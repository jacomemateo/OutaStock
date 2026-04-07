#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

. "$SCRIPT_DIR/output_helpers.sh"

OUTPUTS_JSON=$(require_terraform_outputs)
PROJECT_ID=$(terraform_output_value project_id "$OUTPUTS_JSON")
ISSUER=$(terraform_output_value zitadel_issuer "$OUTPUTS_JSON")
OIDC_CLIENT_ID=$(terraform_output_value oidc_client_id "$OUTPUTS_JSON")
ORGANIZATION_ID=$(terraform_output_value organization_id "$OUTPUTS_JSON")
TMP_FILE=$(mktemp "${TMPDIR:-/tmp}/zitadel-web.env.XXXXXX")

cat > "$TMP_FILE" <<EOF
ZITADEL_ISSUER=${ISSUER}
ZITADEL_CLIENT_ID=${OIDC_CLIENT_ID}
ZITADEL_ORGANIZATION_ID=${ORGANIZATION_ID}
ZITADEL_REDIRECT_URI=http://localhost/auth/callback
ZITADEL_POST_LOGOUT_REDIRECT_URI=http://localhost/
ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
EOF

mv "$TMP_FILE" zitadel-web.env

printf 'Wrote %s/zitadel-web.env\n' "$SCRIPT_DIR"
