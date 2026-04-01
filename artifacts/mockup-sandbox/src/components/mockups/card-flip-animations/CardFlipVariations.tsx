import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const animations = {
  "3D Flip X": {
    front: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -90, opacity: 0 },
    enter: { rotateX: 90, opacity: 0 },
    transition: { duration: 0.4 },
  },
  "3D Flip Y": {
    front: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    enter: { rotateY: 90, opacity: 0 },
    transition: { duration: 0.4 },
  },
  "Slide Up Fade": {
    front: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    enter: { y: 20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  "Scale & Fade": {
    front: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    enter: { scale: 1.2, opacity: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
  },
  "Spin 360": {
    front: { rotate: 0, opacity: 1 },
    exit: { rotate: -180, opacity: 0 },
    enter: { rotate: 180, opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  "Blur Transition": {
    front: { filter: "blur(0px)", opacity: 1 },
    exit: { filter: "blur(8px)", opacity: 0 },
    enter: { filter: "blur(8px)", opacity: 0 },
    transition: { duration: 0.3 },
  },
  "Bounce Flip": {
    front: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -90, opacity: 0 },
    enter: { rotateX: 90, opacity: 0 },
    transition: { duration: 0.6, ease: "easeInOut", type: "spring", bounce: 0.4 },
  },
  "Slide & Rotate": {
    front: { x: 0, rotateZ: 0, opacity: 1 },
    exit: { x: -30, rotateZ: -15, opacity: 0 },
    enter: { x: 30, rotateZ: 15, opacity: 0 },
    transition: { duration: 0.4 },
  },
};

export default function CardFlipVariations() {
  const [selectedAnimation, setSelectedAnimation] = useState<keyof typeof animations>("3D Flip X");
  const [isFlipped, setIsFlipped] = useState(false);

  const config = animations[selectedAnimation];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Card Flip Animations</h1>
          <p className="text-slate-600">Click the card or button to flip and preview the animation</p>
        </div>

        {/* Animation Selector */}
        <div className="mb-8 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
            Select Animation Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(animations).map((anim) => (
              <button
                key={anim}
                onClick={() => {
                  setSelectedAnimation(anim as keyof typeof animations);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAnimation === anim
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Card Preview */}
        <div className="mb-8">
          <div className="relative h-96 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={!isFlipped ? config.enter : config.exit}
                animate={config.front}
                exit={isFlipped ? config.exit : config.enter}
                transition={config.transition}
                className="absolute inset-0 w-full h-full"
              >
                <div className="w-full h-full rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex flex-col items-center justify-center p-8 text-center cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}>
                  {!isFlipped ? (
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                        Front Side
                      </p>
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                        What year did Germany invade Poland?
                      </h2>
                      <p className="text-slate-500 mt-6 text-sm">Click to reveal answer</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                        Back Side
                      </p>
                      <h2 className="text-3xl md:text-4xl font-bold text-blue-600 leading-tight">
                        1939
                      </h2>
                      <p className="text-slate-500 mt-6 text-sm">Click to see question</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
            >
              {isFlipped ? "Show Question" : "Show Answer"}
            </button>
            <button
              onClick={() => setIsFlipped(false)}
              className="flex-1 px-6 py-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Animation Details</h3>
          <div className="space-y-2 text-sm text-slate-600 font-mono bg-slate-50 p-4 rounded-lg overflow-auto max-h-40">
            <div>
              <span className="text-slate-900 font-bold">Style:</span> {selectedAnimation}
            </div>
            <div>
              <span className="text-slate-900 font-bold">Duration:</span> {config.transition.duration}s
            </div>
            <div>
              <span className="text-slate-900 font-bold">Easing:</span> {(config.transition.ease as string) || "default"}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 mb-3">Quick Notes:</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="font-bold text-blue-600">3D Flip X:</span> Current style - rotates on horizontal axis
              </li>
              <li>
                <span className="font-bold text-blue-600">3D Flip Y:</span> Rotates on vertical axis instead
              </li>
              <li>
                <span className="font-bold text-blue-600">Slide Up Fade:</span> Subtle up motion with fade
              </li>
              <li>
                <span className="font-bold text-blue-600">Scale & Fade:</span> Grows/shrinks during flip
              </li>
              <li>
                <span className="font-bold text-blue-600">Bounce Flip:</span> 3D flip with bouncy spring effect
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
