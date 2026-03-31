export default function SlideEngine() {
  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-8 tracking-wide">
          Meta-Learned Spaced Retrieval
        </h2>
        <p className="font-light text-slate-600 mb-16 max-w-3xl text-[23px]">
          A Python-based adaptive scheduler that predicts recall. It targets a 60-80% "desirable difficulty" recall probability, surfacing words from The Crucible automatically during the Fahrenheit 451 unit.
        </p>

        {/* API Logic Visualization */}
        <div className="flex items-center justify-center gap-6 mt-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-lg border-2 border-slate-300 flex items-center justify-center bg-slate-50">
              <span className="text-xs font-medium text-slate-700 text-center px-2">userId</span>
            </div>
          </div>
          
          <div className="text-slate-400">→</div>

          <div className="text-center">
            <div className="w-24 h-20 rounded-lg border-2 border-slate-300 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <span className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-[18px]">recordReview</span>
            </div>
          </div>

          <div className="text-slate-400">→</div>

          <div className="text-center">
            <div className="w-20 h-20 rounded-lg border-2 border-slate-300 flex items-center justify-center bg-slate-50">
              <span className="text-xs font-medium text-slate-700 text-center px-2">itemId</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-lg border-2 border-slate-300 flex items-center justify-center bg-slate-50">
              <span className="text-xs font-medium text-slate-700 text-center px-2">correct</span>
            </div>
          </div>

          <div className="text-slate-400">→</div>

          <div className="text-slate-400 text-sm">scheduler</div>

          <div className="text-slate-400">→</div>

          <div className="text-center">
            <div className="w-24 h-20 rounded-lg border-2 border-slate-300 flex items-center justify-center bg-blue-50">
              <span className="text-xs font-medium text-blue-700 text-center px-2">next interval</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 tracking-wide">
            Desirable Difficulty: <span className="font-semibold text-slate-700">60–80%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
