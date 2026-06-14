import { useEffect, useRef, useState } from "react";
import { socket } from "../socket.js";

export default function TextEditor({ roomId, initialContent }) {
  const [content, setContent] = useState(initialContent || "");
  const textareaRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    setContent(initialContent || "");
  }, [initialContent]);

  useEffect(() => {
    const handleTextUpdate = (incoming) => {
      isRemoteUpdate.current = true;
      setContent(incoming);
    };

    socket.on("text-update", handleTextUpdate);
    return () => socket.off("text-update", handleTextUpdate);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    socket.emit("text-update", { roomId, content: value });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-cream-dark overflow-hidden">
      <div className="px-4 py-3 border-b border-cream-dark flex items-center gap-2">
        <span className="text-lg">📝</span>
        <h2 className="text-sm font-semibold text-ink">Shared Notes</h2>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Type notes here — everyone in the room sees this live..."
        className="flex-1 w-full p-4 resize-none focus:outline-none text-sm leading-relaxed text-ink placeholder:text-muted/70 bg-transparent"
      />
    </div>
  );
}
