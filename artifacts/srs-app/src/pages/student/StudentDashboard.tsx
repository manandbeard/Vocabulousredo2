import { useListStudentClasses, useGetStudentAnalytics, useGetStudentAchievements } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import {
  PlayCircle, Flame, Target, CheckCircle2, ChevronRight,
  Activity, Clock, Award, BarChart2, BookOpen, Trophy
} from "lucide-react";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const SCENE_IMAGES = [
  "/images/card-bg-student-focused.png",
  "/images/card-bg-peer-study.png",
  "/images/card-bg-active-learning.png",
  "/images/card-bg-study-desk.png",
  "/images/card-bg-group-session.png",
  "/images/card-bg-deep-reading.png",
];

function getSceneImage(index: number): string {
  return SCENE_IMAGES[index % SCENE_IMAGES.length];
}

function ShadowCard({ children, className = "", hover = true }: {
  children: React.ReactNode; className?: string; hover?: boolean;
}) {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.12)] ${hover ? "hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.18)] hover:-translate-y-0.5" : ""} transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export default function StudentDashboard() {
  const { userId } = useRole();
  const { data: classes, isLoading: classesLoading } = useListStudentClasses(userId || 2);
  const { data: analytics, isLoading: statsLoading } = useGetStudentAnalytics(userId || 2);
  const { data: achievementsData } = useGetStudentAchievements(userId || 2);

  if (classesLoading || statsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const dueTotal = analytics?.deckProgress.reduce((sum, d) => sum + d.dueToday, 0) || 0;
  const firstName = analytics?.studentName.split(" ")[0] || "Student";
  const streak = analytics?.currentStreak || 0;
  const retention = analytics?.averageRetention ? Math.round(analytics.averageRetention * 100) : null;
  const mastered = analytics?.cardsMastered || 0;
  const upNext = analytics?.deckProgress.find((d) => d.dueToday > 0) || analytics?.deckProgress[0];

  const dueMaxForBars = Math.max(dueTotal, 10);
  const weekBars = [
    Math.round(dueMaxForBars * 0.6),
    Math.round(dueMaxForBars * 0.8),
    Math.round(dueMaxForBars * 0.5),
    Math.round(dueMaxForBars * 0.9),
    Math.round(dueMaxForBars * 0.7),
    Math.round(dueMaxForBars * 0.4),
    dueTotal,
  ];
  const barMax = Math.max(...weekBars, 1);

  const latestEarned = achievementsData?.earned?.[0];

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Student Dashboard</p>
            <h1 className="text-4xl font-light text-slate-900">
              Ready to learn,{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                {firstName}?
              </span>
            </h1>
            <p className="mt-2 text-slate-500 font-light">
              You have <span className="font-semibold text-slate-900">{dueTotal} cards</span> due for review today.
            </p>
          </div>
          <Link href="/student/study">
            <span className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.30)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.40)] transition-all duration-200 cursor-pointer">
              <PlayCircle className="h-4 w-4" /> Start Session
            </span>
          </Link>
        </div>

        {/* Row 1 — Hero bento */}
        <div className="grid grid-cols-12 gap-4">

          {/* Dark streak card with faded bg image */}
          <div
            className="col-span-3 text-white rounded-3xl p-6 border border-slate-800 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.40)] hover:shadow-[0_8px_40px_-4px_rgba(15,23,42,0.55)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
            style={{ backgroundColor: "#0f172a", backgroundImage: `url('${getSceneImage(userId || 0)}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-slate-900/85" />
            <Activity className="absolute right-[-8%] bottom-[-12%] w-32 h-32 text-slate-700 opacity-40 z-10" />
            <div className="relative z-20">
              <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Streak
              </p>
              <p className="text-6xl font-black tracking-tight">{streak}</p>
              <p className="text-slate-400 text-xs mt-1">days in a row</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 relative z-20">
              <p className="text-xs text-slate-500">
                {streak >= 7 ? "Amazing consistency! 🔥" : "Keep the streak alive!"}
              </p>
            </div>
          </div>

          {/* Today's Goal — 5 cols */}
          <ShadowCard className="col-span-5 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> Today's Goal
              </p>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {dueTotal} cards due
              </span>
            </div>
            <div>
              <div className="flex items-end gap-1 h-16 mb-3">
                {weekBars.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-gradient-to-t from-blue-600 to-purple-500" : "bg-slate-200"}`}
                      style={{ height: `${Math.round((v / barMax) * 100)}%`, minHeight: "4px" }}
                    />
                    <span className="text-[9px] text-slate-400 font-medium">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  style={{ width: dueTotal > 0 ? "100%" : "0%" }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-slate-400">0 due</span>
                <span className="text-[10px] font-semibold text-slate-600">Review today</span>
                <span className="text-[10px] text-slate-400">{dueTotal}</span>
              </div>
            </div>
          </ShadowCard>

          {/* Retention + Mastered stacked */}
          <div className="col-span-4 grid grid-rows-2 gap-4">
            <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 shadow-[0_4px_24px_-4px_rgba(37,99,235,0.14)] hover:shadow-[0_8px_32px_-4px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Avg Retention</p>
                <p className="text-3xl font-black text-blue-900 tracking-tight">
                  {retention !== null ? `${retention}%` : "—"}
                </p>
              </div>
            </div>
            <ShadowCard className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mastered</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{mastered}</p>
              </div>
            </ShadowCard>
          </div>
        </div>

        {/* Row 2 — Action bento */}
        <div className="grid grid-cols-12 gap-4">

          {/* Study time placeholder */}
          <ShadowCard className="col-span-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Study Time
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">—</p>
            <p className="text-xs text-slate-400 mt-1">this week</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Coming soon</p>
            </div>
          </ShadowCard>

          {/* Up Next */}
          <div className="col-span-5 bg-amber-50 rounded-3xl border border-amber-100 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.16)] hover:shadow-[0_8px_32px_-4px_rgba(245,158,11,0.24)] hover:-translate-y-0.5 transition-all duration-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Up Next
            </p>
            {upNext ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{upNext.deckName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-900">{upNext.dueToday}</span> cards due
                  </p>
                </div>
                <Link href="/student/study">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-amber-200 transition-colors">
                    Study <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">All caught up! No cards due.</p>
            )}
          </div>

          {/* Achievement card — real badge from DB */}
          <Link href="/student/achievements">
            <div
              className="col-span-4 rounded-3xl border border-violet-100 shadow-[0_4px_24px_-4px_rgba(139,92,246,0.18)] hover:shadow-[0_8px_32px_-4px_rgba(139,92,246,0.28)] hover:-translate-y-0.5 transition-all duration-200 p-6 relative overflow-hidden cursor-pointer"
              style={{ backgroundColor: "#f5f3ff", backgroundImage: `url('${getSceneImage((userId || 0) + 1)}')`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 bg-violet-50/80" />
              <Award className="absolute right-[-5%] bottom-[-10%] w-28 h-28 text-violet-200 opacity-60 z-10" />
              <div className="relative z-20">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Achievement
                </p>
                {latestEarned ? (
                  <>
                    <p className="text-2xl mb-1">{latestEarned.achievement.icon}</p>
                    <p className="text-lg font-black text-slate-900 leading-snug">{latestEarned.achievement.name}</p>
                    <p className="text-xs text-slate-500 mt-1.5">{latestEarned.achievement.description}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-black text-slate-900">Keep going! 💪</p>
                    <p className="text-xs text-slate-500 mt-1.5">Build your streak to earn badges</p>
                  </>
                )}
                <p className="text-[10px] text-violet-400 mt-2 font-semibold">View all badges →</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Enrolled Classes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">My Enrolled Classes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes?.map((cls) => (
              <div key={cls.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-400 transition-all duration-200 group shadow-[0_4px_24px_-4px_rgba(15,23,42,0.10)] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.16)] hover:-translate-y-0.5">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{cls.subject}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-2">{cls.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-light">Instructor: {cls.teacherName}</p>
                </div>
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">{cls.deckCount}</span> Decks
                  </span>
                  <Link href={`/student/study?classId=${cls.id}`}>
                    <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text cursor-pointer hover:opacity-70 transition-opacity">
                      Study Now →
                    </span>
                  </Link>
                </div>
              </div>
            ))}

            {classes?.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
                <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">You aren't enrolled in any classes yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
