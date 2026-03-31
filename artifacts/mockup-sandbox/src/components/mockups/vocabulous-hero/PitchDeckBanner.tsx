import { SynapticWeb } from "../synaptic-web/SynapticWeb";

export function PitchDeckBanner() {
  return (
    <div className="w-full h-96 text-slate-900 font-['Inter'] relative overflow-hidden">
      <SynapticWeb />
      <div className="w-full h-full relative z-10 flex items-center justify-center">
        <div className="text-center max-w-3xl px-8">
          <p className="text-slate-700 uppercase tracking-widest font-bold text-[20px] mb-[0px]">The Future of Learning</p>
          
          <h1 className="text-7xl font-light leading-tight mb-8">
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold">
              Vocabulous²
            </span>
          </h1>

          <p className="text-2xl text-slate-600 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
            Science-backed language learning platform powered by spaced repetition and adaptive difficulty
          </p>
        </div>
      </div>
    </div>
  );
}
