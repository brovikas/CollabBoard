# CollabBoard — Realtime Collaborative Design Tool (MERN)

A simple, elegant MERN-stack application where multiple users can join a shared
"room" and draw on a whiteboard and write shared notes together in real time.

This is intentionally kept **basic** — no authentication, no complex shape
tools, no version history UI. It focuses on the core collaboration loop:
join a room → draw / write → see everyone's changes instantly.

---

## ✨ Features

- **Realtime drawing** — pen and eraser tools, multiple colors and brush sizes, synced instantly via Socket.io
- **Shared text notes** — a live collaborative text area per room
- **Rooms** — create a new room (random code) or join an existing one via code/link
- **Presence** — see who else is currently in the room (avatar list + live count)
- **Persistence** — board strokes and notes are saved to MongoDB, so reloading or rejoining restores the board
- **Undo & Clear board** — remove the last stroke or wipe the whole canvas for everyone
- **Responsive, premium UI** — soft cream/indigo theme, rounded corners, built with the latest Tailwind CSS (v4, CSS-first config, no PostCSS config needed)

---

## 🧱 Tech Stack

| Layer      | Tech                                              |
|------------|---------------------------------------------------|
| Frontend   | React 18 + Vite, React Router, Tailwind CSS v4    |
| Realtime   | Socket.io (client + server)                       |
| Backend    | Node.js + Express                                  |
| Database   | MongoDB + Mongoose                                 |

---

## 📁 Project Structure

```
collab-design-tool/
├── server/                  # Express + Socket.io backend
│   ├── models/
│   │   └── Room.js          # Mongoose schema for rooms (canvas + text data)
│   ├── routes/
│   │   └── roomRoutes.js     # REST endpoints (join/create/list rooms)
│   ├── socket/
│   │   └── socketHandlers.js # All realtime event handling
│   ├── .env.example
│   ├── package.json
│   └── server.js             # Entry point
│
└── client/                  # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── Whiteboard.jsx  # Canvas drawing component
    │   │   ├── TextEditor.jsx  # Shared notes textarea
    │   │   └── UserList.jsx    # Online users avatars
    │   ├── pages/
    │   │   ├── Home.jsx        # Landing page (join/create room)
    │   │   └── Room.jsx        # Main collaboration room
    │   ├── api.js               # REST API helper
    │   ├── socket.js             # Socket.io client instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css             # Tailwind v4 import + theme tokens
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Clone & install

```bash
# Backend
cd server
npm install

# Frontend (in a separate terminal)
cd client
npm install
```

### 2. Configure environment variables

**server/.env** (copy from `.env.example`):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/collab-design-tool
CLIENT_URL=http://localhost:5173
```

**client/.env** (copy from `.env.example`):

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the app

```bash
# Terminal 1 - start backend
cd server
npm run dev      # or: npm start

# Terminal 2 - start frontend
cd client
npm run dev
```

Open `http://localhost:5173` in your browser. To test real-time collaboration,
open the same room link in a second tab/window or a different browser.

---

## 🕹️ How It Works

1. **Home page** — Enter your name and either create a new room (gets a random
   6-character code) or join an existing room via its code.
2. **Room page** — You'll see:
   - A **whiteboard** (left/main) with pen/eraser tools, color palette, brush
     sizes, undo, and clear-board actions.
   - A **shared notes panel** (right, or via tab on mobile) — a plain text area
     that syncs live across all participants.
   - A **presence bar** at the top showing avatars of everyone currently online
     in the room, plus a "Share Link" button to invite others.
3. Every stroke, text change, undo, and clear action is broadcast via
   **Socket.io** to all connected clients in that room, and persisted to
   **MongoDB** (debounced) so the board state survives reloads.

---

## 🎨 Design / Theming

The UI uses **Tailwind CSS v4** with a CSS-first theme defined in
`client/src/index.css` via the `@theme` directive

Theme tokens:

- `cream` / `cream-dark` — soft warm background tones
- `ink` — primary text color
- `muted` — secondary/subtle text
- `accent` / `accent-dark` / `accent-soft` — indigo accent for buttons, highlights, and active states
Rounded corners, soft shadows, and generous
spacing are used throughout for a calm, premium feel.

---

## 🔌 Socket.io Events Reference

| Event            | Direction        | Payload                                              | Purpose                                |
|-------------------|------------------|-------------------------------------------------------|-----------------------------------------|
| `join-room`       | client → server | `{ roomId, username, color }`                         | Join a room, get initial board/text data |
| `room-data`       | server → client | `{ canvasData, textContent }`                         | Initial state on join                    |
| `user-list`       | server → client | `[{ socketId, username, color }]`                     | Updated presence list                    |
| `user-joined`     | server → client | `{ username, color }`                                 | Someone joined notification              |
| `draw-stroke`     | both             | `{ roomId, stroke }`                                  | A completed stroke                       |
| `draw-preview`    | both             | `{ roomId, data }`                                    | In-progress stroke preview               |
| `clear-canvas`    | both             | `{ roomId }`                                          | Clear the whole board                    |
| `undo-stroke`     | client → server | `{ roomId }`                                          | Remove the last stroke                   |
| `canvas-sync`     | server → client | `canvasData[]`                                        | Full canvas resync (after undo)          |
| `text-update`     | both             | `{ roomId, content }`                                 | Shared notes text change                 |
| `cursor-move`     | both             | `{ roomId, x, y }`                                    | (Optional) live cursor position          |

---

## 📌 Notes & Possible Extensions

This project is deliberately minimal. Ideas for extending it:

- User authentication and saved/named boards per account
- Shapes (rectangles, circles, text labels) on the canvas
- Export board as an image (PNG)
- Room password protection
- Chat panel alongside notes
- Per-user cursor indicators on the canvas

---

## 📄 License

This project is provided as-is for learning and prototyping purposes.
