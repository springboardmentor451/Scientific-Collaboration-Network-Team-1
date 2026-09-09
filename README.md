# Scientific-Collaboration-Network-Team-1

A research collaboration platform: publications, projects, citations, and
institutional networks, secured behind role-based access and 2FA.


## Tech Stack

- **API**: FastAPI (async)
- **ORM**: SQLAlchemy 2.0 (async engine)
- **Migrations**: Alembic
- **Auth**: JWT (access + refresh) + TOTP-based email OTP
- **DB**: SQLite (dev/test) · PostgreSQL (production)
- **Testing**: pytest, pytest-asyncio, httpx
- **API client**: Bruno


## Requirements

- Python 3.11+
- `uv` (or `pip`) for dependency management


## Setup

```bash
git clone <repo-url>
cd backend
uv sync                      # or: pip install -r requirements.txt
cp .env.example .env         # fill in real values before running
```


### Required `.env` values

| Variable | Purpose |
|----------|---------|
| `FASTAPI_ENV` | Environment mode: `development`, `testing`, or `production` |
| `JWT_KEY` | Secret signing key for JWTs (must be at least 32 characters) |
| `ALGORITHM` | JWT signing algorithm (e.g., `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Lifetime of access tokens in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Lifetime of refresh tokens in days |
| `DEV_DATABASE_URL` | Connection string for the development database |
| `ALLOWED_ORIGIN` | Frontend origin allowed for CORS requests |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Email delivery configuration (if unset, console notifier is used) |
| `ADMIN_ACTION` | Administrative action (`create` or `replace`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credentials for creating or replacing the system administrator |
| `CURRENT_ADMIN_EMAIL`, `CURRENT_ADMIN_PASSWORD` | Existing administrator credentials (required when replacing) |
| `NEW_ADMIN_EMAIL`, `NEW_ADMIN_PASSWORD` | New administrator credentials (required when replacing) |



## Running the App

```bash
cd backend
uv run -m main
```

API docs available at `http://localhost:8000/docs`.


## Creating the First Admin

No admin can self-register with `system_admin`, seed one directly:

```bash
cd backend
uv run scripts/create_superuser.py
```

Reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or `ADMIN_ACTION=replace` with
`CURRENT_ADMIN_*` / `NEW_ADMIN_*`) from `.env`.


## Database Migrations

```bash
alembic upgrade head          # apply all migrations
alembic revision --autogenerate -m "describe the change"
alembic downgrade -1          # roll back one step
```

SQLite can't `ALTER TABLE` directly, migrations touching existing columns use `batch_alter_table`. Always test `downgrade` before merging a new one.


## Running Tests

```bash
pytest tests/unit tests/integration     # fast suite, run this during development
pytest tests/concurrency -v -s          # race-condition suite, slower, non-deterministic timing
pytest                                   # everything (330 tests)
```

Test tiers:

- **`tests/unit/`**: schemas, token service, config, hashing. No DB, no HTTP.
- **`tests/integration/`**: full HTTP flows per module and per role, including negative cases.
- **`tests/concurrency/`**: simultaneous requests proving atomicity holds under contention.


## Project Structure

```
app/
├── core/        config, database, security, constants, validators
├── models/      SQLAlchemy ORM models
├── schemas/     Pydantic request/response models
├── services/    business logic, one class per domain
├── routes/      FastAPI routers, thin, delegate to services
└── utils/       email notifier, file upload helpers
scripts/         create_superuser.py, seed data
tests/
├── unit/
├── integration/
└── concurrency/
migrations/      Alembic revisions
```


## API Testing with Bruno

The `api-client/` folder is a full request collection covering every route.


**Environments** (`bruno/environments/`):

| Environment | Represents |
|---|---|
| `local-visitor` | No auth, public routes only |
| `local` | Fresh registration template |
| `local-researcher` | Logged-in researcher session |
| `local-reviewer` | Logged-in reviewer session |
| `local-institution-admin` | Scoped institution admin session |
| `local-admin` | System admin session |

Open the collection in Bruno Desktop, pick an environment, and run requests
in the order shown in each folder's `seq`.


## Key Design Decisions

- **Role assignment is admin-gated**: Users self-declare a `requested_role` at registration; `role` itself is only set on admin approval.
- **State transitions are atomic**: Approve/ban/reject use a conditional `UPDATE ... WHERE ... RETURNING`, not read-then-write, safe under concurrent admin actions.
- **Every uniqueness rule has a real database constraint**: Behind it (DOI, citation pairs, verification codes, collaboration membership), application-level checks alone don't survive concurrent requests.
- **Institution linkage is automatic**: A researcher's email domain is matched against registered institutions on profile creation.
