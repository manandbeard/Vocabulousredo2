import { Clock, Brain, Zap } from "lucide-react";
import { useState, useRef } from "react";

export default function Slide3() {
  const pillars = [
    {
      icon: Clock,
      title: "Spaced Practice",
      desc: "Interrupting the forgetting curve with mathematically timed reviews.",
    },
    {
      icon: Brain,
      title: "Active Retrieval",
      desc: "Building durable neural pathways through effortful recall, not passive reading.",
    },
    {
      icon: Zap,
      title: "Adaptive Scheduler",
      desc: "A Python-based engine that learns the unique half-life of your memory.",
    },
  ];

  const [hoverId, setHoverId] = useState<number | null>(null);

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center px-8">
      <style>{`
        @keyframes shimmer {
          0%, 100% { text-shadow: none; }
          50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
        }
        .shimmer-text {
          animation: shimmer 1s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-16 tracking-wide">
          Make Learning Stick.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            const isHovered = hoverId === i;
            return (
              <div
                key={i}
                className="flex flex-col items-start cursor-default transition-transform duration-300 text-[20px]"
                onMouseEnter={() => setHoverId(i)}
                onMouseLeave={() => setHoverId(null)}
              >
                <Icon 
                  className={`text-slate-400 mb-4 transition-all duration-300 ${isHovered ? "text-blue-600" : ""}`}
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="font-semibold text-slate-900 mb-3 transition-all duration-300 shimmer-text scale-110 text-[25px]">
                  {pillar.title}
                </h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed border-t-[0px] border-r-[0px] border-b-[0px] border-l-[0px] ml-[-6px] mr-[-6px]">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
