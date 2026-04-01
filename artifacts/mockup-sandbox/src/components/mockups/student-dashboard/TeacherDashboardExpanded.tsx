import {
  BookOpen, Users, Brain, Flame, TrendingUp, Clock,
  AlertTriangle, Award, Calendar, ChevronRight, Activity, Zap
} from "lucide-react";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const ENGAGEMENT = [18, 14, 22, 9, 20, 11, 16]; // students who reviewed each day
const MAX_ENGAGEMENT = Math.max(...ENGAGEMENT);
const TOTAL_STUDENTS = 24;

const CLASSES = [
  {
    name: "English Literature 10A",
    subject: "English",
    students: 24,
    retention: 84,
    reviews: 312,
    atRisk: 2,
    color: "bg-violet-50 border-violet-100",
    accent: "text-violet-600",
  },
  {
    name: "Creative Writing 11B",
    subject: "English",
    students: 18,
    retention: 79,
    reviews: 214,
    atRisk: 0,
    color: "bg-blue-50 border-blue-100",
    accent: "text-blue-600",
  },
  {
    name: "AP Literature 12",
    subject: "English",
    students: 16,
    retention: 91,
    reviews: 480,
    atRisk: 1,
    color: "bg-emerald-50 border-emerald-100",
    accent: "text-emerald-600",
  },
];

const AT_RISK = [
  { name: "Jordan M.", days: 6, class: "10A" },
  { name: "Priya K.", days: 5, class: "11B" },
  { name: "Marcus T.", days: 8, class: "12" },
];

function ShadowCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.10)] ${hover ? "hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.16)] hover:-translate-y-0.5" : ""} transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export default function TeacherDashboardExpanded() {
  const todayStudied = ENGAGEMENT[6];
  const todayPct = Math.round((todayStudied / TOTAL_STUDENTS) * 100);

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter']">
      <div className="max-w-5xl mx-auto p-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Teacher Dashboard</p>
            <h1 className="text-4xl font-light text-slate-900">
              Welcome back,{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Dr. Smith
              </span>
            </h1>
            <p className="mt-2 text-slate-500 font-light">
              <span className="font-semibold text-slate-900">3 students</span> need attention today.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">3 classes active</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
              ))}
            </div>
          </div>
        </div>

        {/* Row 1 — Hero bento */}
        <div className="grid grid-cols-12 gap-4">

          {/* Classes Active — dark hero */}
          <div className="col-span-3 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.30)] flex flex-col justify-between relative overflow-hidden">
            <Activity className="absolute right-[-10%] bottom-[-15%] w-28 h-28 text-slate-800 opacity-60" />
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Classes Active
              </p>
              <p className="text-6xl font-black tracking-tight">3</p>
              <p className="text-slate-400 text-xs mt-1">all classes reviewed today</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 relative z-10">
              <p className="text-xs text-slate-500">
                Consecutive days: <span className="text-slate-300 font-semibold">5</span>
              </p>
            </div>
          </div>

          {/* Today's Class Engagement — 5 cols */}
          <ShadowCard className="col-span-5 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Class Engagement
              </p>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {todayStudied} / {TOTAL_STUDENTS} students today
              </span>
            </div>
            <div>
              <div className="flex items-end gap-1 h-16 mb-3">
                {ENGAGEMENT.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-gradient-to-t from-blue-600 to-purple-500" : "bg-slate-200"}`}
                      style={{ height: `${(v / MAX_ENGAGEMENT) * 100}%` }}
                    />
                    <span className="text-[9px] text-slate-400 font-medium">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  style={{ width: `${todayPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-slate-400">0 students</span>
                <span className="text-[10px] font-semibold text-slate-600">{todayPct}% engaged</span>
                <span className="text-[10px] text-slate-400">{TOTAL_STUDENTS}</span>
              </div>
            </div>
          </ShadowCard>

          {/* Quick stats — 4 cols stacked */}
          <div className="col-span-4 grid grid-rows-2 gap-4">
            <ShadowCard className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Retention</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">84.3%</p>
              </div>
            </ShadowCard>
            <ShadowCard className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Reviews</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">1,006</p>
              </div>
            </ShadowCard>
          </div>
        </div>

        {/* Row 2 — Actionable cards */}
        <div className="grid grid-cols-12 gap-4">

          {/* Avg Study Time */}
          <ShadowCard className="col-span-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Avg Study Time
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">18m</p>
            <p className="text-xs text-slate-500 mt-1">per student / week</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Best class: <span className="font-semibold text-slate-700">AP Lit 12</span></p>
            </div>
          </ShadowCard>

          {/* Needs Attention — amber (teacher's "Up Next") */}
          <div className="col-span-4 bg-red-50 rounded-3xl border border-red-100 shadow-[0_4px_24px_-4px_rgba(220,38,38,0.12)] hover:shadow-[0_8px_32px_-4px_rgba(220,38,38,0.20)] hover:-translate-y-0.5 transition-all duration-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
            </p>
            <div className="space-y-2.5">
              {AT_RISK.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/70 rounded-2xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-500">Class {s.class}</p>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    {s.days}d inactive
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Class Milestone — gradient (teacher's Achievement) */}
          <div className="col-span-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl border border-blue-500 shadow-[0_4px_24px_-4px_rgba(37,99,235,0.30)] hover:shadow-[0_8px_32px_-4px_rgba(37,99,235,0.40)] hover:-translate-y-0.5 transition-all duration-200 p-6 flex flex-col justify-between">
            <Award className="w-8 h-8 text-white/70" />
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Class Milestone</p>
              <p className="text-white font-black text-lg leading-snug">AP Lit 12 hit 500 reviews 🏅</p>
              <p className="text-white/60 text-xs mt-1">Share this win with your class!</p>
            </div>
          </div>

          {/* Decks summary */}
          <ShadowCard className="col-span-2 p-6 flex flex-col justify-between items-center text-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Total cards</p>
            <p className="text-3xl font-black text-slate-900">248</p>
            <p className="text-xs text-slate-400">across 3 classes</p>
          </ShadowCard>
        </div>

        {/* Row 3 — Class Cards */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> My Classes
          </p>
          <div className="grid grid-cols-3 gap-4">
            {CLASSES.map((cls, i) => (
              <ShadowCard key={i} className="overflow-hidden">
                <div className={`${cls.color} border-b p-5`}>
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${cls.accent}`}>{cls.subject}</span>
                    {cls.atRisk > 0 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                        {cls.atRisk} at risk
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{cls.name}</h3>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3 border-b border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Students</p>
                    <p className="text-xl font-bold text-slate-900">{cls.students}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Retention</p>
                    <p className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">{cls.retention}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Reviews</p>
                    <p className="text-xl font-bold text-slate-900">{cls.reviews}</p>
                  </div>
                </div>
                <div className="px-5 py-3 flex justify-end">
                  <button className="flex items-center gap-1 text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:opacity-70 transition-opacity">
                    View class <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </ShadowCard>
            ))}
          </div>
        </div>

        {/* Row 4 — Weekly Engagement Calendar */}
        <ShadowCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Student Engagement This Week
            </p>
            <span className="text-xs text-slate-400">Apr 1 – Apr 7, 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => {
              const count = ENGAGEMENT[i];
              const pct = Math.round((count / TOTAL_STUDENTS) * 100);
              const today = i === 6;
              const good = pct >= 70;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${today ? "bg-slate-900 text-white" : good ? "bg-emerald-50" : "bg-white"}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${today ? "text-slate-300" : "text-slate-400"}`}>{d}</span>
                  <div className={`w-2 h-2 rounded-full ${good ? (today ? "bg-green-400" : "bg-emerald-500") : "bg-amber-300"}`} />
                  <span className={`text-xs font-bold ${today ? "text-white" : "text-slate-700"}`}>{count}</span>
                  <span className={`text-[9px] ${today ? "text-slate-400" : "text-slate-400"}`}>of {TOTAL_STUDENTS}</span>
                  <span className={`text-[9px] font-semibold ${today ? "text-slate-300" : good ? "text-emerald-600" : "text-amber-600"}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> ≥70% engaged (on track)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" /> &lt;70% engaged (watch)</span>
          </div>
        </ShadowCard>

      </div>
    </div>
  );
}
