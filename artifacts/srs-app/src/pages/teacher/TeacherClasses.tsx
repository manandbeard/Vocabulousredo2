import { useState } from "react";
import { useListClasses, useCreateClass, getListClassesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, Users, Layers } from "lucide-react";
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
        data: {
          ...formData,
          teacherId: userId
        }
      });
      toast({ title: "Class created successfully" });
      setIsOpen(false);
      setFormData({ name: "", subject: "", description: "" });
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey({ teacherId: userId }) });
    } catch (err) {
      toast({ title: "Failed to create class", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Classes & Decks</h1>
            <p className="mt-2 text-muted-foreground text-lg">Manage your subjects, flashcard decks, and enrollments.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. AP Biology Fall 2024" 
                    className="rounded-xl border-border/50 bg-muted/30 focus:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    required 
                    value={formData.subject}
                    onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Biology" 
                    className="rounded-xl border-border/50 bg-muted/30 focus:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the course" 
                    className="rounded-xl border-border/50 bg-muted/30 focus:bg-background"
                  />
                </div>
                <Button type="submit" disabled={createClassMut.isPending} className="w-full rounded-xl mt-2">
                  {createClassMut.isPending ? "Creating..." : "Create Class"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes?.map((cls) => (
              <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                <Card className="hover-elevate cursor-pointer border-border/50 h-full bg-card overflow-hidden group">
                  <div className="h-2 w-full bg-gradient-to-r from-primary to-accent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {cls.subject}
                      </span>
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{cls.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{cls.description || "No description provided."}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{cls.enrollmentCount} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>{cls.deckCount} Decks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            
            {classes?.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-foreground">No classes yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Create your first class to start adding students and flashcard decks.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
