#!/bin/sh
echo "Injecting runtime API URL: $API_BASE_URL"

replace_placeholder() {
    key="$1"
    value="$2"
    escaped=$(printf '%s\n' "$value" | sed 's/[\/&]/\\&/g')
    sed -i "s|__${key}__|$escaped|g" /app/dist/env.js
}

replace_placeholder "API_BASE_URL" "${API_BASE_URL:-}"
replace_placeholder "ZITADEL_ISSUER" "${ZITADEL_ISSUER:-}"
replace_placeholder "ZITADEL_CLIENT_ID" "${ZITADEL_CLIENT_ID:-}"
replace_placeholder "ZITADEL_ORGANIZATION_ID" "${ZITADEL_ORGANIZATION_ID:-}"
replace_placeholder "ZITADEL_REDIRECT_URI" "${ZITADEL_REDIRECT_URI:-}"
replace_placeholder "ZITADEL_POST_LOGOUT_REDIRECT_URI" "${ZITADEL_POST_LOGOUT_REDIRECT_URI:-}"
replace_placeholder "ZITADEL_SCOPE" "${ZITADEL_SCOPE:-}"

exec "$@"
