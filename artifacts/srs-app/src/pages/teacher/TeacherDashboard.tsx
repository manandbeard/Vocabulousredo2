import { useGetTeacherAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Brain, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function TeacherDashboard() {
  const { userId } = useRole();
  const { data: analytics, isLoading, error } = useGetTeacherAnalytics(userId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h2 className="text-xl font-bold">Failed to load analytics</h2>
          <p className="mt-2 opacity-80">Please ensure the backend is running and the database is seeded.</p>
        </div>
      </AppLayout>
    );
  }

  const statCards = [
    { title: "Total Classes", value: analytics.totalClasses, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Students", value: analytics.totalStudents, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Total Cards", value: analytics.totalCards, icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Avg. Retention", value: analytics.averageClassRetention ? `${(analytics.averageClassRetention * 100).toFixed(1)}%` : "N/A", icon: AlertTriangle, color: "text-teal-500", bg: "bg-teal-500/10" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome back, Dr. Smith</h1>
          <p className="mt-2 text-muted-foreground text-lg">Here's what's happening in your classes today.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="hover-elevate border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="font-display text-3xl font-bold text-foreground mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground pt-4">Class Overview</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {analytics.classBreakdown.map((cls) => (
            <Link key={cls.classId} href={`/teacher/classes/${cls.classId}`}>
              <Card className="hover-elevate cursor-pointer border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    {cls.className}
                    {cls.atRiskCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {cls.atRiskCount} At Risk
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Students</p>
                      <p className="text-xl font-bold mt-1">{cls.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Retention</p>
                      <p className="text-xl font-bold mt-1 text-primary">
                        {cls.averageRetention ? `${(cls.averageRetention * 100).toFixed(1)}%` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Reviews</p>
                      <p className="text-xl font-bold mt-1">{cls.totalReviews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {analytics.classBreakdown.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No classes yet</h3>
              <p className="text-muted-foreground mt-1 mb-6">Create your first class to start tracking student progress.</p>
              <Link href="/teacher/classes" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Manage Classes
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
