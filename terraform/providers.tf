provider "zitadel" {
  domain           = var.zitadel_domain
  port             = var.zitadel_port
  insecure         = var.zitadel_insecure
  jwt_profile_file = var.zitadel_machinekey_file
}
