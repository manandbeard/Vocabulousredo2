/**
 * Bounty Flicks — Peer-to-Peer concept challenges
 *
 * Students "flick" hard concepts to peers using COPPA-safe aliases.
 * - Challenger: earns Tutor Bonus points for sending
 * - Defender: earns cosmetic dupe for recalling correctly
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRole } from "@/hooks/use-role";
import { useGetDueCards } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Inbox, Zap, ChevronRight, X, AlertCircle } from "lucide-react";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function StudentBountyFlicks() {
  const { userId } = useRole();
  const safeUserId = userId ?? 0;
  const { data: dueCards } = useGetDueCards(safeUserId);

  const [tab, setTab] = useState<"send" | "inbox">("send");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [defenderAlias, setDefenderAlias] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function sendBounty() {
    if (selectedCardIndex === null || !defenderAlias.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/bounty/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenger_id: safeUserId,
          defender_alias: defenderAlias.trim().toUpperCase(),
          concept_id: dueCards?.[selectedCardIndex]?.cardId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Bounty sent! 🎯 You earned +${data.tutor_bonus_awarded} Tutor Bonus pts.` });
        setDefenderAlias("");
        setSelectedCardIndex(null);
      } else {
        setResult({ ok: false, message: data.error ?? "Failed to send bounty" });
      }
    } catch {
      setResult({ ok: false, message: "Network error — please try again." });
    }
    setSending(false);
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto font-['Inter'] space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Peer Challenge</p>
          <h1 className="text-3xl font-bold text-slate-900">Bounty Flicks 🎯</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Flick a tricky concept to a classmate. They earn a cosmetic if they recall it — you earn Tutor Bonus points!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          {(["send", "inbox"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "send" ? <span className="flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Send</span>
                           : <span className="flex items-center gap-1.5"><Inbox className="h-3.5 w-3.5" /> Inbox</span>}
            </button>
          ))}
        </div>

        {/* Send tab */}
        <AnimatePresence mode="wait">
          {tab === "send" && (
            <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Step 1 — pick a concept */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  1. Pick a concept to send
                </p>
                {(!dueCards || dueCards.length === 0) ? (
                  <p className="text-slate-400 text-sm">No due cards right now — try again after a study session.</p>
                ) : (
                  <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
                    {dueCards.slice(0, 8).map((card, i) => (
                      <motion.button
                        key={card.cardId}
                        variants={fadeUp}
                        onClick={() => setSelectedCardIndex(i === selectedCardIndex ? null : i)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between ${
                          selectedCardIndex === i
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="text-sm font-semibold text-slate-800 line-clamp-1">{card.front}</span>
                        {selectedCardIndex === i
                          ? <X className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        }
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Step 2 — enter alias */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  2. Enter classmate alias
                  <span className="ml-2 text-[10px] font-normal text-slate-400 uppercase tracking-wider">COPPA-safe · no real names</span>
                </p>
                <input
                  type="text"
                  value={defenderAlias}
                  onChange={(e) => setDefenderAlias(e.target.value.toUpperCase())}
                  maxLength={20}
                  placeholder="e.g. NEONFALCON"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-mono font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Send button */}
              <button
                onClick={sendBounty}
                disabled={selectedCardIndex === null || !defenderAlias.trim() || sending}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Bounty Flick
                    <span className="ml-1 text-xs opacity-70">+15 Tutor Bonus pts</span>
                  </>
                )}
              </button>

              {/* Result toast */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${
                      result.ok
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {result.ok ? <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                    {result.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Inbox tab — placeholder (incoming bounties would be loaded via TanStack Query) */}
          {tab === "inbox" && (
            <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700">No incoming bounties</p>
                <p className="text-sm text-slate-400 mt-1">
                  When a classmate flicks you a concept, it'll appear here.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
