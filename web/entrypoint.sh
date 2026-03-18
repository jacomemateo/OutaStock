#!/bin/sh
echo "Injecting runtime API URL: $API_BASE_URL"

escaped=$(printf '%s\n' "$API_BASE_URL" | sed 's/[&/\]/\\&/g')

sed -i "s|__API_BASE_URL__|$escaped|g" /app/dist/env.js

exec "$@"