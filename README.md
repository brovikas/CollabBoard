# CollabBoard

A real-time collaborative whiteboard and notes app, built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. Multiple people can join the same room using a shared code, draw together on a canvas, and write shared notes — all updated live for everyone in the room.

---

- **Live Preview:** [collaboardvex.vercel.app]

## Features

- **Realtime drawing** — pen and eraser tools, multiple colors, adjustable brush sizes, live stroke previews while others draw
- **Shared notes** — a text area that syncs instantly across everyone in the room
- **Rooms** — create a new room (random code) or join an existing one with a code or shared link
- **Live presence** — see who's online with avatars and names in a dropdown member list
- **Persistence** — board strokes and notes are saved to MongoDB, so reloading or rejoining restores everything
- **Undo & clear board** — remove the last stroke or wipe the canvas for everyone
- **Responsive, premium UI** — soft cream/indigo theme, rounded cards, built with Tailwind CSS

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS v4 |
| Realtime | Socket.io |
| Backend  | Node.js, Express |
| Database | MongoDB, Mongoose |
| Deployment | Render, Vercel |

---

## Project Structure

```
collab-board/
├── server/
│   ├── models/
│   │   └── Room.js              # Schema: room ID, canvas strokes, shared text
│   ├── routes/
│   │   └── roomRoutes.js        # REST: create/join, fetch, list rooms
│   ├── socket/
│   │   └── socketHandlers.js    # Realtime events: drawing, text, presence
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Entry point
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Whiteboard.jsx   # Canvas drawing
    │   │   ├── TextEditor.jsx   # Shared notes
    │   │   └── UserList.jsx     # Online members dropdown
    │   ├── pages/
    │   │   ├── Home.jsx         # Create/join room
    │   │   └── Room.jsx         # Main collaboration view
    │   ├── api.js                # REST helper
    │   ├── socket.js              # Socket.io client instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              # Tailwind v4 theme tokens
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend (separate terminal)
cd client
npm install
```

### 2. Configure environment variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/collab-design-tool
CLIENT_URL=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the app

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Open `http://localhost:5173`. Open the same room link in a second tab or browser to test real-time sync.

---

## Deployment (Render + Vercel)

### MongoDB
Use MongoDB Atlas (free tier works). Whitelist all IPs (`0.0.0.0/0`) for simplicity, or restrict to Render's IPs.

### Backend → Render

1. Push your code to GitHub.
2. Render dashboard → **New → Web Service**, connect your repo, set root directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables:
   - `MONGO_URI` → your Atlas connection string
   - `CLIENT_URL` → your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
6. Deploy and note the generated URL (e.g. `https://collab-server.onrender.com`)

### Frontend → Vercel

1. Vercel dashboard → **New Project**, import the repo, set root directory to `client`.
2. Framework preset: Vite (auto-detected, output directory `dist`)
3. Environment variables:
   - `VITE_API_URL` → `https://collab-server.onrender.com/api`
   - `VITE_SOCKET_URL` → `https://collab-server.onrender.com`
4. Deploy.

### Final step

Once Vercel gives you the live domain, update `CLIENT_URL` on Render to match exactly (including `https://`) and redeploy the backend so CORS allows requests from your frontend.

---

## How It Works

1. **Home page** — enter your name, then create a new room (random 6-character code) or join an existing one by code.
2. **Room page** —
   - **Whiteboard**: pen/eraser tools, color palette, brush sizes, undo, and clear-board actions.
   - **Shared notes**: a text panel synced live across all participants.
   - **Members list**: click the avatar stack in the header to see everyone currently online with their name and avatar.
   - **Share Link**: copies the room URL so others can join instantly.
3. Every stroke, text edit, undo, and clear is broadcast via Socket.io to everyone in the room and persisted (debounced) to MongoDB.

---

## Socket.io Events Reference

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `join-room` | client → server | `{ roomId, username, color }` | Join room, request initial state |
| `room-data` | server → client | `{ canvasData, textContent }` | Initial board/notes on join |
| `user-list` | server → client | `[{ socketId, username, color }]` | Updated list of online users |
| `user-joined` | server → client | `{ username, color }` | New user joined notification |
| `draw-stroke` | both | `{ roomId, stroke }` | A completed stroke |
| `draw-preview` | both | `{ roomId, data }` | Live in-progress stroke |
| `clear-canvas` | both | `{ roomId }` | Clear the whole board |
| `undo-stroke` | client → server | `{ roomId }` | Remove the last stroke |
| `canvas-sync` | server → client | `canvasData[]` | Full canvas resync after undo |
| `text-update` | both | `{ roomId, content }` | Shared notes change |
| `cursor-move` | both | `{ roomId, x, y }` | Live cursor position (optional) |

---

