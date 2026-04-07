import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import { RoleProvider, useRole, type Role } from "@/hooks/use-role";
import { TopNav } from "@/components/layout/TopNav";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherClassDetail from "./pages/teacher/TeacherClassDetail";
import TeacherDeckDetail from "./pages/teacher/TeacherDeckDetail";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentStudy from "./pages/student/StudentStudy";
import StudentProgress from "./pages/student/StudentProgress";
import StudentLearningLab from "./pages/student/StudentLearningLab";
import StudentAchievements from "./pages/student/StudentAchievements";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BuildingInPublic from "./pages/BuildingInPublic";
import PitchDeck from "./pages/PitchDeck";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  const { role, isAuthenticated, isAuthLoading } = useRole();
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }
  if (isAuthenticated && role) {
    return <Redirect to={role === "teacher" ? "/teacher" : "/student"} />;
  }
  if (isAuthenticated && !role) {
    return <Redirect to="/signup" />;
  }
  return <Landing />;
}

function RequireRole({ required, component: Component }: { required: Role; component: React.ComponentType }) {
  const { role, isAuthenticated, isAuthLoading } = useRole();
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!role) return <Redirect to="/signup" />;
  if (role !== required) return <Redirect to={role === "teacher" ? "/teacher" : "/student"} />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Root} />

      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Teacher Routes */}
      <Route path="/teacher">{() => <RequireRole required="teacher" component={TeacherDashboard} />}</Route>
      <Route path="/teacher/classes">{() => <RequireRole required="teacher" component={TeacherClasses} />}</Route>
      <Route path="/teacher/classes/:id">{() => <RequireRole required="teacher" component={TeacherClassDetail} />}</Route>
      <Route path="/teacher/decks/:id">{() => <RequireRole required="teacher" component={TeacherDeckDetail} />}</Route>
      <Route path="/teacher/analytics">{() => <RequireRole required="teacher" component={TeacherAnalytics} />}</Route>

      {/* Student Routes */}
      <Route path="/student">{() => <RequireRole required="student" component={StudentDashboard} />}</Route>
      <Route path="/student/study">{() => <RequireRole required="student" component={StudentStudy} />}</Route>
      <Route path="/student/learning-lab">{() => <RequireRole required="student" component={StudentLearningLab} />}</Route>
      <Route path="/student/progress">{() => <RequireRole required="student" component={StudentProgress} />}</Route>
      <Route path="/student/achievements">{() => <RequireRole required="student" component={StudentAchievements} />}</Route>

      {/* Public Pages */}
      <Route path="/build" component={BuildingInPublic} />
      <Route path="/pitch" component={PitchDeck} />
      <Route path="/settings" component={Settings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <TopNav />
            <Router />
          </WouterRouter>
        </RoleProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
