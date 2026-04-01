import { useGetStudentAchievements } from "@workspace/api-client-react";
import type { Achievement, UserAchievementWithDetails } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { Award, ChevronLeft, Lock } from "lucide-react";

function BadgeCard({
  achievement,
  earned,
  earnedAt,
}: {
  achievement: Achievement;
  earned: boolean;
  earnedAt?: string;
}) {
  return (
    <div
      className={`relative rounded-3xl border p-6 transition-all duration-200 flex flex-col items-center text-center gap-3
        ${earned
          ? "bg-violet-50 border-violet-200 shadow-[0_4px_24px_-4px_rgba(139,92,246,0.20)] hover:shadow-[0_8px_32px_-4px_rgba(139,92,246,0.30)] hover:-translate-y-0.5"
          : "bg-slate-50 border-slate-200 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] opacity-60"
        }
      `}
    >
      {!earned && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
          ${earned ? "bg-white shadow-[0_4px_12px_-2px_rgba(139,92,246,0.25)]" : "bg-slate-100"}
        `}
      >
        {achievement.icon}
      </div>
      <div>
        <p className={`text-sm font-bold ${earned ? "text-slate-900" : "text-slate-500"}`}>
          {achievement.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{achievement.description}</p>
        {earned && earnedAt && (
          <p className="text-[10px] text-violet-500 font-semibold mt-2">
            Earned {new Date(earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
        {!earned && achievement.targetValue !== null && (
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Target: {achievement.targetValue}
            {achievement.category === "streak" ? " days" : achievement.category === "retention" ? "%" : " reviews"}
          </p>
        )}
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  streak: "Streak Badges",
  reviews: "Review Milestones",
  retention: "Retention Awards",
};

export default function StudentAchievements() {
  const { userId } = useRole();
  const { data, isLoading } = useGetStudentAchievements(userId || 2);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const earned = data?.earned ?? [];
  const locked = data?.locked ?? [];

  const earnedByCategory = earned.reduce((acc, ua) => {
    const cat = ua.achievement.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ua);
    return acc;
  }, {} as Record<string, UserAchievementWithDetails[]>);

  const lockedByCategory = locked.reduce((acc, a) => {
    const cat = a.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const allCategories = Array.from(
    new Set([...Object.keys(earnedByCategory), ...Object.keys(lockedByCategory)])
  ).filter((c) => c !== "class_milestone");

  return (
    <AppLayout>
      <div className="space-y-8 font-['Inter']">

        {/* Header */}
        <div>
          <Link href="/student/dashboard">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer mb-4">
              <ChevronLeft className="w-3.5 h-3.5" /> Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Achievement Inventory</p>
              <h1 className="text-3xl font-bold text-slate-900">My Badges</h1>
            </div>
          </div>
          <p className="mt-3 text-slate-500 font-light">
            {earned.length > 0
              ? `You've earned ${earned.length} badge${earned.length > 1 ? "s" : ""} so far. Keep going!`
              : "Complete study sessions to earn your first badge!"}
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-violet-700">{earned.length}</p>
            <p className="text-xs text-violet-500 font-semibold mt-0.5">Earned</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-slate-700">{locked.length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Locked</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-blue-700">
              {earned.length + locked.length > 0
                ? Math.round((earned.length / (earned.length + locked.length)) * 100)
                : 0}%
            </p>
            <p className="text-xs text-blue-500 font-semibold mt-0.5">Complete</p>
          </div>
        </div>

        {/* Badges by category */}
        {allCategories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Award className="mx-auto w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No badges available yet.</p>
          </div>
        ) : (
          allCategories.map((category) => {
            const catEarned = earnedByCategory[category] ?? [];
            const catLocked = lockedByCategory[category] ?? [];
            const label = CATEGORY_LABELS[category] ?? category;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                  <span className="text-xs text-slate-400">{catEarned.length} / {catEarned.length + catLocked.length} earned</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {catEarned.map((ua) => (
                    <BadgeCard
                      key={ua.id}
                      achievement={ua.achievement}
                      earned
                      earnedAt={ua.earnedAt}
                    />
                  ))}
                  {catLocked.map((a) => (
                    <BadgeCard key={a.id} achievement={a} earned={false} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
