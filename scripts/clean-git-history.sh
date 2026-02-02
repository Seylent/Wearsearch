#!/usr/bin/env bash
set -euo pipefail

echo "This will rewrite git history to scrub secrets from all commits."
read -p "Proceed? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "$REPO_ROOT" ]]; then
  echo "Not inside a git repo. Abort."
  exit 1
fi

SECRET_MARKERS=(
  SUPABASE_ANON_KEY
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  VITE_SUPABASE_PUBLISHABLE_KEY
  VITE_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)

echo "Creating a backup clone..."
git clone --mirror . repo-mirror
cd repo-mirror

cat > secrets.txt << 'EOF'
${SECRET_MARKERS[@]// /\n}
EOF

git filter-repo --replace-text secrets.txt
echo "History scrubbed. Push with: git push origin --force --mirror"
