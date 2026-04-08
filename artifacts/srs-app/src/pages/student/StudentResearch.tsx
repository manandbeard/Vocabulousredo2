import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetStudentResearchDecks } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, BookOpen, FlaskConical, Tag, ChevronDown } from "lucide-react";

const MASTERY_OPTIONS = [
  { value: "", label: "All Levels" },
  { value: "new", label: "New" },
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
];

const MASTERY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  learning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  mastered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

export default function StudentResearch() {
  const { userId } = useRole();
  const [, setLocation] = useLocation();

  const safeUserId = userId ?? 0;

  const { data: decks, isLoading } = useGetStudentResearchDecks(safeUserId);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedMastery, setSelectedMastery] = useState("");

  const allTags = useMemo(() => {
    if (!decks) return [];
    const tagSet = new Set<string>();
    for (const deck of decks) {
      for (const tag of deck.tags) tagSet.add(tag);
    }
    return Array.from(tagSet).sort();
  }, [decks]);

  const filtered = useMemo(() => {
    if (!decks) return [];
    return decks.filter((deck) => {
      if (search && !deck.deckName.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedTag && !deck.tags.includes(selectedTag)) return false;
      if (selectedMastery && deck.masteryLevel !== selectedMastery) return false;
      return true;
    });
  }, [decks, search, selectedTag, selectedMastery]);

  const handleStudy = (deckId: number) => {
    setLocation(`/student/study?deckId=${deckId}&mode=research`);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8 font-['Inter']">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Research Library</h1>
          </div>
          <p className="text-slate-500 ml-[52px] text-sm">
            Practice any deck from your enrolled classes. No progress is saved.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="w-56 flex-shrink-0 space-y-5">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Deck name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Mastery filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Mastery Level
              </label>
              <div className="space-y-1">
                {MASTERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedMastery(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedMastery === opt.value
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Tags
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedTag("")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTag === ""
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    All Tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedTag === tag
                          ? "bg-purple-100 text-purple-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Tag className="h-3 w-3 flex-shrink-0" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">
                  {decks && decks.length === 0
                    ? "No decks found. Make sure you're enrolled in classes."
                    : "No decks match your filters."}
                </p>
                {(search || selectedTag || selectedMastery) && (
                  <button
                    onClick={() => { setSearch(""); setSelectedTag(""); setSelectedMastery(""); }}
                    className="mt-3 text-sm text-purple-600 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400 mb-4 font-medium">
                  {filtered.length} deck{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((deck) => {
                    const masteryColors = MASTERY_COLORS[deck.masteryLevel];
                    const masteryPctDisplay = Math.round(deck.masteryPct * 100);

                    return (
                      <div
                        key={deck.deckId}
                        className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all"
                      >
                        {/* Class name */}
                        {deck.className && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {deck.className}
                          </p>
                        )}

                        {/* Deck name */}
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {deck.deckName}
                        </h3>

                        {/* Tags */}
                        {deck.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {deck.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600"
                              >
                                <Tag className="h-2.5 w-2.5" />
                                {tag}
                              </span>
                            ))}
                            {deck.tags.length > 4 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                +{deck.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                          <div className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-900">{deck.cardCount}</span> cards
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{ width: `${masteryPctDisplay}%` }}
                              />
                            </div>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${masteryColors.bg} ${masteryColors.text} ${masteryColors.border}`}
                            >
                              {deck.masteryLevel.charAt(0).toUpperCase() + deck.masteryLevel.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => handleStudy(deck.deckId)}
                          className="w-full mt-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                        >
                          Load &amp; Study
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
