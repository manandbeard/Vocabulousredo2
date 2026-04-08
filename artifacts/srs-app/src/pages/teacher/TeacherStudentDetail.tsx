import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRole } from "@/hooks/use-role";
import { useGetStudentDetail } from "@workspace/api-client-react";
import { ArrowLeft, BookOpen, TrendingUp, Clock, AlertTriangle, Zap, CheckCircle, XCircle } from "lucide-react";

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr as string);
  if (isNaN(d.getTime())) return "Never";
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function gradeLabel(grade: number): string {
  return grade === 1 ? "Again" : grade === 2 ? "Hard" : grade === 3 ? "Good" : "Easy";
}

function gradeColor(grade: number): string {
  return grade === 1 ? "text-red-600" : grade === 2 ? "text-amber-600" : grade === 3 ? "text-blue-600" : "text-emerald-600";
}

function buildRetentionPath(points: { date: string | Date; retention: number }[]): { svgPath: string; labels: string[] } {
  if (points.length === 0) return { svgPath: "", labels: [] };

  const sorted = [...points].sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
  const width = 800;
  const height = 360;
  const top = 40;
  const bottom = 320;

  const dates = sorted.map((p) => new Date(p.date as string).getTime());
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1] ?? minDate;
  const range = maxDate - minDate || 1;

  const pathPoints = sorted.map((p, i) => {
    const x = ((dates[i] - minDate) / range) * width;
    const y = bottom - p.retention * (bottom - top);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const labels = sorted
    .filter((_, i) => i === 0 || i === Math.floor(sorted.length / 2) || i === sorted.length - 1)
    .map((p) => {
      const d = new Date(p.date as string);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

  return { svgPath: pathPoints.join(" "), labels };
}

export default function TeacherStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { userId } = useRole();
  const studentId = Number(id);

  const { data: student, isLoading } = useGetStudentDetail(studentId, { teacherId: userId ?? undefined });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <p className="text-slate-500">Student not found.</p>
          <button onClick={() => navigate("/teacher/heatmap")} className="mt-4 text-blue-600 text-sm font-medium hover:underline">
            Back to Heatmap
          </button>
        </div>
      </AppLayout>
    );
  }

  const { svgPath, labels: trendLabels } = buildRetentionPath(
    student.retentionTrend.map((p) => ({ date: p.date, retention: p.retention }))
  );

  const initials = student.studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Back button */}
        <button
          onClick={() => navigate("/teacher/heatmap")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Heatmap
        </button>

        {/* Student header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-wrap items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.studentName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{student.studentName}</h1>
              <p className="text-slate-500 mt-1">{student.studentEmail}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {student.classes.map((cls) => (
                  <span key={cls} className="inline-block text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-6 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center text-orange-500 font-bold text-xl">
                  <Zap className="w-4 h-4" />
                  {student.streakCount}
                </div>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Streak</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-slate-900">
                  {student.averageRetention != null ? `${(student.averageRetention * 100).toFixed(0)}%` : "—"}
                </div>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Avg Retention</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-slate-900">{formatDate(student.lastActiveAt as string | null | undefined)}</div>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Last Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* At-risk flags */}
        {student.atRiskFlags.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wider">Alerts</h3>
            </div>
            <ul className="space-y-2">
              {student.atRiskFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 30-day retention trend */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">30-Day Retention Trend</h3>
              <p className="text-slate-500 text-sm">Daily recall rate over the last 30 days</p>
            </div>
          </div>

          {svgPath ? (
            <div className="relative h-56 w-full">
              <svg viewBox="0 0 800 360" className="w-full h-full" preserveAspectRatio="none">
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                  <line
                    key={pct}
                    x1="0" x2="800"
                    y1={320 - pct * 280} y2={320 - pct * 280}
                    stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1"
                  />
                ))}
                <defs>
                  <linearGradient id="retGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`${svgPath} 800,320 0,320`} fill="url(#retGrad)" />
                <polyline points={svgPath} stroke="#2563eb" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 font-medium px-2 pb-1">
                {trendLabels.map((label, i) => <span key={i}>{label}</span>)}
              </div>
              <div className="absolute top-0 right-0 flex flex-col justify-between text-xs text-slate-400 font-medium h-full py-1 pr-2 text-right">
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              No review data in the last 30 days
            </div>
          )}
        </div>

        {/* Deck progress bento grid */}
        {student.deckProgress.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Deck Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.deckProgress.map((deck) => {
                const masteryPct = deck.totalCards > 0 ? Math.round((deck.mastered / deck.totalCards) * 100) : 0;
                return (
                  <div key={deck.deckId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{deck.deckName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{deck.totalCards} cards total</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Mastery</span>
                        <span className="font-bold text-slate-700">{masteryPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          style={{ width: `${masteryPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="font-bold text-emerald-600">{deck.mastered}</p>
                        <p className="text-slate-400">Mastered</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-600">{deck.learning}</p>
                        <p className="text-slate-400">Learning</p>
                      </div>
                      <div>
                        <p className={`font-bold ${deck.dueToday > 0 ? "text-amber-600" : "text-slate-600"}`}>{deck.dueToday}</p>
                        <p className="text-slate-400">Due</p>
                      </div>
                    </div>
                    {deck.averageRetention != null && (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                        <span>Retention</span>
                        <span className={`font-bold ${deck.averageRetention >= 0.75 ? "text-emerald-600" : deck.averageRetention >= 0.6 ? "text-amber-600" : "text-red-600"}`}>
                          {(deck.averageRetention * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent review history */}
        {student.recentReviews.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">Recent Review History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold tracking-wider">Card</th>
                    <th className="px-6 py-3 text-left font-semibold tracking-wider">Deck</th>
                    <th className="px-6 py-3 text-center font-semibold tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-center font-semibold tracking-wider">Recalled</th>
                    <th className="px-6 py-3 text-right font-semibold tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {student.recentReviews.map((review) => (
                    <tr key={review.reviewId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-slate-700 font-medium truncate max-w-[200px]">{review.cardFront}</p>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{review.deckName}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`font-semibold text-xs ${gradeColor(review.grade)}`}>
                          {gradeLabel(review.grade)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {review.recalled ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-slate-400">
                        {formatDateTime(review.reviewedAt)}
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
