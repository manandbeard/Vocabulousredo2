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

export default function WarmApproachable() {
  const analytics = mockAnalytics;

  return (
    <div className="min-h-screen bg-amber-50 font-['Inter'] text-amber-950 p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3 opacity-70">Teacher Dashboard</p>
            <h1 className="text-4xl font-light text-amber-950">
              Welcome back, <span className="font-bold text-transparent bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text">Dr. Smith</span>
            </h1>
            <p className="mt-2 text-amber-700 font-light text-lg">Here's what's happening in your classes today.</p>
          </div>

          {/* Stats — warm bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Hero warm card */}
            <div className="bg-gradient-to-br from-amber-900 to-orange-800 text-amber-50 rounded-[28px] p-8 border border-amber-800 shadow-lg shadow-orange-900/20 flex flex-col justify-center relative overflow-hidden col-span-2 lg:col-span-1">
              <Activity className="absolute right-[-15%] bottom-[-15%] w-40 h-40 text-orange-900 opacity-30" />
              <div className="relative z-10">
                <p className="text-amber-200 text-xs font-medium mb-3 uppercase tracking-wider flex items-center gap-2 opacity-80">
                  <BookOpen className="w-4 h-4" /> Total Classes
                </p>
                <p className="text-6xl font-light tracking-tight text-amber-50">{analytics.totalClasses}</p>
              </div>
            </div>

            <div className="bg-white rounded-[28px] p-8 border border-orange-100 shadow-md shadow-orange-100/40 flex flex-col justify-center">
              <p className="text-amber-700 text-xs font-medium mb-3 uppercase tracking-wider opacity-70">Students</p>
              <p className="text-6xl font-light tracking-tight text-amber-950">{analytics.totalStudents}</p>
            </div>

            <div className="bg-white rounded-[28px] p-8 border border-orange-100 shadow-md shadow-orange-100/40 flex flex-col justify-center">
              <p className="text-amber-700 text-xs font-medium mb-3 uppercase tracking-wider opacity-70">Total Cards</p>
              <p className="text-6xl font-light tracking-tight text-amber-950">{analytics.totalCards}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-[28px] p-8 border border-orange-200 shadow-md shadow-orange-100/40 flex flex-col justify-center">
              <p className="text-amber-800 text-xs font-medium mb-3 uppercase tracking-wider opacity-80">Avg Retention</p>
              <p className="text-5xl font-light tracking-tight text-orange-900">
                {(analytics.averageClassRetention * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Class Overview */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-6 opacity-70">Class Overview</p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {analytics.classBreakdown.map((cls) => (
                <div key={cls.classId} className="bg-white rounded-[28px] p-7 border border-orange-100 hover:border-orange-300 transition-colors cursor-pointer group shadow-md shadow-orange-100/30">
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="text-lg font-semibold text-amber-950">{cls.className}</h3>
                    <div className="flex items-center gap-2">
                      {cls.atRiskCount > 0 && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-full">
                          {cls.atRiskCount} at risk
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-amber-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-orange-100 pt-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-700 mb-1.5 opacity-70">Students</p>
                      <p className="text-3xl font-light text-amber-950">{cls.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-700 mb-1.5 opacity-70">Retention</p>
                      <p className="text-3xl font-light text-transparent bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text">
                        {(cls.averageRetention * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-700 mb-1.5 opacity-70">Reviews</p>
                      <p className="text-3xl font-light text-amber-950">{cls.totalReviews}</p>
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
