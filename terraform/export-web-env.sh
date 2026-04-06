#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

PROJECT_ID=$(terraform output -raw project_id)

cat > zitadel-web.env <<EOF
ZITADEL_ISSUER=$(terraform output -raw zitadel_issuer)
ZITADEL_CLIENT_ID=$(terraform output -raw oidc_client_id)
ZITADEL_ORGANIZATION_ID=$(terraform output -raw organization_id)
ZITADEL_REDIRECT_URI=http://localhost/auth/callback
ZITADEL_POST_LOGOUT_REDIRECT_URI=http://localhost/
ZITADEL_SCOPE=openid profile email urn:zitadel:iam:org:project:id:${PROJECT_ID}:aud
EOF

printf 'Wrote %s/zitadel-web.env\n' "$SCRIPT_DIR"
