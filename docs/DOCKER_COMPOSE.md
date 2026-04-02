# Docker Compose - Development

This project includes a simple Docker Compose setup to run the Expo dev server in a container for local development.

What it provides

- `app` service: builds using `Dockerfile.dev` and runs the Expo dev server.
- `db` service: a local Postgres instance (basic) for convenience if you want to run a local DB.

Quick start

1. Build and start services:

```bash
docker compose up --build
```

2. Open the Expo dev tools in the browser (printed by the container) or use the Expo Go app on your device.

Notes & tips

- Ports exposed:
  - 19000 - Expo/Metro
  - 19001 - Expo dev tools
  - 19002 - Expo debugger
  - 8081  - Metro bundler

- On Docker Desktop for Mac/Windows, `host.docker.internal` should resolve to your host machine. The compose service sets `REACT_NATIVE_PACKAGER_HOSTNAME=host.docker.internal` which helps device connections.

- The container mounts the repository into `/usr/src/app` and keeps `node_modules` inside the container to avoid host/OS module mismatch.

- Environment variables such as Supabase URLs and Stripe keys should be provided to the container at runtime. For quick testing you can copy `.env.example` to `.env` and add values, then pass them to Docker Compose, e.g.:

```bash
# example (PowerShell)
$env:EXPO_PUBLIC_SUPABASE_URL = 'http://db:5432'
docker compose up --build
```

or export before running on Unix:

```bash
export EXPO_PUBLIC_SUPABASE_URL=http://db:5432
docker compose up --build
```

Troubleshooting

- If your device can't connect to the Metro bundler, ensure `REACT_NATIVE_PACKAGER_HOSTNAME` points to an address reachable by the device (e.g., your host IP or `host.docker.internal`).
- On Windows, Docker Desktop is recommended for `host.docker.internal` support.

