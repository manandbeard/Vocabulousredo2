import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useListDecks, useGradeBlurt } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Timer,
  RotateCcw,
  Send,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

type Step = "setup" | "writing" | "results";

interface GradeResult {
  score: number;
  feedback: string;
  correctConcepts: string[];
  missedConcepts: string[];
  sessionId?: number;
}

export default function StudentBlurting() {
  const { userId } = useRole();
  const [, setLocation] = useLocation();
  const safeUserId = userId ?? 0;

  const { data: decks, isLoading: decksLoading } = useListDecks({});
  const gradeBlurtMut = useGradeBlurt();

  const [step, setStep] = useState<Step>("setup");
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [studentResponse, setStudentResponse] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedDeck = decks?.find((d) => d.id === selectedDeckId);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timeLeft]);

  const startWriting = () => {
    if (!selectedDeckId) return;
    if (timerEnabled) {
      setTimeLeft(timerMinutes * 60);
      setTimerRunning(true);
    }
    setStep("writing");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!selectedDeckId || !studentResponse.trim() || !prompt.trim()) return;
    setTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await gradeBlurtMut.mutateAsync({
        data: {
          prompt,
          studentResponse,
          deckId: selectedDeckId,
          studentId: safeUserId,
        },
      });
      setResult(data);
      setStep("results");
    } catch {
      setError("Failed to grade your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAgain = () => {
    setStep("setup");
    setStudentResponse("");
    setResult(null);
    setError(null);
    setTimerRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timerWarning = timeLeft > 0 && timeLeft <= 30;

  if (decksLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 font-['Inter']">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation("/student")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          {step === "writing" && timerEnabled && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold transition-colors ${
                timerWarning
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : timeLeft === 0
                    ? "bg-slate-100 text-slate-500"
                    : "bg-slate-900 text-white"
              }`}
            >
              <Timer className="h-5 w-5" />
              {timeLeft === 0 ? "Time's up!" : formatTime(timeLeft)}
            </div>
          )}
        </div>

        {step === "setup" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Blurting Exercise
                </h1>
              </div>
              <p className="text-slate-500 text-base ml-13">
                Write everything you know about a topic, then get AI-powered feedback.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-4 shadow-sm">
              <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Choose a Deck
              </label>
              {!decks || decks.length === 0 ? (
                <p className="text-slate-400 text-sm">No decks available.</p>
              ) : (
                <div className="grid gap-2">
                  {decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => setSelectedDeckId(deck.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                        selectedDeckId === deck.id
                          ? "border-purple-400 bg-purple-50 text-purple-900"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen
                          className={`h-4 w-4 ${selectedDeckId === deck.id ? "text-purple-500" : "text-slate-400"}`}
                        />
                        <span className="font-medium">{deck.name}</span>
                        {deck.description && (
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            {deck.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{deck.cardCount} cards</span>
                        {selectedDeckId === deck.id && (
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDeckId && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-4 shadow-sm animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Topic Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`What topic from "${selectedDeck?.name}" do you want to recall? e.g. "Everything I know about photosynthesis"`}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                  rows={2}
                />
              </div>
            )}

            {selectedDeckId && prompt.trim() && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-sm animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Timer (optional)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${timerEnabled ? "bg-purple-500" : "bg-slate-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${timerEnabled ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                  {timerEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Duration:</span>
                      {[2, 5, 10, 15].map((m) => (
                        <button
                          key={m}
                          onClick={() => setTimerMinutes(m)}
                          className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                            timerMinutes === m
                              ? "bg-purple-100 text-purple-700 border border-purple-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              disabled={!selectedDeckId || !prompt.trim()}
              onClick={startWriting}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              Start Writing <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === "writing" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">
                Your prompt
              </div>
              <p className="text-purple-900 font-medium text-lg">{prompt}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm mb-4">
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm text-slate-500">
                  Write everything you know about the topic. Don't hold back — dump it all out!
                </p>
              </div>
              <textarea
                ref={textareaRef}
                value={studentResponse}
                onChange={(e) => setStudentResponse(e.target.value)}
                placeholder="Start writing here..."
                className="w-full resize-none p-6 text-slate-900 placeholder-slate-300 focus:outline-none rounded-b-3xl text-base leading-relaxed"
                rows={16}
              />
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("setup");
                  setTimerRunning(false);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                }}
                className="px-6 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!studentResponse.trim() || isSubmitting}
                className="flex-1 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit for Grading
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "results" && result && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <div
                className={`inline-flex h-28 w-28 rounded-full items-center justify-center mb-4 ${
                  result.score >= 80
                    ? "bg-emerald-100 text-emerald-600"
                    : result.score >= 60
                      ? "bg-blue-100 text-blue-600"
                      : result.score >= 40
                        ? "bg-amber-100 text-amber-600"
                        : "bg-red-100 text-red-600"
                }`}
              >
                <span className="text-4xl font-bold">{result.score}</span>
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">
                Your Score
              </div>
              <div
                className={`text-2xl font-bold ${
                  result.score >= 80
                    ? "text-emerald-600"
                    : result.score >= 60
                      ? "text-blue-600"
                      : result.score >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                }`}
              >
                {result.score >= 80
                  ? "Excellent recall!"
                  : result.score >= 60
                    ? "Good effort!"
                    : result.score >= 40
                      ? "Keep practicing!"
                      : "Room to grow!"}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                AI Feedback
              </div>
              <p className="text-slate-700 leading-relaxed">{result.feedback}</p>
            </div>

            {result.correctConcepts.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                    Concepts You Got Right ({result.correctConcepts.length})
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.correctConcepts.map((concept, i) => (
                    <li key={i} className="flex items-start gap-2 text-emerald-800">
                      <span className="mt-0.5 h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-200 text-emerald-700 text-xs font-bold">
                        ✓
                      </span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.missedConcepts.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div className="text-sm font-bold uppercase tracking-widest text-red-500">
                    Concepts to Review ({result.missedConcepts.length})
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.missedConcepts.map((concept, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-800">
                      <span className="mt-0.5 h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-red-200 text-red-600 text-xs font-bold">
                        ✗
                      </span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setLocation("/student")}
                className="px-6 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleStartAgain}
                className="flex-1 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-all hover:-translate-y-0.5 shadow-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Start Another Round
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
