import React from "react";
import { BookOpen, Users, Brain, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

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

export default function DenseAnalytics() {
  const analytics = mockAnalytics;

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] text-slate-900 p-6 flex items-start justify-center pt-8">
      <div className="w-full max-w-7xl">
        {/* Dense header row */}
        <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Dr. Smith · 3 Classes · 47 Students</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Avg Retention</div>
            <div className="text-3xl font-bold text-blue-600">{(analytics.averageClassRetention * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* Two-column dense grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Left col: Key metrics in tight grid */}
          <div className="col-span-1 space-y-3">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1">TOTAL CLASSES</div>
              <div className="text-4xl font-bold text-slate-900">{analytics.totalClasses}</div>
              <div className="text-xs text-slate-400 mt-2">Across all terms</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1">TOTAL STUDENTS</div>
              <div className="text-4xl font-bold text-slate-900">{analytics.totalStudents}</div>
              <div className="text-xs text-slate-400 mt-2">Active enrollments</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold mb-1">FLASHCARDS</div>
              <div className="text-4xl font-bold text-slate-900">{analytics.totalCards}</div>
              <div className="text-xs text-slate-400 mt-2">In circulation</div>
            </div>
          </div>

          {/* Middle: Class comparison matrix */}
          <div className="col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">Class</th>
                  <th className="text-center px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">Students</th>
                  <th className="text-center px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">Reviews</th>
                  <th className="text-center px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">Retention</th>
                  <th className="text-center px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">At Risk</th>
                  <th className="text-center px-3 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.classBreakdown.map((cls) => (
                  <tr key={cls.classId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{cls.className}</td>
                    <td className="text-center px-3 py-3 text-slate-700">{cls.studentCount}</td>
                    <td className="text-center px-3 py-3 text-slate-700">{cls.totalReviews}</td>
                    <td className="text-center px-3 py-3 font-bold text-blue-600">{(cls.averageRetention * 100).toFixed(0)}%</td>
                    <td className="text-center px-3 py-3">
                      {cls.atRiskCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          {cls.atRiskCount}
                        </span>
                      ) : (
                        <span className="text-green-600 text-lg">✓</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex justify-center">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              cls.averageRetention >= 0.85 ? "bg-green-500" : cls.averageRetention >= 0.75 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${cls.averageRetention * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom: Detailed breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {analytics.classBreakdown.map((cls) => (
            <div key={cls.classId} className="bg-white rounded-lg border border-slate-200 shadow-xs p-4">
              <h4 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">{cls.className}</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Enrolled</span>
                  <span className="font-bold text-slate-900">{cls.studentCount} students</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Activity</span>
                  <span className="font-bold text-slate-900">{cls.totalReviews} reviews</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Retention</span>
                  <span className="font-bold text-blue-600">{(cls.averageRetention * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-600">Flagged</span>
                  <span className={`font-bold ${cls.atRiskCount > 0 ? "text-red-600" : "text-green-600"}`}>
                    {cls.atRiskCount > 0 ? `${cls.atRiskCount} struggling` : "All on track"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
