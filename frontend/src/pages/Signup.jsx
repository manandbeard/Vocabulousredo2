import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, BookOpen, Users, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import EtherealBg from '@/components/EtherealBg';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [role, setRole] = useState('student');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColors = ['', 'bg-red-400', 'bg-secondary', 'bg-primary', 'bg-tertiary'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setError(null);
    setLoading(true);
    try {
      const user = await signup(form.name, form.email, form.password, role);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative px-4 py-8">
      <EtherealBg />

      <motion.div className="w-full max-w-md relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface tracking-tight">Vocabulous</span>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-8" data-testid="signup-form">
          <h1 className="headline-md text-on-surface mb-1">Create your account</h1>
          <p className="body-md text-sm mb-6">Join thousands of learners and educators.</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setRole('student')} data-testid="role-student-btn"
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold transition-all ${role === 'student' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high/80'}`}>
              <Users className="w-4 h-4" /> Student
            </button>
            <button type="button" onClick={() => setRole('teacher')} data-testid="role-teacher-btn"
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold transition-all ${role === 'teacher' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high/80'}`}>
              <GraduationCap className="w-4 h-4" /> Teacher
            </button>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-full bg-red-50 text-sm text-red-600 font-medium" data-testid="signup-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-sm block mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={update('name')} placeholder="Jane Smith" required className="input-ethereal" data-testid="signup-name-input" />
            </div>
            <div>
              <label className="label-sm block mb-2">Email</label>
              <input type="email" value={form.email} onChange={update('email')} placeholder="you@school.edu" required className="input-ethereal" data-testid="signup-email-input" />
            </div>
            <div>
              <label className="label-sm block mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min. 6 characters" required minLength={6} className="input-ethereal pr-12" data-testid="signup-password-input" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-surface-container-high'}`} />
                    ))}
                  </div>
                  <span className="label-sm text-[10px]">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <label className="label-sm block mb-2">Confirm Password</label>
              <div className="relative">
                <input type="password" value={form.confirm} onChange={update('confirm')} placeholder="Re-enter password" className={`input-ethereal pr-12 ${form.confirm && form.confirm !== form.password ? 'ring-2 ring-red-300' : ''}`} data-testid="signup-confirm-input" />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                )}
              </div>
              {form.confirm && form.confirm !== form.password && <p className="text-xs text-red-500 mt-1 font-medium">Passwords don't match</p>}
            </div>
            <button type="submit" disabled={loading || (!!form.confirm && form.confirm !== form.password)} className="btn-primary w-full flex items-center justify-center gap-2" data-testid="signup-submit-btn">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
