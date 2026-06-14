import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import { joinOrCreateRoom } from "../api.js";
import Whiteboard from "../components/Whiteboard.jsx";
import TextEditor from "../components/TextEditor.jsx";
import UserList from "../components/UserList.jsx";

const USER_COLORS = [
  "#6366f1",
  "#ec4899",
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#a855f7",
];

function randomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [username] = useState(
    () => sessionStorage.getItem("cb_username") || "Guest"
  );
  const [users, setUsers] = useState([]);
  const [initialStrokes, setInitialStrokes] = useState([]);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("board"); // mobile: board | notes
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        const room = await joinOrCreateRoom(roomId, `Room ${roomId}`);
        if (!mounted) return;

        setInitialStrokes(room.canvasData || []);
        setInitialText(room.textContent || "");

        if (!socket.connected) socket.connect();

        socket.emit("join-room", {
          roomId,
          username,
          color: randomColor(),
        });

        socket.on("room-data", (data) => {
          if (data.canvasData?.length) setInitialStrokes(data.canvasData);
          if (data.textContent) setInitialText(data.textContent);
        });

        socket.on("user-list", (list) => setUsers(list));

        setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Could not connect to the server. Please try again.");
          setLoading(false);
        }
      }
    }

    setup();

    return () => {
      mounted = false;
      socket.off("room-data");
      socket.off("user-list");
      socket.disconnect();
    };
  }, [roomId, username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted text-sm">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-sm">
          <p className="text-ink font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-2xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-cream-dark shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a4 4 0 01-1.414.94l-3.243 1.214 1.214-3.243a4 4 0 01.94-1.414z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h14" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-ink leading-tight">
              Room {roomId}
            </h1>
            <p className="text-xs text-muted leading-tight truncate">
              Signed in as {username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserList users={users} />
          <button
            onClick={handleCopyLink}
            className="px-3 sm:px-4 py-2 rounded-2xl bg-accent-soft text-accent-dark text-xs font-medium hover:bg-accent/15 transition whitespace-nowrap"
          >
            {copied ? "Copied!" : "Share Link"}
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="flex sm:hidden bg-white border-b border-cream-dark shrink-0">
        <button
          onClick={() => setActiveTab("board")}
          className={`flex-1 py-2.5 text-sm font-medium transition ${
            activeTab === "board"
              ? "text-accent border-b-2 border-accent"
              : "text-muted"
          }`}
        >
          🎨 Board
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 py-2.5 text-sm font-medium transition ${
            activeTab === "notes"
              ? "text-accent border-b-2 border-accent"
              : "text-muted"
          }`}
        >
          📝 Notes
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 p-3 sm:p-4 gap-4 flex flex-col sm:flex-row overflow-hidden">
        <div
          className={`flex-1 min-h-0 ${
            activeTab === "board" ? "flex" : "hidden sm:flex"
          } flex-col rounded-3xl shadow-sm border border-cream-dark overflow-hidden`}
        >
          <Whiteboard roomId={roomId} initialStrokes={initialStrokes} />
        </div>

        <div
          className={`sm:w-80 shrink-0 min-h-0 ${
            activeTab === "notes" ? "flex" : "hidden sm:flex"
          } flex-col`}
        >
          <TextEditor roomId={roomId} initialContent={initialText} />
        </div>
      </main>
    </div>
  );
}
