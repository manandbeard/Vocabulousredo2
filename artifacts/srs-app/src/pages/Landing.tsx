import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, Zap, Target, BarChart3, Clock, Users, Activity, RefreshCw,
  BookOpen, GraduationCap, LineChart, CheckCircle2, Menu, X, TrendingUp,
  Bell, Layers, Award, Star
} from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";
import logo from "@/assets/vocabulous-logo.png";

function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims: Record<string, string> = { sm: "w-6 h-6", md: "w-7 h-7", lg: "w-8 h-8" };
  return (
    <div className={`${dims[size]} rounded-lg overflow-hidden flex-shrink-0`}>
      <img src={logo} alt="Vocabulous²" className="w-full h-full object-contain" />
    </div>
  );
}

function LandingNav() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Science of Learning", id: "science" },
    { label: "For Teachers", id: "teachers" },
    { label: "For Students", id: "students" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm font-['Inter']">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition-opacity"
        >
          <LogoMark size="md" />
          <span className="text-lg tracking-tight">Vocabulous</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
          >
            Sign Up
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => { setMenuOpen(false); navigate("/login"); }}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate("/signup"); }}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function ScienceSection() {
  return (
    <section id="science" className="py-24 px-6 bg-white font-['Inter'] scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 bg-blue-50 px-3 py-1.5 rounded-full">
              <RefreshCw className="w-3.5 h-3.5" />
              Cognitive Science
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
              The Science of Learning
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Without review, the average person forgets 70% of new material within 24 hours. Vocabulous uses the <strong>forgetting curve</strong> and spaced repetition to schedule reviews at exactly the right moment — just before you forget.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Each correct answer pushes the next review further out. Over time, items move from days-apart reviews to months-apart, meaning you spend far less time maintaining what you've already learned.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <RefreshCw className="w-4 h-4" />, label: "Spaced Repetition", color: "bg-blue-100 text-blue-600" },
                { icon: <Zap className="w-4 h-4" />, label: "Active Recall", color: "bg-violet-100 text-violet-600" },
                { icon: <Target className="w-4 h-4" />, label: "Adaptive Review", color: "bg-purple-100 text-purple-600" },
              ].map(({ icon, label, color }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">The Forgetting Curve</p>
            <svg viewBox="0 0 400 220" className="w-full" aria-label="Forgetting curve diagram">
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eff6ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#eff6ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 20 20 Q 60 30 100 80 Q 140 130 200 160 Q 260 185 380 195" stroke="url(#curveGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 20 20 Q 60 30 100 80 Q 140 130 200 160 Q 260 185 380 195 L 380 210 L 20 210 Z" fill="url(#areaGrad)" />
              {[
                { x: 100, y: 80, label: "Day 1" },
                { x: 160, y: 120, label: "Day 3" },
                { x: 230, y: 150, label: "Day 7" },
                { x: 310, y: 175, label: "Day 14" },
              ].map(({ x, y, label }) => (
                <g key={label}>
                  <circle cx={x} cy={y} r="4" fill="white" stroke="url(#curveGrad)" strokeWidth="2" />
                  <line x1={x} y1={y - 6} x2={x} y2={y - 22} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
                  <text x={x} y={y - 26} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="Inter, sans-serif">{label}</text>
                </g>
              ))}
              <text x="20" y="15" fontSize="11" fill="#2563eb" fontFamily="Inter, sans-serif" fontWeight="600">100%</text>
              <text x="370" y="192" fontSize="11" fill="#7c3aed" fontFamily="Inter, sans-serif" fontWeight="600">~30%</text>
              <text x="200" y="215" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">Time without review</text>
            </svg>
            <div className="mt-2 p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-blue-700">With Vocabulous</span>, each review resets memory strength — turning the curve into a series of slow, long-arc declines that compound into permanent knowledge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeachersSection() {
  const features = [
    { icon: <BarChart3 className="w-5 h-5" />, title: "Class-wide analytics", desc: "Track retention rates, study streaks, and quiz performance across every student in real time.", color: "bg-orange-100 text-orange-600" },
    { icon: <BookOpen className="w-5 h-5" />, title: "Custom deck builder", desc: "Create and organize flashcard decks by subject, chapter, or learning objective — no coding required.", color: "bg-blue-100 text-blue-600" },
    { icon: <Users className="w-5 h-5" />, title: "Multi-class management", desc: "Manage multiple classes from one dashboard. Assign decks, set deadlines, and monitor progress.", color: "bg-violet-100 text-violet-600" },
    { icon: <Bell className="w-5 h-5" />, title: "Early-struggle alerts", desc: "Get notified when a student falls behind before it becomes a problem. Intervene at the right moment.", color: "bg-rose-100 text-rose-600" },
    { icon: <Layers className="w-5 h-5" />, title: "Curriculum alignment", desc: "Tag decks by standard or topic so you can see which learning goals are on track and which need attention.", color: "bg-emerald-100 text-emerald-600" },
    { icon: <TrendingUp className="w-5 h-5" />, title: "Progress over time", desc: "View longitudinal performance trends across weeks and months, not just individual quiz scores.", color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <section id="teachers" className="py-24 px-6 font-['Inter'] scroll-mt-16" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 bg-blue-100/70 px-3 py-1.5 rounded-full">
            <GraduationCap className="w-3.5 h-3.5" />
            For Teachers
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Built for the classroom
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Vocabulous gives teachers real data and simple tools so you can spend less time guessing and more time teaching.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudentsSection() {
  const features = [
    { icon: <Zap className="w-5 h-5" />, title: "Smart review sessions", desc: "Each session surfaces only the cards you're about to forget — no wasted time on what you already know.", color: "bg-yellow-100 text-yellow-600" },
    { icon: <LineChart className="w-5 h-5" />, title: "Personal progress dashboard", desc: "See exactly how many items you've mastered, what needs work, and how your streak is building.", color: "bg-blue-100 text-blue-600" },
    { icon: <Award className="w-5 h-5" />, title: "Achievements & streaks", desc: "Stay motivated with daily streaks, milestone badges, and personal bests that make studying feel rewarding.", color: "bg-purple-100 text-purple-600" },
    { icon: <Clock className="w-5 h-5" />, title: "Micro-sessions that fit your day", desc: "Study in 5-minute bursts between classes or during a commute. Consistency beats marathon sessions.", color: "bg-teal-100 text-teal-600" },
    { icon: <Target className="w-5 h-5" />, title: "Adaptive difficulty", desc: "The algorithm adjusts to your specific memory patterns — easier on good days, gentler when you're struggling.", color: "bg-rose-100 text-rose-600" },
    { icon: <Star className="w-5 h-5" />, title: "Learning lab", desc: "Practice with multiple question types — fill-in-the-blank, multiple choice, and more to deepen recall.", color: "bg-indigo-100 text-indigo-600" },
  ];

  return (
    <section id="students" className="py-24 px-6 bg-white font-['Inter'] scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-600 mb-4 bg-purple-50 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            For Students
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Learn smarter, not harder
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Stop cramming the night before. Vocabulous helps you build lasting memory through short, consistent practice — starting from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, color }) => (
            <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [, navigate] = useLocation();

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individual learners getting started.",
      features: [
        "Up to 3 decks",
        "100 cards per deck",
        "Basic spaced repetition",
        "Personal progress dashboard",
        "Mobile-friendly web app",
      ],
      cta: "Get Started Free",
      highlighted: false,
      ctaStyle: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    },
    {
      name: "Pro",
      price: "$6",
      period: "per month",
      description: "For serious learners who want the full experience.",
      features: [
        "Unlimited decks & cards",
        "Advanced adaptive algorithm",
        "All question types in Learning Lab",
        "Detailed analytics & insights",
        "Priority sync across devices",
        "Achievements & leaderboards",
      ],
      cta: "Start Free Trial",
      highlighted: true,
      ctaStyle: "text-white",
      ctaGradient: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    },
    {
      name: "School",
      price: "Custom",
      period: "per institution",
      description: "Built for classrooms, departments, and districts.",
      features: [
        "Everything in Pro",
        "Teacher dashboard & analytics",
        "Multi-class management",
        "Early-struggle alerts",
        "Admin controls & reporting",
        "Dedicated onboarding support",
      ],
      cta: "Contact Us",
      highlighted: false,
      ctaStyle: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 font-['Inter'] scroll-mt-16" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f5f3ff 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-600 mb-4 bg-violet-50 px-3 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5" />
            Pricing
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            Start free and upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col gap-6 ${
                tier.highlighted
                  ? "border-2 border-blue-300 shadow-xl shadow-blue-100/50"
                  : "border border-slate-200 shadow-sm"
              } bg-white relative`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white px-3 py-1.5 rounded-full" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{tier.name}</div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                  <span className="text-slate-500 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-slate-600">{tier.description}</p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/signup")}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all text-sm ${tier.ctaStyle}`}
                style={tier.ctaGradient ? { background: tier.ctaGradient } : undefined}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const [, navigate] = useLocation();
  return (
    <footer className="py-12 px-6 border-t border-slate-200 bg-white font-['Inter']">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <LogoMark size="sm" />
          <span className="font-bold text-slate-900">Vocabulous</span>
        </div>
        <p className="text-sm text-slate-400">© 2026 Vocabulous. Built with the forgetting curve in mind.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/login")} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Sign In</button>
          <button onClick={() => navigate("/signup")} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Sign Up</button>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="font-['Inter'] text-slate-900">
      <LandingNav />

      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center relative">
        <SynapticWeb />
        <div className="max-w-6xl w-full mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]">

            <div className="md:col-span-4 bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <LogoMark size="lg" />
                  <span className="font-bold text-xl tracking-tight">Vocabulous</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
                  Make learning stick, <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    not slip away.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                  Vocabulous uses science-backed spaced retrieval and adaptive review to help users actually remember what they learn across content.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <Activity className="absolute right-[-10%] bottom-[-20%] w-48 h-48 text-slate-800 opacity-50" />
              <div className="relative z-10">
                <div className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Retention Rate
                </div>
                <div className="text-6xl font-bold tracking-tight">87%</div>
                <p className="text-slate-400 text-sm mt-2">Average long-term retention</p>
              </div>
            </div>
            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Engagement</div>
              <div className="text-5xl font-bold tracking-tight text-slate-900 mb-1">94%</div>
              <p className="text-slate-500 text-xs">Active weekly users</p>
            </div>
            <div className="md:col-span-1 bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center">
              <div className="text-blue-600 text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Latency
              </div>
              <div className="text-4xl font-bold tracking-tight text-blue-900 mb-1">&lt;200ms</div>
              <p className="text-blue-600/70 text-xs">Lightning fast sync</p>
            </div>

            <div className="md:col-span-2 md:row-span-2 rounded-3xl p-8 border border-blue-100 shadow-sm relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 60%, #fdf4ff 100%)" }}>
              <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(99,102,241) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
              <div className="relative z-10 h-full flex flex-col gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Cognitive Design
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                    Built on real learning science
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Memory doesn't fade — it compounds with every review.
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Review Intervals</p>
                  <div className="flex items-end gap-2 h-24">
                    {[
                      { label: "Day 1", h: "20%", from: "#93c5fd", to: "#60a5fa" },
                      { label: "Day 3", h: "35%", from: "#60a5fa", to: "#818cf8" },
                      { label: "Day 7", h: "52%", from: "#818cf8", to: "#a78bfa" },
                      { label: "Day 14", h: "68%", from: "#a78bfa", to: "#c084fc" },
                      { label: "Day 30", h: "82%", from: "#c084fc", to: "#d946ef" },
                      { label: "∞", h: "100%", from: "#a855f7", to: "#7c3aed" },
                    ].map(({ label, h, from, to }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                        <div
                          className="w-full rounded-t-md transition-opacity duration-300 group-hover:opacity-90"
                          style={{ height: h, background: `linear-gradient(to top, ${from}, ${to})` }}
                        />
                        <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-100/80">
                  {[
                    { icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Spaced Repetition", iconBg: "bg-blue-100 text-blue-600" },
                    { icon: <Zap className="w-3.5 h-3.5" />, label: "Active Recall", iconBg: "bg-violet-100 text-violet-600" },
                    { icon: <Target className="w-3.5 h-3.5" />, label: "Adaptive Review", iconBg: "bg-purple-100 text-purple-600" },
                  ].map(({ icon, label, iconBg }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
                      <span className="text-[11px] font-semibold text-slate-600 leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 leading-tight">Short, powerful practice</h3>
                <p className="text-sm text-slate-600">Optimized micro-sessions that fit seamlessly into your day without overwhelming.</p>
              </div>
            </div>

            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 leading-tight">Progress you can see</h3>
                <p className="text-sm text-slate-600">Track mastery day by day and watch your knowledge graph grow with each session.</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.12)] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #eff6ff, #f5f3ff)" }}>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-xl tracking-tight">Ready to start?</h3>
              <p className="text-sm text-slate-500 mb-2">Join thousands of learners today.</p>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 px-6 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
              >
                Create account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                Sign in
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/pitch")}
                className="w-full py-3 px-6 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
              >
                See the pitch deck →
              </button>
            </div>

            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 leading-tight">Adaptive for every learner</h3>
                <p className="text-sm text-slate-600">The algorithm adjusts to your specific forgetting curve and pacing needs.</p>
              </div>
            </div>

            <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Actionable insight for teachers</h3>
                <p className="text-slate-600 text-lg">
                  Detailed analytics to track class progress, identify struggling students early, and adjust instructional focus based on real data. Never guess who needs help again.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ScienceSection />
      <TeachersSection />
      <StudentsSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}
