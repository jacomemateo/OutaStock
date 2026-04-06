// src/vite-env.d.ts

declare module '*.png' {
    const value: string;
    return value;
}

declare module '*.jpg' {
    const value: string;
    return value;
}

declare module '*.svg' {
    const value: string;
    return value;
}

// declarations.d.ts
interface Window {
    env: {
        API_BASE_URL: string;
        ZITADEL_ISSUER?: string;
        ZITADEL_CLIENT_ID?: string;
        ZITADEL_ORGANIZATION_ID?: string;
        ZITADEL_REDIRECT_URI?: string;
        ZITADEL_POST_LOGOUT_REDIRECT_URI?: string;
        ZITADEL_SCOPE?: string;
        [key: string]: string | undefined; // for other env vars you may add
    };
}
