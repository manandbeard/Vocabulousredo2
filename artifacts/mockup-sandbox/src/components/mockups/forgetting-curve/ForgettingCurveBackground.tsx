import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
}

const GRID_CELL_SIZE = 50;
const ANIMATION_DURATION = 10;
const DECAY_RATE = 0.5;
const LINE_HEIGHT = 300; // max height of the forgetting curve

export function ForgettingCurveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDecaying, setIsDecaying] = useState(true);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const lastClickRef = useRef<number>(0);

  // Generate grid pattern on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw grid
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 2;

    for (let x = 0; x < canvas.width; x += GRID_CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += GRID_CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Forgetting curve animation logic
  useEffect(() => {
    const animate = () => {
      timeRef.current += 16; // ~60fps at 16ms per frame

      const canvas = canvasRef.current;
      if (!canvas) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate progress (0-1) over ANIMATION_DURATION seconds
      const progress = (timeRef.current % (ANIMATION_DURATION * 1000)) / (ANIMATION_DURATION * 1000);

      // Time since last click (for recovery spike)
      const timeSinceClick = timeRef.current - lastClickRef.current;
      const recoveryProgress = Math.min(timeSinceClick / 500, 1); // Recovery spike over 500ms

      // Generate forgetting curve points
      const newPoints: Point[] = [];
      const pointCount = canvas.width / 20;

      for (let i = 0; i < pointCount; i++) {
        const x = (i / pointCount) * canvas.width;
        const normalizedX = i / pointCount; // 0 to 1

        // Forgetting curve: exponential decay
        let decay = Math.pow(normalizedX, DECAY_RATE);
        
        // Apply decay based on animation progress (dips over 10 seconds)
        decay = decay * Math.max(1 - progress * 0.7, 0.3);

        // Recovery spike on click (temporary boost)
        if (timeSinceClick < 500) {
          const spikeHeight = Math.sin(recoveryProgress * Math.PI) * 0.4;
          decay = Math.min(decay + spikeHeight, 1);
        }

        // Add glitch effect (randomly)
        const glitch = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.1 : 0;
        decay = Math.max(0, Math.min(1, decay + glitch));

        const y = canvas.height * 0.5 - (decay * LINE_HEIGHT);
        newPoints.push({ x, y });
      }

      setPoints(newPoints);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Handle click for recovery spike
  const handleClick = () => {
    lastClickRef.current = timeRef.current;
  };

  // Generate SVG path from points
  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` +
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  return (
    <div
      className="fixed inset-0 -z-10 bg-black cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Grid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Forgetting Curve SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(0, 255, 65, 0.3))" }}>
        {pathD && (
          <>
            {/* Curve line with hard border effect */}
            <path
              d={pathD}
              stroke="#000000"
              strokeWidth="6"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={pathD}
              stroke="#00FF41"
              strokeWidth="4"
              fill="none"
              vectorEffect="non-scaling-stroke"
              style={{
                filter: "drop-shadow(0 0 4px #00FF41)",
              }}
            />
            
            {/* Fill under curve with transparency */}
            <path
              d={`${pathD} L ${points[points.length - 1]?.x || 0} ${window.innerHeight} L 0 ${window.innerHeight} Z`}
              fill="#00FF41"
              opacity="0.08"
            />
          </>
        )}

        {/* Knowledge blocks floating */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = ((i * 137) % window.innerWidth) + 50;
          const y = ((i * 89) % (window.innerHeight - 200)) + 100;
          const size = 40 + (i % 3) * 20;

          return (
            <motion.g
              key={`block-${i}`}
              animate={{
                y: [y, y - 30, y],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Black border */}
              <rect
                x={x}
                y={y}
                width={size}
                height={size}
                fill="none"
                stroke="#000000"
                strokeWidth="2"
              />
              {/* White outer accent */}
              <rect
                x={x}
                y={y}
                width={size}
                height={size}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Gold fill */}
              <rect
                x={x + 4}
                y={y + 4}
                width={size - 8}
                height={size - 8}
                fill="#FFD700"
                opacity="0.7"
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Click hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p
          className="border-2 border-white px-4 py-2 font-bold text-white text-sm uppercase"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          CLICK TO SPIKE RECOVERY
        </p>
      </motion.div>
    </div>
  );
}
