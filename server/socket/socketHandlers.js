const Room = require("../models/Room");

const roomUsers = new Map();
const saveTimers = new Map();

const SAVE_DELAY_MS = 2000;

function scheduleSave(roomId, updates) {
  if (saveTimers.has(roomId)) {
    clearTimeout(saveTimers.get(roomId));
  }

  const timer = setTimeout(async () => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { ...updates, lastActivity: new Date() },
        { upsert: true }
      );
    } catch (error) {
      console.error(`Failed to persist room ${roomId}:`, error.message);
    }
    saveTimers.delete(roomId);
  }, SAVE_DELAY_MS);

  saveTimers.set(roomId, timer);
}

function getUsersInRoom(roomId) {
  const users = roomUsers.get(roomId);
  return users ? Array.from(users.values()) : [];
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ---- Join Room ----
    socket.on("join-room", async ({ roomId, username, color }) => {
      try {
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.username = username || "Guest";
        socket.data.color = color || "#6366f1";

        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Map());
        }
        roomUsers.get(roomId).set(socket.id, {
          socketId: socket.id,
          username: socket.data.username,
          color: socket.data.color,
        });

        // Send current room data to the joining user
        const room = await Room.findOne({ roomId });
        socket.emit("room-data", {
          canvasData: room?.canvasData || [],
          textContent: room?.textContent || "",
        });

        // Notify everyone of updated user list
        io.to(roomId).emit("user-list", getUsersInRoom(roomId));

        // Notify others that someone joined
        socket.to(roomId).emit("user-joined", {
          username: socket.data.username,
          color: socket.data.color,
        });
      } catch (error) {
        console.error("join-room error:", error.message);
        socket.emit("error-message", "Failed to join room.");
      }
    });

    // ---- Drawing Events ----
    // A "draw-stroke" is a single completed stroke object: { id, points, color, size, tool }
    socket.on("draw-stroke", ({ roomId, stroke }) => {
      socket.to(roomId).emit("draw-stroke", stroke);

      // Persist by appending to canvasData (debounced)
      Room.findOne({ roomId })
        .then((room) => {
          const canvasData = room?.canvasData || [];
          canvasData.push(stroke);
          scheduleSave(roomId, { canvasData });
        })
        .catch((err) => console.error("draw-stroke save error:", err.message));
    });

    // Live cursor / in-progress stroke preview (not persisted)
    socket.on("draw-preview", ({ roomId, data }) => {
      socket.to(roomId).emit("draw-preview", {
        socketId: socket.id,
        ...data,
      });
    });

    // ---- Clear Canvas ----
    socket.on("clear-canvas", async ({ roomId }) => {
      io.to(roomId).emit("clear-canvas");
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { canvasData: [], lastActivity: new Date() },
          { upsert: true }
        );
      } catch (error) {
        console.error("clear-canvas error:", error.message);
      }
    });

    // ---- Undo last stroke ----
    socket.on("undo-stroke", async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (room && room.canvasData.length > 0) {
          room.canvasData.pop();
          await room.save();
          io.to(roomId).emit("canvas-sync", room.canvasData);
        }
      } catch (error) {
        console.error("undo-stroke error:", error.message);
      }
    });

    // ---- Shared Text Editor ----
    socket.on("text-update", ({ roomId, content }) => {
      socket.to(roomId).emit("text-update", content);
      scheduleSave(roomId, { textContent: content });
    });

    // ---- Cursor position broadcast (for live presence) ----
    socket.on("cursor-move", ({ roomId, x, y }) => {
      socket.to(roomId).emit("cursor-move", {
        socketId: socket.id,
        username: socket.data.username,
        color: socket.data.color,
        x,
        y,
      });
    });

    // ---- Disconnect ----
    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (roomId && roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        io.to(roomId).emit("user-list", getUsersInRoom(roomId));
        socket.to(roomId).emit("cursor-leave", { socketId: socket.id });

        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = registerSocketHandlers;
