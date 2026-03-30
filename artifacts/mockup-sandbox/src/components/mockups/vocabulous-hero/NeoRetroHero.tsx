export function NeoRetroHero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 text-white font-['Space_Mono']">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="inline-block bg-yellow-300 text-blue-900 px-4 py-2 mb-8 font-black text-xs">
          ▶ POWERED BY SCIENCE ◀
        </div>
        <h1 className="text-6xl font-black mb-6 text-yellow-300" style={{textShadow: '4px 4px #ff00ff'}}>
          VOCABULOUS
        </h1>
        <p className="text-xl text-pink-200 mb-12 max-w-2xl">
          Defeat the forgetting curve with AI-powered spacing effects and retrieval practice. 70% lost in 24 hours? Not anymore.
        </p>
        <div className="flex gap-4 mb-16">
          <button className="border-4 border-yellow-300 bg-transparent px-8 py-4 hover:bg-yellow-300 hover:text-blue-900 transition-all font-bold text-lg">
            ▶ START LEARNING ◀
          </button>
          <button className="border-4 border-pink-300 bg-transparent px-8 py-4 hover:bg-pink-300 hover:text-blue-900 transition-all font-bold text-lg">
            ▶ WATCH DEMO ◀
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="border-4 border-cyan-300 bg-cyan-900 bg-opacity-30 p-6 text-center">
            <p className="text-cyan-300 font-black text-xs mb-2">RETENTION RATE</p>
            <p className="text-yellow-300 text-4xl font-black">87%</p>
          </div>
          <div className="border-4 border-pink-300 bg-pink-900 bg-opacity-30 p-6 text-center">
            <p className="text-pink-300 font-black text-xs mb-2">ENGAGEMENT</p>
            <p className="text-yellow-300 text-4xl font-black">94%</p>
          </div>
          <div className="border-4 border-purple-300 bg-purple-900 bg-opacity-30 p-6 text-center">
            <p className="text-purple-300 font-black text-xs mb-2">API LATENCY</p>
            <p className="text-yellow-300 text-4xl font-black">&lt;200ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
