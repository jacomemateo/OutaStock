#!/bin/sh
echo "Injecting runtime API URL: $API_BASE_URL"

replace_placeholder() {
    key="$1"
    value="$2"
    escaped=$(printf '%s\n' "$value" | sed 's/[\/&]/\\&/g')
    sed -i "s|__${key}__|$escaped|g" /app/dist/env.js
}

replace_placeholder "API_BASE_URL" "${API_BASE_URL:-}"

exec "$@"
