import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetClass,
  useListClassStudents,
  useListDecks,
  useGetAtRiskStudents,
  useCreateDeck,
  getListDecksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Users, Layers, ArrowLeft, Plus, ChevronRight, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherClassDetail() {
  const { id } = useParams<{ id: string }>();
  const classId = parseInt(id || "0", 10);
  const { userId } = useRole();
  const safeUserId = userId ?? 0;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cls, isLoading: clsLoading } = useGetClass(classId);
  const { data: students } = useListClassStudents(classId);
  const { data: decks } = useListDecks({ classId });
  const { data: atRisk } = useGetAtRiskStudents(classId);

  const createDeckMut = useCreateDeck();
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [deckForm, setDeckForm] = useState({ name: "", description: "" });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeckMut.mutateAsync({
        data: { ...deckForm, classId, teacherId: safeUserId }
      });
      toast({ title: "Deck created successfully" });
      setIsDeckOpen(false);
      setDeckForm({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: getListDecksQueryKey({ classId }) });
    } catch {
      toast({ title: "Failed to create deck", variant: "destructive" });
    }
  };

  if (clsLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4 p-2">
          <div className="h-8 w-1/3 bg-slate-100 rounded-2xl" />
          <div className="h-48 bg-slate-100 rounded-3xl" />
        </div>
      </AppLayout>
    );
  }
  if (!cls) return <AppLayout><div className="text-slate-500">Class not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Back link */}
        <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Classes
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              {cls.subject}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{cls.name}</h1>
          {cls.description && <p className="mt-2 text-slate-500 font-light max-w-2xl">{cls.description}</p>}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm">
            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Decks</p>
            <p className="text-4xl font-bold">{decks?.length || 0}</p>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">Students</p>
            <p className="text-4xl font-bold text-slate-900">{students?.length || 0}</p>
          </div>
          <div className={`rounded-3xl p-5 border shadow-sm ${(atRisk?.length || 0) > 0 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-100"}`}>
            <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${(atRisk?.length || 0) > 0 ? "text-red-600" : "text-blue-600"}`}>At Risk</p>
            <p className={`text-4xl font-bold ${(atRisk?.length || 0) > 0 ? "text-red-700" : "text-blue-900"}`}>{atRisk?.length || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="decks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-6 p-1 bg-slate-100 rounded-2xl">
            <TabsTrigger value="decks" className="rounded-xl py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Decks ({decks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Students ({students?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="at-risk" className="rounded-xl py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              At Risk
              {atRisk && atRisk.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center bg-red-100 text-red-600 h-4 w-4 rounded-full text-xs font-bold">
                  {atRisk.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Decks tab */}
          <TabsContent value="decks" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Study Decks</p>
              <Dialog open={isDeckOpen} onOpenChange={setIsDeckOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                    <Plus className="h-4 w-4" /> Add Deck
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border border-slate-200">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">Create New Deck</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDeck} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Deck Name</Label>
                      <Input required value={deckForm.name}
                        onChange={e => setDeckForm(p => ({ ...p, name: e.target.value }))}
                        className="rounded-xl border-slate-200" placeholder="e.g. Chapter 5 Vocabulary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Description (Optional)</Label>
                      <Input value={deckForm.description}
                        onChange={e => setDeckForm(p => ({ ...p, description: e.target.value }))}
                        className="rounded-xl border-slate-200" />
                    </div>
                    <button type="submit" disabled={createDeckMut.isPending}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50 mt-2">
                      {createDeckMut.isPending ? "Creating..." : "Create Deck"}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks?.map(deck => (
                <Link key={deck.id} href={`/teacher/decks/${deck.id}`}>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-400 transition-colors cursor-pointer group shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{deck.name}</h3>
                        <p className="text-sm text-slate-500">{deck.cardCount} cards</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-700 transition-colors group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
              {decks?.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                  <Layers className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No decks yet. Add one to start building flashcards.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Students tab */}
          <TabsContent value="students">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider">Student</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Enrolled</th>
                      <th className="px-6 py-4 font-semibold tracking-wider text-right">Reviews</th>
                      <th className="px-6 py-4 font-semibold tracking-wider text-right">Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students?.map((student) => (
                      <tr key={student.studentId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{student.studentName}</div>
                          <div className="text-slate-400 text-xs">{student.studentEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900">{student.totalReviews}</td>
                        <td className="px-6 py-4 text-right">
                          {student.averageRetention !== null && student.averageRetention !== undefined ? (
                            <span className={student.averageRetention < 0.8
                              ? "text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full text-xs border border-red-100"
                              : "text-blue-600 font-bold"}>
                              {(student.averageRetention * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!students || students.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          <Users className="mx-auto h-8 w-8 opacity-30 mb-3" />
                          No students enrolled yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* At-Risk tab */}
          <TabsContent value="at-risk" className="space-y-4">
            {atRisk?.map(student => (
              <div key={student.studentId} className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AlertTriangle className={`h-6 w-6 ${student.riskLevel === "high" ? "text-red-600" : "text-orange-500"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{student.studentName}</h3>
                    <p className="text-sm text-slate-500 mt-1">{student.riskReason}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-red-600 text-2xl">{student.cardsOverdue}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Overdue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-900 text-2xl">
                      {student.averageRetention ? `${(student.averageRetention * 100).toFixed(0)}%` : "N/A"}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Retention</div>
                  </div>
                </div>
              </div>
            ))}
            {(!atRisk || atRisk.length === 0) && (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">All students on track!</h3>
                <p className="text-slate-500 mt-2 text-sm">No students are currently flagged for memory slippage.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
