const AUTH_SESSION_STORAGE_KEY = 'outastock.auth.session';
const AUTH_PENDING_LOGIN_STORAGE_KEY = 'outastock.auth.pending-login';

export interface AuthUser {
    sub: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
    [key: string]: unknown;
}

export interface AuthSession {
    accessToken: string;
    idToken?: string;
    tokenType: string;
    expiresAt: number;
    scope: string;
    user: AuthUser;
}

interface PendingLogin {
    codeVerifier: string;
    nonce: string;
    returnTo: string;
    state: string;
}

interface AuthConfig {
    clientId: string;
    issuer: string;
    organizationId?: string;
    postLogoutRedirectUri: string;
    redirectUri: string;
    scope: string;
}

interface OidcMetadata {
    authorization_endpoint: string;
    end_session_endpoint?: string;
    issuer: string;
    token_endpoint: string;
    userinfo_endpoint: string;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    id_token?: string;
    scope?: string;
    token_type: string;
}

let oidcMetadataPromise: Promise<OidcMetadata> | null = null;

function cleanRuntimeValue(value?: string): string | undefined {
    if (!value) {
        return undefined;
    }

    if (value.startsWith('__') && value.endsWith('__')) {
        return undefined;
    }

    return value;
}

function getWindowOrigin() {
    return typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
}

function isLoopbackHostname(hostname: string) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
}

function resolveRedirectUrl(configuredUrl: string | undefined, defaultPath: string) {
    const currentOrigin = getWindowOrigin();
    const fallbackUrl = new URL(defaultPath, currentOrigin).toString();

    if (!configuredUrl) {
        return fallbackUrl;
    }

    try {
        const currentUrl = new URL(currentOrigin);
        const resolvedUrl = new URL(configuredUrl);

        // In local dev, treat localhost/127.0.0.1 as the same browser origin family
        // so the callback always lands on the exact host the user started from.
        if (
            isLoopbackHostname(currentUrl.hostname) &&
            isLoopbackHostname(resolvedUrl.hostname) &&
            currentUrl.port === resolvedUrl.port
        ) {
            resolvedUrl.protocol = currentUrl.protocol;
            resolvedUrl.hostname = currentUrl.hostname;
            resolvedUrl.port = currentUrl.port;
            return resolvedUrl.toString();
        }
    } catch {
        return configuredUrl;
    }

    return configuredUrl;
}

function normalizeIssuer(issuer: string) {
    return issuer.replace(/\/+$/, '');
}

function buildWellKnownUrl(issuer: string) {
    return `${normalizeIssuer(issuer)}/.well-known/openid-configuration`;
}

function base64UrlEncode(bytes: Uint8Array) {
    let binary = '';

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(input: string) {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return atob(padded);
}

function createRandomString(byteLength = 32) {
    const bytes = new Uint8Array(byteLength);
    window.crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
}

async function createCodeChallenge(codeVerifier: string) {
    const encoded = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return base64UrlEncode(new Uint8Array(digest));
}

function parseJsonStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue) as T;
    } catch {
        window.localStorage.removeItem(key);
        return null;
    }
}

function removePendingLogin() {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(AUTH_PENDING_LOGIN_STORAGE_KEY);
}

function storePendingLogin(pendingLogin: PendingLogin) {
    window.localStorage.setItem(AUTH_PENDING_LOGIN_STORAGE_KEY, JSON.stringify(pendingLogin));
}

function getPendingLogin() {
    return parseJsonStorage<PendingLogin>(AUTH_PENDING_LOGIN_STORAGE_KEY);
}

function storeSession(session: AuthSession) {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function isSessionExpired(session: AuthSession) {
    return Date.now() >= session.expiresAt;
}

export function getStoredSession() {
    const session = parseJsonStorage<AuthSession>(AUTH_SESSION_STORAGE_KEY);

    if (!session) {
        return null;
    }

    if (isSessionExpired(session)) {
        clearStoredSession();
        return null;
    }

    return session;
}

export function getAccessToken() {
    return getStoredSession()?.accessToken ?? null;
}

function decodeIdToken(idToken?: string) {
    if (!idToken) {
        return null;
    }

    const parts = idToken.split('.');

    if (parts.length < 2) {
        return null;
    }

    try {
        const payload = decodeBase64Url(parts[1]);
        return JSON.parse(payload) as AuthUser;
    } catch {
        return null;
    }
}

function normalizeUserProfile(user: AuthUser | null, fallbackIdToken?: string) {
    const fallbackUser = decodeIdToken(fallbackIdToken);
    const mergedUser = { ...fallbackUser, ...user } as AuthUser;
    const fullName = [mergedUser.given_name, mergedUser.family_name]
        .filter(Boolean)
        .join(' ');
    const resolvedName =
        mergedUser.name ||
        fullName ||
        mergedUser.preferred_username ||
        mergedUser.email ||
        'OutaStock User';

    return {
        ...mergedUser,
        name: resolvedName,
    };
}

export function getAuthConfig(): AuthConfig | null {
    const issuer =
        cleanRuntimeValue(window.env?.ZITADEL_ISSUER) ??
        cleanRuntimeValue(import.meta.env.VITE_ZITADEL_ISSUER);
    const clientId =
        cleanRuntimeValue(window.env?.ZITADEL_CLIENT_ID) ??
        cleanRuntimeValue(import.meta.env.VITE_ZITADEL_CLIENT_ID);
    const redirectUri = resolveRedirectUrl(
        cleanRuntimeValue(window.env?.ZITADEL_REDIRECT_URI) ??
            cleanRuntimeValue(import.meta.env.VITE_ZITADEL_REDIRECT_URI),
        '/auth/callback',
    );
    const postLogoutRedirectUri = resolveRedirectUrl(
        cleanRuntimeValue(window.env?.ZITADEL_POST_LOGOUT_REDIRECT_URI) ??
            cleanRuntimeValue(import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI),
        '/',
    );
    const scope =
        cleanRuntimeValue(window.env?.ZITADEL_SCOPE) ??
        cleanRuntimeValue(import.meta.env.VITE_ZITADEL_SCOPE) ??
        'openid profile email';
    const organizationId =
        cleanRuntimeValue(window.env?.ZITADEL_ORGANIZATION_ID) ??
        cleanRuntimeValue(import.meta.env.VITE_ZITADEL_ORGANIZATION_ID);

    if (!issuer || !clientId) {
        return null;
    }

    return {
        clientId,
        issuer: normalizeIssuer(issuer),
        organizationId,
        postLogoutRedirectUri,
        redirectUri,
        scope,
    };
}

export function isAuthConfigured() {
    return getAuthConfig() !== null;
}

async function getOidcMetadata() {
    const config = getAuthConfig();

    if (!config) {
        throw new Error('ZITADEL auth is not configured for the frontend.');
    }

    if (!oidcMetadataPromise) {
        oidcMetadataPromise = fetch(buildWellKnownUrl(config.issuer))
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load OIDC metadata: ${response.status}`);
                }

                return (await response.json()) as OidcMetadata;
            })
            .catch((caughtError) => {
                oidcMetadataPromise = null;
                throw caughtError;
            });
    }

    return oidcMetadataPromise;
}

export async function startLogin(returnTo = '/dashboard') {
    const config = getAuthConfig();

    if (!config) {
        throw new Error('ZITADEL auth is not configured for the frontend.');
    }

    const metadata = await getOidcMetadata();
    const codeVerifier = createRandomString(64);
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = createRandomString(32);
    const nonce = createRandomString(32);

    storePendingLogin({
        codeVerifier,
        nonce,
        returnTo,
        state,
    });

    const authorizeUrl = new URL(metadata.authorization_endpoint);
    authorizeUrl.searchParams.set('client_id', config.clientId);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', config.scope);
    authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('nonce', nonce);
    authorizeUrl.searchParams.set('code_challenge', codeChallenge);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');

    window.location.assign(authorizeUrl.toString());
}

async function exchangeCodeForTokens(code: string, pendingLogin: PendingLogin, config: AuthConfig) {
    const metadata = await getOidcMetadata();
    const body = new URLSearchParams({
        client_id: config.clientId,
        code,
        code_verifier: pendingLogin.codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
    });

    const response = await fetch(metadata.token_endpoint, {
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to exchange auth code: ${response.status} ${errorBody}`);
    }

    return (await response.json()) as TokenResponse;
}

async function fetchUserInfo(accessToken: string) {
    const metadata = await getOidcMetadata();
    const response = await fetch(metadata.userinfo_endpoint, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as AuthUser;
}

export async function completeLogin(callbackUrl = window.location.href) {
    const config = getAuthConfig();

    if (!config) {
        throw new Error('ZITADEL auth is not configured for the frontend.');
    }

    const currentUrl = new URL(callbackUrl);
    const code = currentUrl.searchParams.get('code');
    const state = currentUrl.searchParams.get('state');
    const error = currentUrl.searchParams.get('error');
    const errorDescription = currentUrl.searchParams.get('error_description');

    if (error) {
        throw new Error(errorDescription ?? error);
    }

    if (!code || !state) {
        throw new Error('Missing authorization code or state from the callback URL.');
    }

    const pendingLogin = getPendingLogin();

    if (!pendingLogin) {
        throw new Error('Missing login state. Please try signing in again.');
    }

    if (pendingLogin.state !== state) {
        removePendingLogin();
        throw new Error('The OIDC state did not match. Please try signing in again.');
    }

    const tokenResponse = await exchangeCodeForTokens(code, pendingLogin, config);
    const userInfo = await fetchUserInfo(tokenResponse.access_token);
    const user = normalizeUserProfile(userInfo, tokenResponse.id_token);

    const session: AuthSession = {
        accessToken: tokenResponse.access_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        idToken: tokenResponse.id_token,
        scope: tokenResponse.scope ?? config.scope,
        tokenType: tokenResponse.token_type,
        user,
    };

    storeSession(session);
    removePendingLogin();

    return {
        returnTo: pendingLogin.returnTo || '/dashboard',
        session,
    };
}

export async function startLogout(session: AuthSession | null) {
    const config = getAuthConfig();
    clearStoredSession();
    removePendingLogin();

    if (!config) {
        window.location.assign('/');
        return;
    }

    const metadata = await getOidcMetadata();
    const endSessionEndpoint =
        metadata.end_session_endpoint ?? `${normalizeIssuer(config.issuer)}/oidc/v1/end_session`;
    const logoutUrl = new URL(endSessionEndpoint);

    logoutUrl.searchParams.set('client_id', config.clientId);
    logoutUrl.searchParams.set(
        'post_logout_redirect_uri',
        config.postLogoutRedirectUri,
    );

    if (session?.idToken) {
        logoutUrl.searchParams.set('id_token_hint', session.idToken);
    }

    window.location.assign(logoutUrl.toString());
}
