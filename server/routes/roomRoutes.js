const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// Create or fetch a room by ID
router.post("/join", async (req, res) => {
  try {
    const { roomId, name } = req.body;

    if (!roomId || !roomId.trim()) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    let room = await Room.findOne({ roomId });

    if (!room) {
      room = await Room.create({
        roomId,
        name: name || `Room ${roomId}`,
      });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Server error while joining room" });
  }
});

// Get room data (canvas + text) for initial load
router.get("/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Server error while fetching room" });
  }
});

// List recently active rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find()
      .sort({ lastActivity: -1 })
      .limit(20)
      .select("roomId name lastActivity createdAt");

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error listing rooms:", error);
    res.status(500).json({ message: "Server error while listing rooms" });
  }
});

module.exports = router;
