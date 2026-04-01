import { useListStudentClasses, useGetStudentAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { PlayCircle, Flame, Target, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function StudentDashboard() {
  const { userId } = useRole();
  const { data: classes, isLoading: classesLoading } = useListStudentClasses(userId || 2);
  const { data: analytics, isLoading: statsLoading } = useGetStudentAnalytics(userId || 2);

  if (classesLoading || statsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const dueTotal = analytics?.deckProgress.reduce((sum, deck) => sum + deck.dueToday, 0) || 0;
  const firstName = analytics?.studentName.split(" ")[0] || "Student";

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Header */}
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

        {/* Stats — bento row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Hero dark card — streak */}
          <div className="md:col-span-1 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <Activity className="absolute right-[-10%] bottom-[-20%] w-32 h-32 text-slate-800 opacity-50" />
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3" /> Streak
              </p>
              <p className="text-5xl font-bold tracking-tight">{analytics?.currentStreak || 0}</p>
              <p className="text-slate-400 text-xs mt-1">days</p>
            </div>
          </div>

          <div className="md:col-span-1 bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center">
            <p className="text-blue-600 text-xs font-medium mb-2 uppercase tracking-wider">Avg Retention</p>
            <p className="text-4xl font-bold tracking-tight text-blue-900">
              {analytics?.averageRetention ? `${(analytics.averageRetention * 100).toFixed(0)}%` : "N/A"}
            </p>
          </div>

          <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Cards Mastered</p>
            <p className="text-5xl font-bold tracking-tight text-slate-900">{analytics?.cardsMastered || 0}</p>
          </div>

          {/* CTA card */}
          <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">{dueTotal} cards due today</p>
            <Link href="/student/study">
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer w-full justify-center">
                <PlayCircle className="h-4 w-4" />
                Start Session
              </span>
            </Link>
          </div>
        </div>

        {/* Enrolled Classes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">My Enrolled Classes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes?.map((cls) => (
              <div key={cls.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-400 transition-colors group shadow-sm">
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
                    <span className="text-sm font-medium text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text cursor-pointer hover:opacity-70 transition-opacity">
                      Study Now →
                    </span>
                  </Link>
                </div>
              </div>
            ))}

            {classes?.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-sm">
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
