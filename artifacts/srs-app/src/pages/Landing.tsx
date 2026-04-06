import { useLocation } from "wouter";
import { ArrowRight, Brain, Zap, Target, BarChart3, Clock, Users, Activity } from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/sign-up");
  };

  const handleSignIn = () => {
    navigate("/sign-in");
  };

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

          {/* Large Benefit 1 — 2 cols × 2 rows */}
          <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
              <Brain className="w-64 h-64" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight text-slate-900">Built on real learning science</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Leverages cognitive psychology principles of spaced repetition and active recall to encode information into long-term memory efficiently.
                </p>
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
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">Ready to start?</h3>
            <p className="text-sm text-slate-500 mb-2">Join the learning platform today.</p>
            <button
              onClick={handleGetStarted}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
            >
              Get Started — Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleSignIn}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/pitch")}
              className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              See the pitch
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
