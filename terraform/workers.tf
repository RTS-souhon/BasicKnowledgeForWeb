# ── Backend: Worker Routes ─────────────────────────────────────────────────
#
# wrangler.jsonc の routes[].pattern に対応する。
# Worker スクリプト本体のデプロイは wrangler が担当し、
# Terraform はルートのマッピングのみ管理する。

resource "cloudflare_workers_route" "backend_prod" {
  zone_id = data.cloudflare_zone.reitaisai_info.id
  pattern = "reitaisai.info/api/*"
  script  = "basic-knowledge-for-web-backend"
}

resource "cloudflare_workers_route" "backend_dev" {
  zone_id = data.cloudflare_zone.reitaisai_info.id
  pattern = "dev.reitaisai.info/api/*"
  script  = "basic-knowledge-for-web-backend-dev"
}

# ── Frontend: Custom Domains ───────────────────────────────────────────────
#
# wrangler.jsonc の routes[].custom_domain = true に対応する。

resource "cloudflare_workers_custom_domain" "frontend_prod" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zone.reitaisai_info.id
  hostname   = "reitaisai.info"
  service    = "basic-knowledge-for-web-frontend"
}

resource "cloudflare_workers_custom_domain" "frontend_dev" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zone.reitaisai_info.id
  hostname   = "dev.reitaisai.info"
  service    = "basic-knowledge-for-web-frontend-dev"
}
