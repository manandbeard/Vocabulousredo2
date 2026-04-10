import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentStudy from '@/pages/student/StudentStudy';
import StudentProgress from '@/pages/student/StudentProgress';
import StudentAchievements from '@/pages/student/StudentAchievements';
import StudentResearch from '@/pages/student/StudentResearch';
import StudentBlurting from '@/pages/student/StudentBlurting';
import StudentCoach from '@/pages/student/StudentCoach';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import TeacherClasses from '@/pages/teacher/TeacherClasses';
import TeacherDeckDetail from '@/pages/teacher/TeacherDeckDetail';
import TeacherHeatmap from '@/pages/teacher/TeacherHeatmap';
import TeacherBottlenecks from '@/pages/teacher/TeacherBottlenecks';
import Settings from '@/pages/Settings';
import TopNav from '@/components/TopNav';

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Signup />} />

      {/* Student Routes */}
      <Route path="/student" element={<RequireAuth role="student"><AppLayout><StudentDashboard /></AppLayout></RequireAuth>} />
      <Route path="/student/study" element={<RequireAuth role="student"><AppLayout><StudentStudy /></AppLayout></RequireAuth>} />
      <Route path="/student/progress" element={<RequireAuth role="student"><AppLayout><StudentProgress /></AppLayout></RequireAuth>} />
      <Route path="/student/achievements" element={<RequireAuth role="student"><AppLayout><StudentAchievements /></AppLayout></RequireAuth>} />
      <Route path="/student/research" element={<RequireAuth role="student"><AppLayout><StudentResearch /></AppLayout></RequireAuth>} />
      <Route path="/student/blurting" element={<RequireAuth role="student"><AppLayout><StudentBlurting /></AppLayout></RequireAuth>} />
      <Route path="/student/coach" element={<RequireAuth role="student"><AppLayout><StudentCoach /></AppLayout></RequireAuth>} />

      {/* Teacher Routes */}
      <Route path="/teacher" element={<RequireAuth role="teacher"><AppLayout><TeacherDashboard /></AppLayout></RequireAuth>} />
      <Route path="/teacher/classes" element={<RequireAuth role="teacher"><AppLayout><TeacherClasses /></AppLayout></RequireAuth>} />
      <Route path="/teacher/decks/:deckId" element={<RequireAuth role="teacher"><AppLayout><TeacherDeckDetail /></AppLayout></RequireAuth>} />
      <Route path="/teacher/heatmap" element={<RequireAuth role="teacher"><AppLayout><TeacherHeatmap /></AppLayout></RequireAuth>} />
      <Route path="/teacher/bottlenecks" element={<RequireAuth role="teacher"><AppLayout><TeacherBottlenecks /></AppLayout></RequireAuth>} />

      {/* Shared Routes */}
      <Route path="/settings" element={<RequireAuth><AppLayout><Settings /></AppLayout></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
