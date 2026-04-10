import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Home, BookOpen, BarChart3, Trophy, Users, LogOut, BrainCircuit, FlaskConical, Brain, Activity, AlertTriangle, Settings, Moon, Sun, Sparkles } from 'lucide-react';

export default function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const studentLinks = [
    { label: 'Dashboard', href: '/student', icon: Home },
    { label: 'Study', href: '/student/study', icon: BrainCircuit },
    { label: 'Coach', href: '/student/coach', icon: Sparkles },
    { label: 'Research', href: '/student/research', icon: FlaskConical },
    { label: 'Progress', href: '/student/progress', icon: BarChart3 },
    { label: 'Achievements', href: '/student/achievements', icon: Trophy },
  ];

  const teacherLinks = [
    { label: 'Dashboard', href: '/teacher', icon: Home },
    { label: 'Classes', href: '/teacher/classes', icon: Users },
    { label: 'Heatmap', href: '/teacher/heatmap', icon: Activity },
    { label: 'Bottlenecks', href: '/teacher/bottlenecks', icon: AlertTriangle },
  ];

  const links = user.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <nav className="sticky top-0 z-50 glass-panel" data-testid="top-nav">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          to={user.role === 'teacher' ? '/teacher' : '/student'}
          className="flex items-center gap-2.5 group"
          data-testid="nav-logo"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-on-surface tracking-tight">Vocabulous</span>
        </Link>

        <div className="flex items-center gap-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href ||
              (link.href !== '/teacher' && link.href !== '/student' && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <Link to="/settings" data-testid="nav-settings-btn" className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all">
            <Settings className="w-4 h-4" />
          </Link>
          <span className="label-sm text-on-surface-variant hidden md:inline">{user.name}</span>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
