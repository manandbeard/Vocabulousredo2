import React from "react";
import { BookOpen, Users, Brain, AlertTriangle, ChevronRight, Activity } from "lucide-react";

// Mock data
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

export default function FormalProfessional() {
  const analytics = mockAnalytics;

  return (
    <div className="min-h-screen bg-slate-950 font-['Inter'] text-slate-50 p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-4 opacity-60">DASHBOARD</p>
            <h1 className="text-5xl font-extralight text-slate-50 tracking-tight">
              Welcome back, <span className="font-semibold text-transparent bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text">Dr. Smith</span>
            </h1>
            <p className="mt-3 text-slate-300 font-light text-sm tracking-wide">Administrative overview of class performance</p>
          </div>

          {/* Stats — formal bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Hero dark card with gold accent */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 rounded-2xl p-8 border-t border-l border-amber-700/30 flex flex-col justify-center relative overflow-hidden col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent pointer-events-none" />
              <Activity className="absolute right-[-20%] bottom-[-20%] w-40 h-40 text-slate-700 opacity-20" />
              <div className="relative z-10">
                <p className="text-slate-300 text-xs font-bold mb-3 uppercase tracking-[0.12em] opacity-60 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> Total Classes
                </p>
                <p className="text-6xl font-light tracking-tighter text-amber-300">{analytics.totalClasses}</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700/50 flex flex-col justify-center">
              <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-[0.12em] opacity-60">Students</p>
              <p className="text-6xl font-light tracking-tighter text-slate-50">{analytics.totalStudents}</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700/50 flex flex-col justify-center">
              <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-[0.12em] opacity-60">Total Cards</p>
              <p className="text-6xl font-light tracking-tighter text-slate-50">{analytics.totalCards}</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 border border-amber-700/40 flex flex-col justify-center">
              <p className="text-amber-300 text-xs font-bold mb-3 uppercase tracking-[0.12em] opacity-80">Avg Retention</p>
              <p className="text-5xl font-light tracking-tighter text-amber-300">
                {(analytics.averageClassRetention * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Class Overview */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-6 opacity-60">CLASS PERFORMANCE</p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {analytics.classBreakdown.map((cls) => (
                <div key={cls.classId} className="bg-slate-900 rounded-2xl p-7 border border-slate-700/50 hover:border-amber-600/30 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="text-lg font-semibold text-slate-50 tracking-tight">{cls.className}</h3>
                    <div className="flex items-center gap-2">
                      {cls.atRiskCount > 0 && (
                        <span className="text-xs font-bold text-red-400 bg-red-950 border border-red-700/50 px-2.5 py-1 rounded-sm uppercase tracking-wider">
                          {cls.atRiskCount} Risk
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 opacity-60">Students</p>
                      <p className="text-3xl font-light text-slate-50 tracking-tighter">{cls.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 opacity-60">Retention</p>
                      <p className="text-3xl font-light text-amber-300 tracking-tighter">
                        {(cls.averageRetention * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 opacity-60">Reviews</p>
                      <p className="text-3xl font-light text-slate-50 tracking-tighter">{cls.totalReviews}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
