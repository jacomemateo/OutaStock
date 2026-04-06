variable "zitadel_domain" {
  description = "Public domain that fronts the local ZITADEL instance."
  type        = string
  default     = "auth.localhost"
}

variable "zitadel_port" {
  description = "Public port exposed by Caddy for the local ZITADEL instance."
  type        = string
  default     = "80"
}

variable "zitadel_insecure" {
  description = "Use plaintext HTTP for the local ZITADEL instance."
  type        = bool
  default     = true
}

variable "zitadel_machinekey_file" {
  description = "Path to the machine key JSON generated during first-instance bootstrap."
  type        = string
  default     = "./bootstrap/zitadel-admin-sa.json"
}

variable "project_name" {
  description = "ZITADEL project name for the local OutaStock app."
  type        = string
  default     = "OutaStock Local"
}

variable "application_name" {
  description = "OIDC application name for local development."
  type        = string
  default     = "OutaStock Web"
}

variable "admin_username" {
  description = "Username for the local ZITADEL admin user."
  type        = string
  default     = "admin"
}

variable "admin_email" {
  description = "Email for the local ZITADEL admin user."
  type        = string
  default     = "admin@zitadel.example.com"
}

variable "admin_password" {
  description = "Password for the local ZITADEL admin user."
  type        = string
  default     = "SecurePassword123!"
  sensitive   = true
}

variable "redirect_uris" {
  description = "Allowed redirect URIs for the local OIDC application."
  type        = list(string)
  default = [
    "http://localhost/auth/callback",
  ]
}

variable "post_logout_redirect_uris" {
  description = "Allowed post-logout redirect URIs for the local OIDC application."
  type        = list(string)
  default = [
    "http://localhost/",
  ]
}

variable "additional_origins" {
  description = "Additional browser origins allowed for the local OIDC app."
  type        = list(string)
  default = [
    "http://localhost",
  ]
}
