# VegBazar production deployment

## Architecture

The frontend (`codax69/VegBazar`) and backend (`codax69/VegBazar_Backend`) are separate GitHub repositories. Each repository's `main` workflow tests and builds its own Docker image, pushes a commit-SHA tag and `latest` to GHCR, then asks the VPS deployment script to update only that application. The VPS never checks out source or builds images.

The Ubuntu host runs Nginx and Docker Compose. Compose runs only the static frontend and Node.js API. Host Nginx routes `vegbazar.store` to the frontend, forwards its existing relative `/api/*` requests to the backend, and routes `api.vegbazar.pritesh.site` directly to the backend. The backend connects to the configured MongoDB service (the supplied example uses Atlas); there is no MongoDB container.

| Service  | Image                                            | Container port | VPS binding      |
| -------- | ------------------------------------------------ | -------------: | ---------------- |
| Frontend | `ghcr.io/codax69/vegbazar-frontend:<commit-sha>` |             80 | `127.0.0.1:8085` |
| Backend  | `ghcr.io/codax69/vegbazar-backend:<commit-sha>`  |           4000 | `127.0.0.1:4041` |

`latest` is published for convenience, but Compose deploys the explicit full commit SHA from `release.env`.

## 1. Required VPS software and setup

Use a supported Ubuntu LTS release with DNS records for both domains pointing to the VPS. Permit inbound SSH, HTTP (80), and HTTPS (443) in the provider firewall and host firewall. No Node.js, npm, Git checkout, frontend build tools, or application source is needed on the server.

Install Docker Engine from its official Ubuntu repository, Docker Compose v2, Nginx, and Certbot:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx nano
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Create a dedicated SSH deployment account (or use an existing non-root account), install its authorized SSH public key, and grant it Docker access:

```bash
sudo adduser --disabled-password --gecos "" vegbazar-deploy
sudo usermod -aG docker vegbazar-deploy
```

Membership in the `docker` group effectively grants root-level control of the host. Protect this account and its SSH key accordingly. Log in again after changing group membership.

Create the deployment directory and persistent writable paths. The Node image runs as UID/GID 1000; Nginx runs as UID/GID 101:

```bash
sudo install -d -o vegbazar-deploy -g vegbazar-deploy -m 0750 /opt/apps/vegbazar
sudo install -d -o vegbazar-deploy -g vegbazar-deploy -m 0750 /opt/apps/vegbazar/frontend
sudo install -d -o vegbazar-deploy -g vegbazar-deploy -m 0750 /opt/apps/vegbazar/backend
sudo install -d -o 1000 -g 1000 -m 0750 \
  /opt/apps/vegbazar/backend/data/invoices \
  /opt/apps/vegbazar/backend/data/uploads \
  /opt/apps/vegbazar/backend/data/reports
```

Each repository now deploys completely independently:
- Frontend (`VegBazar`) deploys to `/opt/apps/vegbazar/frontend/` (port `8085`)
- Backend (`VegBazar_Backend`) deploys to `/opt/apps/vegbazar/backend/` (port `4041`)

Install the separate Nginx templates manually:

```bash
# Run locally from the VegBazar frontend repository.
scp deploy/nginx/vegbazar-frontend.conf "$VPS_USER@$VPS_HOST:/tmp/vegbazar-frontend.conf"
scp deploy/nginx/vegbazar-backend.conf "$VPS_USER@$VPS_HOST:/tmp/vegbazar-backend.conf"

# Run on the VPS.
sudo install -m 0644 /tmp/vegbazar-frontend.conf /etc/nginx/sites-available/vegbazar-frontend.conf
sudo install -m 0644 /tmp/vegbazar-backend.conf /etc/nginx/sites-available/vegbazar-backend.conf
sudo ln -sf /etc/nginx/sites-available/vegbazar-frontend.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/vegbazar-backend.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Before enabling it, inspect the existing sites for these exact `server_name` values. If an old VegBazar virtual host already exists, back it up and merge/replace only its VegBazar server blocks rather than enabling duplicate names. This template does not remove or replace unrelated sites. Avoid changing the Nginx document root to `/opt/apps/vegbazar`; secrets and deployment files must stay outside any public document root.

## 2. GHCR setup

Each workflow publishes its own package using the repository-scoped `GITHUB_TOKEN` with `packages: write`. In GitHub, allow the packages to inherit access from their respective repositories or grant the workflow repository access.

On the VPS, create a GitHub **classic personal access token** restricted to `read:packages` (and grant package access if required by package visibility). Log in as the deployment account; do not put this token in `.env`, workflow YAML, or an image:

```bash
# As vegbazar-deploy; enter the read-only token at the prompt.
read -rsp "GHCR read-only token: " GHCR_READ_TOKEN; echo
printf '%s' "$GHCR_READ_TOKEN" | docker login ghcr.io --username codax69 --password-stdin
unset GHCR_READ_TOKEN
chmod 600 "$HOME/.docker/config.json"
```

The Docker credential file is sensitive and should remain readable only by the deployment account. Rotate the token if that account or host is compromised.

## 3. GitHub repository secrets and variables

Add these **repository secrets to both repositories**, because each has its own deploy workflow:

| Secret        | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| `VPS_HOST`    | VPS hostname or IP address (not a URL)                       |
| `VPS_USER`    | Non-root SSH account; legacy `VPS_USERNAME` is also accepted |
| `VPS_SSH_KEY` | Private SSH key authorized for that account                  |

The workflow enforces SSH host-key checking. `VPS_KNOWN_HOSTS` is an optional additional secret containing the independently verified host key entry (recommended); if it is absent, the workflow uses `ssh-keyscan` for that run. Never disable host-key checking.

The backend workflow also checks out the two deployment files from the frontend repository. If that repository is private, add `DEPLOYMENT_REPO_TOKEN` to the backend repository as a fine-grained token with read-only Contents access to `codax69/VegBazar`.

The frontend build reads the existing `VITE_RAZORPAY_KEY_ID` Vite variable. If live payments are configured, set it as a GitHub repository **variable** named `VITE_RAZORPAY_KEY_ID`; otherwise the existing application fallback remains in effect. This is a publishable key identifier, not the Razorpay secret.

No VPS SSH, database, mail, payment, AI, Cloudinary, or JWT secret is needed by either image-build job.

## 4. Backend environment file

Create `/opt/apps/vegbazar/.env` on the VPS. Keep it outside the Nginx document root and restrict access:

```bash
sudo -u vegbazar-deploy install -m 0600 /dev/null /opt/apps/vegbazar/.env
sudo -u vegbazar-deploy editor /opt/apps/vegbazar/.env
```

Set values from the actual backend integrations; do not copy credentials into this document or source control. The backend reads these variable names:

| Variable(s)                                                            | Use                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `DB_URI`                                                               | Required MongoDB connection string; use the existing Atlas URI if that is the configured database |
| `DB_NAME`                                                              | Optional database-name override                                                                   |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`                                     | Authentication signing secrets                                                                    |
| `FRONTEND_URL`                                                         | Frontend origin used in email/reset links; set to `https://vegbazar.store`                        |
| `RAZORPAY_KEY_ID`, `RAZORPAY_SECRET`                                   | Razorpay integration                                                                              |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary integration                                                                            |
| `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_EMAIL`                              | Email and administrative notifications                                                            |
| `SMTP_HOST`, `SMTP_PORT`                                               | SMTP settings; code has a host/port fallback                                                      |
| `MAILER_MAIL`, `MAILER_PASSWORD`                                       | OTP mailer integration                                                                            |
| `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `GOOGLE_CLIENT_ID`                   | Existing Auth0/Google authentication configuration                                                |
| `GROQ_API_KEY`, `GROQ_MODEL`                                           | AI assistant; the model has an application fallback                                               |
| `RECAPTCHA_SECRET_KEY`                                                 | CAPTCHA verification                                                                              |
| `REDIS_URL`                                                            | Optional Redis integration                                                                        |
| `USER_DOMAIN`, `ADMIN_DOMAIN`, `ADMIN_SECRET_KEY`                      | Existing account-domain/admin options; the domains have application fallbacks                     |

Only the variables required by the enabled application features need values. Compose sets `NODE_ENV=production` and `PORT=4000`; do not rely on a differing `PORT` from the external file. Use valid Compose env-file quoting if a value contains whitespace, `#`, or `$`, and verify it is parsed as intended. Ensure the final file is owned by the deployment user and mode `0600`.

## 5. Initial deployment

Wait for a successful `main` workflow run in **both** repositories. Each run publishes the full source commit SHA to:

- `ghcr.io/codax69/vegbazar-frontend:<frontend-commit-sha>`
- `ghcr.io/codax69/vegbazar-backend:<backend-commit-sha>`

On the VPS, create `/opt/apps/vegbazar/release.env` with the exact two SHA values shown in the successful workflow runs:

```dotenv
GHCR_OWNER=codax69
FRONTEND_IMAGE_TAG=<40-character-frontend-commit-sha>
BACKEND_IMAGE_TAG=<40-character-backend-commit-sha>
```

`release.env` contains image metadata only, not secrets. Set its owner and permissions:

```bash
chown vegbazar-deploy:vegbazar-deploy /opt/apps/vegbazar/release.env
chmod 0640 /opt/apps/vegbazar/release.env
```

As the deployment user, start the two pinned images:

```bash
cd /opt/apps/vegbazar
docker compose --env-file .env --env-file release.env -f docker-compose.yml pull
docker compose --env-file .env --env-file release.env -f docker-compose.yml up -d --wait
docker compose --env-file .env --env-file release.env -f docker-compose.yml ps
curl --fail http://127.0.0.1:8085/healthz
curl --fail http://127.0.0.1:4041/health
```

Open the two domains after configuring HTTPS below. Do not declare the deployment successful until the health checks and external routes have been tested on the actual VPS.

## 6. Automated deployment

Push to `main` in either repository. Its workflow runs lint/build (frontend) or tests (backend), verifies the Docker build, publishes both the SHA tag and `latest`, and SSHes to `/opt/apps/vegbazar/deploy.sh`. It updates only that service’s pinned SHA, pulls that one image, and waits for Compose and host-port health checks. `latest` is never selected for deployment.

Deployments from the two repositories serialize on the VPS with `flock`; neither workflow stops unrelated containers or reloads host Nginx. If an automatic health check fails, the script restores the previous tag and attempts to bring the last working container back. It retains the previous successful image tag per service in `.previous-release.env` and never prunes images or volumes.

## 7. Host Nginx and HTTPS

The template at `deploy/nginx/vegbazar.conf` has HTTP virtual hosts for:

- `vegbazar.store`: frontend on loopback port 8085; `/api` and `/api/*` are forwarded to backend port 4041 to preserve existing frontend API calls.
- `api.vegbazar.pritesh.site`: all paths are forwarded to backend port 4041.

The template forwards the original host, client IP, forwarded chain, and scheme, and permits 10 MB requests (the backend's Multer file limit is 5 MB). It does not configure WebSockets because the existing API does not use them. Check DNS and firewall rules, then validate the added site:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Issue and install a certificate for both names with Certbot’s Nginx plugin:

```bash
sudo certbot --nginx -d vegbazar.store -d api.vegbazar.pritesh.site
sudo certbot renew --dry-run
```

Certbot updates only the matching server blocks in this site. Review the resulting config with `sudo nginx -t`; do not overwrite unrelated sites.

## 8. Monitoring and logs

```bash
cd /opt/apps/vegbazar
docker compose --env-file .env --env-file release.env -f docker-compose.yml ps
docker compose --env-file .env --env-file release.env -f docker-compose.yml top
docker inspect --format '{{json .State.Health}}' "$(docker compose --env-file .env --env-file release.env -f docker-compose.yml ps -q backend)"
```

View bounded container output:

```bash
docker compose --env-file .env --env-file release.env -f docker-compose.yml logs --tail=100 backend
docker compose --env-file .env --env-file release.env -f docker-compose.yml logs --tail=100 frontend
```

The Docker `local` log driver rotates each service’s logs (10 MB, three files). Invoice PDFs, report workbooks, and Multer temporary uploads are bind-mounted under `/opt/apps/vegbazar/data/`, outside disposable containers. The app currently sends logs to stdout/stderr; do not write persistent logs into the image filesystem.

## 9. Updating and rollback

Normal updates happen on pushes to `main`; the script retains the prior successful pair of tags in `.previous-release.env`. To roll back one service:

```bash
cd /opt/apps/vegbazar
bash ./deploy.sh rollback frontend
# or
bash ./deploy.sh rollback backend
```

The script serializes the operation, pulls the previous pinned image, waits for health, and restores the former active release metadata if rollback itself fails. Do not run `docker system prune -a`, remove the data directories, or delete GHCR tags needed for rollback.

## 10. Common deployment errors

- **Compose says a tag or owner is missing:** check `release.env` spelling, full 40-character lowercase SHA values, and `GHCR_OWNER=codax69`.
- **Image pull is denied:** confirm both package names/permissions and that the deployment account is logged into GHCR with a read-only package token.
- **MongoDB connection fails:** verify `DB_URI`, Atlas network allowlisting, database credentials, and outbound DNS/network access from the VPS.
- **Backend health check stays unhealthy:** inspect backend logs and ensure its required integration settings are present; the API waits for the database connection before listening.
- **Frontend API calls fail:** verify the frontend domain’s `/api/` host-Nginx location and backend loopback binding on port 4041.
- **Nginx reports a conflict or syntax error:** run `sudo nginx -t`, inspect the newly installed site, and preserve other virtual-host files.
- **HTTPS issuance fails:** verify both DNS records resolve to the VPS and ports 80/443 are reachable before running Certbot.
- **Uploads or generated files fail with permissions errors:** check that `data/invoices`, `data/uploads`, and `data/reports` are writable by UID/GID 1000; do not solve this by running the backend as root.
- **Workflow cannot SSH:** verify the three GitHub secrets, authorized public key, host-key fingerprint, and that the deployment user can run Docker and access `/opt/apps/vegbazar`.
- **SSH prints a post-quantum key-exchange warning:** this is informational and does not itself fail deployment; update the VPS OpenSSH server when a compatible update is available.
