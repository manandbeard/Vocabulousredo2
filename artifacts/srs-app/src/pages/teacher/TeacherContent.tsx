import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDecks,
  useCreateCard,
  useListAllCards,
  useUpdateCardStatus,
  useUpdateCard,
  useListClasses,
  useCreateClass,
  useUpdateClass,
  getListAllCardsQueryKey,
  getListClassesQueryKey,
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Sparkles,
  Upload,
  BookOpen,
  Layers,
  Users,
  ChevronRight,
  Check,
  X,
  Archive,
  Trash2,
  Search,
  Edit2,
  Link2,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const CLASS_ICONS = [
  "📚","🔬","🧪","🧬","⚗️","🌍","🗺️","📐","📏","🧮",
  "🎓","🖥️","📊","📈","🧠","💡","🔭","📖","✏️","🎨",
  "🎵","⚽","🏃","🌱","🔑","🏛️","🧩","🌟","🚀","🦋",
];

const COLOR_SCHEMES = [
  { value: "blue", label: "Blue", bg: "bg-blue-500" },
  { value: "purple", label: "Purple", bg: "bg-purple-500" },
  { value: "green", label: "Green", bg: "bg-green-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-500" },
  { value: "pink", label: "Pink", bg: "bg-pink-500" },
  { value: "teal", label: "Teal", bg: "bg-teal-500" },
  { value: "red", label: "Red", bg: "bg-red-500" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-500" },
  { value: "slate", label: "Slate", bg: "bg-slate-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-500" },
];

type Tab = "create" | "wordbank" | "classes";

interface GeneratedCardPreview {
  front: string;
  back: string;
  hint?: string | null;
  tags: string[];
  cardType: "flashcard" | "multiple_choice" | "brain_dump";
  accepted: boolean;
}

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "create";
  const params = new URLSearchParams(window.location.search);
  return (params.get("tab") as Tab) ?? "create";
}

export default function TeacherContent() {
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState<Tab>(getTabFromUrl);

  const { userId } = useRole();
  const safeUserId = userId ?? 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setTab = (tab: Tab) => {
    setCurrentTab(tab);
    setLocation(`/teacher/content?tab=${tab}`);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "create", label: "Create Content", icon: <Plus className="h-4 w-4" /> },
    { id: "wordbank", label: "Word Bank", icon: <BookOpen className="h-4 w-4" /> },
    { id: "classes", label: "Class Creation", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Content Management
          </p>
          <h1 className="text-4xl font-light text-slate-900">
            Deploy{" "}
            <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Content
            </span>
          </h1>
          <p className="mt-2 text-slate-500 font-light">
            Create cards, manage your word bank, and set up classes.
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                currentTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {currentTab === "create" && <CreateContentTab userId={safeUserId} toast={toast} queryClient={queryClient} />}
        {currentTab === "wordbank" && <WordBankTab userId={safeUserId} toast={toast} queryClient={queryClient} />}
        {currentTab === "classes" && <ClassCreationTab userId={safeUserId} toast={toast} queryClient={queryClient} />}
      </div>
    </AppLayout>
  );
}

function CreateContentTab({
  userId,
  toast,
  queryClient,
}: {
  userId: number;
  toast: ReturnType<typeof useToast>["toast"];
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const { data: decks } = useListDecks({ teacherId: userId });
  const createCardMut = useCreateCard();

  const [form, setForm] = useState({
    front: "",
    back: "",
    hint: "",
    tags: "",
    cardType: "flashcard" as "flashcard" | "multiple_choice" | "brain_dump",
    importance: 3,
    deckId: "",
  });

  const [aiForm, setAiForm] = useState({
    terms: "",
    context: "",
    tags: "",
    deckId: "",
    count: 10,
  });
  const [aiCards, setAiCards] = useState<GeneratedCardPreview[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCards, setBulkCards] = useState<GeneratedCardPreview[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deckId) {
      toast({ title: "Please select a deck", variant: "destructive" });
      return;
    }
    try {
      await createCardMut.mutateAsync({
        deckId: parseInt(form.deckId),
        data: {
          front: form.front,
          back: form.back,
          hint: form.hint || undefined,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          cardType: form.cardType,
          importance: form.importance,
          createdBy: userId,
        },
      });
      toast({ title: "Card saved successfully" });
      setForm({ front: "", back: "", hint: "", tags: "", cardType: "flashcard", importance: 3, deckId: form.deckId });
      queryClient.invalidateQueries({ queryKey: getListAllCardsQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to save card", variant: "destructive" });
    }
  };

  const handleGenerateAI = async () => {
    if (!aiForm.terms.trim()) {
      toast({ title: "Please enter some terms", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/ai/generate-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terms: aiForm.terms,
          context: aiForm.context || undefined,
          tags: aiForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
          count: aiForm.count,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const cards = await res.json();
      setAiCards(cards.map((c: GeneratedCardPreview) => ({ ...c, accepted: true })));
    } catch {
      toast({ title: "Failed to generate cards", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAccepted = async () => {
    const accepted = aiCards.filter((c) => c.accepted);
    if (!aiForm.deckId) {
      toast({ title: "Please select a deck", variant: "destructive" });
      return;
    }
    if (accepted.length === 0) {
      toast({ title: "No cards accepted", variant: "destructive" });
      return;
    }
    try {
      for (const card of accepted) {
        await createCardMut.mutateAsync({
          deckId: parseInt(aiForm.deckId),
          data: { ...card, createdBy: userId, hint: card.hint ?? undefined },
        });
      }
      toast({ title: `${accepted.length} cards saved` });
      setAiCards([]);
      queryClient.invalidateQueries({ queryKey: getListAllCardsQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to save cards", variant: "destructive" });
    }
  };

  const handleFileUpload = async (file: File) => {
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Only PDF and .txt files are supported", variant: "destructive" });
      return;
    }
    setBulkLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (aiForm.tags) formData.append("tags", aiForm.tags);
      formData.append("count", String(aiForm.count));
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/ai/bulk-generate`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const cards = await res.json();
      setBulkCards(cards.map((c: GeneratedCardPreview) => ({ ...c, accepted: true })));
    } catch {
      toast({ title: "Failed to generate cards from file", variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSaveBulkAccepted = async () => {
    const accepted = bulkCards.filter((c) => c.accepted);
    if (!aiForm.deckId) {
      toast({ title: "Please select a deck", variant: "destructive" });
      return;
    }
    if (accepted.length === 0) {
      toast({ title: "No cards accepted", variant: "destructive" });
      return;
    }
    try {
      for (const card of accepted) {
        await createCardMut.mutateAsync({
          deckId: parseInt(aiForm.deckId),
          data: { ...card, createdBy: userId, hint: card.hint ?? undefined },
        });
      }
      toast({ title: `${accepted.length} cards saved` });
      setBulkCards([]);
      queryClient.invalidateQueries({ queryKey: getListAllCardsQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to save cards", variant: "destructive" });
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" /> Manual Card Creation
          </h2>
          <form onSubmit={handleManualSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Deck</Label>
              <Select value={form.deckId} onValueChange={(v) => setForm((p) => ({ ...p, deckId: v }))}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select a deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Card Type</Label>
              <Select value={form.cardType} onValueChange={(v) => setForm((p) => ({ ...p, cardType: v as typeof form.cardType }))}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flashcard">Flashcard</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="brain_dump">Brain Dump</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Front (Question)</Label>
              <Textarea
                required
                value={form.front}
                onChange={(e) => setForm((p) => ({ ...p, front: e.target.value }))}
                className="rounded-xl border-slate-200 resize-none min-h-[80px]"
                placeholder="e.g. What is the powerhouse of the cell?"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Back (Answer)</Label>
              <Textarea
                required
                value={form.back}
                onChange={(e) => setForm((p) => ({ ...p, back: e.target.value }))}
                className="rounded-xl border-slate-200 resize-none min-h-[80px]"
                placeholder="e.g. Mitochondria"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Hint (Optional)</Label>
              <Input
                value={form.hint}
                onChange={(e) => setForm((p) => ({ ...p, hint: e.target.value }))}
                className="rounded-xl border-slate-200"
                placeholder="Brief clue..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-sm">Tags</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  className="rounded-xl border-slate-200"
                  placeholder="bio, cell, ..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-sm">Importance (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.importance}
                  onChange={(e) => setForm((p) => ({ ...p, importance: parseInt(e.target.value) || 3 }))}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createCardMut.isPending}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              {createCardMut.isPending ? "Saving..." : "Save Card"}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" /> Bulk Upload
          </h2>
          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
              isDragging ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
            {bulkLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-slate-500 text-sm">Extracting and generating cards...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-700 font-medium text-sm">Drop PDF or .txt file here</p>
                <p className="text-slate-400 text-xs mt-1">or click to browse</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 cursor-default">
                      <Link2 className="h-3 w-3" /> URL import — coming soon
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>URL extraction will be available in a future update</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
          {bulkCards.length > 0 && (
            <CardPreviewList
              cards={bulkCards}
              setCards={setBulkCards}
              deckId={aiForm.deckId}
              setDeckId={(v) => setAiForm((p) => ({ ...p, deckId: v }))}
              decks={decks ?? []}
              onSave={handleSaveBulkAccepted}
              isPending={createCardMut.isPending}
            />
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" /> AI Card Generation
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Terms / Content</Label>
            <Textarea
              value={aiForm.terms}
              onChange={(e) => setAiForm((p) => ({ ...p, terms: e.target.value }))}
              className="rounded-xl border-slate-200 resize-none min-h-[120px]"
              placeholder="Paste terms, key concepts, or content here..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Context (Optional)</Label>
            <Textarea
              value={aiForm.context}
              onChange={(e) => setAiForm((p) => ({ ...p, context: e.target.value }))}
              className="rounded-xl border-slate-200 resize-none min-h-[60px]"
              placeholder="e.g. High school AP Biology, Chapter 4 — Cell Structure"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Tags</Label>
              <Input
                value={aiForm.tags}
                onChange={(e) => setAiForm((p) => ({ ...p, tags: e.target.value }))}
                className="rounded-xl border-slate-200"
                placeholder="bio, genetics, ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Card Count</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={aiForm.count}
                onChange={(e) => setAiForm((p) => ({ ...p, count: parseInt(e.target.value) || 10 }))}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={aiLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-medium text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Cards with AI
              </>
            )}
          </button>
        </div>

        {aiCards.length > 0 && (
          <CardPreviewList
            cards={aiCards}
            setCards={setAiCards}
            deckId={aiForm.deckId}
            setDeckId={(v) => setAiForm((p) => ({ ...p, deckId: v }))}
            decks={decks ?? []}
            onSave={handleSaveAccepted}
            isPending={createCardMut.isPending}
          />
        )}
      </div>
    </div>
  );
}

function CardPreviewList({
  cards,
  setCards,
  deckId,
  setDeckId,
  decks,
  onSave,
  isPending,
}: {
  cards: GeneratedCardPreview[];
  setCards: (cards: GeneratedCardPreview[]) => void;
  deckId: string;
  setDeckId: (v: string) => void;
  decks: { id: number; name: string }[];
  onSave: () => void;
  isPending: boolean;
}) {
  const acceptedCount = cards.filter((c) => c.accepted).length;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {acceptedCount}/{cards.length} cards accepted
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCards(cards.map((c) => ({ ...c, accepted: true })))}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Accept all
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setCards(cards.map((c) => ({ ...c, accepted: false })))}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Reject all
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {cards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl border p-3 transition-all text-sm",
              card.accepted
                ? "border-green-200 bg-green-50"
                : "border-slate-200 bg-slate-50 opacity-50"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 line-clamp-1">{card.front}</p>
                <p className="text-slate-500 line-clamp-1">{card.back}</p>
                {card.hint && (
                  <p className="text-blue-500 text-xs mt-0.5 line-clamp-1">Hint: {card.hint}</p>
                )}
              </div>
              <button
                onClick={() =>
                  setCards(
                    cards.map((c, j) => (j === i ? { ...c, accepted: !c.accepted } : c))
                  )
                }
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  card.accepted
                    ? "bg-green-500 text-white hover:bg-red-500"
                    : "bg-slate-200 text-slate-400 hover:bg-green-500 hover:text-white"
                )}
              >
                {card.accepted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <Label className="text-slate-700 font-medium text-sm">Save to Deck</Label>
        <Select value={deckId} onValueChange={setDeckId}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <SelectValue placeholder="Select a deck" />
          </SelectTrigger>
          <SelectContent>
            {decks.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={onSave}
          disabled={isPending || acceptedCount === 0}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : `Save ${acceptedCount} Accepted Cards`}
        </button>
      </div>
    </div>
  );
}

function WordBankTab({
  userId,
  toast,
  queryClient,
}: {
  userId: number;
  toast: ReturnType<typeof useToast>["toast"];
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const { data: classes } = useListClasses({ teacherId: userId });
  const { data: decks } = useListDecks({ teacherId: userId });
  const updateStatusMut = useUpdateCardStatus();
  const updateCardMut = useUpdateCard();

  const [classFilter, setClassFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ front: "", back: "", hint: "" });

  const queryParams: Record<string, unknown> = { teacherId: userId };
  if (classFilter !== "all") queryParams.classId = parseInt(classFilter);
  if (tagFilter) queryParams.tag = tagFilter;
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const { data: allCards, isLoading } = useListAllCards(queryParams);

  const filtered = (allCards ?? []).filter(
    (c) =>
      !search ||
      c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (id: number, status: "active" | "archived" | "deleted") => {
    try {
      await updateStatusMut.mutateAsync({ id, data: { status } });
      toast({ title: status === "archived" ? "Card archived" : "Card deleted" });
      queryClient.invalidateQueries({ queryKey: getListAllCardsQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to update card", variant: "destructive" });
    }
  };

  const handleBatchAction = async (status: "archived" | "deleted") => {
    try {
      for (const id of selected) {
        await updateStatusMut.mutateAsync({ id, data: { status } });
      }
      toast({ title: `${selected.length} cards ${status === "archived" ? "archived" : "deleted"}` });
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: getListAllCardsQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Batch action failed", variant: "destructive" });
    }
  };

  const startEdit = (card: { id: number; front: string; back: string; hint?: string | null }) => {
    setEditingId(card.id);
    setEditForm({ front: card.front, back: card.back, hint: card.hint ?? "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateCardMut.mutateAsync({
        id: editingId,
        data: { front: editForm.front, back: editForm.back, hint: editForm.hint || undefined },
      });
      toast({ title: "Card updated" });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: getListAllCardsQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to update card", variant: "destructive" });
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-slate-200"
            placeholder="Search cards..."
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-40 rounded-xl border-slate-200">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="w-36 rounded-xl border-slate-200"
          placeholder="Tag filter..."
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-36 rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <span className="text-sm font-medium text-blue-700">{selected.length} selected</span>
          <button
            onClick={() => handleBatchAction("archived")}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            Archive Selected
          </button>
          <button
            onClick={() => handleBatchAction("deleted")}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-slate-500 hover:text-slate-700 ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-500">No cards found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={(e) =>
                      setSelected(e.target.checked ? filtered.map((c) => c.id) : [])
                    }
                  />
                </TableHead>
                <TableHead>Front</TableHead>
                <TableHead>Back</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((card) => (
                <TableRow key={card.id} className="border-slate-100 hover:bg-slate-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(card.id)}
                      onChange={() => toggleSelect(card.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 max-w-48">
                    {editingId === card.id ? (
                      <Input
                        value={editForm.front}
                        onChange={(e) => setEditForm((p) => ({ ...p, front: e.target.value }))}
                        className="rounded-lg border-slate-200 text-sm h-8"
                      />
                    ) : (
                      <span className="line-clamp-2">{card.front}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-48">
                    {editingId === card.id ? (
                      <Input
                        value={editForm.back}
                        onChange={(e) => setEditForm((p) => ({ ...p, back: e.target.value }))}
                        className="rounded-lg border-slate-200 text-sm h-8"
                      />
                    ) : (
                      <span className="line-clamp-2">{card.back}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {card.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 rounded-md">
                          {tag}
                        </Badge>
                      ))}
                      {card.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 rounded-md">
                          +{card.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs rounded-lg",
                        card.status === "active" && "border-green-200 text-green-700 bg-green-50",
                        card.status === "archived" && "border-amber-200 text-amber-700 bg-amber-50"
                      )}
                    >
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {editingId === card.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(card)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {card.status === "active" ? (
                            <button
                              onClick={() => handleStatusChange(card.id, "archived")}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(card.id, "active")}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(card.id, "deleted")}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">{filtered.length} cards shown</p>
    </div>
  );
}

function ClassCreationTab({
  userId,
  toast,
  queryClient,
}: {
  userId: number;
  toast: ReturnType<typeof useToast>["toast"];
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const { data: classes, isLoading } = useListClasses({ teacherId: userId });
  const createClassMut = useCreateClass();
  const updateClassMut = useUpdateClass();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    icon: "📚",
    colorScheme: "blue",
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingClass, setEditingClass] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", subject: "", description: "", icon: "📚", colorScheme: "blue" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClassMut.mutateAsync({
        data: { ...formData, teacherId: userId },
      });
      toast({ title: "Class created successfully" });
      setFormData({ name: "", subject: "", description: "", icon: "📚", colorScheme: "blue" });
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to create class", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingClass) return;
    try {
      await updateClassMut.mutateAsync({
        id: editingClass,
        data: editForm,
      });
      toast({ title: "Class updated" });
      setEditingClass(null);
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to update class", variant: "destructive" });
    }
  };

  const getColorBg = (color: string) => {
    return COLOR_SCHEMES.find((c) => c.value === color)?.bg ?? "bg-blue-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" /> Create New Class
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Class Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="rounded-xl border-slate-200"
              placeholder="e.g. AP Biology Fall 2025"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Subject</Label>
            <Input
              required
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
              className="rounded-xl border-slate-200"
              placeholder="e.g. Biology"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Description (Optional)</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="rounded-xl border-slate-200"
              placeholder="Brief course description..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Class Icon</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIconPicker((p) => !p)}
                className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-2xl hover:border-slate-400 transition-colors"
              >
                {formData.icon}
              </button>
              <span className="text-sm text-slate-500">Click to pick an icon</span>
            </div>
            {showIconPicker && (
              <div className="grid grid-cols-10 gap-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl mt-1">
                {CLASS_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, icon: emoji }));
                      setShowIconPicker(false);
                    }}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white transition-colors",
                      formData.icon === emoji && "bg-white ring-2 ring-blue-400"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Color Scheme</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, colorScheme: scheme.value }))}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    scheme.bg,
                    formData.colorScheme === scheme.value ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                  )}
                  title={scheme.label}
                />
              ))}
            </div>
          </div>

          <div className={cn("rounded-2xl p-4 text-white flex items-center gap-3", getColorBg(formData.colorScheme))}>
            <span className="text-2xl">{formData.icon}</span>
            <div>
              <p className="font-bold">{formData.name || "Class Name"}</p>
              <p className="text-sm opacity-80">{formData.subject || "Subject"}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={createClassMut.isPending}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            {createClassMut.isPending ? "Creating..." : "Create Class"}
          </button>

          <button
            type="button"
            disabled
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Import from Google Classroom — Coming in v2</span>
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Classes</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : classes?.length === 0 ? (
          <div className="py-12 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
            <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500">No classes yet</p>
          </div>
        ) : (
          classes?.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors"
            >
              <div className={cn("h-1.5 w-full", getColorBg(cls.colorScheme ?? "blue"))} />
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cls.icon ?? "📚"}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{cls.name}</h3>
                    <p className="text-sm text-slate-500">{cls.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {cls.enrollmentCount}</span>
                  <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {cls.deckCount}</span>
                  <Link href={`/teacher/classes/${cls.id}`}>
                    <ChevronRight className="h-4 w-4 text-slate-400 hover:text-slate-700 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={editingClass !== null} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent className="rounded-3xl border border-slate-200">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Class name"
              className="rounded-xl border-slate-200"
            />
            <Input
              value={editForm.subject}
              onChange={(e) => setEditForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Subject"
              className="rounded-xl border-slate-200"
            />
            <button
              onClick={handleUpdate}
              disabled={updateClassMut.isPending}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm"
            >
              {updateClassMut.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
