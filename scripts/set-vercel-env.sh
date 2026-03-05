#!/bin/bash
set -e
cd "/Users/antonioilinca/AI Ops Hub"

add_env() {
  local name="$1"
  local value="$2"
  echo "→ $name"
  printf "%s" "$value" | npx vercel env add "$name" production --yes 2>&1 || true
}

# Supabase
add_env NEXT_PUBLIC_SUPABASE_URL "https://zojqmansitqcnxbhfwcs.supabase.co"
add_env NEXT_PUBLIC_SUPABASE_ANON_KEY "YOUR_SUPABASE_ANON_KEY"
add_env SUPABASE_SERVICE_ROLE_KEY "YOUR_SUPABASE_SERVICE_ROLE_KEY"
add_env DATABASE_URL "postgresql://postgres:YOUR_PASSWORD@db.zojqmansitqcnxbhfwcs.supabase.co:5432/postgres?sslmode=require"

# Stripe
add_env STRIPE_SECRET_KEY "YOUR_STRIPE_SECRET_KEY"
add_env STRIPE_WEBHOOK_SECRET "YOUR_STRIPE_WEBHOOK_SECRET"
add_env STRIPE_PRICE_STARTER_MONTHLY "price_1T7W70I2XWaqbTQgV8g4FNgE"
add_env STRIPE_PRICE_TEAM_MONTHLY "price_1T7W71I2XWaqbTQg7UyymT7c"

# AI
add_env ANTHROPIC_API_KEY "YOUR_ANTHROPIC_API_KEY"

# Security
add_env ENCRYPTION_KEY "YOUR_ENCRYPTION_KEY"

# App
add_env NEXT_PUBLIC_APP_URL "https://ai-ops-hub-eight.vercel.app"

echo "✓ Toutes les env vars ajoutées"
