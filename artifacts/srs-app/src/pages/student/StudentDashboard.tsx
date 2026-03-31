import { useListStudentClasses, useGetStudentAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { PlayCircle, Flame, Target, CheckCircle2, ChevronRight } from "lucide-react";

export default function StudentDashboard() {
  const { userId } = useRole();
  const { data: classes, isLoading: classesLoading } = useListStudentClasses(userId);
  const { data: analytics, isLoading: statsLoading } = useGetStudentAnalytics(userId);

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

  const statCards = [
    { label: "Current Streak", value: `${analytics?.currentStreak || 0}`, unit: "days", icon: Flame },
    { label: "Avg Retention", value: analytics?.averageRetention ? `${(analytics.averageRetention * 100).toFixed(0)}%` : "N/A", icon: Target },
    { label: "Cards Mastered", value: `${analytics?.cardsMastered || 0}`, icon: CheckCircle2 },
  ];

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header + CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer">
              <PlayCircle className="h-4 w-4" />
              Start Session
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{stat.label}</p>
              <p className="text-4xl font-bold text-slate-900">
                {stat.value}
                {stat.unit && <span className="text-lg font-normal text-slate-400 ml-1">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Enrolled Classes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">My Enrolled Classes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes?.map((cls) => (
              <div key={cls.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-400 transition-colors group">
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
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
                <p className="text-sm text-slate-500">You aren't enrolled in any classes yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
