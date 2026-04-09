import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, Tag, Calendar, ExternalLink } from "lucide-react";

interface ChangelogEntry {
  id: string;
  commitHash: string;
  title: string;
  description: string;
  date: string;
  status: "shipped" | "in-progress" | "pending";
  tags: string[];
}

const TAG_COLORS: Record<string, string> = {
  feature: "bg-blue-50 text-blue-700 border border-blue-200",
  bugfix: "bg-red-50 text-red-700 border border-red-200",
  improvement: "bg-purple-50 text-purple-700 border border-purple-200",
  design: "bg-pink-50 text-pink-700 border border-pink-200",
  backend: "bg-slate-100 text-slate-700 border border-slate-200",
  analytics: "bg-amber-50 text-amber-700 border border-amber-200",
  "pitch-deck": "bg-indigo-50 text-indigo-700 border border-indigo-200",
  update: "bg-gray-50 text-gray-600 border border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(entries: ChangelogEntry[]) {
  const groups: Record<string, ChangelogEntry[]> = {};
  for (const entry of entries) {
    const day = new Date(entry.date).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(entry);
  }
  return Object.entries(groups).map(([day, items]) => ({ day, items }));
}

export default function ChangeLogTab() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/changelog")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setEntries(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          Could not load changelog: {error}
        </p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <GitCommit className="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No commits yet.</p>
      </div>
    );
  }

  const groups = groupByDate(entries);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Build History
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {entries.length} commits shipped
          </h2>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <GitCommit className="h-3 w-3" />
          Auto-generated from git history
        </span>
      </div>

      {groups.map(({ day, items }, gi) => (
        <div key={day}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {new Date(day).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="relative ml-4 border-l-2 border-slate-100 pl-6 space-y-5">
            {items.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (gi * 4 + i) * 0.04 }}
                className="relative"
              >
                <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full bg-white border-2 border-slate-300" />

                <div className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {entry.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1 mt-0.5">
                      <ExternalLink className="h-2.5 w-2.5" />
                      {entry.id}
                    </span>
                  </div>

                  {entry.description && entry.description !== entry.title && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {entry.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          TAG_COLORS[tag] ?? TAG_COLORS.update
                        }`}
                      >
                        <Tag className="h-2 w-2" />
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-slate-400">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
