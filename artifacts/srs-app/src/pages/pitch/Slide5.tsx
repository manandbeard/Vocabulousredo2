export default function Slide5() {
  const stats = [
    { label: "Target Recall", value: "60–80%" },
    { label: "Daily Burst", value: "3–5 min" },
    { label: "Latency Target", value: "<200ms" },
  ];

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-6 tracking-wide">
          Agent 4 Buildathon
        </h2>
        <p className="text-xl font-light text-slate-600 mb-16 tracking-wide">
          Minimalist MVP — Week Two Complete
        </p>

        <p className="text-lg font-light text-slate-600 mb-20">
          The core Memory Engine is live.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center border-t border-slate-200 pt-8">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-3">
                {stat.label}
              </p>
              <p className="text-5xl font-light text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
