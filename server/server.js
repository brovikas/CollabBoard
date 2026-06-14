require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const roomRoutes = require("./routes/roomRoutes");
const registerSocketHandlers = require("./socket/socketHandlers");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/collab-design-tool";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Routes
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
  res.send("Collaborative Design Tool API is running.");
});

// Socket.io
registerSocketHandlers(io);

// Connect to MongoDB then start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });
