#!/usr/bin/env bash
# Deploy this site to Cloudflare Pages (direct upload — no git integration needed).
#
# Currently the site is hosted on GitHub Pages; this script is here for when we
# move to Cloudflare Pages (https://sawyers-squishys.pages.dev).
#
# Requires these environment variables:
#   CLOUDFLARE_API_TOKEN   API token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID  Your Cloudflare account ID
#
# Usage:
#   CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=yyy ./deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN (Cloudflare Pages: Edit permission)}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"

export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID

echo "Deploying to Cloudflare Pages project: sawyers-squishys"

# All site assets use relative paths, so the site works both at a domain root
# (Cloudflare Pages) and under a subpath (GitHub Pages).
npx wrangler pages deploy . \
  --project-name sawyers-squishys \
  --commit-dirty=true

echo
echo "Done. Live at https://sawyers-squishys.pages.dev"
