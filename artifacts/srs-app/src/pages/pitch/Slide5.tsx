import { Users, TrendingUp, Activity } from "lucide-react";

export default function Slide5() {
  const features = [
    {
      icon: Activity,
      label: "3–5 Min Bursts",
      desc: "Daily retrieval practice",
    },
    {
      icon: Users,
      label: "Differentiated",
      desc: "Adaptive difficulty per learner",
    },
    {
      icon: TrendingUp,
      label: "Live Diagnostics",
      desc: "Retention heatmap for teachers",
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-8">
      <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-8 tracking-wide">
          The Daily Do-Now
        </h2>
        <p className="text-lg font-light text-slate-600 leading-relaxed mb-16 max-w-3xl">Using 3–5 minute retrieval bursts, differentiated support where struggling students see fragile words more often, and fast learners advance, teachers get a live diagnostic heatmap of retention.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="flex flex-col items-start">
                <Icon className="h-8 w-8 text-slate-400 mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.label}
                </h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
