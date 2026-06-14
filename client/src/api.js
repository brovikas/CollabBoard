const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function joinOrCreateRoom(roomId, name) {
  const res = await fetch(`${API_URL}/rooms/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, name }),
  });

  if (!res.ok) {
    throw new Error("Failed to join or create room");
  }

  return res.json();
}

export async function fetchRecentRooms() {
  const res = await fetch(`${API_URL}/rooms`);
  if (!res.ok) {
    throw new Error("Failed to fetch rooms");
  }
  return res.json();
}
