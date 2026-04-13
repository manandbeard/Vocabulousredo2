import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSidebar } from '@/hooks/useSidebar';
import {
  Home, BookOpen, BarChart3, Trophy, Users, LogOut, BrainCircuit,
  FlaskConical, Brain, Activity, AlertTriangle, Settings, Moon, Sun,
  Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';

const studentLinks = [
  { label: 'Dashboard', href: '/student', icon: Home },
  { label: 'Study', href: '/student/study', icon: BrainCircuit },
  { label: 'Coach', href: '/student/coach', icon: Sparkles },
  { label: 'Research', href: '/student/research', icon: FlaskConical },
  { label: 'Blurting', href: '/student/blurting', icon: Brain },
  { label: 'Progress', href: '/student/progress', icon: BarChart3 },
  { label: 'Achievements', href: '/student/achievements', icon: Trophy },
];

const teacherLinks = [
  { label: 'Dashboard', href: '/teacher', icon: Home },
  { label: 'Classes', href: '/teacher/classes', icon: Users },
  { label: 'Heatmap', href: '/teacher/heatmap', icon: Activity },
  { label: 'Bottlenecks', href: '/teacher/bottlenecks', icon: AlertTriangle },
];

// Pick the 5 most important links for the mobile bottom bar
const studentMobileLinks = [
  { label: 'Home', href: '/student', icon: Home },
  { label: 'Study', href: '/student/study', icon: BrainCircuit },
  { label: 'Coach', href: '/student/coach', icon: Sparkles },
  { label: 'Progress', href: '/student/progress', icon: BarChart3 },
  { label: 'More', href: null, icon: null }, // handled specially
];

const teacherMobileLinks = [
  { label: 'Home', href: '/teacher', icon: Home },
  { label: 'Classes', href: '/teacher/classes', icon: Users },
  { label: 'Heatmap', href: '/teacher/heatmap', icon: Activity },
  { label: 'Bottlenecks', href: '/teacher/bottlenecks', icon: AlertTriangle },
];

function isActive(pathname, href, role) {
  if (!href) return false;
  const base = role === 'teacher' ? '/teacher' : '/student';
  if (href === base) return pathname === base;
  return pathname === href || pathname.startsWith(href + '/');
}

/* ─── Desktop Sidebar ─────────────────────────────────────────────────────── */
export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { expanded, toggle: toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = user.role === 'teacher' ? teacherLinks : studentLinks;
  const homeHref = user.role === 'teacher' ? '/teacher' : '/student';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      data-testid="sidebar"
      className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-out ${
        expanded ? 'w-56' : 'w-[68px]'
      }`}
      style={{ background: 'var(--sidebar-bg, rgba(248,246,250,0.85))', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 pt-5 pb-3 ${expanded ? '' : 'justify-center'}`}>
        <Link to={homeHref} className="flex items-center gap-2.5 shrink-0" data-testid="nav-logo">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          {expanded && <span className="text-lg font-bold text-on-surface tracking-tight">Vocabulous</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        data-testid="sidebar-toggle"
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface-container-lowest shadow-ambient flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors z-10"
      >
        {expanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Section label */}
      {expanded && (
        <div className="px-5 pt-4 pb-1">
          <span className="label-sm text-[10px] text-on-surface-variant/60">{user.role === 'teacher' ? 'TEACHING' : 'LEARNING'}</span>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5 pt-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(location.pathname, link.href, user.role);
          return (
            <Link
              key={link.href}
              to={link.href}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              title={!expanded ? link.label : undefined}
              className={`group flex items-center gap-3 rounded-2xl transition-all duration-200 ${
                expanded ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'
              } ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-primary' : ''}`} />
              {expanded && <span className="text-sm font-semibold truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={`flex flex-col gap-0.5 px-2.5 pb-4 pt-2 ${expanded ? '' : 'items-center'}`}
        style={{ borderTop: '1px solid rgba(46,46,50,0.06)' }}>
        <button
          onClick={toggleTheme}
          data-testid="theme-toggle-btn"
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          className={`flex items-center gap-3 rounded-2xl transition-all duration-200 text-on-surface-variant hover:text-primary hover:bg-primary/10 ${
            expanded ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'
          }`}
        >
          {theme === 'light' ? <Moon className="w-[18px] h-[18px] shrink-0" /> : <Sun className="w-[18px] h-[18px] shrink-0" />}
          {expanded && <span className="text-sm font-semibold">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
        </button>

        <Link
          to="/settings"
          data-testid="nav-settings-btn"
          title={!expanded ? 'Settings' : undefined}
          className={`flex items-center gap-3 rounded-2xl transition-all duration-200 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 ${
            expanded ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'
          } ${location.pathname === '/settings' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {expanded && <span className="text-sm font-semibold">Settings</span>}
        </Link>

        {/* User info + logout */}
        <div className={`flex items-center gap-2 mt-1 ${expanded ? 'px-3.5 py-2' : 'justify-center py-2'}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-[10px] text-on-surface-variant truncate capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            title="Logout"
            className="p-1.5 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─── Mobile Bottom Bar ───────────────────────────────────────────────────── */
export function BottomBar() {
  const { user } = useAuth();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const allLinks = user.role === 'teacher' ? teacherLinks : studentLinks;

  // Show first 4 + "More" for student, or all 4 for teacher
  const primaryLinks = allLinks.slice(0, 4);
  const overflowLinks = allLinks.slice(4);
  const hasOverflow = overflowLinks.length > 0;

  return (
    <>
      {/* Overflow tray */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-surface-container-lowest rounded-t-[2rem] shadow-float p-4 space-y-1" onClick={(e) => e.stopPropagation()} data-testid="mobile-more-tray">
            {overflowLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(location.pathname, link.href, user.role);
              return (
                <button
                  key={link.href}
                  onClick={() => { navigate(link.href); setShowMore(false); }}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{link.label}</span>
                </button>
              );
            })}
            {/* Settings in overflow */}
            <button
              onClick={() => { navigate('/settings'); setShowMore(false); }}
              data-testid="nav-settings-btn-mobile"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                location.pathname === '/settings' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-semibold">Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} data-testid="bottom-bar">
        <div className="flex items-center justify-around px-2 py-1.5">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(location.pathname, link.href, user.role);
            return (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all min-w-0 ${
                  active ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold truncate">{link.label}</span>
              </Link>
            );
          })}
          {hasOverflow && (
            <button
              onClick={() => setShowMore(!showMore)}
              data-testid="mobile-more-btn"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${
                showMore ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
              <span className="text-[10px] font-semibold">More</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

/* Legacy default export kept so old imports don't break */
export default function TopNav() {
  return null; /* Replaced by Sidebar + BottomBar */
}
