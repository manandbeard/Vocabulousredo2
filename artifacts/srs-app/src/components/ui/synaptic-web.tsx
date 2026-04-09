import { useEffect, useRef, useState } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: string;
}

interface Connection {
  from: Dot;
  to: Dot;
  progress: number; // 0-1 for draw, 1-1.5 for hold, 1.5-3 for fade
  startTime: number;
  state: "drawing" | "holding" | "fading";
}

const COLORS = {
  dotBase: "#CBD5E1",
  lineBase: "#94A3B8",
  dotHover: "#94A3B8",
};

const CONFIG = {
  dotCount: 150,
  dotMinSize: 1,
  dotMaxSize: 3,
  connectionProbability: 0.05,
  maxConnectionsPerDot: 2,
  lineThickness: 0.5,
  drawDurationMs: 2000,
  holdDurationMs: 5000,
  fadeDurationMs: 1500,
  hoverRadius: 100,
  floatSpeed: 0.3,
};

export function SynapticWeb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Initialize dots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Set canvas resolution
    canvas.width = width;
    canvas.height = height;

    dotsRef.current = Array.from({ length: CONFIG.dotCount }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.floatSpeed,
      vy: (Math.random() - 0.5) * CONFIG.floatSpeed,
      radius: CONFIG.dotMinSize + Math.random() * (CONFIG.dotMaxSize - CONFIG.dotMinSize),
      id: `dot-${i}`,
    }));

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 16; // ~60fps

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas (transparent — background comes from the page)
      ctx.clearRect(0, 0, width, height);

      // Update dots
      dotsRef.current.forEach((dot) => {
        // Gentle floating motion
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Wrap around edges
        if (dot.x < 0) dot.x = width;
        if (dot.x > width) dot.x = 0;
        if (dot.y < 0) dot.y = height;
        if (dot.y > height) dot.y = 0;

        // Hover repel effect
        const dx = dot.x - mousePos.x;
        const dy = dot.y - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.hoverRadius && dist > 0) {
          const force = (CONFIG.hoverRadius - dist) / CONFIG.hoverRadius;
          dot.vx += (dx / dist) * force * 0.1;
          dot.vy += (dy / dist) * force * 0.1;
          
          // Dampen velocity
          dot.vx *= 0.95;
          dot.vy *= 0.95;
        }
      });

      // Attempt new connections randomly
      if (Math.random() < CONFIG.connectionProbability) {
        const fromDot = dotsRef.current[Math.floor(Math.random() * dotsRef.current.length)];
        const activeConnectionsFromDot = connectionsRef.current.filter((c) => c.from === fromDot).length;

        if (activeConnectionsFromDot < CONFIG.maxConnectionsPerDot) {
          const toDot = dotsRef.current[Math.floor(Math.random() * dotsRef.current.length)];
          if (toDot !== fromDot) {
            connectionsRef.current.push({
              from: fromDot,
              to: toDot,
              progress: 0,
              startTime: timeRef.current,
              state: "drawing",
            });
          }
        }
      }

      // Update and draw connections
      connectionsRef.current = connectionsRef.current.filter((conn) => {
        const elapsed = timeRef.current - conn.startTime;
        const totalDuration = CONFIG.drawDurationMs + CONFIG.holdDurationMs + CONFIG.fadeDurationMs;

        if (elapsed > totalDuration) return false;

        // Determine state and progress
        let alpha = 1;
        if (elapsed < CONFIG.drawDurationMs) {
          conn.state = "drawing";
          conn.progress = elapsed / CONFIG.drawDurationMs;
          alpha = 1;
        } else if (elapsed < CONFIG.drawDurationMs + CONFIG.holdDurationMs) {
          conn.state = "holding";
          conn.progress = 1;
          alpha = 1;
        } else {
          conn.state = "fading";
          const fadeElapsed = elapsed - (CONFIG.drawDurationMs + CONFIG.holdDurationMs);
          conn.progress = 1 + fadeElapsed / CONFIG.fadeDurationMs;
          alpha = 1 - fadeElapsed / CONFIG.fadeDurationMs;
        }

        // Draw connection
        const startX = conn.from.x + (conn.to.x - conn.from.x) * (conn.state === "drawing" ? conn.progress : 1);
        const startY = conn.from.y + (conn.to.y - conn.from.y) * (conn.state === "drawing" ? conn.progress : 1);

        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.6})`; // slate-400 with alpha
        ctx.lineWidth = CONFIG.lineThickness;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(startX, startY);
        ctx.stroke();

        return true;
      });

      // Draw dots
      dotsRef.current.forEach((dot) => {
        // Glow effect for hover
        const dx = dot.x - mousePos.x;
        const dy = dot.y - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = dist < CONFIG.hoverRadius;

        ctx.fillStyle = isNearMouse ? COLORS.dotHover : COLORS.dotBase;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
