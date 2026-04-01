import { useState } from "react";
import { useListClasses, useCreateClass, getListClassesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, Users, Layers, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function TeacherClasses() {
  const { userId } = useRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: classes, isLoading } = useListClasses({ teacherId: userId });
  const createClassMut = useCreateClass();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", subject: "", description: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClassMut.mutateAsync({
        data: { ...formData, teacherId: userId }
      });
      toast({ title: "Class created successfully" });
      setIsOpen(false);
      setFormData({ name: "", subject: "", description: "" });
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey({ teacherId: userId }) });
    } catch {
      toast({ title: "Failed to create class", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Classes & Decks</p>
            <h1 className="text-4xl font-light text-slate-900">
              Your <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Classes</span>
            </h1>
            <p className="mt-2 text-slate-500 font-light">Manage your subjects, flashcard decks, and enrollments.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                <Plus className="h-4 w-4" />
                Create Class
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Create New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Class Name</Label>
                  <Input
                    id="name" required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. AP Biology Fall 2024"
                    className="rounded-xl border-slate-200 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
                  <Input
                    id="subject" required
                    value={formData.subject}
                    onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Biology"
                    className="rounded-xl border-slate-200 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the course"
                    className="rounded-xl border-slate-200 focus:border-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createClassMut.isPending}
                  className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors disabled:opacity-50 mt-2"
                >
                  {createClassMut.isPending ? "Creating..." : "Create Class"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classes grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes?.map((cls) => (
              <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-400 transition-colors cursor-pointer group shadow-sm h-full flex flex-col">
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                        {cls.subject}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2">{cls.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 font-light">{cls.description || "No description provided."}</p>
                  </div>
                  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {cls.enrollmentCount} Students
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      {cls.deckCount} Decks
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {classes?.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-dashed border-slate-300 rounded-3xl shadow-sm">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No classes yet</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">Create your first class to start adding students and flashcard decks.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
