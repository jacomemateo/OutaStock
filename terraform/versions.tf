terraform {
  required_version = ">= 1.5.7"

  required_providers {
    zitadel = {
      source  = "zitadel/zitadel"
      version = "~> 2.11"
    }
  }
}
