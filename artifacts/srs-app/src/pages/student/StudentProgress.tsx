import { useGetStudentAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp, CheckCircle2, BarChart3, Layers } from "lucide-react";

export default function StudentProgress() {
  const { userId } = useRole();
  const { data: analytics, isLoading } = useGetStudentAnalytics(userId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!analytics) {
    return <AppLayout><div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm text-slate-500">Failed to load data</div></AppLayout>;
  }

  const trendData = analytics.retentionTrend.map(pt => ({
    ...pt,
    formattedDate: format(new Date(pt.date), "MMM d"),
    retentionPercent: pt.retention * 100
  }));

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Progress</p>
          <h1 className="text-4xl font-light text-slate-900">
            Your <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Learning Journey</span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">Track your memory strength and deck mastery.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-center">
            <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total Reviews
            </p>
            <p className="text-5xl font-bold tracking-tight">{analytics.totalReviews}</p>
            <p className="text-slate-400 text-xs mt-1">lifetime</p>
          </div>
          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center">
            <p className="text-blue-600 text-xs font-medium mb-2 uppercase tracking-wider">Overall Mastery</p>
            <p className="text-4xl font-bold tracking-tight text-blue-900">
              {analytics.averageRetention ? `${(analytics.averageRetention * 100).toFixed(1)}%` : "N/A"}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center col-span-2 lg:col-span-1">
            <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Decks Tracked
            </p>
            <p className="text-5xl font-bold tracking-tight text-slate-900">{analytics.deckProgress.length}</p>
          </div>
        </div>

        {/* Retention trend chart */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Memory Retention Trend</h3>
              <p className="text-slate-500 text-sm">How well you remember cards over time</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 100]} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Retention"]}
                  />
                  <Area type="monotone" dataKey="retentionPercent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRet)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">
                Not enough review data to show trend yet.
              </div>
            )}
          </div>
        </div>

        {/* Deck breakdown */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Deck Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.deckProgress.map(deck => {
              const total = deck.totalCards || 1;
              const masteryPct = (deck.mastered / total) * 100;
              const learningPct = (deck.learning / total) * 100;

              return (
                <div key={deck.deckId} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1 flex-1">{deck.deckName}</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 uppercase tracking-wider font-medium">Mastered</span>
                        <span className="font-semibold text-emerald-600">{deck.mastered} cards</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${masteryPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 uppercase tracking-wider font-medium">Learning</span>
                        <span className="font-semibold text-blue-600">{deck.learning} cards</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${learningPct}%` }} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-400">{deck.new} new left</span>
                      {deck.dueToday > 0 && (
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100">
                          {deck.dueToday} Due
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
