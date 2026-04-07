import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Loader2 } from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";
import { useRole } from "@/hooks/use-role";

function ReplitLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 4.5A1.5 1.5 0 0 1 5 3h6.5a1.5 1.5 0 0 1 0 3H8v3.5h6.5a1.5 1.5 0 0 1 0 3H8V16h6.5a1.5 1.5 0 0 1 0 3H5a1.5 1.5 0 0 1-1.5-1.5V4.5Z" />
      <path d="M13.5 9.5h3A1.5 1.5 0 0 1 18 11v2a1.5 1.5 0 0 1-1.5 1.5h-3V9.5Z" />
    </svg>
  );
}

export default function Login() {
  const [, navigate] = useLocation();
  const { role, isAuthenticated, isAuthLoading, login } = useRole();

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated && role) {
      navigate(role === "teacher" ? "/teacher" : "/student");
    } else if (isAuthenticated && !role) {
      navigate("/signup");
    }
  }, [isAuthLoading, isAuthenticated, role, navigate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Inter'] flex items-center justify-center relative" style={{ background: "linear-gradient(145deg, #eef2ff 0%, #f5f3ff 40%, #fdf4ff 70%, #eff6ff 100%)" }}>
      <SynapticWeb />

      <div className="w-full max-w-md mx-auto px-4 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Vocabulous²</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.12)] p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h1>
            <p className="text-sm text-slate-500">
              Sign in with your account to start learning with spaced repetition.
            </p>
          </div>

          <button
            onClick={login}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2.5 group hover:opacity-90 active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #f26207 0%, #e05a00 100%)" }}
          >
            <ReplitLogo className="w-4 h-4 text-white shrink-0" />
            Sign in with Replit
          </button>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex flex-col gap-1.5">
            {[
              "Science-backed spaced repetition",
              "Adaptive review that fits your schedule",
              "Track progress with detailed analytics",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-xs text-slate-600">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                >
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {perk}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
