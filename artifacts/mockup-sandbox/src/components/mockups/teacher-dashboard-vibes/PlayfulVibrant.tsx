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

export default function PlayfulVibrant() {
  const analytics = mockAnalytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50 to-pink-50 font-['Inter'] text-slate-900 p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-600 mb-4 opacity-75">📊 Teacher Hub</p>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-transparent bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 bg-clip-text animate-pulse">Dr. Smith</span>
            </h1>
            <p className="mt-2 text-slate-600 font-medium text-lg">Let's see what your students learned today! 🚀</p>
          </div>

          {/* Stats — playful bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hero vibrant card */}
            <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 text-white rounded-[24px] p-8 border-2 border-white shadow-2xl shadow-purple-400/30 flex flex-col justify-center relative overflow-hidden col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform">
              <Activity className="absolute right-[-10%] bottom-[-10%] w-40 h-40 text-white opacity-20 animate-pulse" />
              <div className="relative z-10">
                <p className="text-white text-xs font-extrabold mb-2 uppercase tracking-widest flex items-center gap-2 opacity-90">
                  <BookOpen className="w-4 h-4" /> CLASSES
                </p>
                <p className="text-7xl font-black tracking-tighter">{analytics.totalClasses}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-[24px] p-8 border-2 border-white shadow-lg shadow-cyan-400/30 flex flex-col justify-center transform hover:scale-105 transition-transform">
              <p className="text-white text-xs font-extrabold mb-2 uppercase tracking-widest opacity-90">Students</p>
              <p className="text-7xl font-black tracking-tighter">{analytics.totalStudents}</p>
            </div>

            <div className="bg-gradient-to-br from-lime-400 to-teal-500 text-white rounded-[24px] p-8 border-2 border-white shadow-lg shadow-lime-400/30 flex flex-col justify-center transform hover:scale-105 transition-transform">
              <p className="text-white text-xs font-extrabold mb-2 uppercase tracking-widest opacity-90">Flashcards</p>
              <p className="text-7xl font-black tracking-tighter">{analytics.totalCards}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-[24px] p-8 border-2 border-white shadow-lg shadow-orange-400/30 flex flex-col justify-center transform hover:scale-105 transition-transform">
              <p className="text-white text-xs font-extrabold mb-2 uppercase tracking-widest opacity-90">Avg Memory</p>
              <p className="text-6xl font-black tracking-tighter">
                {(analytics.averageClassRetention * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Class Overview */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-600 mb-6 opacity-75">📚 Your Classes</p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {analytics.classBreakdown.map((cls, idx) => {
                const gradients = [
                  "from-blue-400 to-purple-500",
                  "from-pink-400 to-rose-500",
                  "from-emerald-400 to-teal-500"
                ];
                return (
                  <div
                    key={cls.classId}
                    className={`bg-gradient-to-br ${gradients[idx % 3]} text-white rounded-[24px] p-8 border-2 border-white shadow-lg transform hover:scale-102 transition-transform cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <h3 className="text-xl font-extrabold tracking-tight max-w-[200px]">{cls.className}</h3>
                      <div className="flex items-center gap-2">
                        {cls.atRiskCount > 0 && (
                          <span className="text-xs font-black text-white bg-red-600 border-2 border-white px-3 py-1 rounded-full uppercase">
                            ⚠️ {cls.atRiskCount}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t-2 border-white border-opacity-30 pt-5">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-white opacity-80 mb-1">Students</p>
                        <p className="text-4xl font-black">{cls.studentCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-white opacity-80 mb-1">Recall</p>
                        <p className="text-4xl font-black">
                          {(cls.averageRetention * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-white opacity-80 mb-1">Activity</p>
                        <p className="text-4xl font-black">{cls.totalReviews}</p>
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
