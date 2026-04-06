/**
 * OnboardingPage — shown to new users who have signed in with Clerk
 * but haven't yet chosen their role (teacher or student).
 */
import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import { Brain, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import type { Role } from "@/hooks/use-role";

export default function OnboardingPage() {
  const { completeOnboarding } = useRole();
  const [selected, setSelected] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await completeOnboarding(selected);
      // RoleProvider will update and the router will redirect
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Inter']">
      <div className="max-w-lg w-full">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vocabulous</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 text-center">
            How will you use Vocabulous?
          </h1>
          <p className="text-slate-500 text-center mb-8">
            Choose your role to personalise your experience.
          </p>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {/* Teacher option */}
            <button
              onClick={() => setSelected("teacher")}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                selected === "teacher"
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">I'm a Teacher</div>
                  <div className="text-sm text-slate-500">
                    Create classes, build study decks, and track your students' retention and progress.
                  </div>
                </div>
              </div>
            </button>

            {/* Student option */}
            <button
              onClick={() => setSelected("student")}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                selected === "student"
                  ? "border-purple-600 bg-purple-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">I'm a Student</div>
                  <div className="text-sm text-slate-500">
                    Study smarter with spaced repetition. Review cards, track your progress, and retain more.
                  </div>
                </div>
              </div>
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center mb-4">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selected || isSubmitting}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
