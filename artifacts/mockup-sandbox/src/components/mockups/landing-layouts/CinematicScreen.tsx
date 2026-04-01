import React from "react";
import { ArrowRight } from "lucide-react";

export function CinematicScreen() {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#fafafa] font-['Inter'] text-slate-900 flex flex-col select-none">
      {/* TOP ZONE (35%) */}
      <div className="h-[35%] flex items-end justify-between px-12 pb-12 border-b border-slate-200/50">
        <div className="text-4xl font-bold tracking-tight">Vocabulous²</div>
        <div className="flex gap-16 text-right">
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400 mb-1">Retention</span>
            <span className="text-4xl font-bold tracking-tight">87%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400 mb-1">Engagement</span>
            <span className="text-4xl font-bold tracking-tight">94%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400 mb-1">Latency</span>
            <span className="text-4xl font-bold tracking-tight">&lt;200ms</span>
          </div>
        </div>
      </div>

      {/* CENTER ZONE (35%) */}
      <div className="h-[35%] flex flex-col justify-center px-12 border-b border-slate-200/50 relative group">
        <h1 className="text-[7rem] leading-[0.9] font-black tracking-tighter mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent w-full">
          Make learning stick,
          <br />
          not slip away.
        </h1>
        <div className="flex items-center justify-between w-full">
          <p className="text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
            Vocabulous uses science‑backed spaced retrieval and adaptive review to help users actually remember what they learn across content.
          </p>
          <div className="flex items-center gap-4">
            <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
              Start Learning <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ZONE (30%) */}
      <div className="h-[30%] flex flex-col justify-end px-12 pb-12">
        <div className="flex flex-col gap-0">
          {[
            {
              title: "Built on real learning science",
              desc: "Algorithms optimized for the spacing effect and testing effect.",
            },
            {
              title: "Short, powerful practice",
              desc: "Micro-sessions that fit seamlessly into any daily routine.",
            },
            {
              title: "Adaptive for every learner",
              desc: "Difficulty scales dynamically based on individual mastery data.",
            },
            {
              title: "Actionable insight for teachers",
              desc: "Real-time analytics to identify struggle points before tests.",
            },
          ].map((benefit, i) => (
            <div
              key={i}
              className="group flex items-center justify-between py-5 border-b border-slate-200 last:border-0"
            >
              <div className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {benefit.title}
              </div>
              <div className="text-lg text-slate-500 font-medium">
                {benefit.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CinematicScreen;
