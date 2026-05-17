# Steps API (trust platform)

Backend for trust-wide rollout: schools, roles, central data, audit trail.

## Quick start

```bash
cd server
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

API: `http://localhost:3001/api/health`

## Seed logins

| Role | School / trust code | Username | PIN |
|------|---------------------|----------|-----|
| Student | `riverside-ap` | alex | 4821 |
| Student | `riverside-ap` | jordan | 7392 |
| Student | `oakfield` | sam | 4821 |
| School admin | `riverside-ap` | lead.ap | 0000 |
| Trust admin | `riverside` | trust.admin | 0000 |

## Production

1. Set `DATABASE_URL` to PostgreSQL (change `provider` in `prisma/schema.prisma`).
2. Set strong `JWT_SECRET`.
3. Host API (Azure, AWS, Railway, etc.) behind HTTPS.
4. Set frontend `VITE_DATA_MODE=api` and `VITE_API_URL`.

## Endpoints (v0.1)

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/me` (Bearer token)
- `GET /api/trust/schools/summary` (staff roles)

Progress sync endpoints come next.
