# ── 既存リソースの Import ──────────────────────────────────────────────────
#
# Terraform 1.5+ の import ブロックを使用する。
# terraform apply 時に自動的にステートへ取り込まれる。
#
# 取り込み済みのリソース:
#   - cloudflare_hyperdrive_config.backend_prod   (既存)
#   - cloudflare_hyperdrive_config.backend_dev    (既存)
#   - cloudflare_workers_route.backend_dev        (既存)
#   - cloudflare_workers_custom_domain.frontend_dev (既存)
#
# 新規作成されるリソース（import 不要）:
#   - cloudflare_workers_route.backend_prod
#   - cloudflare_workers_custom_domain.frontend_prod

# ── Hyperdrive ─────────────────────────────────────────────────────────────

import {
  to = cloudflare_hyperdrive_config.backend_prod
  id = "d94e52a031721601047a2770f9b5fa4c/5a36ae3ca5ed4a4697040c00685f213e"
}

import {
  to = cloudflare_hyperdrive_config.backend_dev
  id = "d94e52a031721601047a2770f9b5fa4c/f7f0ede9c7464673ab6f5bdcf0753218"
}

# ── Worker Routes ──────────────────────────────────────────────────────────

import {
  to = cloudflare_workers_route.backend_dev
  id = "9961342728b0faee0f0ac019a838c679/021793cd5cb1460098af3e26fc97d3ec"
}

# ── Workers Custom Domains ─────────────────────────────────────────────────

import {
  to = cloudflare_workers_custom_domain.frontend_dev
  id = "d94e52a031721601047a2770f9b5fa4c/9961342728b0faee0f0ac019a838c679/dev.reitaisai.info"
}
