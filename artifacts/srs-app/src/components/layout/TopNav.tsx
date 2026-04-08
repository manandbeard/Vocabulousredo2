import { useLocation } from "wouter";
import { BookOpen, BarChart3, Settings, LogOut, Home, Rocket, Presentation, ChevronDown, Info, BrainCircuit, TrendingUp, LogIn, UserPlus } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useRole } from "@/hooks/use-role";

export function TopNav() {
  const { role, signOut } = useRole();
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!role) {
    return (
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">V</span>
            </div>
            <span>Vocabulous²</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/build")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === "/build" ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Rocket className="w-4 h-4" />
              Building in Public
            </button>
            <button
              onClick={() => navigate("/pitch")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === "/pitch" ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Presentation className="w-4 h-4" />
              Pitch Deck
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Sign up
            </button>
          </div>
        </div>
      </nav>
    );
  }

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
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate(role === "teacher" ? "/teacher" : "/student")}
            className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">V</span>
            </div>
            <span>Vocabulous²</span>
          </button>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const baseHref = role === "teacher" ? "/teacher" : "/student";
              const isActive = location === item.href || (item.href !== baseHref && location.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                  <ChevronDown className={`w-4 h-4 transition-transform ${infoOpen ? "rotate-180" : ""}`} />
                </button>

                {infoOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-md z-50">
                    {infoItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <button
                          key={item.href}
                          onClick={() => { navigate(item.href); setInfoOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
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

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/settings")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
