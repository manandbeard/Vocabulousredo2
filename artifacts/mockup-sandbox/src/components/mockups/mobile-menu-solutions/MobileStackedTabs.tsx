import { useState } from "react";
import { Mail, Shield, Bell, Target } from "lucide-react";

export default function MobileStackedTabs() {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Account", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Target },
  ];

  return (
    <div className="w-full h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your preferences</p>
      </div>

      {/* Stacked Vertical Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
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
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="alex@example.com"
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
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">Changed 4 months ago</p>
                </div>
                <button className="text-xs text-blue-600 font-medium">Update</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Updates</p>
                  <p className="text-xs text-slate-500">Learning progress</p>
                </div>
                <div className="w-10 h-6 bg-blue-600 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                  <p className="text-xs text-slate-500">Card reminders</p>
                </div>
                <div className="w-10 h-6 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Learning Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium hover:border-blue-600"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
