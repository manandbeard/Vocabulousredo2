import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Zap, TrendingUp, BookOpen, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { useGetStudentAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";

export default function StudentLearningLab() {
  const { userId } = useRole();
  const { data: analytics } = useGetStudentAnalytics(userId || 2);

  const [complexity, setComplexity] = useState(5);
  const [reviewStrategy, setReviewStrategy] = useState<"spaced" | "cramming" | "none">("spaced");
  const [recallStrength, setRecallStrength] = useState(0.8);

  const generateCurvePath = (strategy: "spaced" | "cramming" | "none", complexity: number) => {
    if (strategy === "cramming") {
      return "M 0 40 L 100 50 L 200 150 L 300 280 L 400 360 L 500 360 L 600 360 L 800 360";
    } else if (strategy === "none") {
      return "M 0 40 Q 150 200 800 360";
    } else {
      return "M 0 40 Q 100 80 200 120 L 200 40 Q 350 80 500 100 L 500 40 Q 650 60 800 70";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto font-['Inter']">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">
            Learning <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Lab</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Explore the science behind spaced repetition. Visualize how different review strategies affect your memory retention over time.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chart Section */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Memory Retention Over Time</h3>
              <p className="text-sm text-slate-500">
                Period: 30 Days | Complexity: {complexity === 5 ? "Moderate" : complexity < 5 ? "Simple" : "Advanced"} | Strategy: {reviewStrategy.toUpperCase()}
              </p>
            </div>

            {/* SVG Chart */}
            <div className="relative h-96 w-full mb-8">
              <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`hgrid-${i}`}
                    x1="0"
                    x2="800"
                    y1={360 - (80 * i)}
                    y2={360 - (80 * i)}
                    stroke="#e2e8f0"
                    strokeDasharray="4"
                    strokeWidth="1"
                  />
                ))}

                <path
                  d="M 0 40 Q 150 200 800 360"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="6"
                  opacity="0.5"
                />

                <path
                  d={generateCurvePath(reviewStrategy, complexity)}
                  stroke="#2563eb"
                  strokeWidth="4"
                  fill="none"
                />

                {reviewStrategy === "spaced" && (
                  <>
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 40 Q 100 80 200 120 L 200 40 Q 350 80 500 100 L 500 40 Q 650 60 800 70 L 800 400 L 0 400 Z"
                      fill="url(#grad1)"
                    />
                  </>
                )}

                {reviewStrategy === "spaced" && (
                  <>
                    <circle cx="200" cy="40" r="5" fill="#2563eb" />
                    <circle cx="500" cy="40" r="5" fill="#2563eb" />
                  </>
                )}
              </svg>

              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest px-4 pb-2">
                {["Day 0", "Day 7", "Day 14", "Day 21", "Day 30"].map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>

              <div className="absolute top-0 -left-12 h-full flex flex-col justify-between text-xs font-bold text-slate-500 uppercase tracking-widest py-2 pr-2">
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded" />
                <span className="text-slate-600">Your Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-slate-400" style={{ width: 12 }} />
                <span className="text-slate-600">Without Review</span>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Material Complexity */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-900">Material Complexity</label>
                <span className="text-xs font-bold text-blue-600 uppercase">
                  {complexity === 3 ? "Simple" : complexity === 5 ? "Moderate" : "Advanced"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="9"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 font-bold mt-3 uppercase tracking-widest">
                <span>Simple</span>
                <span>Academic</span>
              </div>
            </div>

            {/* Review Strategy */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <label className="text-sm font-bold text-slate-900 mb-4 block">Review Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {["cramming", "spaced", "none"].map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => setReviewStrategy(strategy as "spaced" | "cramming" | "none")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-all uppercase ${
                      reviewStrategy === strategy
                        ? strategy === "spaced"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-900 text-white shadow-md"
                        : "border border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {strategy === "cramming" ? "Cramming" : strategy === "spaced" ? "Spaced" : "None"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recall Strength */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-900">Recall Strength</label>
                <span className="text-xs font-bold text-blue-600">{Math.round(recallStrength * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(recallStrength * 100)}
                onChange={(e) => setRecallStrength(Number(e.target.value) / 100)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="text-xs text-slate-500 mt-3">
                {recallStrength >= 0.8 ? "✓ Excellent" : recallStrength >= 0.6 ? "→ Good" : "✗ Needs Work"}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Your Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-600">Retention Rate</span>
                  <span className="ml-auto text-sm font-bold text-slate-900">
                    {analytics?.averageRetention ? `${(analytics.averageRetention * 100).toFixed(0)}%` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-600">Cards Learned</span>
                  <span className="ml-auto text-sm font-bold text-slate-900">{analytics?.cardsMastered || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-600">Streak</span>
                  <span className="ml-auto text-sm font-bold text-slate-900">{analytics?.currentStreak || 0} days</span>
                </div>
              </div>
            </div>

            {/* Study CTA */}
            <Link href="/student/study">
              <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 group">
                <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Start Study Session
              </button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
