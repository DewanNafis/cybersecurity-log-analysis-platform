# Cloud Deployment (Recommended)

This app has 2 services:
- **web**: Node/Express backend that also serves the built React frontend (`/dist`), plus `/api/*` and WebSocket `/ws`.
- **ml**: Python FastAPI service that loads your CICIDS `.pkl` models and serves predictions.

For a semester project, the most reliable “cloud” setup is:
- a small VPS (DigitalOcean / AWS EC2 / Azure VM)
- Docker + Docker Compose
- Nginx or Caddy as a reverse proxy for HTTPS

## 1) Prepare model files

Copy your `.pkl` files into:
- `cybersecurity-log-analysis-platform/ml_service/models/`

Expected names (from your notebooks):
- `random_forest_cicids.pkl`
- `scaler_cicids.pkl`
- `rf_multiclass_cicids.pkl`
- `scaler_multiclass_cicids.pkl`
- `label_encoder_cicids.pkl`

### Free hosting note (GitHub 100MB limit)

If your `.pkl` is larger than 100MB, GitHub will reject pushes.

For Render-only demos, the simplest process is:
- Upload the `.pkl` files as **GitHub Release assets** (or another public URL)
- Set ML service env vars to download them at startup:
  - `ML_MULTI_MODEL_URL`, `ML_MULTI_SCALER_URL`, `ML_MULTI_LABEL_ENCODER_URL`
  - (optional) `ML_FEATURE_COLUMNS_URL`

See `ml_service/README.md` for the full list.

## 2) Run on a server (Docker Compose)

On the VPS:

1. Install Docker + Compose
2. Clone your repo
3. Go into `cybersecurity-log-analysis-platform/`
4. Edit secrets in `docker-compose.yml` (or use environment variables)
5. Start:

- `docker compose up -d --build`

Health checks:
- `http://SERVER_IP:3001/api/health`
- `http://SERVER_IP:3001/api/ml/health` (requires login token)

## 3) Put HTTPS in front (best practice)

### Option A: Caddy (simplest)

Install Caddy on the VPS and configure:

```
YOUR_DOMAIN {
  reverse_proxy localhost:3001
}
```

Caddy will auto-issue Let’s Encrypt certificates.

### Option B: Nginx

Use Nginx with WebSocket support:

```
server {
  server_name YOUR_DOMAIN;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /ws {
    proxy_pass http://127.0.0.1:3001/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

Then add TLS via Certbot.

## 4) Cloud platforms notes

- **Avoid Vercel/Netlify for the backend** here (serverless) because:
  - WebSockets are tricky
  - SQLite file persistence is not a good fit

- **Render / Railway / Fly.io** can work if you:
  - use Docker deployments
  - attach persistent volumes for `cybersecurity.db`
  - deploy ML service as a second container/service

## 5) Security minimums

Before demoing publicly:
- Set a strong `JWT_SECRET`
- Change `DEFAULT_ADMIN_PASSWORD`
- Restrict who can access the admin account
- Consider disabling debug endpoints under `/api/debug/*` for production
