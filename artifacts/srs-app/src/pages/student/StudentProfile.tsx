/**
 * Student Profile — Memory Bank & Cosmetics Shop
 *
 * Points are append-only (Memory Bank). Shown here as a "bank balance."
 * Students spend points on aesthetic cosmetics — never on study advantages.
 */

import { AppLayout } from "@/components/layout/AppLayout";
import { useMemoryBankStore } from "@/stores/memory-bank-store";
import { useMomentumStore, TIER_META } from "@/stores/momentum-store";
import { useRole } from "@/hooks/use-role";
import { motion } from "framer-motion";
import {
  Coins,
  ShoppingBag,
  History,
  CheckCircle2,
  Lock,
} from "lucide-react";

/** Cosmetic catalogue — purely aesthetic, no gameplay advantages */
const COSMETICS = [
  { id: "frame_neon_hex",     category: "Avatar Frame",  name: "Neon Hex",      emoji: "🔷", price: 50  },
  { id: "frame_crown_gold",   category: "Avatar Frame",  name: "Crown Gold",    emoji: "👑", price: 120 },
  { id: "card_back_galaxy",   category: "Card Back",     name: "Galaxy",        emoji: "🌌", price: 80  },
  { id: "card_back_aurora",   category: "Card Back",     name: "Aurora",        emoji: "🌅", price: 100 },
  { id: "badge_flame_silver", category: "Badge",         name: "Silver Flame",  emoji: "🔥", price: 30  },
  { id: "badge_shooting_star",category: "Badge",         name: "Shooting Star", emoji: "⭐", price: 60  },
  { id: "theme_midnight",     category: "App Theme",     name: "Midnight",      emoji: "🌙", price: 200 },
  { id: "theme_sakura",       category: "App Theme",     name: "Sakura",        emoji: "🌸", price: 200 },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function StudentProfile() {
  const { user } = useRole();
  const { totalPoints, spentPoints, history, spendPoints } = useMemoryBankStore();
  const { tier, multiplier, streakDays } = useMomentumStore();

  const balance   = totalPoints - spentPoints;
  const tierMeta  = TIER_META[tier];

  function handleBuy(cosmetic: typeof COSMETICS[number]) {
    if (balance < cosmetic.price) return;
    const ok = spendPoints(cosmetic.price, cosmetic.id);
    if (!ok) alert("Not enough points!");
  }

  return (
    <AppLayout>
      <div className="space-y-8 font-['Inter'] max-w-5xl mx-auto">

        {/* Hero — alias + Memory Bank balance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Profile</p>
              <h1 className="text-3xl font-bold text-slate-900">{user?.name ?? "Student"}</h1>
              {/* COPPA alias */}
              <p className="text-slate-500 text-sm mt-0.5">
                Alias: <span className="font-mono font-bold text-slate-700">{user?.alias ?? "—"}</span>
              </p>
            </div>

            {/* Memory Bank balance card */}
            <div className="flex-shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-center min-w-[160px]">
              <Coins className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-3xl font-black text-amber-700">{balance.toLocaleString()}</p>
              <p className="text-xs font-semibold text-amber-600 mt-0.5">Memory Bank pts</p>
              <p className="text-[10px] text-amber-400 mt-1">
                {totalPoints.toLocaleString()} earned · {spentPoints.toLocaleString()} spent
              </p>
            </div>
          </div>

          {/* Vibe tier banner */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-semibold">
              <span className="text-lg">{tierMeta.emoji}</span>
              <span>{tierMeta.label} Vibe</span>
              <span className="text-slate-300">|</span>
              <span className={`font-bold ${tierMeta.color}`}>{multiplier}× multiplier</span>
            </span>
            <span className="text-sm text-slate-400">
              {streakDays} day streak · {tier === "spark" ? `${3 - streakDays} days to Aura 🔮` : tier === "aura" ? `${6 - streakDays} days to Crown 👑` : "Max tier reached! 🎉"}
            </span>
          </div>
        </motion.div>

        {/* Cosmetics shop */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Cosmetics Shop</h2>
            <span className="ml-auto text-xs text-slate-400">Points never expire · purely aesthetic</span>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {COSMETICS.map((item) => {
              const canAfford = balance >= item.price;
              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.category}</p>
                  <p className="font-bold text-slate-900 text-center leading-tight">{item.name}</p>
                  <p className="text-sm font-bold text-amber-600">{item.price} pts</p>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className="mt-1 w-full py-2 rounded-xl text-xs font-bold transition-all
                      disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
                      enabled:bg-amber-500 enabled:hover:bg-amber-600 enabled:text-white"
                  >
                    {canAfford ? "Unlock" : <span className="flex items-center justify-center gap-1"><Lock className="h-3 w-3" /> Need {(item.price - balance).toLocaleString()} more</span>}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Recent point history */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Point History</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {history.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{event.reason}</p>
                    <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">+{event.multipliedAmount} pts</p>
                    {event.multiplier > 1 && (
                      <p className="text-[10px] text-slate-400">{event.amount} × {event.multiplier}×</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
