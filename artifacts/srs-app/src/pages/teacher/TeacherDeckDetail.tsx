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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
    } catch {
      toast({ title: "Failed to add card", variant: "destructive" });
    }
  };

  if (deckLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4 p-2">
          <div className="h-8 w-1/4 bg-slate-100 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
          </div>
        </div>
      </AppLayout>
    );
  }
  if (!deck) return <AppLayout><div className="text-slate-500">Deck not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Back link */}
        <Link
          href={deck.classId ? `/teacher/classes/${deck.classId}` : "/teacher/classes"}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Class
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <LayoutPanelTop className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{deck.name}</h1>
            </div>
            {deck.description && <p className="text-slate-500 font-light ml-13">{deck.description}</p>}
            <p className="text-sm font-semibold text-blue-600 mt-1">{cards?.length || 0} Cards</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                <Plus className="h-4 w-4" /> Add Card
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Add Flashcard</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCard} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Front (Question)</Label>
                  <Textarea
                    required value={form.front}
                    onChange={e => setForm(p => ({ ...p, front: e.target.value }))}
                    className="rounded-xl min-h-[100px] resize-none border-slate-200"
                    placeholder="e.g. What is the powerhouse of the cell?"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Back (Answer)</Label>
                  <Textarea
                    required value={form.back}
                    onChange={e => setForm(p => ({ ...p, back: e.target.value }))}
                    className="rounded-xl min-h-[100px] resize-none border-slate-200"
                    placeholder="e.g. Mitochondria"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Hint (Optional)</Label>
                  <Input
                    value={form.hint}
                    onChange={e => setForm(p => ({ ...p, hint: e.target.value }))}
                    className="rounded-xl border-slate-200"
                    placeholder="Brief clue..."
                  />
                </div>
                <button
                  type="submit" disabled={createCardMut.isPending}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50 mt-2"
                >
                  {createCardMut.isPending ? "Saving..." : "Save Card"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards list */}
        <div className="grid grid-cols-1 gap-4">
          {cards?.map((card) => (
            <div key={card.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Front</span>
                  <p className="text-slate-900 font-medium text-lg whitespace-pre-wrap">{card.front}</p>
                </div>
                <div className="flex-1 p-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Back</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{card.back}</p>
                  {card.hint && (
                    <p className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <span className="font-semibold">Hint:</span> {card.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {cards?.length === 0 && !cardsLoading && (
            <div className="py-16 text-center bg-white border border-dashed border-slate-300 rounded-3xl shadow-sm">
              <LayoutPanelTop className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-lg mb-4">No cards in this deck yet.</p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Add your first card
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
