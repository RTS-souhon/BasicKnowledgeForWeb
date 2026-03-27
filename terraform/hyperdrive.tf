# ── Hyperdrive ─────────────────────────────────────────────────────────────
#
# 既存リソースをインポートする場合は以下のコマンドを実行する:
#
#   terraform import cloudflare_hyperdrive_config.backend_prod \
#     <ACCOUNT_ID>/5a36ae3ca5ed4a4697040c00685f213e
#
#   terraform import cloudflare_hyperdrive_config.backend_dev \
#     <ACCOUNT_ID>/f7f0ede9c7464673ab6f5bdcf0753218
#
# インポート後、wrangler.jsonc の hyperdrive[].id が outputs の値と
# 一致していることを確認する。

resource "cloudflare_hyperdrive_config" "backend_prod" {
    account_id = var.cloudflare_account_id
    name       = "basic-knowledge-for-web-backend"

    origin = {
        scheme   = "postgresql"
        host     = var.db_host_prod
        port     = var.db_port_prod
        database = var.db_name_prod
        user     = var.db_user_prod
        password = var.db_password_prod
    }

    caching = {
        disabled = false
    }
}

resource "cloudflare_hyperdrive_config" "backend_dev" {
    account_id = var.cloudflare_account_id
    name       = "basic-knowledge-for-web-backend-dev"

    origin = {
        scheme   = "postgresql"
        host     = var.db_host_dev
        port     = var.db_port_dev
        database = var.db_name_dev
        user     = var.db_user_dev
        password = var.db_password_dev
    }

    caching = {
        disabled = false
    }
}
