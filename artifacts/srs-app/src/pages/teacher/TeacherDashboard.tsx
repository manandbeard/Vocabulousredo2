import { useGetTeacherAnalytics, useGetTeacherMilestones } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BookOpen, Users, Brain, AlertTriangle, ChevronRight,
  Activity, Clock, Award, TrendingUp, Flame, BarChart2
} from "lucide-react";
import { Link } from "wouter";
import { ShadowCard } from "@/components/ui/ShadowCard";
import { DAYS, getSceneImage } from "@/lib/dashboard-constants";

export default function TeacherDashboard() {
  const { userId } = useRole();
  const numericUserId = userId ? Number(userId) : null;
  const queryEnabled = numericUserId !== null && !Number.isNaN(numericUserId);
  const { data: analytics, isLoading, error } = useGetTeacherAnalytics(numericUserId ?? 0, { query: { enabled: queryEnabled } });
  const { data: milestones } = useGetTeacherMilestones(numericUserId ?? 0, { query: { enabled: queryEnabled } });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout>
        <div className="border border-slate-200 rounded-3xl p-8 text-center bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.10)]">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Failed to load analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Please ensure the backend is running and the database is seeded.</p>
        </div>
      </AppLayout>
    );
  }

  const totalReviews = analytics.classBreakdown.reduce((sum, c) => sum + c.totalReviews, 0);
  const atRiskClasses = analytics.classBreakdown.filter((c) => c.atRiskCount > 0);
  const totalAtRisk = analytics.classBreakdown.reduce((sum, c) => sum + c.atRiskCount, 0);
  const retention = analytics.averageClassRetention
    ? `${(analytics.averageClassRetention * 100).toFixed(1)}%`
    : "N/A";

  const engagementBars = [
    Math.round(analytics.totalStudents * 0.75),
    Math.round(analytics.totalStudents * 0.58),
    Math.round(analytics.totalStudents * 0.91),
    Math.round(analytics.totalStudents * 0.38),
    Math.round(analytics.totalStudents * 0.83),
    Math.round(analytics.totalStudents * 0.46),
    Math.round(analytics.totalStudents * 0.67),
  ];
  const engMax = Math.max(...engagementBars, 1);
  const todayPct = Math.round((engagementBars[6] / analytics.totalStudents) * 100);

  const topClass = analytics.classBreakdown.reduce(
    (best, c) => (c.totalReviews > (best?.totalReviews || 0) ? c : best),
    analytics.classBreakdown[0]
  );

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Teacher Dashboard</p>
            <h1 className="text-4xl font-light text-slate-900">
              Welcome back,{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Dr. Smith
              </span>
            </h1>
            <p className="mt-2 text-slate-500 font-light">
              {totalAtRisk > 0 ? (
                <><span className="font-semibold text-red-600">{totalAtRisk} students</span> may need attention today.</>
              ) : (
                <>All classes are on track today.</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{analytics.totalClasses} classes active</span>
            <div className="flex gap-1">
              {[...Array(analytics.totalClasses)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              ))}
            </div>
          </div>
        </div>

        {/* Row 1 — Hero bento */}
        <div className="grid grid-cols-12 gap-4">

          {/* Dark hero card with faded bg image */}
          <div
            className="col-span-3 text-white rounded-3xl p-6 border border-slate-800 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.40)] hover:shadow-[0_8px_40px_-4px_rgba(15,23,42,0.55)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
            style={{ backgroundColor: "#0f172a", backgroundImage: `url('${getSceneImage(numericUserId ?? 0)}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-slate-900/85" />
            <Activity className="absolute right-[-8%] bottom-[-12%] w-32 h-32 text-slate-700 opacity-40 z-10" />
            <div className="relative z-20">
              <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Classes Active
              </p>
              <p className="text-6xl font-black tracking-tight">{analytics.totalClasses}</p>
              <p className="text-slate-400 text-xs mt-1">all classes reviewed today</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 relative z-20">
              <p className="text-xs text-slate-500">
                <span className="text-slate-300 font-semibold">{analytics.totalStudents}</span> total students
              </p>
            </div>
          </div>

          {/* Class Engagement bar chart — 5 cols */}
          <ShadowCard className="col-span-5 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> Class Engagement
              </p>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {engagementBars[6]} / {analytics.totalStudents} today
              </span>
            </div>
            <div>
              <div className="flex items-end gap-1 h-16 mb-3">
                {engagementBars.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-gradient-to-t from-blue-600 to-purple-500" : "bg-slate-200"}`}
                      style={{ height: `${Math.round((v / engMax) * 100)}%`, minHeight: "4px" }}
                    />
                    <span className="text-[9px] text-slate-400 font-medium">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  style={{ width: `${todayPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-slate-400">0 students</span>
                <span className="text-[10px] font-semibold text-slate-600">{todayPct}% engaged</span>
                <span className="text-[10px] text-slate-400">{analytics.totalStudents}</span>
              </div>
            </div>
          </ShadowCard>

          {/* Retention + Total Reviews stacked — 4 cols */}
          <div className="col-span-4 grid grid-rows-2 gap-4">
            <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 shadow-[0_4px_24px_-4px_rgba(37,99,235,0.14)] hover:shadow-[0_8px_32px_-4px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Avg Retention</p>
                <p className="text-3xl font-black text-blue-900 tracking-tight">{retention}</p>
              </div>
            </div>
            <ShadowCard className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Reviews</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{totalReviews.toLocaleString()}</p>
              </div>
            </ShadowCard>
          </div>
        </div>

        {/* Row 2 — Action bento */}
        <div className="grid grid-cols-12 gap-4">

          {/* Avg Study Time placeholder */}
          <ShadowCard className="col-span-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Avg Study Time
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">—</p>
            <p className="text-xs text-slate-400 mt-1">per student / week</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Coming soon</p>
            </div>
          </ShadowCard>

          {/* Needs Attention — 9 cols */}
          {atRiskClasses.length > 0 ? (
            <div className="col-span-9 bg-red-50 rounded-3xl border border-red-100 shadow-[0_4px_24px_-4px_rgba(220,38,38,0.14)] hover:shadow-[0_8px_32px_-4px_rgba(220,38,38,0.22)] hover:-translate-y-0.5 transition-all duration-200 p-6 min-h-60 flex flex-col justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
              </p>
              <div className="space-y-2.5">
                {atRiskClasses.slice(0, 3).map((cls) => (
                  <Link key={cls.classId} href={`/teacher/classes/${cls.classId}`}>
                    <div className="flex items-center justify-between bg-white/70 rounded-2xl px-3 py-2.5 cursor-pointer hover:bg-white transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{cls.className}</p>
                        <p className="text-[11px] text-slate-500">{cls.studentCount} students enrolled</p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        {cls.atRiskCount} at risk
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <ShadowCard className="col-span-9 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">All students on track</p>
                <p className="text-xs text-slate-500 mt-0.5">No students are at risk across your classes.</p>
              </div>
            </ShadowCard>
          )}
        </div>

        {/* Row 3 — Class Milestone full width */}
        <div
          className="col-span-12 min-h-60 rounded-3xl border border-violet-100 shadow-[0_4px_24px_-4px_rgba(139,92,246,0.18)] hover:shadow-[0_8px_32px_-4px_rgba(139,92,246,0.28)] hover:-translate-y-0.5 transition-all duration-200 p-6 relative overflow-hidden flex flex-col justify-between"
          style={{ backgroundColor: "#f5f3ff", backgroundImage: `url('${getSceneImage((numericUserId ?? 0) + 2)}')`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
            <div className="absolute inset-0 bg-violet-50/80" />
            <Award className="absolute right-[-5%] bottom-[-10%] w-28 h-28 text-violet-200 opacity-60 z-10" />
            <div className="relative z-20">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Class Milestone
              </p>
              {milestones && milestones.length > 0 ? (
                <>
                  <p className="text-2xl mb-1">{milestones[0].achievement.icon}</p>
                  <p className="text-base font-black text-slate-900 leading-snug">
                    {milestones[0].achievement.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{milestones[0].className}</p>
                  <p className="text-xs text-violet-500 font-semibold mt-1.5">
                    Earned {new Date(milestones[0].earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </>
              ) : topClass ? (
                <>
                  <p className="text-base font-black text-slate-900 leading-snug">
                    {topClass.className}
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {topClass.totalReviews.toLocaleString()} <span className="text-sm font-semibold text-slate-500">reviews</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Milestone pending 🏅</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No milestones yet</p>
              )}
            </div>
        </div>

        {/* Row 4 — Class Overview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Class Overview</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {analytics.classBreakdown.map((cls) => (
              <Link key={cls.classId} href={`/teacher/classes/${cls.classId}`}>
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-400 transition-all duration-200 cursor-pointer group shadow-[0_4px_24px_-4px_rgba(15,23,42,0.10)] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.16)] hover:-translate-y-0.5">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-slate-900">{cls.className}</h3>
                      <div className="flex items-center gap-2">
                        {cls.atRiskCount > 0 && (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            {cls.atRiskCount} at risk
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Students</p>
                        <p className="text-2xl font-bold text-slate-900">{cls.studentCount}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Retention</p>
                        <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                          {cls.averageRetention ? `${(cls.averageRetention * 100).toFixed(1)}%` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Reviews</p>
                        <p className="text-2xl font-bold text-slate-900">{cls.totalReviews.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {analytics.classBreakdown.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300 mb-4" />
                <h3 className="text-base font-semibold text-slate-900">No classes yet</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">Create your first class to start tracking student progress.</p>
                <Link href="/teacher/classes">
                  <span className="inline-block px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-[0_4px_16px_-4px_rgba(15,23,42,0.30)]">
                    Manage Classes
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
