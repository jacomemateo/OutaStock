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
TMP_FILE=$(mktemp "${TMPDIR:-/tmp}/zitadel-backend.env.XXXXXX")

cat > "$TMP_FILE" <<EOF
AUTH_ENABLED=true
ZITADEL_ISSUER=${ISSUER}
ZITADEL_INTROSPECTION_URL=http://zitadel-api:8080/oauth/v2/introspect
ZITADEL_API_CLIENT_ID=${API_CLIENT_ID}
ZITADEL_API_CLIENT_SECRET=${API_CLIENT_SECRET}
ZITADEL_PROJECT_ID=${PROJECT_ID}
EOF

mv "$TMP_FILE" zitadel-backend.env

printf 'Wrote %s/zitadel-backend.env\n' "$SCRIPT_DIR"
