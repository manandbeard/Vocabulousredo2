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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Users, Layers, ArrowLeft, Plus, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherClassDetail() {
  const { id } = useParams<{ id: string }>();
  const classId = parseInt(id || "0", 10);
  const { userId } = useRole();
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
        data: {
          ...deckForm,
          classId,
          teacherId: userId
        }
      });
      toast({ title: "Deck created successfully" });
      setIsDeckOpen(false);
      setDeckForm({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: getListDecksQueryKey({ classId }) });
    } catch (err) {
      toast({ title: "Failed to create deck", variant: "destructive" });
    }
  };

  if (clsLoading) {
    return <AppLayout><div className="p-8 animate-pulse flex flex-col gap-4"><div className="h-10 w-1/3 bg-muted rounded"></div><div className="h-64 bg-muted rounded"></div></div></AppLayout>;
  }
  if (!cls) return <AppLayout>Class not found</AppLayout>;

  return (
    <AppLayout>
      <div className="animate-in fade-in duration-500">
        <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Classes
        </Link>
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {cls.subject}
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">{cls.name}</h1>
            {cls.description && <p className="mt-2 text-muted-foreground max-w-2xl">{cls.description}</p>}
          </div>
        </div>

        <Tabs defaultValue="decks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-8 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="decks" className="rounded-lg py-2">Decks ({decks?.length || 0})</TabsTrigger>
            <TabsTrigger value="students" className="rounded-lg py-2">Students ({students?.length || 0})</TabsTrigger>
            <TabsTrigger value="at-risk" className="rounded-lg py-2">
              At Risk 
              {atRisk && atRisk.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-destructive/20 text-destructive h-5 w-5 rounded-full text-xs font-bold">
                  {atRisk.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="decks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display">Study Decks</h2>
              <Dialog open={isDeckOpen} onOpenChange={setIsDeckOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Add Deck
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Deck</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDeck} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="deckName">Deck Name</Label>
                      <Input 
                        id="deckName" required 
                        value={deckForm.name} onChange={e => setDeckForm(p => ({ ...p, name: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deckDesc">Description (Optional)</Label>
                      <Input 
                        id="deckDesc" 
                        value={deckForm.description} onChange={e => setDeckForm(p => ({ ...p, description: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <Button type="submit" disabled={createDeckMut.isPending} className="w-full rounded-xl mt-2">
                      {createDeckMut.isPending ? "Creating..." : "Create Deck"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks?.map(deck => (
                <Link key={deck.id} href={`/teacher/decks/${deck.id}`}>
                  <Card className="hover-elevate cursor-pointer border-border/50 group bg-card transition-all hover:border-primary/50">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                          <Layers className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{deck.name}</h3>
                          <p className="text-sm text-muted-foreground">{deck.cardCount} cards</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {decks?.length === 0 && (
                <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No decks created yet. Add one to start building flashcards.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Enrolled</th>
                      <th className="px-6 py-4 font-semibold text-right">Total Reviews</th>
                      <th className="px-6 py-4 font-semibold text-right">Avg Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students?.map((student) => (
                      <tr key={student.studentId} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{student.studentName}</div>
                          <div className="text-muted-foreground text-xs">{student.studentEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{student.totalReviews}</td>
                        <td className="px-6 py-4 text-right">
                          {student.averageRetention !== null && student.averageRetention !== undefined ? (
                            <span className={student.averageRetention < 0.8 ? "text-destructive font-semibold" : "text-primary font-semibold"}>
                              {(student.averageRetention * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!students || students.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <Users className="mx-auto h-10 w-10 opacity-20 mb-3" />
                          No students enrolled yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="at-risk" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {atRisk?.map(student => (
                <Card key={student.studentId} className="border-destructive/30 bg-destructive/5 shadow-none rounded-2xl">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <AlertTriangle className={`h-6 w-6 ${student.riskLevel === 'high' ? 'text-destructive' : 'text-orange-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{student.studentName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{student.riskReason}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-destructive">{student.cardsOverdue}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Overdue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">
                          {student.averageRetention ? `${(student.averageRetention * 100).toFixed(0)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Retention</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!atRisk || atRisk.length === 0) && (
                <div className="py-16 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
                    <Brain className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">All students on track!</h3>
                  <p className="text-muted-foreground mt-2">No students are currently flagged for memory slippage.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
