import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Users, ArrowRight, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { SynapticWeb } from "@/components/ui/synaptic-web";
import { useRole } from "@/hooks/use-role";

const onboardingSchema = z.object({
  role: z.enum(["teacher", "student"], {
    required_error: "Please choose your role to continue.",
  }),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function Signup() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isAuthLoading, role: existingRole, setRole, displayName, login } = useRole();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (existingRole) {
      navigate(existingRole === "teacher" ? "/teacher" : "/student");
    }
  }, [isAuthLoading, isAuthenticated, existingRole, navigate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const onSubmit = (data: OnboardingForm) => {
    setRole(data.role);
    navigate(data.role === "teacher" ? "/teacher" : "/student");
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              {displayName ? `Welcome, ${displayName.split(" ")[0]}!` : "One last step"}
            </h1>
            <p className="text-sm text-slate-500">
              How will you use Vocabulous? This helps us personalise your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Role selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["student", "teacher"] as const).map((r) => {
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setValue("role", r, { shouldValidate: true })}
                      className={`relative flex flex-col items-center gap-3 py-5 px-4 rounded-2xl border-2 transition-all text-sm font-medium ${
                        isSelected
                          ? r === "student"
                            ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                            : "bg-violet-50 border-violet-400 text-violet-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          className={`absolute top-2 right-2 w-4 h-4 ${r === "student" ? "text-blue-500" : "text-violet-500"}`}
                        />
                      )}
                      {r === "student" ? (
                        <Users className={`w-8 h-8 ${isSelected ? "text-blue-500" : "text-slate-400"}`} />
                      ) : (
                        <GraduationCap className={`w-8 h-8 ${isSelected ? "text-violet-500" : "text-slate-400"}`} />
                      )}
                      <span>{r === "student" ? "Student" : "Teacher"}</span>
                      <span className="text-[11px] font-normal text-slate-400 text-center leading-tight">
                        {r === "student" ? "I want to learn vocabulary" : "I teach and manage classes"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-100 text-red-500 text-[10px] font-bold flex items-center justify-center">!</span>
                  {errors.role.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Signed in with the wrong account?{" "}
          <button
            onClick={login}
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            Switch account
          </button>
        </p>
      </div>
    </div>
  );
}
