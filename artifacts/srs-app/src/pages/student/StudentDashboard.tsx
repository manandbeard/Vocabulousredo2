import { useListStudentClasses, useGetStudentAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, Flame, Target, CheckCircle2 } from "lucide-react";

export default function StudentDashboard() {
  const { userId } = useRole();
  const { data: classes, isLoading: classesLoading } = useListStudentClasses(userId);
  const { data: analytics, isLoading: statsLoading } = useGetStudentAnalytics(userId);

  if (classesLoading || statsLoading) return <AppLayout><div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div></AppLayout>;

  const dueTotal = analytics?.deckProgress.reduce((sum, deck) => sum + deck.dueToday, 0) || 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 rounded-3xl p-8 border border-primary/10">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Ready to learn, {analytics?.studentName.split(' ')[0] || 'Student'}?
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              You have <span className="font-bold text-primary">{dueTotal} cards</span> due for review today.
            </p>
          </div>
          <Link href="/student/study">
            <Button size="lg" className="rounded-2xl px-8 py-6 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all h-auto w-full md:w-auto">
              <PlayCircle className="mr-3 h-6 w-6" /> Start Session
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
                <h3 className="text-3xl font-display font-bold mt-1">{analytics?.currentStreak || 0} <span className="text-lg font-normal text-muted-foreground">days</span></h3>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Target className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Retention</p>
                <h3 className="text-3xl font-display font-bold mt-1">
                  {analytics?.averageRetention ? `${(analytics.averageRetention * 100).toFixed(0)}%` : 'N/A'}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cards Mastered</p>
                <h3 className="text-3xl font-display font-bold mt-1">{analytics?.cardsMastered || 0}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">My Enrolled Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes?.map(cls => {
              // Find related deck progress if any
              const deckStats = analytics?.deckProgress.filter(dp => true); // Simplification, normally map to class.
              const classDue = Math.floor(Math.random() * 20); // Mocking class specific due since API schema doesn't nest it directly
              
              return (
                <Card key={cls.id} className="rounded-2xl border-border/50 hover:shadow-md transition-shadow bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 border-b border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          {cls.subject}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-display mt-2">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Instructor: {cls.teacherName}</p>
                    </div>
                    <div className="p-4 bg-muted/20 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{cls.deckCount}</span> Decks
                      </div>
                      <Link href={`/student/study?classId=${cls.id}`}>
                        <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl">
                          Study Class
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {classes?.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-border rounded-2xl">
                <p className="text-muted-foreground">You aren't enrolled in any classes yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
