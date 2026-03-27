terraform {
  required_version = ">= 1.5"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "cloudflare_zone" "reitaisai_info" {
  account = {
    id = var.cloudflare_account_id
  }
  name = var.cloudflare_zone_name
}
