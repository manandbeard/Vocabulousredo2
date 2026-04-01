import { useLocation } from "wouter";
import { BookOpen, BarChart3, Settings, LogOut, Home, Rocket, Presentation } from "lucide-react";
import { useRole } from "@/hooks/use-role";

export function TopNav() {
  const { role, setRole } = useRole();
  const [location, navigate] = useLocation();

  if (role !== "teacher") return null;

  const navItems = [
    { label: "Dashboard", href: "/teacher", icon: Home },
    { label: "Classes", href: "/teacher/classes", icon: BookOpen },
    { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
    { label: "Building in Public", href: "/build", icon: Rocket },
    { label: "Pitch Deck", href: "/pitch", icon: Presentation },
  ];

  const handleLogout = () => {
    setRole(null);
    navigate("/");
  };

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

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/teacher" && location.startsWith(item.href));
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
          </div>
        </div>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2">
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
