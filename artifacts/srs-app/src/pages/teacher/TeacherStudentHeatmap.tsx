import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRole } from "@/hooks/use-role";
import { useGetTeacherStudents } from "@workspace/api-client-react";
import { Search, AlertTriangle, Users, ChevronRight } from "lucide-react";

type RiskLevel = "on_track" | "slipping" | "at_risk";

const RISK_BADGE: Record<RiskLevel, { label: string; className: string }> = {
  on_track: { label: "On Track", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  slipping: { label: "Slipping", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  at_risk: { label: "At Risk", className: "bg-red-50 text-red-700 border border-red-200" },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Never";
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

export default function TeacherStudentHeatmap() {
  const { userId } = useRole();
  const [, navigate] = useLocation();
  const { data: students, isLoading } = useGetTeacherStudents(userId ?? 0);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");

  const allClasses = useMemo(() => {
    if (!students) return [];
    const set = new Set<string>();
    students.forEach((s) => s.classes.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [students]);

  const filtered = useMemo(() => {
    if (!students) return [];
    return students.filter((s) => {
      const matchesSearch =
        !search ||
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === "all" || s.classes.includes(classFilter);
      const matchesRisk = riskFilter === "all" || s.riskLevel === riskFilter;
      return matchesSearch && matchesClass && matchesRisk;
    });
  }, [students, search, classFilter, riskFilter]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const atRiskCount = (students ?? []).filter((s) => s.riskLevel === "at_risk").length;
  const slippingCount = (students ?? []).filter((s) => s.riskLevel === "slipping").length;

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Students</p>
          <h1 className="text-4xl font-light text-slate-900">
            Student <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Heatmap</span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">Monitor all students across your classes at a glance.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Students</p>
              <p className="text-3xl font-bold text-slate-900">{(students ?? []).length}</p>
            </div>
          </div>
          <div className={`rounded-3xl p-6 border shadow-sm flex items-center gap-4 ${atRiskCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${atRiskCount > 0 ? "bg-red-100" : "bg-slate-100"}`}>
              <AlertTriangle className={`w-5 h-5 ${atRiskCount > 0 ? "text-red-600" : "text-slate-400"}`} />
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider font-medium ${atRiskCount > 0 ? "text-red-600" : "text-slate-500"}`}>At Risk</p>
              <p className={`text-3xl font-bold ${atRiskCount > 0 ? "text-red-700" : "text-slate-900"}`}>{atRiskCount}</p>
            </div>
          </div>
          <div className={`rounded-3xl p-6 border shadow-sm flex items-center gap-4 ${slippingCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${slippingCount > 0 ? "bg-amber-100" : "bg-slate-100"}`}>
              <span className={`text-lg font-bold ${slippingCount > 0 ? "text-amber-600" : "text-slate-400"}`}>~</span>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider font-medium ${slippingCount > 0 ? "text-amber-600" : "text-slate-500"}`}>Slipping</p>
              <p className={`text-3xl font-bold ${slippingCount > 0 ? "text-amber-700" : "text-slate-900"}`}>{slippingCount}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="all">All Classes</option>
              {allClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as "all" | RiskLevel)}
              className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="all">All Risk Levels</option>
              <option value="at_risk">At Risk</option>
              <option value="slipping">Slipping</option>
              <option value="on_track">On Track</option>
            </select>
            {(search || classFilter !== "all" || riskFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setClassFilter("all"); setRiskFilter("all"); }}
                className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="mx-auto mb-4 w-10 h-10 text-slate-300" />
              <p className="text-slate-500 font-medium">
                {students?.length === 0 ? "No students enrolled in your classes yet." : "No students match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wider">Classes</th>
                    <th className="px-6 py-4 text-right font-semibold tracking-wider">Avg Retention</th>
                    <th className="px-6 py-4 text-right font-semibold tracking-wider">Due Today</th>
                    <th className="px-6 py-4 text-right font-semibold tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-right font-semibold tracking-wider">Streak</th>
                    <th className="px-6 py-4 text-center font-semibold tracking-wider">Risk</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const badge = RISK_BADGE[student.riskLevel as RiskLevel];
                    return (
                      <tr
                        key={student.studentId}
                        onClick={() => navigate(`/teacher/students/${student.studentId}`)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{student.studentName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{student.studentEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {student.classes.map((cls) => (
                              <span key={cls} className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {cls}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {student.averageRetention != null ? (
                            <span className={`font-bold ${student.averageRetention >= 0.75 ? "text-emerald-600" : student.averageRetention >= 0.6 ? "text-amber-600" : "text-red-600"}`}>
                              {(student.averageRetention * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${student.cardsDueToday > 5 ? "text-red-600" : student.cardsDueToday > 0 ? "text-amber-600" : "text-slate-600"}`}>
                            {student.cardsDueToday}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500">
                          {formatDate(student.lastActiveAt as string | null | undefined)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-slate-700 font-medium">
                            {student.streakCount > 0 ? `${student.streakCount}🔥` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-slate-400 text-right">
            Showing {filtered.length} of {students?.length ?? 0} students
          </p>
        )}
      </div>
    </AppLayout>
  );
}
