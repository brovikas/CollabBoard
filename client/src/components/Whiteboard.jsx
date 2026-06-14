import { useRef, useEffect, useState, useCallback } from "react";
import { socket } from "../socket.js";

const COLORS = [
  "#2d2a26", // ink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#6366f1", // indigo / accent
  "#a855f7", // purple
  "#ec4899", // pink
];

const SIZES = [2, 4, 8, 14];

export default function Whiteboard({ roomId, initialStrokes }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef(null);
  const strokesRef = useRef([]); // all completed strokes for redraw
  const previewStrokesRef = useRef(new Map()); // socketId -> in-progress stroke

  const [color, setColor] = useState(COLORS[6]);
  const [size, setSize] = useState(SIZES[1]);
  const [tool, setTool] = useState("pen"); // pen | eraser

  // Resize canvas to fill its container while keeping drawing intact
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const ratio = window.devicePixelRatio || 1;

    const { width, height } = container.getBoundingClientRect();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    redrawAll();
  }, []);

  const redrawAll = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);

    strokesRef.current.forEach((stroke) => drawStroke(ctx, stroke));
    previewStrokesRef.current.forEach((stroke) => drawStroke(ctx, stroke));
  }, []);

  const drawStroke = (ctx, stroke) => {
    if (!stroke || !stroke.points || stroke.points.length < 1) return;

    ctx.beginPath();
    ctx.strokeStyle =
      stroke.tool === "eraser" ? "#faf8f5" : stroke.color || "#2d2a26";
    ctx.lineWidth = stroke.size || 4;

    const points = stroke.points;
    if (points.length === 1) {
      // Dot
      ctx.arc(points[0].x, points[0].y, (stroke.size || 4) / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      return;
    }

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  // Setup canvas + socket listeners
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (initialStrokes && initialStrokes.length) {
      strokesRef.current = initialStrokes;
      redrawAll();
    }

    const handleDrawStroke = (stroke) => {
      strokesRef.current.push(stroke);
      redrawAll();
    };

    const handleDrawPreview = ({ socketId, points, color, size, tool, done }) => {
      if (done) {
        previewStrokesRef.current.delete(socketId);
      } else {
        previewStrokesRef.current.set(socketId, { points, color, size, tool });
      }
      redrawAll();
    };

    const handleClearCanvas = () => {
      strokesRef.current = [];
      previewStrokesRef.current.clear();
      redrawAll();
    };

    const handleCanvasSync = (canvasData) => {
      strokesRef.current = canvasData || [];
      previewStrokesRef.current.clear();
      redrawAll();
    };

    const handleCursorLeave = ({ socketId }) => {
      previewStrokesRef.current.delete(socketId);
      redrawAll();
    };

    socket.on("draw-stroke", handleDrawStroke);
    socket.on("draw-preview", handleDrawPreview);
    socket.on("clear-canvas", handleClearCanvas);
    socket.on("canvas-sync", handleCanvasSync);
    socket.on("cursor-leave", handleCursorLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      socket.off("draw-stroke", handleDrawStroke);
      socket.off("draw-preview", handleDrawPreview);
      socket.off("clear-canvas", handleClearCanvas);
      socket.off("canvas-sync", handleCanvasSync);
      socket.off("cursor-leave", handleCursorLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeCanvas, redrawAll, initialStrokes]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const point = getPoint(e);
    isDrawingRef.current = true;
    currentStrokeRef.current = {
      id: `${socket.id}-${Date.now()}`,
      tool,
      color,
      size,
      points: [point],
    };
    redrawWithCurrent();
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const point = getPoint(e);
    currentStrokeRef.current.points.push(point);
    redrawWithCurrent();

    socket.emit("draw-preview", {
      roomId,
      data: {
        points: currentStrokeRef.current.points,
        color: currentStrokeRef.current.color,
        size: currentStrokeRef.current.size,
        tool: currentStrokeRef.current.tool,
        done: false,
      },
    });
  };

  const redrawWithCurrent = () => {
    redrawAll();
    if (currentStrokeRef.current) {
      drawStroke(ctxRef.current, currentStrokeRef.current);
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (stroke && stroke.points.length > 0) {
      strokesRef.current.push(stroke);
      socket.emit("draw-stroke", { roomId, stroke });
      socket.emit("draw-preview", {
        roomId,
        data: { points: [], color, size, tool, done: true },
      });
    }
    redrawAll();
  };

  const handleClear = () => {
    strokesRef.current = [];
    redrawAll();
    socket.emit("clear-canvas", { roomId });
  };

  const handleUndo = () => {
    socket.emit("undo-stroke", { roomId });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white border-b border-cream-dark rounded-t-3xl">
        {/* Tool toggle */}
        <div className="flex items-center bg-cream rounded-2xl p-1 gap-1">
          <button
            onClick={() => setTool("pen")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              tool === "pen"
                ? "bg-white shadow-sm text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              tool === "eraser"
                ? "bg-white shadow-sm text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            🧹 Eraser
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              className={`w-6 h-6 rounded-full border-2 transition ${
                color === c && tool === "pen"
                  ? "border-accent scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        {/* Sizes */}
        <div className="flex items-center gap-1.5 bg-cream rounded-2xl p-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                size === s ? "bg-white shadow-sm" : "hover:bg-white/60"
              }`}
              aria-label={`Brush size ${s}`}
            >
              <span
                className="rounded-full bg-ink"
                style={{ width: s, height: s }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={handleUndo}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-cream text-ink hover:bg-cream-dark transition"
        >
          ↩ Undo
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition"
        >
          🗑 Clear Board
        </button>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 bg-white rounded-b-3xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="canvas-cursor absolute inset-0 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
