import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sampleCards = [
  { front: "What year did Germany invade Poland?", back: "1939", tag: "History" },
  { front: "What is the powerhouse of the cell?", back: "Mitochondria", tag: "Biology" },
  { front: "Who wrote Hamlet?", back: "William Shakespeare", tag: "Literature" },
  { front: "What is the chemical symbol for gold?", back: "Au", tag: "Chemistry" },
  { front: "What is π rounded to 4 places?", back: "3.1415", tag: "Mathematics" },
];

type TransitionKey =
  | "Rise Up"
  | "Slide Right"
  | "Deal"
  | "Scale Pop"
  | "Swipe Away"
  | "Cascade Drop";

const transitions: Record<
  TransitionKey,
  {
    initial: object;
    animate: object;
    exit: object;
    transition: object;
    description: string;
  }
> = {
  "Rise Up": {
    initial: { y: 48, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -32, opacity: 0 },
    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
    description: "Current style — fades in rising from below",
  },
  "Slide Right": {
    initial: { x: 80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
    description: "Horizontal sweep — feels like flipping through a deck",
  },
  "Deal": {
    initial: { scale: 0.88, x: 40, y: 32, opacity: 0 },
    animate: { scale: 1, x: 0, y: 0, opacity: 1 },
    exit: { scale: 0.97, y: -20, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 24, mass: 0.8 },
    description: "Materialises from bottom-right — like being dealt a card",
  },
  "Scale Pop": {
    initial: { scale: 0.72, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.06, opacity: 0 },
    transition: { type: "spring", stiffness: 380, damping: 22 },
    description: "Pops in from nothing — snappy and modern",
  },
  "Swipe Away": {
    initial: { x: "110%", opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-110%", opacity: 1 },
    transition: { type: "spring", stiffness: 280, damping: 28, mass: 0.9 },
    description: "Full-width slide — like swiping a Tinder card",
  },
  "Cascade Drop": {
    initial: { y: -56, opacity: 0, rotateX: -12 },
    animate: { y: 0, opacity: 1, rotateX: 0 },
    exit: { y: 48, opacity: 0, rotateX: 10 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    description: "Drops in from above with a 3D tilt — dramatic and satisfying",
  },
};

const TRANSITION_KEYS = Object.keys(transitions) as TransitionKey[];

const tagColors: Record<string, string> = {
  History: "bg-amber-50 text-amber-700 border-amber-200",
  Biology: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Literature: "bg-violet-50 text-violet-700 border-violet-200",
  Chemistry: "bg-blue-50 text-blue-700 border-blue-200",
  Mathematics: "bg-pink-50 text-pink-700 border-pink-200",
};

function CardPreview({
  style,
  cardIndex,
  onNext,
}: {
  style: TransitionKey;
  cardIndex: number;
  onNext: () => void;
}) {
  const card = sampleCards[cardIndex % sampleCards.length];
  const nextCard = sampleCards[(cardIndex + 1) % sampleCards.length];
  const cfg = transitions[style];
  const needsOverflow = style === "Swipe Away";

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative h-40 w-full rounded-2xl${needsOverflow ? " overflow-hidden" : ""}`}
        style={style === "Cascade Drop" ? { perspective: "800px" } : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIndex}
            initial={cfg.initial}
            animate={cfg.animate}
            exit={cfg.exit}
            transition={cfg.transition}
            className="absolute inset-0 w-full h-full"
          >
            <div className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center p-4 text-center">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2 ${tagColors[card.tag]}`}
              >
                {card.tag}
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-3">
                {card.front}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 truncate flex-1">
          Next: <span className="text-slate-600 font-medium">{nextCard.tag}</span>
        </span>
        <button
          onClick={onNext}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold transition-colors shrink-0"
        >
          Next card →
        </button>
      </div>
    </div>
  );
}

export default function CardTransitionVariations() {
  const [indices, setIndices] = useState<Record<TransitionKey, number>>(
    Object.fromEntries(TRANSITION_KEYS.map((k) => [k, 0])) as Record<TransitionKey, number>
  );
  const [selected, setSelected] = useState<TransitionKey>("Rise Up");

  const advance = (style: TransitionKey) =>
    setIndices((prev) => ({ ...prev, [style]: prev[style] + 1 }));

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-['Inter']">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Card Transition Styles</h1>
          <p className="text-slate-500">
            Click <span className="font-semibold text-slate-700">Next card →</span> in each preview
            to see how a new card appears. Pick your favourite.
          </p>
        </div>

        {/* Grid of all 6 previews */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10">
          {TRANSITION_KEYS.map((style) => (
            <button
              key={style}
              onClick={() => setSelected(style)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selected === style
                  ? "border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="mb-3">
                <CardPreview
                  style={style}
                  cardIndex={indices[style]}
                  onNext={(e?: unknown) => {
                    if (typeof (e as MouseEvent)?.stopPropagation === "function") {
                      (e as MouseEvent).stopPropagation();
                    }
                    advance(style);
                  }}
                />
              </div>
              <div className="mt-2">
                <p
                  className={`text-sm font-bold mb-0.5 ${
                    selected === style ? "text-blue-700" : "text-slate-900"
                  }`}
                >
                  {style}
                  {selected === style && (
                    <span className="ml-2 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                      ✓ Selected
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {transitions[style].description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Large selected preview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selected}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{transitions[selected].description}</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Preview
            </span>
          </div>

          <div
            className={`relative h-52 w-full rounded-2xl mb-6${
              selected === "Swipe Away" ? " overflow-hidden" : ""
            }`}
            style={selected === "Cascade Drop" ? { perspective: "1000px" } : undefined}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`large-${indices[selected]}`}
                initial={transitions[selected].initial}
                animate={transitions[selected].animate}
                exit={transitions[selected].exit}
                transition={transitions[selected].transition}
                className="absolute inset-0 w-full h-full"
              >
                {(() => {
                  const card = sampleCards[indices[selected] % sampleCards.length];
                  return (
                    <div className="w-full h-full rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center justify-center p-8 text-center">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-4 ${tagColors[card.tag]}`}
                      >
                        {card.tag}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                        {card.front}
                      </h3>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => advance(selected)}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all hover:-translate-y-0.5 shadow-sm"
          >
            Next card →
          </button>
        </div>

        {/* Code hint */}
        <div className="mt-6 bg-slate-900 rounded-2xl p-5 text-sm font-mono text-slate-300">
          <span className="text-slate-500">{`// ${selected} — Framer Motion params`}</span>
          <br />
          <span className="text-blue-400">initial</span>
          {`: `}
          <span className="text-emerald-400">{JSON.stringify(transitions[selected].initial)}</span>
          <br />
          <span className="text-blue-400">exit</span>
          {`: `}
          <span className="text-emerald-400">{JSON.stringify(transitions[selected].exit)}</span>
          <br />
          <span className="text-blue-400">transition</span>
          {`: `}
          <span className="text-emerald-400">
            {JSON.stringify(transitions[selected].transition)}
          </span>
        </div>
      </div>
    </div>
  );
}
