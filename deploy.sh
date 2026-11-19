#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"
ENV_FILE="$APP_DIR/.env"
RELEASE_FILE="$APP_DIR/release.env"
PREVIOUS_FILE="$APP_DIR/.previous-release.env"

usage() {
  echo "Usage: $0 deploy <frontend|backend> <40-character-commit-sha> | rollback <frontend|backend>" >&2
  exit 2
}

[[ $# -ge 2 ]] || usage
ACTION="$1"
COMPONENT="$2"

case "$COMPONENT" in
  frontend)
    SERVICE=frontend
    TAG_KEY=FRONTEND_IMAGE_TAG
    HEALTH_URL=http://127.0.0.1:8085/healthz
    ;;
  backend)
    SERVICE=backend
    TAG_KEY=BACKEND_IMAGE_TAG
    HEALTH_URL=http://127.0.0.1:4041/health
    ;;
  *)
    usage
    ;;
esac

[[ -f "$COMPOSE_FILE" && -f "$ENV_FILE" && -f "$RELEASE_FILE" ]] || {
  echo "Missing docker-compose.yml, .env, or release.env in $APP_DIR" >&2
  exit 1
}

command -v docker >/dev/null
command -v curl >/dev/null
command -v flock >/dev/null

chmod 600 "$ENV_FILE"
exec 9>"$APP_DIR/.deploy.lock"
flock -w 600 9 || {
  echo "Timed out waiting for the active VegBazar deployment to finish." >&2
  exit 1
}

compose() {
  docker compose \
    --env-file "$ENV_FILE" \
    --env-file "$RELEASE_FILE" \
    -f "$COMPOSE_FILE" \
    "$@"
}

read_release_value() {
  local key="$1"
  local file="${2:-$RELEASE_FILE}"
  sed -n "s/^${key}=//p" "$file" | tail -n 1
}

validate_release() {
  local file="${1:-$RELEASE_FILE}"
  local owner frontend_tag backend_tag
  owner="$(read_release_value GHCR_OWNER "$file")"
  frontend_tag="$(read_release_value FRONTEND_IMAGE_TAG "$file")"
  backend_tag="$(read_release_value BACKEND_IMAGE_TAG "$file")"

  [[ "$owner" =~ ^[a-z0-9][a-z0-9-]*$ ]] || {
    echo "release.env must contain a lowercase GHCR_OWNER." >&2
    return 1
  }
  [[ "$frontend_tag" =~ ^[0-9a-f]{40}$ && "$backend_tag" =~ ^[0-9a-f]{40}$ ]] || {
    echo "release.env must contain full 40-character frontend and backend commit SHA tags." >&2
    return 1
  }
}

write_release_tag() {
  local file="$1"
  local key="$2"
  local value="$3"
  local temporary
  temporary="$(mktemp "$APP_DIR/.release-update.XXXXXX")"
  awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    index($0, key "=") == 1 {
      print key "=" value
      found = 1
      next
    }
    { print }
    END {
      if (!found) print key "=" value
    }
  ' "$file" > "$temporary"
  chmod 640 "$temporary"
  mv "$temporary" "$file"
}

wait_for_health() {
  local attempt
  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

atomic_restore() {
  local source_file="$1"
  local destination="$2"
  local temporary
  temporary="$(mktemp "$APP_DIR/.release-restore.XXXXXX")"
  cp "$source_file" "$temporary"
  chmod 640 "$temporary"
  mv "$temporary" "$destination"
}

deploy_component() {
  local new_tag="$1"
  local backup
  local old_tag
  local previous_tmp

  [[ "$new_tag" =~ ^[0-9a-f]{40}$ ]] || {
    echo "Deployment tag must be a full 40-character commit SHA." >&2
    return 2
  }

  old_tag="$(read_release_value "$TAG_KEY")"
  backup="$(mktemp "$APP_DIR/.release-backup.XXXXXX")"
  cp "$RELEASE_FILE" "$backup"
  write_release_tag "$RELEASE_FILE" "$TAG_KEY" "$new_tag"

  mkdir -p "$APP_DIR/data/invoices" "$APP_DIR/data/uploads" "$APP_DIR/data/reports"

  echo "Pulling $SERVICE image for commit $new_tag."
  if ! validate_release ||
    ! compose pull "$SERVICE" ||
    ! compose up -d --no-deps --wait --wait-timeout 90 "$SERVICE" ||
    ! wait_for_health; then
    echo "Deployment failed; restoring the previous $COMPONENT image tag." >&2
    if ! atomic_restore "$backup" "$RELEASE_FILE"; then
      echo "Could not restore release.env; recover it from $backup." >&2
      return 1
    fi
    if compose up -d --no-deps --wait --wait-timeout 90 "$SERVICE" &&
      wait_for_health; then
      echo "Previous $COMPONENT release is healthy again." >&2
    else
      echo "Automatic rollback could not verify the previous release; inspect Docker and application logs." >&2
    fi
    rm -f "$backup"
    return 1
  fi

  previous_tmp="$(mktemp "$APP_DIR/.previous-release.XXXXXX")"
  if [[ -f "$PREVIOUS_FILE" ]]; then
    cp "$PREVIOUS_FILE" "$previous_tmp"
  else
    cp "$backup" "$previous_tmp"
  fi
  write_release_tag "$previous_tmp" "$TAG_KEY" "$old_tag"
  validate_release "$previous_tmp"
  chmod 640 "$previous_tmp"
  mv "$previous_tmp" "$PREVIOUS_FILE"
  rm -f "$backup"
  echo "$SERVICE deployment $new_tag is healthy."
}

rollback_component() {
  local backup
  local previous_tag
  local current_tag
  [[ -f "$PREVIOUS_FILE" ]] || {
    echo "No previous successful release is recorded." >&2
    return 1
  }

  previous_tag="$(read_release_value "$TAG_KEY" "$PREVIOUS_FILE")"
  current_tag="$(read_release_value "$TAG_KEY")"
  if [[ "$previous_tag" == "$current_tag" ]]; then
    echo "No earlier $COMPONENT image tag is available for rollback." >&2
    return 1
  fi
  if [[ "$previous_tag" == "0000000000000000000000000000000000000000" ]]; then
    echo "Previous $COMPONENT release tag is initial placeholder; cannot rollback." >&2
    return 1
  fi

  backup="$(mktemp "$APP_DIR/.release-backup.XXXXXX")"
  cp "$RELEASE_FILE" "$backup"
  write_release_tag "$RELEASE_FILE" "$TAG_KEY" "$previous_tag"

  if ! validate_release ||
    ! compose pull "$SERVICE" ||
    ! compose up -d --no-deps --wait --wait-timeout 90 "$SERVICE" ||
    ! wait_for_health; then
    echo "Rollback failed; restoring the release that was active before this rollback attempt." >&2
    atomic_restore "$backup" "$RELEASE_FILE"
    compose up -d --no-deps --wait --wait-timeout 90 "$SERVICE" || true
    rm -f "$backup"
    return 1
  fi

  write_release_tag "$PREVIOUS_FILE" "$TAG_KEY" "$current_tag"
  rm -f "$backup"
  echo "$SERVICE has been rolled back to the previous successful release."
}

case "$ACTION" in
  deploy)
    [[ $# -eq 3 ]] || usage
    validate_release
    deploy_component "$3"
    ;;
  rollback)
    [[ $# -eq 2 ]] || usage
    validate_release
    rollback_component
    ;;
  *)
    usage
    ;;
esac
