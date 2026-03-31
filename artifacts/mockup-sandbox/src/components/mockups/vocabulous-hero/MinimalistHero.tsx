import { SynapticWeb } from "../synaptic-web/SynapticWeb";

export function MinimalistHero() {
  return (
    <div className="min-h-screen text-slate-900 font-['Inter'] relative">
      <SynapticWeb />
      <div className="max-w-4xl mx-auto px-8 py-32 relative z-10 pt-[55px] pb-[55px]">
        {/* Minimal headline with enhanced readability on animated background */}
        <p className="text-slate-700 uppercase tracking-widest mb-8 text-[24px] font-bold">Vocabulous²</p>
        
        <h1 className="font-light mb-8 text-[90px] leading-tight">
          <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            Make learning stick, not slip away.
          </span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-light">
          Vocabulous uses science‑backed spaced retrieval and adaptive review to help users actually remember what they learn across content.
        </p>

        {/* Minimal CTA */}
        <div className="flex gap-4 mb-20">
          <button className="px-8 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors text-[18px]">
            Start Learning
          </button>
          <button className="px-8 py-3 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors text-[18px]">
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

        {/* Key Benefits */}
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-12">Key Benefits</p>
          <div className="grid grid-cols-2 gap-12">
            {[
              { 
                name: "Built on real learning science", 
                desc: "Vocabulous is grounded in decades of research showing that spacing and retrieval practice dramatically improve long‑term retention in math, science, languages, and more." 
              },
              { 
                name: "Short, powerful practice", 
                desc: "Students complete quick review bursts that are automatically spaced over time, giving them the right question at the right moment—just as they're on the verge of forgetting." 
              },
              { 
                name: "Adaptive for every learner", 
                desc: "As students respond, Vocabulous adjusts what appears next and when, personalizing the path so stronger students stay challenged and those who need support get targeted, timely review." 
              },
              { 
                name: "Actionable insight for teachers", 
                desc: "Every retrieval attempt doubles as low‑stakes assessment, so teachers can see at a glance which ideas are solid, which are fading, and where to intervene next." 
              },
            ].map((benefit) => (
              <div key={benefit.name}>
                <h3 className="font-semibold text-lg mb-3 text-slate-900">{benefit.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
