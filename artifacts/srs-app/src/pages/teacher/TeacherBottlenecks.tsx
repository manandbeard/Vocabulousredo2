import { useGetTeacherBottlenecks } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BookOpen,
  TrendingDown,
  Clock,
  Tag,
  BarChart2,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function pct(rate: number) {
  return Math.round(rate * 100);
}

function RetentionBadge({ value }: { value: number }) {
  const color =
    value < 45
      ? "bg-red-100 text-red-700"
      : value < 65
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {value}%
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "text-slate-900",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
      <div className="h-7 w-16 bg-slate-200 rounded" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-48 bg-slate-200 rounded" />
          <div className="h-2.5 w-28 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex gap-6 shrink-0">
        <div className="h-5 w-10 bg-slate-100 rounded-full" />
        <div className="h-4 w-8 bg-slate-100 rounded" />
        <div className="h-4 w-8 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function TeacherBottlenecks() {
  const { userId } = useRole();
  const safeUserId = userId ?? 0;

  const { data, isLoading, isError } = useGetTeacherBottlenecks(safeUserId, {
    query: { enabled: safeUserId > 0 },
  });

  const struggleCards = data?.struggleCards ?? [];
  const tagRetention = data?.tagRetentionSummary ?? [];
  const classOverdue = data?.classOverdueSummary ?? [];

  const avgRecallPct =
    struggleCards.length > 0
      ? Math.round(
          (struggleCards.reduce((s, c) => s + c.recallRate, 0) / struggleCards.length) * 100
        )
      : null;

  const hasData = struggleCards.length > 0 || tagRetention.length > 0 || classOverdue.length > 0;

  return (
    <AppLayout>
      <div className="space-y-8 font-['Inter']">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Analytics
          </p>
          <h1 className="text-4xl font-light text-slate-900">
            Content{" "}
            <span className="font-bold text-transparent bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text">
              Bottlenecks
            </span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">
            Cards and topics with the lowest class-wide retention. Prioritise reteaching these concepts.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                label="Bottleneck Cards"
                value={struggleCards.length}
                sub="cards with review data"
              />
              <StatCard
                label="Avg Recall (worst)"
                value={avgRecallPct != null ? `${avgRecallPct}%` : "—"}
                color={
                  avgRecallPct != null && avgRecallPct < 50
                    ? "text-red-600"
                    : avgRecallPct != null && avgRecallPct < 70
                      ? "text-amber-600"
                      : "text-emerald-600"
                }
                sub="across all bottleneck cards"
              />
              <StatCard
                label="Fastest Decaying Topic"
                value={
                  data?.fastestDecayingTag
                    ? `${pct(data.fastestDecayingTag.avgRecall)}%`
                    : "—"
                }
                color="text-amber-600"
                sub={data?.fastestDecayingTag?.tagName ?? "no tag data yet"}
              />
              <StatCard
                label="Most Overdue Class"
                value={
                  data?.classWithMostOverdue
                    ? data.classWithMostOverdue.overdueCount
                    : "—"
                }
                color="text-red-600"
                sub={
                  data?.classWithMostOverdue
                    ? `${data.classWithMostOverdue.className} — overdue cards`
                    : "no overdue data"
                }
              />
            </>
          )}
        </div>

        {/* Error state */}
        {isError && (
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm py-16 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <XCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Failed to load bottleneck data</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
              There was a problem fetching analytics. Please reload the page to try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && !hasData && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm py-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No bottleneck data yet</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
              Once students start reviewing cards in your classes, their weakest cards will appear here.
            </p>
          </div>
        )}

        {/* Lowest-retention cards table */}
        {(isLoading || struggleCards.length > 0) && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-slate-800 text-sm">Lowest-Retention Cards</h2>
              {!isLoading && (
                <span className="ml-auto text-xs text-slate-400">{struggleCards.length} cards</span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : (
                struggleCards.map((card) => (
                  <div key={card.cardId} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{card.front}</p>
                        <p className="text-xs text-slate-400 truncate">{card.deckName}</p>
                        {card.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {card.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium"
                              >
                                <Tag className="w-2.5 h-2.5" /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wide">Recall</p>
                        <RetentionBadge value={pct(card.recallRate)} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wide">Reviews</p>
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                          <RefreshCw className="w-3 h-3" />
                          {card.reviewCount}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wide">Decay</p>
                        <span className="text-sm font-semibold text-slate-700">
                          {card.decayRate > 0 ? `${Math.round(card.decayRate * 100)}%` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tag retention breakdown */}
          {(isLoading || tagRetention.length > 0) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-500" />
                <h2 className="font-bold text-slate-800 text-sm">Tag Retention Breakdown</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : (
                  tagRetention.slice(0, 10).map((t) => (
                    <div key={t.tagName} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium shrink-0">
                          <Tag className="w-3 h-3" /> {t.tagName}
                        </span>
                        <span className="text-xs text-slate-400">{t.cardCount} cards</span>
                      </div>
                      <RetentionBadge value={pct(t.avgRecall)} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Class overdue summary */}
          {(isLoading || classOverdue.length > 0) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <h2 className="font-bold text-slate-800 text-sm">Overdue by Class</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : (
                  classOverdue.map((c) => (
                    <div key={c.classId} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <BarChart2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="text-sm font-medium text-slate-800 truncate">{c.className}</p>
                      </div>
                      <span
                        className={`text-sm font-bold shrink-0 ${
                          c.overdueCount > 50
                            ? "text-red-600"
                            : c.overdueCount > 20
                              ? "text-amber-600"
                              : "text-slate-700"
                        }`}
                      >
                        {c.overdueCount} overdue
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
