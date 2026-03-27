import { useGetStudentAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";

export default function StudentProgress() {
  const { userId } = useRole();
  const { data: analytics, isLoading } = useGetStudentAnalytics(userId);

  if (isLoading) return <AppLayout><div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div></AppLayout>;
  if (!analytics) return <AppLayout>Failed to load data</AppLayout>;

  // Format trend data
  const trendData = analytics.retentionTrend.map(pt => ({
    ...pt,
    formattedDate: format(new Date(pt.date), 'MMM d'),
    retentionPercent: pt.retention * 100
  }));

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Your Progress</h1>
          <p className="mt-2 text-muted-foreground text-lg">Track your learning journey and memory strength.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="col-span-1 md:col-span-3 border-border/50 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Memory Retention Trend</CardTitle>
              <CardDescription>How well you remember cards over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} domain={[0, 100]} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention']}
                      />
                      <Area type="monotone" dataKey="retentionPercent" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRetention)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    Not enough review data to show trend.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-border/50 rounded-2xl flex-1 bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Total Reviews</p>
                <div className="text-5xl font-display font-bold text-foreground">{analytics.totalReviews}</div>
                <p className="text-sm text-muted-foreground mt-4">Keep up the great work!</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 rounded-2xl flex-1">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Overall Mastery</p>
                <div className="text-4xl font-display font-bold text-accent">
                  {analytics.averageRetention ? `${(analytics.averageRetention * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">Deck Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.deckProgress.map(deck => {
              const total = deck.totalCards || 1;
              const masteryPct = (deck.mastered / total) * 100;
              const learningPct = (deck.learning / total) * 100;
              
              return (
                <Card key={deck.deckId} className="border-border/50 rounded-2xl hover-elevate">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 line-clamp-1">{deck.deckName}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Mastered</span>
                          <span className="font-semibold text-accent">{deck.mastered} cards</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${masteryPct}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Learning</span>
                          <span className="font-semibold text-primary">{deck.learning} cards</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${learningPct}%` }} />
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-border/50 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{deck.new} new cards left</span>
                        {deck.dueToday > 0 && (
                          <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-1 rounded-md">
                            {deck.dueToday} Due
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
