variable "cloudflare_api_token" {
  description = "Cloudflare API トークン（Workers Routes / Hyperdrive 編集権限が必要）"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare アカウント ID"
  type        = string
}

variable "cloudflare_zone_name" {
  description = "管理対象のゾーン名"
  type        = string
  default     = "reitaisai.info"
}

# ── Hyperdrive: prod ───────────────────────────────────────────────────────

variable "db_host_prod" {
  description = "本番 PostgreSQL ホスト"
  type        = string
}

variable "db_port_prod" {
  description = "本番 DB ポート（CockroachDB: 26257）"
  type        = number
  default     = 26257
}

variable "db_name_prod" {
  description = "本番 PostgreSQL データベース名"
  type        = string
}

variable "db_user_prod" {
  description = "本番 PostgreSQL ユーザー名"
  type        = string
}

variable "db_password_prod" {
  description = "本番 PostgreSQL パスワード"
  type        = string
  sensitive   = true
}

# ── Hyperdrive: dev ────────────────────────────────────────────────────────

variable "db_host_dev" {
  description = "開発環境 PostgreSQL ホスト"
  type        = string
}

variable "db_port_dev" {
  description = "開発環境 DB ポート（CockroachDB: 26257）"
  type        = number
  default     = 26257
}

variable "db_name_dev" {
  description = "開発環境 PostgreSQL データベース名"
  type        = string
}

variable "db_user_dev" {
  description = "開発環境 PostgreSQL ユーザー名"
  type        = string
}

variable "db_password_dev" {
  description = "開発環境 PostgreSQL パスワード"
  type        = string
  sensitive   = true
}
