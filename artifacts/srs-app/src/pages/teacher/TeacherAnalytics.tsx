import { useGetTeacherAnalytics } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, AlertTriangle } from "lucide-react";

export default function TeacherAnalytics() {
  const { userId } = useRole();
  const { data: analytics, isLoading } = useGetTeacherAnalytics(userId ?? 0);

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
    return (
      <AppLayout>
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <p className="text-slate-500">Failed to load analytics</p>
        </div>
      </AppLayout>
    );
  }

  const classData = analytics.classBreakdown.map(cls => ({
    name: cls.className,
    retention: cls.averageRetention ? Math.round(cls.averageRetention * 100) : 0,
    atRisk: cls.atRiskCount
  }));

  const totalAtRisk = analytics.classBreakdown.reduce((s, c) => s + c.atRiskCount, 0);

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Analytics</p>
          <h1 className="text-4xl font-light text-slate-900">
            Platform <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Insights</span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">Platform-wide insights across all your classes.</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-center">
            <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Classes</p>
            <p className="text-5xl font-bold tracking-tight">{analytics.totalClasses}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Students</p>
            <p className="text-5xl font-bold tracking-tight text-slate-900">{analytics.totalStudents}</p>
          </div>
          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center">
            <p className="text-blue-600 text-xs font-medium mb-2 uppercase tracking-wider">Avg Retention</p>
            <p className="text-4xl font-bold tracking-tight text-blue-900">
              {analytics.averageClassRetention
                ? `${(analytics.averageClassRetention * 100).toFixed(1)}%`
                : "N/A"}
            </p>
          </div>
          <div className={`rounded-3xl p-6 border shadow-sm flex flex-col justify-center ${totalAtRisk > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
            <p className={`text-xs font-medium mb-2 uppercase tracking-wider ${totalAtRisk > 0 ? "text-red-600" : "text-slate-500"}`}>At Risk</p>
            <p className={`text-5xl font-bold tracking-tight ${totalAtRisk > 0 ? "text-red-700" : "text-slate-900"}`}>{totalAtRisk}</p>
            <p className={`text-xs mt-1 ${totalAtRisk > 0 ? "text-red-400" : "text-slate-400"}`}>students flagged</p>
          </div>
        </div>

        {/* Retention chart */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Average Retention by Class</h3>
              <p className="text-slate-500 text-sm">Target retention rate is 85%+</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {classData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(241,245,249,0.8)" }}
                    contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  />
                  <Bar dataKey="retention" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {classData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.retention >= 85 ? "#10b981" : entry.retention >= 70 ? "#3b82f6" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                No data available yet
              </div>
            )}
          </div>
        </div>

        {/* Class breakdown table */}
        {analytics.classBreakdown.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Class Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 font-semibold tracking-wider">Class</th>
                    <th className="px-8 py-4 font-semibold tracking-wider text-right">Students</th>
                    <th className="px-8 py-4 font-semibold tracking-wider text-right">Reviews</th>
                    <th className="px-8 py-4 font-semibold tracking-wider text-right">Retention</th>
                    <th className="px-8 py-4 font-semibold tracking-wider text-right">At Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.classBreakdown.map((cls) => (
                    <tr key={cls.classId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-semibold text-slate-900">{cls.className}</td>
                      <td className="px-8 py-4 text-right text-slate-600">{cls.studentCount}</td>
                      <td className="px-8 py-4 text-right text-slate-600">{cls.totalReviews}</td>
                      <td className="px-8 py-4 text-right font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                        {cls.averageRetention ? `${(cls.averageRetention * 100).toFixed(1)}%` : "N/A"}
                      </td>
                      <td className="px-8 py-4 text-right">
                        {cls.atRiskCount > 0 ? (
                          <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full text-xs border border-red-200">
                            {cls.atRiskCount}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
