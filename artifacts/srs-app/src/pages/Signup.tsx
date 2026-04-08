import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, GraduationCap, Users, ArrowRight, BookOpen, Check } from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";
import { useRole } from "@/hooks/use-role";
import { signup } from "@workspace/api-client-react";

export default function Signup() {
  const [, navigate] = useLocation();
  const { refetchUser } = useRole();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-emerald-400"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setError(null);
    setLoading(true);
    try {
      const user = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: selectedRole,
      });
      await refetchUser();
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-['Inter'] flex items-center justify-center relative py-8">
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Create your account</h1>
            <p className="text-sm text-slate-500">Join thousands of learners and educators.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                selectedRole === "student"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" />
              I'm a Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("teacher")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                selectedRole === "teacher"
                  ? "bg-violet-50 border-violet-200 text-violet-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              I'm a Teacher
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Jane Smith"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@school.edu"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-slate-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={form.confirm}
                  onChange={update("confirm")}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 pr-10 ${
                    form.confirm && form.confirm !== form.password
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-200 focus:border-blue-400"
                  }`}
                />
                {form.confirm && form.confirm === form.password && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">Passwords don't match</p>
              )}
            </div>

            {/* Perks blurb */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex flex-col gap-1.5">
              {[
                "Science-backed spaced repetition",
                "Adaptive review that fits your schedule",
                "Track progress with detailed analytics",
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                    <Check className="w-2 h-2 text-white" />
                  </div>
                  {perk}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || (!!form.confirm && form.confirm !== form.password)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
