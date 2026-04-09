import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDecks,
  useCreateDeck,
  useUpdateDeck,
  useDeleteDeck,
  useListClasses,
  getListDecksQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Layers,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DeckFormState {
  name: string;
  description: string;
  classId: string;
}

const emptyForm: DeckFormState = { name: "", description: "", classId: "" };

export default function TeacherDecks() {
  const { userId } = useRole();
  const safeUserId = userId ?? 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decks, isLoading } = useListDecks({ teacherId: safeUserId });
  const { data: classes } = useListClasses({ teacherId: safeUserId });

  const createDeckMut = useCreateDeck();
  const updateDeckMut = useUpdateDeck();
  const deleteDeckMut = useDeleteDeck();

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<DeckFormState>(emptyForm);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListDecksQueryKey({ teacherId: safeUserId }) });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Deck name is required", variant: "destructive" });
      return;
    }
    try {
      await createDeckMut.mutateAsync({
        data: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          classId: form.classId ? parseInt(form.classId) : undefined,
          teacherId: safeUserId,
        },
      });
      toast({ title: "Deck created" });
      setCreateOpen(false);
      setForm(emptyForm);
      invalidate();
    } catch {
      toast({ title: "Failed to create deck", variant: "destructive" });
    }
  };

  const handleEditOpen = (deck: { id: number; name: string; description?: string | null; classId?: number | null }) => {
    setEditId(deck.id);
    setForm({
      name: deck.name,
      description: deck.description ?? "",
      classId: deck.classId ? String(deck.classId) : "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!form.name.trim()) {
      toast({ title: "Deck name is required", variant: "destructive" });
      return;
    }
    try {
      await updateDeckMut.mutateAsync({
        id: editId,
        data: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          classId: form.classId ? parseInt(form.classId) : undefined,
        },
      });
      toast({ title: "Deck updated" });
      setEditId(null);
      setForm(emptyForm);
      invalidate();
    } catch {
      toast({ title: "Failed to update deck", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDeckMut.mutateAsync({ id: deleteId });
      toast({ title: "Deck deleted" });
      setDeleteId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to delete deck", variant: "destructive" });
    }
  };

  const classMap = new Map((classes ?? []).map((c) => [c.id, c.name]));

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Deck Management
            </p>
            <h1 className="text-4xl font-light text-slate-900">
              Your{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Decks
              </span>
            </h1>
            <p className="mt-2 text-slate-500 font-light">
              Create and manage standalone decks or assign them to classes.
            </p>
          </div>
          <Button
            onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            New Deck
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : !decks || decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Layers className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No decks yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first deck to start organising your cards.</p>
            <Button
              onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Deck
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => {
              const assignedClass = deck.classId ? classMap.get(deck.classId) : null;
              const cardCount = deck.cardCount ?? 0;
              return (
                <div
                  key={deck.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-5 w-5 text-blue-600" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors",
                          "opacity-0 group-hover:opacity-100"
                        )}>
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          onClick={() => handleEditOpen(deck)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(deck.id)}
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Link href={`/teacher/decks/${deck.id}`}>
                    <h3 className="font-semibold text-slate-900 text-base mb-1 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">
                      {deck.name}
                    </h3>
                  </Link>
                  {deck.description && (
                    <p className="text-slate-500 text-sm line-clamp-2 mb-3">{deck.description}</p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-auto pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {cardCount} {cardCount === 1 ? "card" : "cards"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {deck.createdAt ? format(new Date(deck.createdAt), "MMM d, yyyy") : "—"}
                    </span>
                    {assignedClass != null ? (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {assignedClass}
                      </span>
                    ) : (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Create Deck</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Name <span className="text-red-500">*</span></Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="rounded-xl border-slate-200"
                placeholder="e.g. Chapter 4 — Cell Biology"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Description <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="rounded-xl border-slate-200 resize-none min-h-[72px]"
                placeholder="A brief description of this deck..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Assign to Class <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Select value={form.classId} onValueChange={(v) => setForm((p) => ({ ...p, classId: v === "none" ? "" : v }))}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="No class (standalone)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No class (standalone)</SelectItem>
                  {(classes ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDeckMut.isPending}
                className="rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                {createDeckMut.isPending ? "Creating..." : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editId !== null} onOpenChange={(open) => { if (!open) { setEditId(null); setForm(emptyForm); } }}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Deck</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Name <span className="text-red-500">*</span></Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="rounded-xl border-slate-200"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Description <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="rounded-xl border-slate-200 resize-none min-h-[72px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Assign to Class <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Select value={form.classId} onValueChange={(v) => setForm((p) => ({ ...p, classId: v === "none" ? "" : v }))}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="No class (standalone)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No class (standalone)</SelectItem>
                  {(classes ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setEditId(null); setForm(emptyForm); }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateDeckMut.isPending}
                className="rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                {updateDeckMut.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="rounded-3xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Delete Deck?</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-sm mt-1">
            This will permanently delete the deck and all its cards. This action cannot be undone.
          </p>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteDeckMut.isPending}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteDeckMut.isPending ? "Deleting..." : "Delete Deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
