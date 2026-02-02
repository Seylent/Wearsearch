#!/usr/bin/env bash
set -euo pipefail

KEYS=(
  SUPABASE_ANON_KEY
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  VITE_SUPABASE_PUBLISHABLE_KEY
  VITE_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)
FILES=(".env" ".env.local" ".env.development" ".env.production" ".env.staging" ".env.example")

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    for k in "${KEYS[@]}"; do
      sed -i.bak -E "s|^${k}=.*|${k}=|g" "$f";
    done
  fi
done
echo "Env secrets scrubbed from env files."
