# Backend
## Setup
Create `backend/.env` (or set env vars in your shell):
- `MONGODB_URI` (or `MONGO_URI`) - Mongo connection string
- `JWT_SECRET` - secret used to sign/verify JWTs
- `PORT` (optional, default `5000`)
- `NODE_ENV` (optional; in non-production you can use the `x-user-id` header as a dev auth shortcut)

## Run
Install deps:
- `npm --prefix backend install`

Start dev server:
- `npm --prefix backend run dev`

## Health check
- `GET /api/health`

## Auth
- `POST /api/auth/signup`
- `POST /api/auth/signin`

## Wallet
All routes require auth:
- `GET /api/wallet`
- `POST /api/wallet`
- `PATCH /api/wallet`
- `DELETE /api/wallet`

## Transactions
All routes require auth:
- `POST /api/transactions`
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`
