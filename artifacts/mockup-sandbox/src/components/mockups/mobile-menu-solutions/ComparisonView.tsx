import { useState } from "react";
import { Menu, X, Home, Brain, Trending2, BarChart3, Mail, Shield, Bell, Target, ChevronRight } from "lucide-react";

export default function ComparisonView() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Mobile Menu Solutions</h1>

      {/* Solution 1: Hamburger Menu */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
          Hamburger Menu with Drawer
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Phone mockup */}
          <div className="max-w-sm mx-auto bg-white">
            {/* TopNav */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
              <div className="text-sm font-bold text-blue-600">Vocabulous²</div>
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                {drawerOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Drawer */}
            {drawerOpen && (
              <>
                <div className="fixed inset-0 bg-black/30 z-40 w-full" />
                <div className="fixed left-0 top-20 w-48 bg-white border-r border-slate-200 shadow-lg z-40 space-y-1 p-2">
                  {[
                    { icon: Home, label: "Dashboard" },
                    { icon: Brain, label: "Study" },
                    { icon: Trending2, label: "Learning Lab" },
                    { icon: BarChart3, label: "Progress" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-900 mb-1">Benefits:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>✓ Saves screen space</li>
                  <li>✓ Familiar pattern</li>
                  <li>✓ Easy to implement</li>
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-yellow-900 mb-1">Consideration:</p>
                <p className="text-xs text-yellow-700">Users must tap to see nav items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solution 2: Scrollable Tabs */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
          Horizontal Scrollable Tabs
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="max-w-sm mx-auto bg-white">
            {/* Header */}
            <div className="px-4 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Settings</h3>
            </div>

            {/* Scrollable Tabs */}
            <div className="overflow-x-auto border-b border-slate-200 px-4">
              <div className="flex gap-2 py-3">
                {[
                  { icon: Mail, label: "Account" },
                  { icon: Shield, label: "Security" },
                  { icon: Bell, label: "Notifications" },
                  { icon: Target, label: "Prefs" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.label}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium whitespace-nowrap"
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-900 mb-1">Benefits:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>✓ All tabs visible</li>
                  <li>✓ No hidden navigation</li>
                  <li>✓ Quick switching</li>
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-yellow-900 mb-1">Consideration:</p>
                <p className="text-xs text-yellow-700">May need scroll indicators on narrow screens</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solution 3: Stacked Vertical Tabs */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
          Stacked Vertical Tabs
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="max-w-sm mx-auto bg-white">
            {/* Header */}
            <div className="px-4 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Settings</h3>
            </div>

            {/* Vertical Tabs */}
            <div className="border-b border-slate-200 px-4 py-2 space-y-2">
              {[
                { icon: Mail, label: "Account", active: true },
                { icon: Shield, label: "Security" },
                { icon: Bell, label: "Notifications" },
                { icon: Target, label: "Preferences" },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-medium transition-colors ${
                      tab.active
                        ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-900 mb-1">Benefits:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>✓ Full-width targets</li>
                  <li>✓ Easy to tap</li>
                  <li>✓ Clear labels</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-900 mb-1">Best for:</p>
                <p className="text-xs text-green-700">Mobile-first design with many options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
