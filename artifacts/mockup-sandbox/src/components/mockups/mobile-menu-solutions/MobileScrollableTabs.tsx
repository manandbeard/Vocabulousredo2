import { useState, useRef } from "react";
import { Mail, Shield, Bell, Target, ChevronLeft, ChevronRight } from "lucide-react";

export default function MobileScrollableTabs() {
  const [activeTab, setActiveTab] = useState("account");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "account", label: "Account", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Target },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your preferences</p>
      </div>

      {/* Scrollable Tabs */}
      <div className="relative bg-white border-b border-slate-200 px-4">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 h-full px-2 bg-gradient-to-r from-white to-transparent flex items-center justify-center z-10 hidden sm:flex"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>

        {/* Tab Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide py-3"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 h-full px-2 bg-gradient-to-l from-white to-transparent flex items-center justify-center z-10 hidden sm:flex"
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto">
        {activeTab === "account" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Alex Rivera"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500">Enabled</p>
                </div>
                <div className="w-10 h-6 bg-blue-600 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Notifications</h2>
            <p className="text-sm text-slate-600">Configure your notification preferences</p>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Learning Preferences</h2>
            <p className="text-sm text-slate-600">Customize your learning experience</p>
          </div>
        )}
      </div>
    </div>
  );
}
