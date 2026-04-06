import { useLocation } from "wouter";
import { ArrowRight, Brain, Zap, Target, BarChart3, Clock, Users, Activity, RefreshCw } from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen font-['Inter'] text-slate-900 p-4 md:p-8 flex items-center justify-center relative">
      <SynapticWeb />
      <div className="max-w-6xl w-full mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]">

          {/* Brand & Hero — spans all 4 columns */}
          <div className="md:col-span-4 bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">Vocabulous</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
                Make learning stick, <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  not slip away.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Vocabulous uses science‑backed spaced retrieval and adaptive review to help users actually remember what they learn across content.
              </p>
            </div>
          </div>

          {/* Stats row — 2-1-1 split, one heavy dark card */}
          <div className="md:col-span-2 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <Activity className="absolute right-[-10%] bottom-[-20%] w-48 h-48 text-slate-800 opacity-50" />
            <div className="relative z-10">
              <div className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Retention Rate
              </div>
              <div className="text-6xl font-bold tracking-tight">87%</div>
              <p className="text-slate-400 text-sm mt-2">Average long-term retention</p>
            </div>
          </div>
          <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Engagement</div>
            <div className="text-5xl font-bold tracking-tight text-slate-900 mb-1">94%</div>
            <p className="text-slate-500 text-xs">Active weekly users</p>
          </div>
          <div className="md:col-span-1 bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center">
            <div className="text-blue-600 text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" /> Latency
            </div>
            <div className="text-4xl font-bold tracking-tight text-blue-900 mb-1">&lt;200ms</div>
            <p className="text-blue-600/70 text-xs">Lightning fast sync</p>
          </div>

          {/* Large Benefit 1 — 2 cols × 2 rows — Science Card */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl p-8 border border-blue-100 shadow-sm relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 60%, #fdf4ff 100%)" }}>
            {/* Subtle dot grid background */}
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(99,102,241) 1px, transparent 0)", backgroundSize: "20px 20px" }} />

            <div className="relative z-10 h-full flex flex-col gap-5">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
                  <Brain className="w-3.5 h-3.5" />
                  Cognitive Design
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                  Built on real learning science
                </h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Memory doesn't fade — it compounds with every review.
                </p>
              </div>

              {/* Review interval timeline */}
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Review Intervals</p>
                <div className="flex items-end gap-2 h-24">
                  {[
                    { label: "Day 1", h: "20%", from: "#93c5fd", to: "#60a5fa" },
                    { label: "Day 3", h: "35%", from: "#60a5fa", to: "#818cf8" },
                    { label: "Day 7", h: "52%", from: "#818cf8", to: "#a78bfa" },
                    { label: "Day 14", h: "68%", from: "#a78bfa", to: "#c084fc" },
                    { label: "Day 30", h: "82%", from: "#c084fc", to: "#d946ef" },
                    { label: "∞", h: "100%", from: "#a855f7", to: "#7c3aed" },
                  ].map(({ label, h, from, to }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                      <div
                        className="w-full rounded-t-md transition-opacity duration-300 group-hover:opacity-90"
                        style={{ height: h, background: `linear-gradient(to top, ${from}, ${to})` }}
                      />
                      <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Three science pillars */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-100/80">
                {[
                  { icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Spaced Repetition", iconBg: "bg-blue-100 text-blue-600" },
                  { icon: <Zap className="w-3.5 h-3.5" />, label: "Active Recall", iconBg: "bg-violet-100 text-violet-600" },
                  { icon: <Target className="w-3.5 h-3.5" />, label: "Adaptive Review", iconBg: "bg-purple-100 text-purple-600" },
                ].map(({ icon, label, iconBg }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
                    <span className="text-[11px] font-semibold text-slate-600 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Small Benefit — 1 col × 1 row */}
          <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 leading-tight">Short, powerful practice</h3>
              <p className="text-sm text-slate-600">Optimized micro-sessions that fit seamlessly into your day without overwhelming.</p>
            </div>
          </div>

          {/* CTAs embedded — 1 col × 2 rows */}
          <div className="md:col-span-1 md:row-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #eff6ff, #f5f3ff)" }}>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">Ready to start?</h3>
            <p className="text-sm text-slate-500 mb-2">Join thousands of learners today.</p>
            <button
              onClick={() => navigate("/signup")}
              className="w-full py-3 px-6 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Create account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
            >
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/pitch")}
              className="w-full py-3 px-6 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              See the pitch deck →
            </button>
          </div>

          {/* Small Benefit — 1 col × 1 row */}
          <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 leading-tight">Adaptive for every learner</h3>
              <p className="text-sm text-slate-600">The algorithm adjusts to your specific forgetting curve and pacing needs.</p>
            </div>
          </div>

          {/* Large Benefit — full width bottom strip */}
          <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Actionable insight for teachers</h3>
              <p className="text-slate-600 text-lg">
                Detailed analytics to track class progress, identify struggling students early, and adjust instructional focus based on real data. Never guess who needs help again.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
