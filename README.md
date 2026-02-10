# Dating Chat - Stage 1

Ephemeral dating chat with roulette matching. No messages stored.

## Features (Stage 1)

- ✅ 3-minute roulette chat with random matching
- ✅ Mutual like system → private chat
- ✅ Private chat with 5-minute timer
- ✅ Mutual extend to continue chatting
- ✅ Clean, modern UI
- ✅ Test users with avatar selection

## Coming in Stage 2

- Facebook OAuth login
- Facebook group verification
- Real profile photos

## Local Development

### Prerequisites

- Node.js 18+
- Redis (local or Docker)

### Start Redis locally

```bash
# Option 1: Docker
docker run -d -p 6379:6379 redis:alpine

# Option 2: Install Redis directly
# macOS: brew install redis && redis-server
# Ubuntu: sudo apt install redis-server && sudo service redis start
```

### Start the backend

```bash
cd backend
npm install
npm run dev
```

Server runs on http://localhost:3001

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173

### Test the app

1. Open http://localhost:5173 in two browser tabs (or different browsers)
2. Register with different names in each tab
3. Click "Find Someone" in both tabs
4. Chat for 3 minutes, click Like in both
5. If both like → private chat starts!

## Deployment to Render

### Option 1: Using render.yaml (Blueprint)

1. Push code to GitHub
2. Go to Render Dashboard → New → Blueprint
3. Connect your repo
4. Render auto-detects `render.yaml` and creates all services
5. Set environment variables:
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://dating-chat-frontend.onrender.com`)
   - `VITE_API_URL`: Your backend URL (e.g., `https://dating-chat-api.onrender.com`)

### Option 2: Manual setup

**Create Redis:**
1. Render Dashboard → New → Redis
2. Name: `dating-chat-redis`
3. Plan: Starter ($10/month)

**Create Backend:**
1. Render Dashboard → New → Web Service
2. Connect repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `REDIS_URL`: (copy from Redis service)
   - `FRONTEND_URL`: (your frontend URL)

**Create Frontend:**
1. Render Dashboard → New → Static Site
2. Connect repo, set root directory to `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable:
   - `VITE_API_URL`: (your backend URL)
6. Add rewrite rule: `/*` → `/index.html`

## Project Structure

```
dating-chat/
├── backend/
│   ├── server.js      # Express + Socket.io server
│   ├── roulette.js    # Matching logic
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   └── components/
│   │       ├── Login.jsx
│   │       ├── Home.jsx
│   │       ├── Queue.jsx
│   │       ├── RouletteChat.jsx
│   │       ├── PrivateChat.jsx
│   │       ├── ChatMessage.jsx
│   │       ├── Timer.jsx
│   │       └── UserCard.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── render.yaml
```

## How It Works

### Data Flow (Nothing Stored!)

```
User connects → Socket.io connection
Register → User data in Redis (1hr expiry)
Join queue → Added to Redis list
Match found → Both users join Socket room
Messages → Pub/sub through Socket.io (never stored)
Timer expires → Session deleted from Redis
Disconnect → User removed from Redis
```

### Redis Keys (all auto-expire)

```
user:{socketId}        → User data (1hr expiry)
queue:roulette         → List of waiting users
session:{sessionId}    → Active roulette session (3min expiry)
likes:{sessionId}      → Set of users who liked
private:{chatId}       → Active private chat (5min expiry)
extend:{chatId}        → Set of users who voted extend
```

## Costs on Render

| Service | Plan | Cost |
|---------|------|------|
| Frontend | Static | FREE |
| Backend | Starter | $7/month |
| Redis | Starter | $10/month |
| **Total** | | **$17/month** |

Can handle ~1000 concurrent users on starter plans.
