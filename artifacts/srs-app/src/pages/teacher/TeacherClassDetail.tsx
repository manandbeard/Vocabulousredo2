import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetClass,
  useListClassStudents,
  useListDecks,
  useGetAtRiskStudents,
  useCreateDeck,
  useUpdateDeck,
  useListClasses,
  getListDecksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Users,
  Layers,
  ArrowLeft,
  Plus,
  Brain,
  Search,
  MoreVertical,
  ExternalLink,
  Unlink,
} from "lucide-react";
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
  const { data: allTeacherDecks } = useListDecks({ teacherId: safeUserId });
  const { data: classes } = useListClasses({ teacherId: safeUserId });
  const { data: atRisk } = useGetAtRiskStudents(classId);

  const createDeckMut = useCreateDeck();
  const updateDeckMut = useUpdateDeck();

  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"assign" | "create">("assign");
  const [search, setSearch] = useState("");
  const [deckForm, setDeckForm] = useState({ name: "", description: "" });
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const invalidateDecks = () => {
    queryClient.invalidateQueries({ queryKey: getListDecksQueryKey({ classId }) });
    queryClient.invalidateQueries({ queryKey: getListDecksQueryKey({ teacherId: safeUserId }) });
  };

  const classMap = new Map((classes ?? []).map((c) => [c.id, c.name]));

  const assignableDecks = (allTeacherDecks ?? []).filter(
    (d) => d.classId !== classId
  );

  const filteredAssignable = assignableDecks.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignDeck = async (deckId: number) => {
    setAssigningId(deckId);
    try {
      await updateDeckMut.mutateAsync({ id: deckId, data: { classId } });
      toast({ title: "Deck assigned to class" });
      setIsDeckOpen(false);
      setSearch("");
      invalidateDecks();
    } catch {
      toast({ title: "Failed to assign deck", variant: "destructive" });
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemoveDeck = async (deckId: number) => {
    try {
      await updateDeckMut.mutateAsync({ id: deckId, data: { classId: null } });
      toast({ title: "Deck removed from class" });
      invalidateDecks();
    } catch {
      toast({ title: "Failed to remove deck", variant: "destructive" });
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeckMut.mutateAsync({
        data: { ...deckForm, classId, teacherId: safeUserId }
      });
      toast({ title: "Deck created successfully" });
      setIsDeckOpen(false);
      setDeckForm({ name: "", description: "" });
      invalidateDecks();
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
              <Dialog open={isDeckOpen} onOpenChange={(open) => {
                setIsDeckOpen(open);
                if (!open) {
                  setSearch("");
                  setDeckForm({ name: "", description: "" });
                  setDialogTab("assign");
                }
              }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                    <Plus className="h-4 w-4" /> Add Deck
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px] rounded-3xl border border-slate-200 p-0 overflow-hidden">
                  <DialogHeader className="px-6 pt-6 pb-0">
                    <DialogTitle className="text-xl font-bold text-slate-900">Add Content to Class</DialogTitle>
                    <p className="text-sm text-slate-500 mt-1">Assign an existing deck or create a new one.</p>
                  </DialogHeader>

                  {/* Inner tab switcher */}
                  <div className="px-6 pt-4">
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                      <button
                        onClick={() => setDialogTab("assign")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          dialogTab === "assign"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Assign Existing
                      </button>
                      <button
                        onClick={() => setDialogTab("create")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          dialogTab === "create"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Create New
                      </button>
                    </div>
                  </div>

                  {dialogTab === "assign" ? (
                    <div className="px-6 pb-6 pt-4 space-y-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search decks..."
                          className="pl-9 rounded-xl border-slate-200"
                        />
                      </div>

                      {/* Deck list */}
                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {filteredAssignable.length === 0 ? (
                          <div className="py-10 text-center">
                            <Layers className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                            {assignableDecks.length === 0 ? (
                              <>
                                <p className="text-slate-500 text-sm font-medium">No available decks</p>
                                <p className="text-slate-400 text-xs mt-1">All your decks are already in this class, or you haven't created any yet.</p>
                                <Link href="/teacher/decks" onClick={() => setIsDeckOpen(false)}>
                                  <span className="inline-block mt-3 text-xs text-blue-600 hover:underline font-medium">
                                    Manage Decks →
                                  </span>
                                </Link>
                              </>
                            ) : (
                              <p className="text-slate-400 text-sm">No decks match your search.</p>
                            )}
                          </div>
                        ) : (
                          filteredAssignable.map((deck) => {
                            const currentClass = deck.classId ? classMap.get(deck.classId) : null;
                            const isLoading = assigningId === deck.id;
                            return (
                              <button
                                key={deck.id}
                                onClick={() => handleAssignDeck(deck.id)}
                                disabled={isLoading || assigningId !== null}
                                className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl px-4 py-3 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Layers className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{deck.name}</p>
                                    <p className="text-xs text-slate-500">{deck.cardCount ?? 0} cards</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {currentClass ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium shrink-0">
                                      Other Class: {currentClass}
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium shrink-0">
                                      Unassigned
                                    </span>
                                  )}
                                  {isLoading ? (
                                    <span className="text-xs text-blue-600 font-medium">Assigning…</span>
                                  ) : (
                                    <Plus className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateDeck} className="px-6 pb-6 pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium text-sm">
                          Deck Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          autoFocus
                          value={deckForm.name}
                          onChange={e => setDeckForm(p => ({ ...p, name: e.target.value }))}
                          className="rounded-xl border-slate-200"
                          placeholder="e.g. Chapter 5 Vocabulary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium text-sm">
                          Description <span className="text-slate-400 font-normal">(optional)</span>
                        </Label>
                        <Input
                          value={deckForm.description}
                          onChange={e => setDeckForm(p => ({ ...p, description: e.target.value }))}
                          className="rounded-xl border-slate-200"
                          placeholder="A brief description of this deck..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={createDeckMut.isPending}
                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50"
                      >
                        {createDeckMut.isPending ? "Creating…" : "Create & Assign Deck"}
                      </button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks?.map(deck => (
                <div
                  key={deck.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors"
                >
                  <Link href={`/teacher/decks/${deck.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{deck.name}</h3>
                      <p className="text-sm text-slate-500">{deck.cardCount} cards</p>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                        <Link href={`/teacher/decks/${deck.id}`}>
                          <ExternalLink className="h-4 w-4" /> View Cards
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setRemoveId(deck.id)}
                        className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Unlink className="h-4 w-4" /> Remove from Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

      {/* Remove deck confirmation dialog */}
      <Dialog open={removeId !== null} onOpenChange={(open) => { if (!open) setRemoveId(null); }}>
        <DialogContent className="sm:max-w-[380px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Remove deck from class?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 mt-1">
            The deck and its cards will not be deleted — it will just be unassigned from this class and returned to your deck library.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setRemoveId(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={updateDeckMut.isPending}
              onClick={async () => {
                if (removeId === null) return;
                await handleRemoveDeck(removeId);
                setRemoveId(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {updateDeckMut.isPending ? "Removing…" : "Remove"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
