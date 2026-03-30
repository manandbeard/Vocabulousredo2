import { SynapticWeb } from "../synaptic-web/SynapticWeb";

export function MinimalistHero() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter']">
      <SynapticWeb />
      <div className="max-w-4xl mx-auto px-8 py-32 relative z-10">
        {/* Minimal headline with enhanced readability on animated background */}
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Learning Science</p>
        
        <h1 className="text-6xl font-light leading-tight mb-8">
          Never forget what<br />
          <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            matters most
          </span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-light">
          The forgetting curve is real. 70% of new information disappears within 24 hours. Vocabulous uses spacing effects, retrieval practice, and adaptive difficulty to ensure long-term retention.
        </p>

        {/* Minimal CTA */}
        <div className="flex gap-4 mb-20">
          <button className="px-8 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
            Start Learning
          </button>
          <button className="px-8 py-3 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors">
            Learn More
          </button>
        </div>

        {/* Minimal stats grid */}
        <div className="grid grid-cols-3 gap-8 mb-24 border-t border-slate-200 pt-12">
          {[
            { value: "87%", label: "Retention" },
            { value: "94%", label: "Engagement" },
            { value: "<200ms", label: "Latency" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
              <p className="text-sm text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Three pillars minimal */}
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-12">Three Core Principles</p>
          <div className="grid grid-cols-3 gap-12">
            {[
              { name: "Spacing", desc: "Distributed, short bursts break cramming. Memory consolidates over time." },
              { name: "Retrieval", desc: "Active recall forces the brain to work. This strengthens retention permanently." },
              { name: "Calibration", desc: "AI adjusts difficulty to maintain 60-80% recall. The sweet spot for learning." },
            ].map((pillar) => (
              <div key={pillar.name}>
                <h3 className="font-semibold text-lg mb-3 text-slate-900">{pillar.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
