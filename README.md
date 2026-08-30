# ayvo-task

Interview starter project: a NestJS backend (Sequelize + Postgres) and a Next.js frontend, wired together and dockerized.

## Structure

- `backend/` — NestJS, empty of controllers/services/repositories. `AppModule` only wires up `ConfigModule` and `SequelizeModule` (connection only, no models yet).
- `frontend/` — Next.js (App Router), no components. `app/page.tsx` does a plain connection check against the backend.

## Run everything with Docker (recommended)

```bash
docker compose up --build
```

- Postgres: `localhost:5433` (db `ayvo_task`, user/pass `postgres`/`postgres`) — mapped to 5433 on the host to avoid clashing with a native Postgres install; the backend still talks to it internally on the standard 5432 over the docker network.
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

To inspect the database with pgAdmin/DBeaver/etc., connect to `localhost:5433`.

### Migrations

Schema is managed by Sequelize CLI migrations (`backend/src/database/migrations`), not auto-sync.

```bash
docker exec ayvo-backend npm run migrate            # apply migrations
docker exec ayvo-backend npm run migrate:undo       # roll back the last one
docker exec ayvo-backend npm run migration:generate -- create-something
```

The backend connects to Postgres automatically on startup (`DB_HOST=postgres` inside the compose network). Source is bind-mounted into both containers, so edits on the host hot-reload inside the containers.

## Run locally without Docker

You'll need a local Postgres instance matching `backend/.env`.

```bash
# backend
cd backend
npm install
npm run start:dev   # http://localhost:3001

# frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
```

## Env files

- `backend/.env` (from `.env.example`) — DB connection + port, used when running outside Docker.
- `frontend/.env.local` (from `.env.local.example`) — backend URL, used when running outside Docker.

Docker Compose sets its own environment variables directly in `docker-compose.yml`, overriding these.
