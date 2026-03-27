output "zone_id" {
    description = "reitaisai.info のゾーン ID"
    value       = data.cloudflare_zone.reitaisai_info.id
}

output "hyperdrive_id_prod" {
    description = "本番 Hyperdrive の ID（wrangler.jsonc env.prod.hyperdrive[].id に設定する）"
    value       = cloudflare_hyperdrive_config.backend_prod.id
}

output "hyperdrive_id_dev" {
    description = "開発環境 Hyperdrive の ID（wrangler.jsonc env.dev.hyperdrive[].id に設定する）"
    value       = cloudflare_hyperdrive_config.backend_dev.id
}

output "backend_route_prod_id" {
    description = "本番バックエンド Worker ルートの ID"
    value       = cloudflare_workers_route.backend_prod.id
}

output "backend_route_dev_id" {
    description = "開発バックエンド Worker ルートの ID"
    value       = cloudflare_workers_route.backend_dev.id
}
