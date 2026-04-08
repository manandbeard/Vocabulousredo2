import { useState, useMemo } from "react";
import { useGetTeacherBottlenecks, useUpdateCard } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { AlertTriangle, TrendingDown, BookOpen, Clock, Edit2, ChevronUp, ChevronDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SortKey = "avgGrade" | "recallRate" | "reviewCount" | "decayRate";
type SortDir = "asc" | "desc";

interface BottleneckCard {
  cardId: number;
  deckId: number;
  front: string;
  back: string;
  tags: string[];
  avgGrade: number;
  recallRate: number;
  reviewCount: number;
  decayRate: number;
}

function recallColor(recall: number): string {
  const r = Math.round(255 * (1 - recall));
  const g = Math.round(200 * recall);
  return `rgb(${r},${g},60)`;
}

function EditCardModal({
  card,
  onClose,
}: {
  card: BottleneckCard;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    front: card.front,
    back: card.back,
    hint: "",
  });
  const updateCard = useUpdateCard();

  function handleSave() {
    updateCard.mutate(
      {
        id: card.cardId,
        data: {
          front: form.front,
          back: form.back,
          hint: form.hint || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Card updated" });
          onClose();
        },
        onError: () => {
          toast({ title: "Failed to update card", variant: "destructive" });
        },
      }
    );
  }

  return (
    <DialogContent className="max-w-lg rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-900">Modify Card</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Front (Question)</Label>
          <Textarea
            value={form.front}
            onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
            rows={3}
            className="rounded-xl resize-none"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Back (Answer)</Label>
          <Textarea
            value={form.back}
            onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
            rows={3}
            className="rounded-xl resize-none"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Hint (optional)</Label>
          <Input
            value={form.hint}
            onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
            className="rounded-xl"
            placeholder="Add a hint…"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={updateCard.isPending || !form.front.trim() || !form.back.trim()}
            className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-700"
          >
            {updateCard.isPending ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="px-4 py-3 font-semibold tracking-wider cursor-pointer select-none whitespace-nowrap text-right"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1 justify-end">
        {label}
        {active ? (
          dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}

export default function TeacherBottlenecks() {
  const { userId } = useRole();
  const { data, isLoading } = useGetTeacherBottlenecks(userId ?? 0);
  const [sortKey, setSortKey] = useState<SortKey>("avgGrade");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editCard, setEditCard] = useState<BottleneckCard | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedCards = useMemo(() => {
    if (!data?.struggleCards) return [];
    return [...data.struggleCards].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const diff = (aVal as number) - (bVal as number);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [data?.struggleCards, sortKey, sortDir]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-slate-400" />
          <p className="text-slate-500">Failed to load bottleneck data</p>
        </div>
      </AppLayout>
    );
  }

  const { highestFailureCard, mostReviewedCard, fastestDecayingTag, classWithMostOverdue, tagRetentionSummary, classOverdueSummary } = data;

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Analytics</p>
          <h1 className="text-4xl font-light text-slate-900">
            Content <span className="font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">Bottlenecks</span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">Cards and topics your students collectively struggle with most.</p>
        </div>

        {/* Stat cards bento row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Highest avg failure rate */}
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Highest Failure Rate</span>
            </div>
            {highestFailureCard ? (
              <>
                <p className="text-sm font-bold text-slate-900 line-clamp-2">{highestFailureCard.front}</p>
                <p className="text-2xl font-bold text-red-600">{(highestFailureCard.recallRate * 100).toFixed(0)}% recall</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">No data yet</p>
            )}
          </div>

          {/* Most reviewed card */}
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-500">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Most Reviewed Card</span>
            </div>
            {mostReviewedCard ? (
              <>
                <p className="text-sm font-bold text-slate-900 line-clamp-2">{mostReviewedCard.front}</p>
                <p className="text-2xl font-bold text-blue-600">{mostReviewedCard.reviewCount} reviews</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">No data yet</p>
            )}
          </div>

          {/* Fastest decaying tag */}
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-orange-500">
              <TrendingDown className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Fastest Decaying Tag</span>
            </div>
            {fastestDecayingTag ? (
              <>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">{fastestDecayingTag.tagName}</p>
                <p className="text-2xl font-bold text-orange-600">{(fastestDecayingTag.avgRecall * 100).toFixed(0)}% avg recall</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">No tags yet</p>
            )}
          </div>

          {/* Class with most overdue */}
          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-500">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Most Overdue Class</span>
            </div>
            {classWithMostOverdue ? (
              <>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">{classWithMostOverdue.className}</p>
                <p className="text-2xl font-bold text-purple-600">{classWithMostOverdue.overdueCount} overdue</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">No overdue cards</p>
            )}
          </div>
        </div>

        {/* Struggle cards table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Struggle Cards</h3>
            <p className="text-sm text-slate-500 mt-0.5">Click a column header to sort</p>
          </div>
          {sortedCards.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold tracking-wider">Card</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Tags</th>
                    <SortHeader label="Avg Grade" sortKey="avgGrade" current={sortKey} dir={sortDir} onSort={handleSort} />
                    <SortHeader label="Recall Rate" sortKey="recallRate" current={sortKey} dir={sortDir} onSort={handleSort} />
                    <SortHeader label="Reviews" sortKey="reviewCount" current={sortKey} dir={sortDir} onSort={handleSort} />
                    <SortHeader label="Decay Rate" sortKey="decayRate" current={sortKey} dir={sortDir} onSort={handleSort} />
                    <th className="px-4 py-3 font-semibold tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCards.map((card) => (
                    <tr key={card.cardId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-semibold text-slate-900 truncate">{card.front}</p>
                        <p className="text-xs text-slate-400 truncate">{card.back}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {card.tags.length > 0 ? (
                            card.tags.map((t) => (
                              <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-bold ${card.avgGrade <= 1.5 ? "text-red-600" : card.avgGrade <= 2.5 ? "text-orange-500" : "text-emerald-600"}`}
                        >
                          {card.avgGrade.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-bold ${card.recallRate < 0.5 ? "text-red-600" : card.recallRate < 0.75 ? "text-orange-500" : "text-emerald-600"}`}
                        >
                          {(card.recallRate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{card.reviewCount}</td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {(card.decayRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditCard(card)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Modify Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-8 py-16 text-center text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No review data yet. Cards will appear here once students start studying.</p>
            </div>
          )}
        </div>

        {/* Tag heatmap grid */}
        {tagRetentionSummary.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tag Heatmap</h3>
            <p className="text-sm text-slate-500 mb-6">Average recall rate per content tag — green is strong, red needs attention</p>
            <div className="flex flex-wrap gap-3">
              {tagRetentionSummary.map((tag) => (
                <div
                  key={tag.tagName}
                  className="relative"
                  onMouseEnter={() => setHoveredTag(tag.tagName)}
                  onMouseLeave={() => setHoveredTag(null)}
                >
                  <div
                    className="px-4 py-3 rounded-2xl cursor-default select-none transition-transform hover:scale-105"
                    style={{ backgroundColor: recallColor(tag.avgRecall) }}
                  >
                    <p className="text-white font-semibold text-sm drop-shadow">{tag.tagName}</p>
                    <p className="text-white/80 text-xs">{tag.cardCount} card{tag.cardCount !== 1 ? "s" : ""}</p>
                  </div>
                  {hoveredTag === tag.tagName && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-lg">
                      Avg recall: {(tag.avgRecall * 100).toFixed(1)}%
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-slate-900" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Class overdue breakdown */}
        {classOverdueSummary.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Overdue Cards by Class</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 font-semibold tracking-wider">Class</th>
                    <th className="px-8 py-4 font-semibold tracking-wider text-right">Overdue Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {classOverdueSummary.map((cls) => (
                    <tr key={cls.classId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-semibold text-slate-900">{cls.className}</td>
                      <td className="px-8 py-4 text-right">
                        <span className="text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                          {cls.overdueCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit card modal */}
      <Dialog open={!!editCard} onOpenChange={(open) => { if (!open) setEditCard(null); }}>
        {editCard && <EditCardModal card={editCard} onClose={() => setEditCard(null)} />}
      </Dialog>
    </AppLayout>
  );
}
