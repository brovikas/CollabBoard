import { useState, useRef, useEffect } from "react";

export default function UserList({ users }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-cream hover:bg-cream-dark transition"
      >
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((u) => (
            <div
              key={u.socketId}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: u.color }}
            >
              {u.username?.charAt(0).toUpperCase() || "?"}
            </div>
          ))}
          {users.length > 3 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent-dark shadow-sm">
              +{users.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs font-medium text-ink hidden sm:inline">
          {users.length} {users.length === 1 ? "person" : "people"}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl shadow-ink/10 border border-cream-dark p-2 z-50">
          <p className="text-xs font-semibold text-muted px-3 py-2">
            {users.length} {users.length === 1 ? "person" : "people"} online
          </p>

          {users.length === 0 ? (
            <p className="text-xs text-muted px-3 py-2">No one else is here yet.</p>
          ) : (
            <ul className="space-y-1">
              {users.map((u) => (
                <li
                  key={u.socketId}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cream transition"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm shrink-0"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-sm text-ink truncate">{u.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}