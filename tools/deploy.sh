#!/bin/sh
# Publishes Website/ to the GitHub Pages repo. Usage: sh Website/tools/deploy.sh [message]
set -e
REPO="${SITE_REPO:-$(gh api user --jq .login)/stay-in-your-lane}"
SITE="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet "https://github.com/$REPO.git" "$TMP/site"
rsync -a --delete --exclude .git --exclude .DS_Store "$SITE/" "$TMP/site/"
touch "$TMP/site/.nojekyll"
cd "$TMP/site"
git add -A
if git diff --cached --quiet; then echo "Nothing to deploy"; exit 0; fi
git commit --quiet -m "${1:-Update site}"
git push --quiet origin HEAD
echo "Pushed to https://github.com/$REPO"
