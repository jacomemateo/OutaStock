#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$SCRIPT_DIR"

PROJECT_ID=$(terraform output -raw project_id)
ISSUER=$(terraform output -raw zitadel_issuer)
FRONTEND_ENV_FILE="$REPO_ROOT/web/.env.local"

cat > "$REPO_ROOT/.env.dev.local" <<EOF
AUTH_ENABLED=true
ZITADEL_ISSUER=${ISSUER}
ZITADEL_INTROSPECTION_URL=${ISSUER}/oauth/v2/introspect
ZITADEL_API_CLIENT_ID=$(terraform output -raw api_client_id)
ZITADEL_API_CLIENT_SECRET=$(terraform output -raw api_client_secret)
ZITADEL_PROJECT_ID=${PROJECT_ID}
VITE_ZITADEL_ISSUER=${ISSUER}
VITE_ZITADEL_CLIENT_ID=$(terraform output -raw oidc_client_id)
VITE_ZITADEL_ORGANIZATION_ID=$(terraform output -raw organization_id)
VITE_ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
EOF

cat > "$FRONTEND_ENV_FILE" <<EOF
VITE_ZITADEL_ISSUER=${ISSUER}
VITE_ZITADEL_CLIENT_ID=$(terraform output -raw oidc_client_id)
VITE_ZITADEL_ORGANIZATION_ID=$(terraform output -raw organization_id)
VITE_ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
EOF

printf 'Wrote %s/.env.dev.local\n' "$REPO_ROOT"
printf 'Wrote %s\n' "$FRONTEND_ENV_FILE"
