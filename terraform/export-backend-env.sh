#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

. "$SCRIPT_DIR/output_helpers.sh"

OUTPUTS_JSON=$(require_terraform_outputs)
PROJECT_ID=$(terraform_output_value project_id "$OUTPUTS_JSON")
ISSUER=$(terraform_output_value zitadel_issuer "$OUTPUTS_JSON")
API_CLIENT_ID=$(terraform_output_value api_client_id "$OUTPUTS_JSON")
API_CLIENT_SECRET=$(terraform_output_value api_client_secret "$OUTPUTS_JSON")
OIDC_CLIENT_ID=$(terraform_output_value oidc_client_id "$OUTPUTS_JSON")
MACHINE_KEY_FILE="$SCRIPT_DIR/bootstrap/zitadel-admin-sa.json"
TMP_FILE=$(mktemp "${TMPDIR:-/tmp}/zitadel-backend.env.XXXXXX")
SERVICE_USER_TOKEN=$(docker exec outastock-prod-zitadel-login-1 cat /zitadel/bootstrap/login-client.pat 2>/dev/null || true)

if [ ! -f "$MACHINE_KEY_FILE" ]; then
  echo "Missing $MACHINE_KEY_FILE." >&2
  exit 1
fi

MACHINE_KEY_BASE64=$(base64 < "$MACHINE_KEY_FILE" | tr -d '\n')

cat > "$TMP_FILE" <<EOF
AUTH_ENABLED=true
ZITADEL_API_URL=http://zitadel-api:8080
ZITADEL_ISSUER=${ISSUER}
ZITADEL_INTROSPECTION_URL=http://zitadel-api:8080/oauth/v2/introspect
ZITADEL_API_CLIENT_ID=${API_CLIENT_ID}
ZITADEL_API_CLIENT_SECRET=${API_CLIENT_SECRET}
ZITADEL_OIDC_CLIENT_ID=${OIDC_CLIENT_ID}
ZITADEL_OIDC_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
ZITADEL_PROJECT_ID=${PROJECT_ID}
ZITADEL_SERVICE_USER_MACHINE_KEY_BASE64=${MACHINE_KEY_BASE64}
EOF

if [ -n "$SERVICE_USER_TOKEN" ]; then
  printf 'ZITADEL_SERVICE_USER_TOKEN=%s\n' "$SERVICE_USER_TOKEN" >> "$TMP_FILE"
fi

mv "$TMP_FILE" zitadel-backend.env

printf 'Wrote %s/zitadel-backend.env\n' "$SCRIPT_DIR"
