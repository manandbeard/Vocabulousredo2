import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Palette, Moon, Sun, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { settingsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function Settings() {
  const { user, refetch } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwErr, setPwErr] = useState(null);

  useEffect(() => {
    settingsApi.get().then(s => { setSettings(s); setName(s.name); }).catch(() => {});
  }, []);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const updated = await settingsApi.update({ name });
      setSettings(updated);
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try { await settingsApi.update({ theme: newTheme }); } catch {}
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwErr("Passwords don't match"); return; }
    if (pwForm.newPw.length < 6) { setPwErr("Min. 6 characters"); return; }
    setPwSaving(true);
    setPwErr(null);
    setPwMsg(null);
    try {
      await settingsApi.changePassword({ current_password: pwForm.current, new_password: pwForm.newPw });
      setPwMsg("Password updated!");
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.detail || "Failed to change password");
    }
    setPwSaving(false);
  };

  return (
    <motion.div className="max-w-2xl mx-auto space-y-8" variants={stagger} initial="hidden" animate="show" data-testid="settings-page">
      <motion.div variants={fadeUp}>
        <p className="label-md text-primary mb-2">Settings</p>
        <h1 className="headline-lg text-on-surface">Your account</h1>
      </motion.div>

      {/* Profile Section */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6" data-testid="settings-profile">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-on-surface">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label-sm block mb-2">Name</label>
            <div className="flex gap-3">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-ethereal flex-1" data-testid="settings-name-input" />
              <button onClick={handleSaveName} disabled={saving || name === settings?.name} className="btn-primary text-sm py-2 px-5 flex items-center gap-2" data-testid="settings-save-name">
                {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? '...' : 'Save'}
              </button>
            </div>
          </div>
          <div>
            <label className="label-sm block mb-2">Email</label>
            <input type="email" value={settings?.email || ''} disabled className="input-ethereal opacity-60" />
          </div>
          <div>
            <label className="label-sm block mb-2">Role</label>
            <span className="inline-block label-sm text-primary bg-primary/8 px-3 py-1.5 rounded-full capitalize">{settings?.role}</span>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6" data-testid="settings-appearance">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-on-surface">Appearance</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            data-testid="theme-light-btn"
            className={`flex items-center gap-3 p-4 rounded-[1.5rem] transition-all ${theme === 'light' ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
          >
            <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-primary' : 'text-on-surface-variant'}`} />
            <div className="text-left">
              <p className={`text-sm font-bold ${theme === 'light' ? 'text-primary' : 'text-on-surface'}`}>Light</p>
              <p className="text-xs text-on-surface-variant">Ethereal pastels</p>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-primary ml-auto" />}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            data-testid="theme-dark-btn"
            className={`flex items-center gap-3 p-4 rounded-[1.5rem] transition-all ${theme === 'dark' ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
          >
            <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-on-surface-variant'}`} />
            <div className="text-left">
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-primary' : 'text-on-surface'}`}>Dark</p>
              <p className="text-xs text-on-surface-variant">Easy on the eyes</p>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-primary ml-auto" />}
          </button>
        </div>
      </motion.div>

      {/* Password */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6" data-testid="settings-password">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-tertiary" />
          </div>
          <h2 className="text-lg font-bold text-on-surface">Change Password</h2>
        </div>
        {pwMsg && <div className="mb-4 px-4 py-2.5 rounded-full bg-tertiary/10 text-sm text-tertiary font-semibold">{pwMsg}</div>}
        {pwErr && <div className="mb-4 px-4 py-2.5 rounded-full bg-red-50 text-sm text-red-600 font-semibold" data-testid="password-error">{pwErr}</div>}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label-sm block mb-2">Current Password</label>
            <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required className="input-ethereal" data-testid="current-password-input" />
          </div>
          <div>
            <label className="label-sm block mb-2">New Password</label>
            <input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} required minLength={6} className="input-ethereal" data-testid="new-password-input" />
          </div>
          <div>
            <label className="label-sm block mb-2">Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required className="input-ethereal" data-testid="confirm-password-input" />
          </div>
          <button type="submit" disabled={pwSaving} className="btn-primary text-sm" data-testid="change-password-btn">
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
