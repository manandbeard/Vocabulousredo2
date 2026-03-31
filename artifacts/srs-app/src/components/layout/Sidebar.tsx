import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  LineChart, 
  LogOut, 
  BrainCircuit,
  Library,
  Rocket,
  ArrowLeftRight
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
    <div className="flex h-full w-60 flex-col bg-white border-r border-slate-200 font-['Inter']">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-slate-200">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <span className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
          Vocabulous²
        </span>
      </div>

      <nav className="flex-1 p-3">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          {role === "teacher" ? "Teacher" : "Student"}
        </p>

        {links.map((link) => {
          const isActive = location === link.href || (link.href !== `/${role}` && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <link.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
              {link.label}
            </Link>
          );
        })}

        <div className="mt-3 pt-3 border-t border-slate-200">
          <Link href="/build" className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
            location === "/build"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}>
            <Rocket className={cn("h-4 w-4 flex-shrink-0", location === "/build" ? "text-blue-600" : "text-slate-400")} />
            Building in Public
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {role === "teacher" ? "T" : "S"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {role === "teacher" ? "Dr. Smith" : "Alex Rivera"}
            </span>
            <span className="text-xs text-slate-500 capitalize">{role}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setRole(role === "teacher" ? "student" : "teacher");
            window.location.href = role === "teacher" ? "/student" : "/teacher";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeftRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          Switch to {role === "teacher" ? "Student" : "Teacher"}
        </button>
      </div>
    </div>
  );
}
