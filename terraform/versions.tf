terraform {
  required_version = ">= 1.6.0"

  required_providers {
    zitadel = {
      source  = "zitadel/zitadel"
      version = "~> 2.11"
    }
  }
}
