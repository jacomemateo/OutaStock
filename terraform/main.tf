locals {
  issuer = format(
    "http://%s%s",
    var.zitadel_domain,
    var.zitadel_port == "80" ? "" : format(":%s", var.zitadel_port)
  )
  default_org_id = one(data.zitadel_organizations.default.ids)
}

data "zitadel_organizations" "default" {
  is_default = true
}

data "zitadel_org" "default" {
  id = local.default_org_id
}

resource "zitadel_project" "outastock" {
  org_id                 = local.default_org_id
  name                   = var.project_name
  project_role_assertion = true
}

resource "zitadel_human_user" "admin" {
  org_id                       = local.default_org_id
  user_name                    = var.admin_username
  first_name                   = "Zitadel"
  last_name                    = "Admin"
  email                        = var.admin_email
  initial_password             = var.admin_password
  initial_skip_password_change = true
  is_email_verified            = true
}

resource "zitadel_org_member" "admin_owner" {
  org_id  = local.default_org_id
  user_id = zitadel_human_user.admin.id
  roles   = ["ORG_OWNER"]
}

resource "zitadel_application_oidc" "outastock_web" {
  org_id     = local.default_org_id
  project_id = zitadel_project.outastock.id

  name                      = var.application_name
  redirect_uris             = var.redirect_uris
  post_logout_redirect_uris = var.post_logout_redirect_uris
  additional_origins        = var.additional_origins

  response_types = ["OIDC_RESPONSE_TYPE_CODE"]
  grant_types    = ["OIDC_GRANT_TYPE_AUTHORIZATION_CODE"]

  app_type         = "OIDC_APP_TYPE_USER_AGENT"
  auth_method_type = "OIDC_AUTH_METHOD_TYPE_NONE"
  version          = "OIDC_VERSION_1_0"

  dev_mode                     = true
  access_token_type            = "OIDC_TOKEN_TYPE_BEARER"
  access_token_role_assertion  = true
  id_token_role_assertion      = true
  id_token_userinfo_assertion  = true
  skip_native_app_success_page = false
}

resource "zitadel_application_api" "outastock_api" {
  org_id     = local.default_org_id
  project_id = zitadel_project.outastock.id

  name             = "OutaStock API"
  auth_method_type = "API_AUTH_METHOD_TYPE_BASIC"
}
