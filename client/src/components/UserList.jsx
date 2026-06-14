export default function UserList({ users }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((u) => (
          <div
            key={u.socketId}
            title={u.username}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: u.color }}
          >
            {u.username?.charAt(0).toUpperCase() || "?"}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-cream-dark flex items-center justify-center text-xs font-semibold text-ink shadow-sm">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs text-muted hidden sm:inline">
        {users.length} online
      </span>
    </div>
  );
}
