import { useState, Suspense, lazy } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Slide1 = lazy(() => import("./pitch/Slide1"));
const Slide2 = lazy(() => import("./pitch/Slide2"));
const Slide3 = lazy(() => import("./pitch/Slide3"));
const Slide4 = lazy(() => import("./pitch/Slide4"));
const Slide5 = lazy(() => import("./pitch/Slide5"));
const Slide6 = lazy(() => import("./pitch/Slide6"));

const slides = [
  { component: Slide1, key: "slide1" },
  { component: Slide2, key: "slide2" },
  { component: Slide3, key: "slide3" },
  { component: Slide4, key: "slide4" },
  { component: Slide5, key: "slide5" },
  { component: Slide6, key: "slide6" },
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  };

  return (
    <div
      className="w-screen h-screen bg-slate-50 overflow-hidden font-['Inter']"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-slate-400">Loading...</div>}>
        {slides[currentSlide].component()}
      </Suspense>

      {/* Navigation */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-6">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <span className="text-xs font-medium text-slate-500 tracking-wide">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
