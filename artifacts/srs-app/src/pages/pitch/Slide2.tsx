export default function Slide2() {
  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-6xl font-light text-slate-900 mb-12 tracking-wide">
          The Forgetting Curve
        </h2>
        <p className="text-lg font-light text-slate-600 leading-relaxed mb-16 max-w-2xl">
          Students lose 70% of new information within 24 hours. Cramming creates the illusion of mastery, but long-term retention is near zero.
        </p>
        
        {/* SVG Forgetting Curve */}
        <svg className="w-full h-48 max-w-2xl" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="40" y1="20" x2="40" y2="160" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="40" y1="160" x2="380" y2="160" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Curve */}
          <path
            d="M 40 30 Q 100 40, 150 90 Q 200 130, 250 145 Q 300 150, 380 155"
            stroke="url(#curveGradient)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Labels */}
          <text x="40" y="180" fontSize="12" fill="#64748b" textAnchor="start" fontWeight="300">
            Now
          </text>
          <text x="360" y="180" fontSize="12" fill="#64748b" textAnchor="end" fontWeight="300">
            24 Hours
          </text>
          <text x="20" y="30" fontSize="12" fill="#64748b" textAnchor="end" fontWeight="300">
            100%
          </text>
          <text x="20" y="150" fontSize="12" fill="#64748b" textAnchor="end" fontWeight="300">
            30%
          </text>
          <text x="200" y="70" fontSize="18" fill="#e11d48" fontWeight="500" textAnchor="middle">
            70% Lost
          </text>
        </svg>
      </div>
    </div>
  );
}
