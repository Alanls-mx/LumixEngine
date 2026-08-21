#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Alanls-mx/LumixEngine.git}"
BRANCH="${BRANCH:-main}"
BASE_DIR="${BASE_DIR:-/opt/lumixengine}"
RELEASES_DIR="$BASE_DIR/releases"
CURRENT_LINK="$BASE_DIR/current"
CURRENT_COMMIT_FILE="$BASE_DIR/current_commit"
LOCK_FILE="$BASE_DIR/deploy.lock"
LOG_FILE="$BASE_DIR/deploy.log"
PRISMA_GENERATE_DATABASE_URL="${PRISMA_GENERATE_DATABASE_URL:-postgresql://lumixengine_app:placeholder@127.0.0.1:5432/lumixengine_app?schema=public}"

mkdir -p "$RELEASES_DIR"
touch "$LOG_FILE"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "$(date -Is) deploy already running" >> "$LOG_FILE"
  exit 0
fi

log() {
  echo "$(date -Is) $*" | tee -a "$LOG_FILE"
}

latest_commit="$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | awk '{print $1}')"

if [[ -z "$latest_commit" ]]; then
  log "unable to resolve $BRANCH from $REPO_URL"
  exit 1
fi

current_commit=""
if [[ -f "$CURRENT_COMMIT_FILE" ]]; then
  current_commit="$(tr -d '[:space:]' < "$CURRENT_COMMIT_FILE")"
fi

if [[ "$latest_commit" == "$current_commit" ]]; then
  log "no deploy needed; $BRANCH is already at ${latest_commit:0:7}"
  exit 0
fi

release="$RELEASES_DIR/$(date +%Y%m%d%H%M%S)-${latest_commit:0:7}"
log "deploying $BRANCH ${latest_commit:0:7} to $release"

git clone --depth 1 --single-branch --branch "$BRANCH" "$REPO_URL" "$release" >> "$LOG_FILE" 2>&1

cd "$release"
npm ci >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1

cd "$release/app/backend"
npm ci >> "$LOG_FILE" 2>&1
DATABASE_URL="$PRISMA_GENERATE_DATABASE_URL" npm run prisma:generate >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1

cd "$release/app/frontend"
npm ci >> "$LOG_FILE" 2>&1
VITE_API_URL="${VITE_API_URL:-https://app.lumixengine.com/api}" \
VITE_SOCKET_URL="${VITE_SOCKET_URL:-https://app.lumixengine.com}" \
  npm run build >> "$LOG_FILE" 2>&1

chown -R ubuntu:ubuntu "$release"
ln -sfn "$release" "$CURRENT_LINK"

systemctl restart lumixengine-app-api.service
systemctl restart lumixengine-site-api.service

systemctl is-active --quiet lumixengine-app-api.service
systemctl is-active --quiet lumixengine-site-api.service

printf '%s\n' "$latest_commit" > "$CURRENT_COMMIT_FILE"
chown ubuntu:ubuntu "$CURRENT_COMMIT_FILE" "$LOG_FILE"

find "$RELEASES_DIR" -maxdepth 1 -mindepth 1 -type d -printf '%T@ %p\0' |
  sort -z -rn |
  tail -z -n +6 |
  while IFS= read -r -d '' entry; do
    old_release="${entry#* }"
    case "$old_release" in
      "$RELEASES_DIR"/*) rm -rf "$old_release" ;;
    esac
  done

log "deployed $BRANCH ${latest_commit:0:7}"
