import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRole } from "@/hooks/use-role";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDueCardsQueryKey,
  useGetUser,
  usePatchUser,
  useChangePassword,
} from "@workspace/api-client-react";
import { Mail, Lock, Bell, Target, Shield, Camera, RotateCcw, AlertCircle, X, Check } from "lucide-react";

type SettingsTab = "account" | "security" | "notifications" | "preferences";

export default function Settings() {
  const { role, userId } = useRole();
  const safeUserId = userId ?? 0;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const { data: userData, isLoading } = useGetUser(safeUserId, {
    query: { enabled: safeUserId > 0 },
  });

  const patchUserMutation = usePatchUser();
  const changePasswordMutation = useChangePassword();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [savedBio, setSavedBio] = useState("");
  const [accountSaveStatus, setAccountSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [notifSaveStatus, setNotifSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const [difficultyLevel, setDifficultyLevel] = useState("Intermediate");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [prefSaveStatus, setPrefSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.name ?? "");
      setSavedDisplayName(userData.name ?? "");
      setBio(userData.bio ?? "");
      setSavedBio(userData.bio ?? "");
      setEmailNotifications(userData.emailNotifications ?? true);
      setPushNotifications(userData.pushNotifications ?? false);
      setWeeklyDigest(userData.weeklyDigest ?? true);
      setDifficultyLevel(userData.difficultyLevel ?? "Intermediate");
      setDailyGoal(userData.dailyGoal ?? 20);
    }
  }, [userData]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveAccount = async () => {
    setAccountSaveStatus("saving");
    try {
      await patchUserMutation.mutateAsync({ id: safeUserId, data: { name: displayName, bio } });
      setSavedDisplayName(displayName);
      setSavedBio(bio);
      setAccountSaveStatus("success");
      setTimeout(() => setAccountSaveStatus("idle"), 3000);
    } catch {
      setAccountSaveStatus("error");
      setTimeout(() => setAccountSaveStatus("idle"), 3000);
    }
  };

  const handleCancelAccount = () => {
    setDisplayName(savedDisplayName);
    setBio(savedBio);
  };

  const handleSaveNotifications = async () => {
    setNotifSaveStatus("saving");
    try {
      await patchUserMutation.mutateAsync({
        id: safeUserId,
        data: { emailNotifications, pushNotifications, weeklyDigest },
      });
      setNotifSaveStatus("success");
      setTimeout(() => setNotifSaveStatus("idle"), 3000);
    } catch {
      setNotifSaveStatus("error");
      setTimeout(() => setNotifSaveStatus("idle"), 3000);
    }
  };

  const handleSavePreferences = async () => {
    setPrefSaveStatus("saving");
    try {
      await patchUserMutation.mutateAsync({ id: safeUserId, data: { difficultyLevel, dailyGoal } });
      setPrefSaveStatus("success");
      setTimeout(() => setPrefSaveStatus("idle"), 3000);
    } catch {
      setPrefSaveStatus("error");
      setTimeout(() => setPrefSaveStatus("idle"), 3000);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    setPasswordSaveStatus("saving");
    try {
      await changePasswordMutation.mutateAsync({
        id: safeUserId,
        data: { currentPassword, newPassword },
      });
      setPasswordSaveStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSaveStatus("idle");
        setShowPasswordForm(false);
      }, 3000);
    } catch (err: unknown) {
      setPasswordSaveStatus("idle");
      if (err && typeof err === "object" && "data" in err) {
        const apiErr = err as { data?: { error?: string } };
        setPasswordError(apiErr.data?.error ?? "Failed to change password.");
      } else {
        setPasswordError("Failed to change password.");
      }
    }
  };

  const handleResetStudyProgress = async () => {
    setResetLoading(true);
    try {
      const response = await fetch(`/api/students/${safeUserId}/reset-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: getGetDueCardsQueryKey(safeUserId) });
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto font-['Inter'] flex items-center justify-center min-h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

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
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                    <span className="text-5xl font-bold text-blue-600">
                      {displayName ? getInitials(displayName) : "?"}
                    </span>
                  </div>
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
                      placeholder="Tell us a little about yourself..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {accountSaveStatus === "error" && (
                <p className="text-red-600 text-sm mb-4">Failed to save changes. Please try again.</p>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-200 items-center">
                <button
                  onClick={handleSaveAccount}
                  disabled={accountSaveStatus === "saving"}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {accountSaveStatus === "saving" ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
                  ) : accountSaveStatus === "success" ? (
                    <><Check className="w-4 h-4" /> Saved!</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={handleCancelAccount}
                  disabled={accountSaveStatus === "saving"}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-colors disabled:opacity-50"
                >
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
                  <p className="text-slate-700">{userData?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">Role</p>
                  <p className="text-slate-700 capitalize">{role}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-1">Member Since</p>
                  <p className="text-slate-700">
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
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
                {/* Password Change */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Change Password</h4>
                      <p className="text-sm text-slate-500">Update your account password</p>
                    </div>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                      >
                        Update
                      </button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                        />
                      </div>

                      {passwordError && (
                        <p className="text-red-600 text-sm">{passwordError}</p>
                      )}

                      <div className="flex gap-3 items-center">
                        <button
                          onClick={handleChangePassword}
                          disabled={passwordSaveStatus === "saving"}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {passwordSaveStatus === "saving" ? (
                            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
                          ) : passwordSaveStatus === "success" ? (
                            <><Check className="w-4 h-4" /> Password Changed!</>
                          ) : (
                            "Update Password"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                            setPasswordError("");
                            setPasswordSaveStatus("idle");
                          }}
                          disabled={passwordSaveStatus === "saving"}
                          className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Session */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Current Session</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-600">
                      You are currently signed in. Your session is managed securely via an HTTP-only cookie.
                    </p>
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
                  <span>Never share your password</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span>Sign out when using shared devices</span>
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
                    <button
                      role="switch"
                      aria-checked={emailNotifications}
                      aria-label="Email Notifications"
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${emailNotifications ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${emailNotifications ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Push Notifications</h4>
                      <p className="text-sm text-slate-500">Get alerts for due cards and milestones</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={pushNotifications}
                      aria-label="Push Notifications"
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${pushNotifications ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${pushNotifications ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                {/* Weekly Digest */}
                <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Weekly Digest</h4>
                      <p className="text-sm text-slate-500">Receive a summary of your learning stats</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={weeklyDigest}
                      aria-label="Weekly Digest"
                      onClick={() => setWeeklyDigest(!weeklyDigest)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${weeklyDigest ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${weeklyDigest ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                {notifSaveStatus === "error" && (
                  <p className="text-red-600 text-sm">Failed to save preferences. Please try again.</p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={notifSaveStatus === "saving"}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {notifSaveStatus === "saving" ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
                    ) : notifSaveStatus === "success" ? (
                      <><Check className="w-4 h-4" /> Saved!</>
                    ) : (
                      "Save Preferences"
                    )}
                  </button>
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
                      onClick={() => setDifficultyLevel(level)}
                      className={`px-6 py-3 rounded-lg border-2 transition-colors font-medium ${
                        difficultyLevel === level
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-blue-600 text-slate-700"
                      }`}
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
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  min={1}
                  max={500}
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

              {prefSaveStatus === "error" && (
                <p className="text-red-600 text-sm">Failed to save preferences. Please try again.</p>
              )}

              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={handleSavePreferences}
                  disabled={prefSaveStatus === "saving"}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {prefSaveStatus === "saving" ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
                  ) : prefSaveStatus === "success" ? (
                    <><Check className="w-4 h-4" /> Saved!</>
                  ) : (
                    "Save Preferences"
                  )}
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
