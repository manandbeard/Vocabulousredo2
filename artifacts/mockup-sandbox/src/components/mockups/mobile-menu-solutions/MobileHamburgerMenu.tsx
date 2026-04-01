import { useState } from "react";
import { Menu, X, Home, Brain, Trending2, BarChart3, Info, Settings, LogOut } from "lucide-react";

export default function MobileHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      {/* TopNav - Mobile Friendly */}
      <nav className="sticky top-0 bg-white border-b border-slate-200 shadow-sm px-4 py-4 flex items-center justify-between z-50">
        <div className="text-lg font-black text-blue-600">Vocabulous²</div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <X className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 top-20 bg-black/30 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] bg-white border-r border-slate-200 shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col h-full p-4">
          <div className="space-y-2 flex-1">
            {[
              { icon: Home, label: "Dashboard", active: true },
              { icon: Brain, label: "Study" },
              { icon: Trending2, label: "Learning Lab" },
              { icon: BarChart3, label: "Progress" },
              { icon: Info, label: "Building in Public" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600 text-sm">Your learning overview</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
              <div className="text-xs text-slate-500 font-medium">Due Cards</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
