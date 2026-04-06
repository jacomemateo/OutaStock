#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

PROJECT_ID=$(terraform output -raw project_id)

cat > zitadel-backend.env <<EOF
AUTH_ENABLED=true
ZITADEL_ISSUER=$(terraform output -raw zitadel_issuer)
ZITADEL_INTROSPECTION_URL=http://zitadel-api:8080/oauth/v2/introspect
ZITADEL_API_CLIENT_ID=$(terraform output -raw api_client_id)
ZITADEL_API_CLIENT_SECRET=$(terraform output -raw api_client_secret)
ZITADEL_PROJECT_ID=${PROJECT_ID}
EOF

printf 'Wrote %s/zitadel-backend.env\n' "$SCRIPT_DIR"
