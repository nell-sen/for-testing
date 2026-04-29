# 🤖 Nell VPS Panel v2.0 — Production Grade

Bot hosting panel: Express backend + React frontend. Multi-user, multi-bot, real-time, Docker-sandboxed.

## What's new in v2.0

- 🔐 JWT **Access + Refresh** tokens, RBAC (admin/user)
- 🐳 **Docker sandbox** for bot execution (CPU/RAM limits, isolated)
- 🛡️ Helmet, rate limiting, Joi input validation, CORS allowlist
- 📊 Real-time system + bot stats via **Socket.IO**
- 🔑 **API Key** system (per-user, hashed)
- 📦 **Bot templates** (whatsapp / telegram / discord / custom)
- 📈 **Per-user usage limits** (bot count, CPU, RAM)
- 🧠 In-memory **cache** (NodeCache)
- 🔁 **Auto-restart** on crash + PM2 ecosystem
- 🌐 Frontend **Base URL switcher** (dynamic, no hardcode)
- ✅ All v1 endpoints kept — **zero feature loss**

## Quick start

### Backend
```bash
cd backend
cp .env.example .env   # edit secrets!
npm install
npm start              # or: pm2 start ecosystem.config.js
```
Default: http://localhost:4000 — login `admin` / `123admin`

### Frontend (Lovable project, separate)
The frontend lives in your Lovable project. In the login screen, set
**Backend URL** to your VPS (e.g. `https://api.example.com`).

## Endpoints

| Method | Endpoint | Notes |
|---|---|---|
| POST | /api/auth/login | returns access + refresh + user |
| POST | /api/auth/refresh | rotate tokens |
| POST | /api/auth/logout | invalidate session |
| GET  | /api/auth/me | current user |
| POST | /api/auth/change-password | change own password |
| GET/POST/DELETE | /api/auth/users[/:id] | admin only |
| GET  | /api/bots | list (scoped by role) |
| POST | /api/bots | create |
| GET  | /api/bots/templates | list templates |
| GET/PATCH/DELETE | /api/bots/:id | CRUD |
| POST | /api/bots/:id/{start,stop,restart} | lifecycle |
| POST | /api/bots/:id/command | run npm/node/yarn |
| GET  | /api/bots/:id/logs | last 100 lines |
| GET  | /api/files/:id?path=. | list files |
| GET  | /api/files/:id/read?path=... | read file |
| POST | /api/files/:id/{write,mkdir,delete} | mutate |
| POST | /api/files/:id/upload | multipart |
| GET  | /api/files/:id/download | ZIP backup |
| GET  | /api/system/stats | CPU/RAM/disk |
| GET/POST/DELETE | /api/keys[/:id] | API keys |
| GET  | /api/health | status |

All require `Authorization: Bearer <token>` OR `X-API-Key: <key>`.

## Test

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123admin"}'

# List bots
curl http://localhost:4000/api/bots -H "Authorization: Bearer $TOKEN"

# Health
curl http://localhost:4000/api/health
```

## Folder structure

```
backend/
├── server.js                    # Express + Socket.IO entry
├── ecosystem.config.js          # PM2 config
├── config/auth.js               # JWT (access+refresh), bcrypt
├── middleware/
│   ├── auth.js                  # requireAuth, requireRole, socketAuth
│   ├── validate.js              # Joi factory
│   ├── errorHandler.js          # Centralized errors
│   └── rateLimit.js             # API + auth limiters
├── validators/schemas.js        # All Joi schemas
├── routes/                      # auth/bots/files/system/apikeys
├── controllers/                 # Thin request handlers
├── services/
│   ├── botService.js            # CRUD + lifecycle + log buffer
│   ├── fileService.js           # Path-traversal-safe FS
│   ├── monitorService.js        # systeminformation + broadcast
│   └── apiKeyService.js         # Hashed API keys
├── sandbox/dockerSandbox.js     # Dockerode-based isolated executor
├── utils/                       # logger, response, storage, cache
├── bots/                        # one folder per bot id
└── storage/                     # users.json, bots.json, apikeys.json, logs/
```

## Security notes

- Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `.env`
- Set tight `CORS_ORIGINS`
- Use Docker (default) — `child_process` only for trusted users
- Rate limits: 200 req/min general, 10/15min on auth
- File ops blocked outside `/bots/<id>/`
- API keys hashed with bcrypt (shown plaintext only on creation)
