const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: "Untitled Board",
    },
    // Stores the full drawing/canvas data so a board can be reloaded later
    canvasData: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    // Stores the shared text/notes content of the room
    textContent: {
      type: String,
      default: "",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
