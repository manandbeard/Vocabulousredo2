import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import EtherealBg from '@/components/EtherealBg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative px-4">
      <EtherealBg />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface tracking-tight">Vocabulous</span>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-8" data-testid="login-form">
          <h1 className="headline-md text-on-surface mb-1">Welcome back</h1>
          <p className="body-md text-sm mb-6">Sign in to continue learning.</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-full bg-red-50 text-sm text-red-600 font-medium" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-sm block mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu" required
                className="input-ethereal" data-testid="login-email-input"
              />
            </div>
            <div>
              <label className="label-sm block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  className="input-ethereal pr-12" data-testid="login-password-input"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" data-testid="login-submit-btn">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-4 bg-primary/5 rounded-full px-5 py-3 text-center">
            <p className="text-xs text-on-surface-variant">
              Demo: <span className="font-semibold text-primary">teacher@vocabulous.app</span> / teacher123
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Or: <span className="font-semibold text-secondary">student@vocabulous.app</span> / student123
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
