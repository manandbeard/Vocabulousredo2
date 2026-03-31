import { useGetTeacherAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookOpen, Users, Brain, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function TeacherDashboard() {
  const { userId, role, setRole } = useRole();
  const { data: analytics, isLoading, error } = useGetTeacherAnalytics(userId || 1);

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
        <div className="border border-slate-200 rounded-xl p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Failed to load analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Please ensure the backend is running and the database is seeded.</p>
        </div>
      </AppLayout>
    );
  }

  const statCards = [
    { label: "Total Classes", value: analytics.totalClasses, icon: BookOpen },
    { label: "Total Students", value: analytics.totalStudents, icon: Users },
    { label: "Total Cards", value: analytics.totalCards, icon: Brain },
    {
      label: "Avg. Retention",
      value: analytics.averageClassRetention
        ? `${(analytics.averageClassRetention * 100).toFixed(1)}%`
        : "N/A",
      icon: AlertTriangle,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Teacher Dashboard</p>
          <h1 className="text-4xl font-light text-slate-900">
            Welcome back, <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Dr. Smith</span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">Here's what's happening in your classes today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{stat.label}</p>
              <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Class Overview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">Class Overview</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {analytics.classBreakdown.map((cls) => (
              <Link key={cls.classId} href={`/teacher/classes/${cls.classId}`}>
                <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{cls.className}</h3>
                    <div className="flex items-center gap-2">
                      {cls.atRiskCount > 0 && (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          {cls.atRiskCount} at risk
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
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
                      <p className="text-2xl font-bold text-slate-900">{cls.totalReviews}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {analytics.classBreakdown.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300 mb-4" />
                <h3 className="text-base font-semibold text-slate-900">No classes yet</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">Create your first class to start tracking student progress.</p>
                <Link href="/teacher/classes">
                  <span className="inline-block px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
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
