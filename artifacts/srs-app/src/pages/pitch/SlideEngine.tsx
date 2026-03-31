import { useState } from "react";
import { Activity, Database, Smartphone } from "lucide-react";

export default function SlideEngine() {
  const [flowState, setFlowState] = useState<'idle' | 'api' | 'engine'>('idle');
  const [payload, setPayload] = useState({ correct: true, latency: 0 });
  const [recallProb, setRecallProb] = useState(45);

  const simulateFlow = (isCorrect: boolean) => {
    setFlowState('idle');
    setPayload({ correct: isCorrect, latency: isCorrect ? 450 : 1200 });
    
    setTimeout(() => setFlowState('api'), 100);
    setTimeout(() => setFlowState('engine'), 1200);
    setTimeout(() => {
      setRecallProb((prev) => (isCorrect ? Math.min(prev + 25, 99) : Math.max(prev - 15, 12)));
      setFlowState('idle');
    }, 2400);
  };

  const getPacketPosition = () => {
    if (flowState === 'idle') return '15%';
    if (flowState === 'api') return '50%';
    return '85%';
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center px-8 font-['Inter'] overflow-hidden">
      <style>{`
        @keyframes float-packet {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .packet-moving {
          animation: float-packet 0.8s ease-in-out;
        }
      `}</style>
      {/* Header and Description */}
      <div className="mb-12 text-center max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-4 tracking-wide">
          Meta-Learned Spaced Retrieval
        </h2>
        <p className="text-lg font-light text-slate-600 leading-relaxed text-left">A Python-based adaptive scheduler that predicts recall. It targets a 60-80% "desirable difficulty" recall probability, surfacing words from previously learned content automatically during review of new content. 

        The engine calculates the current recall probability for every word in the student's history and returns the "k" items most at risk of being forgotten. See how it works below:</p>
      </div>
      {/* Main Diagram Container */}
      <div className="relative w-full max-w-6xl flex justify-between items-center px-12 z-10 h-64 mb-12">
        
        {/* Background SVG Connectors */}
        <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <line x1="15%" y1="50%" x2="50%" y2="50%" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="#E2E8F0" strokeWidth="1" />
        </svg>

        {/* Node 1: Client */}
        <div className="flex flex-col items-center bg-white p-6 border border-slate-200 w-64 rounded-lg">
          <Smartphone strokeWidth={1.5} className="w-8 h-8 text-slate-400 mb-4" />
          <span className="font-light text-slate-900 tracking-wider">Student App</span>
          <span className="text-xs text-slate-400 mt-2 font-mono">React + Vite</span>
        </div>

        {/* Node 2: API */}
        <div className="flex flex-col items-center bg-white p-6 border border-slate-200 w-64 rounded-lg">
          <Activity strokeWidth={1.5} className="w-8 h-8 text-slate-400 mb-4" />
          <span className="font-light text-slate-900 tracking-wider">recordReview API</span>
          <span className="text-xs text-slate-400 mt-2 font-mono">Express Routing</span>
        </div>

        {/* Node 3: Engine */}
        <div className="flex flex-col items-center bg-white p-6 border border-slate-200 w-64 rounded-lg">
          <Database strokeWidth={1.5} className="w-8 h-8 text-slate-400 mb-4" />
          <span className="font-light text-slate-900 tracking-wider">Math Engine</span>
          <span className="text-xs text-slate-400 mt-2 font-mono">Python + Postgres</span>
          <div className="mt-4 pt-4 border-t border-slate-100 w-full text-center">
            <span className="text-xs text-slate-400 tracking-wide uppercase">Recall Probability</span>
            <div className="text-3xl font-light text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mt-1">{recallProb}%</div>
          </div>
        </div>

        {/* Animated Data Packet */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-800 ease-in-out ${flowState !== 'idle' ? 'packet-moving' : ''}`}
          style={{ left: getPacketPosition() }}
        >
          {/* The visual packet */}
          <div className={`w-4 h-4 rounded-full shadow-md transition-all ${
            flowState === 'idle' ? 'bg-slate-300 opacity-0' : 'bg-blue-500 opacity-100'
          }`} />
          
          {/* The JSON Payload */}
          <div 
            className={`absolute top-full whitespace-nowrap bg-white border border-slate-200 px-3 py-2 shadow-sm text-xs font-mono text-slate-500 rounded mt-2 transition-opacity duration-300 ${
              flowState !== 'idle' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {`{ correct: ${payload.correct}, ms: ${payload.latency} }`}
          </div>
        </div>

      </div>
      {/* Interactive Controls */}
      <div className="flex gap-6 mb-8">
        <button 
          onClick={() => simulateFlow(true)}
          disabled={flowState !== 'idle'}
          className="px-6 py-3 border border-green-300 text-green-700 font-light tracking-wide hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          ✓ Correct Recall
        </button>
        <button 
          onClick={() => simulateFlow(false)}
          disabled={flowState !== 'idle'}
          className="px-6 py-3 border border-red-300 text-red-700 font-light tracking-wide hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          ✗ Memory Lapse
        </button>
      </div>
      {/* Status Indicator */}
      <div className="text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest">
          {flowState === 'idle' && 'Ready for next simulation'}
          {flowState === 'api' && 'Processing API call...'}
          {flowState === 'engine' && 'Computing next interval...'}
        </p>
      </div>
    </div>
  );
}
