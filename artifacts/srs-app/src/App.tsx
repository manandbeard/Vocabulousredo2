import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useAuth } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { RoleProvider, useRole } from "@/hooks/use-role";
import { TopNav } from "@/components/layout/TopNav";
import OnboardingPage from "@/pages/OnboardingPage";

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

// Root redirect logic
function Root() {
  const { isSignedIn } = useAuth();
  const { role, isLoading, needsOnboarding } = useRole();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) return <Landing />;
  if (needsOnboarding) return <OnboardingPage />;
  if (role === "teacher") return <Redirect to="/teacher" />;
  if (role === "student") return <Redirect to="/student" />;
  return <Landing />;
}

// Guard for teacher routes
function TeacherGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { role, isLoading, needsOnboarding } = useRole();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (needsOnboarding) return <OnboardingPage />;
  if (role !== "teacher") return <Redirect to="/student" />;
  return <>{children}</>;
}

// Guard for student routes
function StudentGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { role, isLoading, needsOnboarding } = useRole();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (needsOnboarding) return <OnboardingPage />;
  if (role !== "student") return <Redirect to="/teacher" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Root} />

      {/* Clerk-hosted auth pages */}
      <Route path="/sign-in">
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/" />
        </div>
      </Route>
      <Route path="/sign-up">
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/" />
        </div>
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher">
        <TeacherGuard><TeacherDashboard /></TeacherGuard>
      </Route>
      <Route path="/teacher/classes">
        <TeacherGuard><TeacherClasses /></TeacherGuard>
      </Route>
      <Route path="/teacher/classes/:id">
        <TeacherGuard><TeacherClassDetail /></TeacherGuard>
      </Route>
      <Route path="/teacher/decks/:id">
        <TeacherGuard><TeacherDeckDetail /></TeacherGuard>
      </Route>
      <Route path="/teacher/analytics">
        <TeacherGuard><TeacherAnalytics /></TeacherGuard>
      </Route>

      {/* Student Routes */}
      <Route path="/student">
        <StudentGuard><StudentDashboard /></StudentGuard>
      </Route>
      <Route path="/student/study">
        <StudentGuard><StudentStudy /></StudentGuard>
      </Route>
      <Route path="/student/learning-lab">
        <StudentGuard><StudentLearningLab /></StudentGuard>
      </Route>
      <Route path="/student/progress">
        <StudentGuard><StudentProgress /></StudentGuard>
      </Route>
      <Route path="/student/achievements">
        <StudentGuard><StudentAchievements /></StudentGuard>
      </Route>

      {/* Public Pages */}
      <Route path="/build" component={BuildingInPublic} />
      <Route path="/pitch" component={PitchDeck} />
      <Route path="/settings" component={Settings} />

      <Route component={NotFound} />
    </Switch>
  );
}

// Clerk publishable key — set VITE_CLERK_PUBLISHABLE_KEY in the environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
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
    </ClerkProvider>
  );
}

export default App;
