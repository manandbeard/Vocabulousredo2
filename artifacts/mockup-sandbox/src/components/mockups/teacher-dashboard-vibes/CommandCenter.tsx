import React from "react";
import { AlertTriangle, TrendingUp, Users, BookOpen, Clock } from "lucide-react";

const mockAnalytics = {
  totalClasses: 3,
  totalStudents: 47,
  totalCards: 892,
  averageClassRetention: 0.82,
  classBreakdown: [
    { classId: 1, className: "AP Biology Fall", studentCount: 18, averageRetention: 0.85, totalReviews: 1200, atRiskCount: 2 },
    { classId: 2, className: "Intro Chemistry", studentCount: 15, averageRetention: 0.79, totalReviews: 980, atRiskCount: 4 },
    { classId: 3, className: "Spanish II", studentCount: 14, averageRetention: 0.81, totalReviews: 750, atRiskCount: 1 }
  ]
};

export default function CommandCenter() {
  const analytics = mockAnalytics;
  const totalAtRisk = analytics.classBreakdown.reduce((s, c) => s + c.atRiskCount, 0);

  return (
    <div className="min-h-screen bg-slate-900 font-['Inter'] text-slate-50 p-6 flex items-start justify-center pt-8">
      <div className="w-full max-w-7xl">
        {/* Title bar */}
        <div className="mb-6 pb-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Teacher Control Center
              </h1>
              <p className="text-slate-400 text-xs mt-1">Real-time classroom overview — Dr. Smith</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">System Status</div>
              <div className="text-lg font-bold text-green-400">All Systems Nominal</div>
            </div>
          </div>
        </div>

        {/* Three-zone layout */}
        <div className="grid grid-cols-4 gap-4">
          {/* Left: Alerts & Priority Zone */}
          <div className="col-span-1 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Priority Queue
              </div>
              {totalAtRisk > 0 ? (
                <div className="space-y-2">
                  {analytics.classBreakdown.map((cls) =>
                    cls.atRiskCount > 0 ? (
                      <div key={cls.classId} className="bg-red-950/40 border border-red-700/50 rounded p-2 text-xs">
                        <div className="font-semibold text-red-300 truncate">{cls.className}</div>
                        <div className="text-red-400 text-xs mt-1">{cls.atRiskCount} student{cls.atRiskCount !== 1 ? "s" : ""}</div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No alerts</div>
              )}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Quick Stats</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Classes</span>
                  <span className="font-bold text-blue-300">{analytics.totalClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Students</span>
                  <span className="font-bold text-blue-300">{analytics.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">At Risk</span>
                  <span className={`font-bold ${totalAtRisk > 0 ? "text-red-400" : "text-green-400"}`}>{totalAtRisk}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Main Viewport */}
          <div className="col-span-2 space-y-4">
            {/* Performance gauge */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Network Retention
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold text-yellow-300">{(analytics.averageClassRetention * 100).toFixed(1)}%</span>
                    <span className="text-xs text-slate-400">System Average</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full" style={{ width: `${analytics.averageClassRetention * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Class Status Panels */}
            <div className="grid grid-cols-2 gap-3">
              {analytics.classBreakdown.map((cls) => {
                const healthColor = cls.averageRetention >= 0.85 ? "green" : cls.averageRetention >= 0.75 ? "yellow" : "red";
                const healthLabel = healthColor === "green" ? "Nominal" : healthColor === "yellow" ? "Caution" : "Alert";
                return (
                  <div key={cls.classId} className={`bg-slate-800 border ${healthColor === "red" ? "border-red-600" : healthColor === "yellow" ? "border-yellow-600" : "border-green-600"} rounded-lg p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-bold text-slate-100">{cls.className}</div>
                        <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${healthColor === "green" ? "text-green-400" : healthColor === "yellow" ? "text-yellow-400" : "text-red-400"}`}>
                          {healthLabel}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full animate-pulse ${healthColor === "green" ? "bg-green-500" : healthColor === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Retention:</span>
                        <span className="font-semibold">{(cls.averageRetention * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activity:</span>
                        <span className="font-semibold">{cls.totalReviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Population:</span>
                        <span className="font-semibold">{cls.studentCount} units</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Data Stream */}
          <div className="col-span-1 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Activity Log
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span className="text-blue-400">[12:45]</span>
                  <span>1,200 reviews</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">[12:30]</span>
                  <span>47 students active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">[12:15]</span>
                  <span>↑ Retention to 82%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">[12:00]</span>
                  <span>Chemistry: 4 at-risk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">[11:45]</span>
                  <span>892 cards circulating</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Controls</div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                  Drill Down
                </button>
                <button className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
