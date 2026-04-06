# Local ZITADEL Terraform

This directory contains the Terraform setup for the local ZITADEL instance
started by `docker-compose.prod.yml`.

## What it creates

- the local OutaStock organization context from the first-instance bootstrap
- one ZITADEL project for the app
- one OIDC user-agent application for the React frontend
- one API application for backend token introspection
- one local human admin user
- outputs for the organization, project, and application IDs

The React app uses the generated OIDC client as a public SPA client, so it
signs in directly against ZITADEL with Authorization Code + PKCE.
The backend uses the generated API client over the internal Docker network to
introspect access tokens without calling back out through `auth.localhost`.

## Bootstrap flow

`docker-compose.prod.yml` now tells ZITADEL to write a bootstrap machine key to:

`terraform/bootstrap/zitadel-admin-sa.json`

Terraform uses that file to authenticate with the local instance.

## First run

1. Start the production stack:

   ```bash
   task prod
   ```

2. Wait for `terraform/bootstrap/zitadel-admin-sa.json` to appear.

3. Apply Terraform:

   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

4. Export the frontend runtime auth variables:

   ```bash
   sh terraform/export-web-env.sh
   sh terraform/export-backend-env.sh
   ```

5. Sign in at `http://auth.localhost` with the Terraform-managed user:

   - username: `admin`
   - password: `SecurePassword123!`

## Important note

The machine key file is created during ZITADEL first-instance bootstrap. If your
local ZITADEL volumes already existed before this config was added, the file may
not appear automatically. In that case, either:

- recreate the local ZITADEL data with `task prod-nuke` and then `task prod`, or
- create a service account manually in ZITADEL and point `zitadel_machinekey_file`
  at that JSON file instead

## Customizing redirect URIs

Copy the example vars file if you want different callback URLs:

```bash
cp terraform.tfvars.example terraform.tfvars
```

The generated frontend runtime file is:

`terraform/zitadel-web.env`
