import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, Zap, Target, BarChart3, Clock, Users, Activity, RefreshCw,
  BookOpen, GraduationCap, LineChart, CheckCircle2, Menu, X, TrendingUp,
  Bell, Layers, Award, Star
} from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";

function LogoMark() {
  return <img src="/src/assets/vocabulous-logo.png" alt="Vocabulous²" className="w-full h-full object-contain" />;
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
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white">
            <LogoMark />
          </div>
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
