import React from "react";
import { BookOpen, Users, Brain, AlertTriangle, ChevronRight, Activity } from "lucide-react";

const mockAnalytics = {
  totalClasses: 3,
  totalStudents: 47,
  totalCards: 892,
  averageClassRetention: 0.82,
  classBreakdown: [
    {
      classId: 1,
      className: "AP Biology Fall",
      studentCount: 18,
      averageRetention: 0.85,
      totalReviews: 1200,
      atRiskCount: 2
    },
    {
      classId: 2,
      className: "Intro Chemistry",
      studentCount: 15,
      averageRetention: 0.79,
      totalReviews: 980,
      atRiskCount: 4
    },
    {
      classId: 3,
      className: "Spanish II",
      studentCount: 14,
      averageRetention: 0.81,
      totalReviews: 750,
      atRiskCount: 1
    }
  ]
};

export default function ModeratePlayful() {
  const analytics = mockAnalytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 font-['Inter'] text-slate-900 p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 opacity-80">Teacher Dashboard</p>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back, <span className="text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text">Dr. Smith</span>
            </h1>
            <p className="mt-2 text-slate-600 font-light text-lg">Here's what's happening in your classes today.</p>
          </div>

          {/* Stats — toned playful bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Hero card — softer gradient */}
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-[26px] p-8 border border-indigo-400/30 shadow-lg shadow-indigo-200/30 flex flex-col justify-center relative overflow-hidden col-span-2 lg:col-span-1">
              <Activity className="absolute right-[-15%] bottom-[-15%] w-40 h-40 text-indigo-400 opacity-20" />
              <div className="relative z-10">
                <p className="text-indigo-100 text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5 opacity-90">
                  <BookOpen className="w-3.5 h-3.5" /> Total Classes
                </p>
                <p className="text-6xl font-bold tracking-tight">{analytics.totalClasses}</p>
              </div>
            </div>

            <div className="bg-white rounded-[26px] p-8 border border-indigo-100 shadow-md shadow-indigo-100/25 flex flex-col justify-center">
              <p className="text-slate-600 text-xs font-semibold mb-2 uppercase tracking-wider opacity-75">Students</p>
              <p className="text-6xl font-bold tracking-tight text-slate-900">{analytics.totalStudents}</p>
            </div>

            <div className="bg-white rounded-[26px] p-8 border border-cyan-100 shadow-md shadow-cyan-100/25 flex flex-col justify-center">
              <p className="text-slate-600 text-xs font-semibold mb-2 uppercase tracking-wider opacity-75">Flashcards</p>
              <p className="text-6xl font-bold tracking-tight text-slate-900">{analytics.totalCards}</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-[26px] p-8 border border-cyan-200 shadow-md shadow-cyan-100/25 flex flex-col justify-center">
              <p className="text-indigo-700 text-xs font-semibold mb-2 uppercase tracking-wider opacity-85">Avg Retention</p>
              <p className="text-5xl font-bold tracking-tight text-indigo-900">
                {(analytics.averageClassRetention * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Class Overview */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-5 opacity-75">Class Overview</p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {analytics.classBreakdown.map((cls, idx) => {
                const gradients = [
                  "from-indigo-400 to-blue-500",
                  "from-cyan-400 to-blue-500",
                  "from-violet-400 to-indigo-500"
                ];
                const bgGradient = gradients[idx % 3];
                return (
                  <div
                    key={cls.classId}
                    className={`bg-gradient-to-br ${bgGradient} text-white rounded-[26px] p-7 border border-white/20 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/15 transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <h3 className="text-lg font-bold tracking-tight max-w-[220px]">{cls.className}</h3>
                      <div className="flex items-center gap-2">
                        {cls.atRiskCount > 0 && (
                          <span className="text-xs font-bold text-white bg-red-500/70 border border-red-300/30 px-2.5 py-1 rounded-full">
                            {cls.atRiskCount} at risk
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">Students</p>
                        <p className="text-3xl font-bold">{cls.studentCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">Retention</p>
                        <p className="text-3xl font-bold text-yellow-200">
                          {(cls.averageRetention * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">Reviews</p>
                        <p className="text-3xl font-bold">{cls.totalReviews}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
