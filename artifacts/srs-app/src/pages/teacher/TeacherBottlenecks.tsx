import { AlertTriangle, BookOpen, TrendingDown, Users } from "lucide-react";

const bottleneckData = [
  {
    deck: "Spanish Verbs — Present Tense",
    card: "ser vs. estar",
    avgRetention: 42,
    studentsStruggling: 14,
    avgAttempts: 6.2,
  },
  {
    deck: "French Vocabulary — Food",
    card: "croissant / baguette distinction",
    avgRetention: 51,
    studentsStruggling: 9,
    avgAttempts: 4.8,
  },
  {
    deck: "Japanese Hiragana",
    card: "ぬ (nu) recognition",
    avgRetention: 55,
    studentsStruggling: 11,
    avgAttempts: 5.1,
  },
  {
    deck: "German Grammar — Cases",
    card: "Dative vs. Accusative pronouns",
    avgRetention: 38,
    studentsStruggling: 18,
    avgAttempts: 7.4,
  },
  {
    deck: "Mandarin Tones",
    card: "2nd tone vs. 3rd tone distinction",
    avgRetention: 44,
    studentsStruggling: 13,
    avgAttempts: 6.0,
  },
];

function RetentionBadge({ value }: { value: number }) {
  const color =
    value < 45
      ? "bg-red-100 text-red-700"
      : value < 60
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {value}%
    </span>
  );
}

export default function TeacherBottlenecks() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Content Bottlenecks</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Cards with the lowest class-wide retention. Prioritise review or reteach these concepts.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">Bottleneck Cards</p>
            <p className="text-2xl font-bold text-slate-900">{bottleneckData.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">Avg Retention (worst)</p>
            <p className="text-2xl font-bold text-red-600">
              {Math.round(bottleneckData.reduce((s, d) => s + d.avgRetention, 0) / bottleneckData.length)}%
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">Students Affected</p>
            <p className="text-2xl font-bold text-amber-600">
              {Math.max(...bottleneckData.map((d) => d.studentsStruggling))}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-slate-800 text-sm">Lowest-Retention Cards</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {bottleneckData
              .slice()
              .sort((a, b) => a.avgRetention - b.avgRetention)
              .map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.card}</p>
                      <p className="text-xs text-slate-400 truncate">{item.deck}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">Retention</p>
                      <RetentionBadge value={item.avgRetention} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">Struggling</p>
                      <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5" />
                        {item.studentsStruggling}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">Avg Attempts</p>
                      <span className="text-sm font-semibold text-slate-700">{item.avgAttempts.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
