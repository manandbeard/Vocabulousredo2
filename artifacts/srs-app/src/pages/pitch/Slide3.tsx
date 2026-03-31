import { Clock, Brain, Zap } from "lucide-react";

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

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-16 tracking-wide">
          Make Learning Stick.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="flex flex-col items-start">
                <Icon className="h-6 w-6 text-slate-400 mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed">
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
