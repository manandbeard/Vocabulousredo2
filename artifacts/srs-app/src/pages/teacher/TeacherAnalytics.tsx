import { useGetTeacherAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

export default function TeacherAnalytics() {
  const { userId } = useRole();
  const { data: analytics, isLoading } = useGetTeacherAnalytics(userId);

  if (isLoading) return <AppLayout><div className="p-8 animate-pulse flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div></AppLayout>;
  if (!analytics) return <AppLayout>Failed to load analytics</AppLayout>;

  // Prepare data for charts
  const classData = analytics.classBreakdown.map(cls => ({
    name: cls.className,
    retention: cls.averageRetention ? Math.round(cls.averageRetention * 100) : 0,
    atRisk: cls.atRiskCount
  }));

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Analytics Overview</h1>
          <p className="mt-2 text-muted-foreground text-lg">Platform-wide insights across all your classes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border/50 shadow-sm rounded-2xl col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Average Retention by Class</CardTitle>
              <CardDescription>Target retention rate is 85%+</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                {classData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <RechartsTooltip 
                        cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="retention" radius={[6, 6, 0, 0]} maxBarSize={60}>
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.retention >= 85 ? 'hsl(var(--accent))' : entry.retention >= 70 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
