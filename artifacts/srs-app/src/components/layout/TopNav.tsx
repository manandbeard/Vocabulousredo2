import { useLocation } from "wouter";
import { BookOpen, BarChart3, Settings, Home, Rocket, Presentation, ChevronDown, Info, BrainCircuit, TrendingUp } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useRole } from "@/hooks/use-role";
import { useClerk } from "@clerk/react";
import { UserButton } from "@clerk/react";

export function TopNav() {
  const { role } = useRole();
  const { signOut } = useClerk();
  const [location, navigate] = useLocation();
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setInfoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!role) return null;

  const navItems = role === "teacher"
    ? [
        { label: "Dashboard", href: "/teacher", icon: Home },
        { label: "Classes", href: "/teacher/classes", icon: BookOpen },
        { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
      ]
    : [
        { label: "Dashboard", href: "/student", icon: Home },
        { label: "Study", href: "/student/study", icon: BrainCircuit },
        { label: "Learning Lab", href: "/student/learning-lab", icon: TrendingUp },
        { label: "Progress", href: "/student/progress", icon: BarChart3 },
      ];

  const infoItems = [
    { label: "Building in Public", href: "/build", icon: Rocket },
    { label: "Pitch Deck", href: "/pitch", icon: Presentation },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">V</span>
            </div>
            <span>Vocabulous²</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const baseHref = role === "teacher" ? "/teacher" : "/student";
              const isActive =
                location === item.href ||
                (item.href !== baseHref && location.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            {role === "teacher" && (
              <div ref={infoRef} className="relative">
                <button
                  onClick={() => setInfoOpen(!infoOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  Info
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${infoOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {infoOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-md z-50">
                    {infoItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            navigate(item.href);
                            setInfoOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Settings + Clerk UserButton (avatar / sign-out) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          {/* Clerk's built-in user button — handles sign-out, profile management */}
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
