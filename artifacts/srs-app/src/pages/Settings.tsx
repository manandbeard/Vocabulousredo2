import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRole } from "@/hooks/use-role";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDueCardsQueryKey } from "@workspace/api-client-react";
import { Mail, Lock, Bell, Target, Shield, LogOut, Camera, RotateCcw, AlertCircle, X } from "lucide-react";

type SettingsTab = "account" | "security" | "notifications" | "preferences";

export default function Settings() {
  const { role, userId } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [displayName, setDisplayName] = useState("Alex Rivera");
  const [bio, setBio] = useState("Lifelong learner focused on vocabulary mastery and language precision.");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetStudyProgress = async () => {
    setResetLoading(true);
    try {
      const response = await fetch(`/api/students/${userId}/reset-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Invalidate the due-cards query to refetch
        queryClient.invalidateQueries({ queryKey: getGetDueCardsQueryKey(userId) });
        setShowResetModal(false);
      } else {
        console.error("Failed to reset progress");
      }
    } catch (err) {
      console.error("Error resetting progress:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const tabs = [
    { id: "account" as const, label: "Account", icon: Mail },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "preferences" as const, label: "Preferences", icon: Target },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto font-['Inter']">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">
            Settings & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Preferences</span>
          </h1>
          <p className="text-lg text-slate-600">Manage your account and customize your learning experience.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Settings */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Profile Settings</h3>

              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                    <span className="text-5xl font-bold text-slate-400">AR</span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                  Save Changes
                </button>
                <button className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-3xl border border-blue-100 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Account Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">Email</p>
                  <p className="text-slate-700">alex.rivera@example.com</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">Role</p>
                  <p className="text-slate-700 capitalize">{role}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">Member Since</p>
                  <p className="text-slate-700">January 15, 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Account Security</h3>

              <div className="space-y-6">
                {/* Password Reset */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Change Password</h4>
                      <p className="text-sm text-slate-500">Last changed 4 months ago</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition-colors">
                      Update
                    </button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactor}
                        onChange={(e) => setTwoFactor(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Active Sessions */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Chrome on macOS</p>
                        <p className="text-xs text-slate-500">Last active 2 hours ago</p>
                      </div>
                      <button className="text-xs text-red-600 hover:text-red-700 font-medium">Sign out</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-3xl border border-yellow-100 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Security Tips</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Enable two-factor authentication</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Review active sessions regularly</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Keep your browser updated</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Notification Preferences</h3>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Email Notifications</h4>
                      <p className="text-sm text-slate-500">Receive updates about your learning progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Push Notifications</h4>
                      <p className="text-sm text-slate-500">Get alerts for due cards and milestones</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Weekly Digest */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Weekly Digest</h4>
                      <p className="text-sm text-slate-500">Receive a summary of your learning stats</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === "preferences" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Learning Preferences</h3>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-4">Difficulty Level</label>
                <div className="flex gap-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      className="px-6 py-3 rounded-lg border-2 border-slate-200 hover:border-blue-600 transition-colors font-medium text-slate-700"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-4">Daily Goal (Cards)</label>
                <input
                  type="number"
                  defaultValue={20}
                  className="w-32 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset Study Progress
                </h4>
                <p className="text-sm text-slate-600 mb-4">Clear your study progress for today and start over with all cards.</p>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="px-4 py-2 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  Reset for Today
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Reset Study Progress?</h3>
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-600 mb-6">
                This will clear your study progress for today, allowing you to review all cards again. Are you sure you want to continue?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetLoading}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetStudyProgress}
                  disabled={resetLoading}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Progress"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
