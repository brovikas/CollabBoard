import { useState } from "react";
import { useNavigate } from "react-router-dom";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter your name.");
      return;
    }

    const finalRoomId = roomId.trim() || generateRoomId();
    sessionStorage.setItem("cb_username", username.trim());
    navigate(`/room/${finalRoomId.toUpperCase()}`);
  };

  const handleCreateNew = () => {
    if (!username.trim()) {
      setError("Please enter your name.");
      return;
    }
    sessionStorage.setItem("cb_username", username.trim());
    navigate(`/room/${generateRoomId()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
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
          <h1 className="text-2xl font-semibold font-display text-ink">
            CollabBoard
          </h1>
          <p className="text-muted text-sm mt-1">
            Draw, write, and brainstorm together in real time.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-ink/5 border border-cream-dark p-6 sm:p-8">
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition placeholder:text-muted/70 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Room Code{" "}
                <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter a code to join an existing room"
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition placeholder:text-muted/70 text-sm uppercase"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 -mt-1">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-accent text-white font-medium text-sm shadow-md shadow-accent/30 hover:bg-accent-dark active:scale-[0.99] transition-all"
            >
              Join Room
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-cream-dark flex-1" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px bg-cream-dark flex-1" />
          </div>

          <button
            onClick={handleCreateNew}
            className="w-full py-3 rounded-2xl bg-accent-soft text-accent-dark font-medium text-sm hover:bg-accent/15 active:scale-[0.99] transition-all"
          >
            Create a New Room
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Share the room code with others so they can join your board.
        </p>
      </div>
    </div>
  );
}
