import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

const mockAnalytics = {
  totalClasses: 3,
  totalStudents: 47,
  averageClassRetention: 0.82,
  classBreakdown: [
    { classId: 1, className: "AP Biology Fall", studentCount: 18, averageRetention: 0.85, totalReviews: 1200, atRiskCount: 2 },
    { classId: 2, className: "Intro Chemistry", studentCount: 15, averageRetention: 0.79, totalReviews: 980, atRiskCount: 4 },
    { classId: 3, className: "Spanish II", studentCount: 14, averageRetention: 0.81, totalReviews: 750, atRiskCount: 1 }
  ]
};

export default function RelationalNetwork() {
  const analytics = mockAnalytics;

  // Compute positions based on retention vs. risk (more data = right, better retention = up)
  const classesWithLayout = useMemo(() => {
    return analytics.classBreakdown.map((cls, idx) => {
      const x = (cls.totalReviews / 1200) * 60 + 20; // 20-80% from left
      const y = (cls.averageRetention * 100) / 100 * 60 + 20; // 20-80% from top
      return { ...cls, x, y };
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-['Inter'] text-slate-50 p-8 flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-50">Class Relationships</h1>
          <p className="text-slate-400 text-sm mt-1">Positioned by activity (→) vs. retention (↑)</p>
        </div>

        {/* Axes labels */}
        <div className="relative mb-8">
          <div className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">Activity →</div>
          <div className="absolute left-0 top-0 -translate-x-2 -translate-y-6 text-slate-500 text-xs uppercase tracking-widest font-semibold" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
            Retention ↑
          </div>

          {/* Scatter plot */}
          <div className="relative w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl" style={{ aspectRatio: "16/9" }}>
            {/* Quadrant guides */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-600" />
            </div>

            {/* Connecting lines between similar classes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {classesWithLayout.map((cls1, i) =>
                classesWithLayout.slice(i + 1).map((cls2, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={`${cls1.x}%`}
                    y1={`${cls1.y}%`}
                    x2={`${cls2.x}%`}
                    y2={`${cls2.y}%`}
                    stroke="#64748b"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))
              )}
            </svg>

            {/* Classes as positioned nodes */}
            {classesWithLayout.map((cls) => (
              <div
                key={cls.classId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 hover:z-20"
                style={{ left: `${cls.x}%`, top: `${cls.y}%` }}
              >
                {/* Larger hover area */}
                <div className="absolute inset-0 -inset-8 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 shadow-xl border border-blue-400 group-hover:border-blue-300 group-hover:scale-110 transition-all w-48">
                  <h3 className="text-sm font-bold text-white tracking-tight mb-3">{cls.className}</h3>

                  <div className="space-y-2 text-xs text-blue-50">
                    <div className="flex justify-between">
                      <span className="opacity-70">Students</span>
                      <span className="font-semibold">{cls.studentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Reviews</span>
                      <span className="font-semibold">{cls.totalReviews}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-400/30">
                      <span className="opacity-70">Retention</span>
                      <span className="font-bold text-yellow-300">{(cls.averageRetention * 100).toFixed(1)}%</span>
                    </div>

                    {cls.atRiskCount > 0 && (
                      <div className="pt-2 mt-2 border-t border-blue-400/30 flex items-center gap-1.5 text-red-300">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">{cls.atRiskCount} at risk</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom axis label */}
          <div className="text-slate-500 text-xs uppercase tracking-widest font-semibold mt-3 flex justify-end">Low ← Activity → High</div>
        </div>

        {/* Legend/Interpretation */}
        <div className="grid grid-cols-2 gap-6 text-sm text-slate-400 mt-8">
          <div>
            <div className="font-semibold text-slate-200 mb-2">Reading the chart</div>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Right:</strong> More student activity (reviews)</li>
              <li>• <strong>Up:</strong> Better memory retention</li>
              <li>• <strong>Lines:</strong> Relationship between classes</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-200 mb-2">At a glance</div>
            <ul className="space-y-1 text-xs">
              <li>• Avg retention: <strong className="text-yellow-400">{(analytics.averageClassRetention * 100).toFixed(1)}%</strong></li>
              <li>• Total students: <strong className="text-blue-400">{analytics.totalStudents}</strong></li>
              <li>• At-risk: <strong className="text-red-400">{analytics.classBreakdown.reduce((s, c) => s + c.atRiskCount, 0)}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
