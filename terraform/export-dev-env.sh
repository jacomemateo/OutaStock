#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$SCRIPT_DIR"

. "$SCRIPT_DIR/output_helpers.sh"

OUTPUTS_JSON=$(require_terraform_outputs)
PROJECT_ID=$(terraform_output_value project_id "$OUTPUTS_JSON")
ISSUER=$(terraform_output_value zitadel_issuer "$OUTPUTS_JSON")
API_CLIENT_ID=$(terraform_output_value api_client_id "$OUTPUTS_JSON")
API_CLIENT_SECRET=$(terraform_output_value api_client_secret "$OUTPUTS_JSON")
OIDC_CLIENT_ID=$(terraform_output_value oidc_client_id "$OUTPUTS_JSON")
ORGANIZATION_ID=$(terraform_output_value organization_id "$OUTPUTS_JSON")
FRONTEND_ENV_FILE="$REPO_ROOT/web/.env.local"
ROOT_ENV_FILE="$REPO_ROOT/.env.dev.local"
TMP_ROOT_FILE=$(mktemp "${TMPDIR:-/tmp}/env.dev.local.XXXXXX")
TMP_FRONTEND_FILE=$(mktemp "${TMPDIR:-/tmp}/web.env.local.XXXXXX")

cat > "$TMP_ROOT_FILE" <<EOF
AUTH_ENABLED=true
ZITADEL_ISSUER=${ISSUER}
ZITADEL_INTROSPECTION_URL=${ISSUER}/oauth/v2/introspect
ZITADEL_API_CLIENT_ID=${API_CLIENT_ID}
ZITADEL_API_CLIENT_SECRET=${API_CLIENT_SECRET}
ZITADEL_PROJECT_ID=${PROJECT_ID}
VITE_ZITADEL_ISSUER=${ISSUER}
VITE_ZITADEL_CLIENT_ID=${OIDC_CLIENT_ID}
VITE_ZITADEL_ORGANIZATION_ID=${ORGANIZATION_ID}
VITE_ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
EOF

cat > "$TMP_FRONTEND_FILE" <<EOF
VITE_ZITADEL_ISSUER=${ISSUER}
VITE_ZITADEL_CLIENT_ID=${OIDC_CLIENT_ID}
VITE_ZITADEL_ORGANIZATION_ID=${ORGANIZATION_ID}
VITE_ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
EOF

mv "$TMP_ROOT_FILE" "$ROOT_ENV_FILE"
mv "$TMP_FRONTEND_FILE" "$FRONTEND_ENV_FILE"

printf 'Wrote %s\n' "$ROOT_ENV_FILE"
printf 'Wrote %s\n' "$FRONTEND_ENV_FILE"
