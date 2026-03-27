import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  LineChart, 
  LogOut, 
  BrainCircuit,
  Library,
  Settings
} from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { role, setRole } = useRole();

  const teacherLinks = [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "Classes & Decks", icon: BookOpen },
    { href: "/teacher/analytics", label: "Analytics", icon: LineChart },
  ];

  const studentLinks = [
    { href: "/student", label: "My Classes", icon: Library },
    { href: "/student/study", label: "Study Session", icon: BrainCircuit },
    { href: "/student/progress", label: "Progress", icon: LineChart },
  ];

  const links = role === "teacher" ? teacherLinks : studentLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border/60 shadow-sm">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MetaSRS
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {role === "teacher" ? "Teacher View" : "Student View"}
        </div>
        
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== `/${role}` && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60">
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {role === "teacher" ? "T" : "S"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {role === "teacher" ? "Dr. Smith" : "Alex Student"}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {role} Account
            </span>
          </div>
        </div>
        
        <button
          onClick={() => {
            setRole(role === "teacher" ? "student" : "teacher");
            window.location.href = role === "teacher" ? "/student" : "/teacher";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Switch to {role === "teacher" ? "Student" : "Teacher"}
        </button>
      </div>
    </div>
  );
}
