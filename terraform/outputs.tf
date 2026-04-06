output "zitadel_issuer" {
  description = "Issuer base URL for the local ZITADEL instance."
  value       = local.issuer
}

output "organization_id" {
  description = "The ID of the local OutaStock organization."
  value       = local.default_org_id
}

output "organization_name" {
  description = "The name of the local OutaStock organization."
  value       = data.zitadel_org.default.name
}

output "project_id" {
  description = "ZITADEL project ID."
  value       = zitadel_project.outastock.id
}

output "application_id" {
  description = "ZITADEL application ID."
  value       = zitadel_application_oidc.outastock_web.id
}

output "api_application_id" {
  description = "ZITADEL API application ID."
  value       = zitadel_application_api.outastock_api.id
}

output "api_client_id" {
  description = "Client ID for the backend API introspection client."
  value       = zitadel_application_api.outastock_api.client_id
  sensitive   = true
}

output "api_client_secret" {
  description = "Client secret for the backend API introspection client."
  value       = zitadel_application_api.outastock_api.client_secret
  sensitive   = true
}

output "oidc_client_id" {
  description = "Client ID for the local OIDC app."
  value       = zitadel_application_oidc.outastock_web.client_id
  sensitive   = true
}

output "oidc_client_secret" {
  description = "Client secret for the local OIDC app. This is empty for the SPA/public client."
  value       = try(zitadel_application_oidc.outastock_web.client_secret, null)
  sensitive   = true
}

output "admin_username" {
  description = "Username for the local ZITADEL admin user."
  value       = zitadel_human_user.admin.user_name
}
