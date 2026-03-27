resource "cloudflare_hyperdrive_config" "backend_prod" {
    account_id = var.cloudflare_account_id
    name       = "basic-knowledge-for-web-database"

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
    name       = "basic-knowledge-for-web-database-dev"

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
