export default function Slide1({ onNext }: { onNext?: () => void }) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-8xl font-light text-transparent bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text mb-6">
          VOCABULOUS
        </h1>
        <p className="text-2xl font-light text-slate-500 tracking-wide mb-16">
          Because attention is fragile.
        </p>
        <button 
          onClick={onNext}
          className="px-8 py-3 border border-slate-400 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Begin
        </button>
      </div>
    </div>
  );
}
