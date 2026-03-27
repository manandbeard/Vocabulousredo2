import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetDeck, 
  useListCards, 
  useCreateCard,
  getListCardsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, LayoutPanelTop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherDeckDetail() {
  const { id } = useParams<{ id: string }>();
  const deckId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: deck, isLoading: deckLoading } = useGetDeck(deckId);
  const { data: cards, isLoading: cardsLoading } = useListCards(deckId);
  const createCardMut = useCreateCard();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", hint: "" });

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCardMut.mutateAsync({
        deckId,
        data: { ...form, tags: [] }
      });
      toast({ title: "Card added" });
      setIsOpen(false);
      setForm({ front: "", back: "", hint: "" });
      queryClient.invalidateQueries({ queryKey: getListCardsQueryKey(deckId) });
    } catch (err) {
      toast({ title: "Failed to add card", variant: "destructive" });
    }
  };

  if (deckLoading) return <AppLayout><div className="p-8 animate-pulse"><div className="h-10 w-1/4 bg-muted rounded mb-8"></div><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}</div></div></AppLayout>;
  if (!deck) return <AppLayout>Deck not found</AppLayout>;

  return (
    <AppLayout>
      <div className="animate-in fade-in duration-500">
        <Link href={deck.classId ? `/teacher/classes/${deck.classId}` : "/teacher/classes"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Class
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border/50">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <LayoutPanelTop className="h-8 w-8 text-primary" />
              {deck.name}
            </h1>
            {deck.description && <p className="mt-2 text-muted-foreground">{deck.description}</p>}
            <p className="mt-2 text-sm font-medium text-accent">{cards?.length || 0} Cards</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Flashcard</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCard} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Front (Question)</Label>
                  <Textarea 
                    required 
                    value={form.front} onChange={e => setForm(p => ({ ...p, front: e.target.value }))}
                    className="rounded-xl min-h-[100px] resize-none border-border/50 focus-visible:ring-primary/20"
                    placeholder="e.g. What is the powerhouse of the cell?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Back (Answer)</Label>
                  <Textarea 
                    required 
                    value={form.back} onChange={e => setForm(p => ({ ...p, back: e.target.value }))}
                    className="rounded-xl min-h-[100px] resize-none border-border/50 focus-visible:ring-primary/20"
                    placeholder="e.g. Mitochondria"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hint (Optional)</Label>
                  <Input 
                    value={form.hint} onChange={e => setForm(p => ({ ...p, hint: e.target.value }))}
                    className="rounded-xl border-border/50"
                    placeholder="Brief clue..."
                  />
                </div>
                <Button type="submit" disabled={createCardMut.isPending} className="w-full rounded-xl mt-4">
                  {createCardMut.isPending ? "Saving..." : "Save Card"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {cards?.map((card, idx) => (
            <Card key={card.id} className="border-border/50 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-border/30 bg-muted/10">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Front</span>
                    <p className="text-foreground font-medium text-lg whitespace-pre-wrap">{card.front}</p>
                  </div>
                  <div className="flex-1 p-6">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Back</span>
                    <p className="text-foreground whitespace-pre-wrap">{card.back}</p>
                    {card.hint && (
                      <p className="mt-4 text-sm text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <span className="font-semibold">Hint:</span> {card.hint}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cards?.length === 0 && !cardsLoading && (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground text-lg">No cards in this deck yet.</p>
              <Button onClick={() => setIsOpen(true)} variant="outline" className="mt-4 rounded-xl">
                Add your first card
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
