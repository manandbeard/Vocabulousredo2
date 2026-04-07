import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from "@clerk/react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { TopNav } from "@/components/layout/TopNav";
import { useRole } from "@/hooks/use-role";
import { SynapticWeb } from "@/components/ui/synaptic-web";

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
import RoleSelector from "./pages/RoleSelector";
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

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL || undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function SignInPage() {
  return (
    <div className="min-h-screen font-['Inter'] flex items-center justify-center relative">
      <SynapticWeb />
      <div className="relative z-10 py-8">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          routingStrategy="path"
          signUpUrl={`${basePath}/sign-up`}
          afterSignInUrl="/select-role"
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen font-['Inter'] flex items-center justify-center relative">
      <SynapticWeb />
      <div className="relative z-10 py-8">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          routingStrategy="path"
          signInUrl={`${basePath}/sign-in`}
          afterSignUpUrl="/select-role"
        />
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { role, isLoaded: roleLoaded } = useRole();

  if (!authLoaded) return null;
  if (isSignedIn && !roleLoaded) return null;

  if (isSignedIn) {
    if (role === "teacher") return <Redirect to="/teacher" />;
    if (role === "student") return <Redirect to="/student" />;
    return <Redirect to="/select-role" />;
  }

  return <Landing />;
}

function ProtectedTeacher({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { role, isLoaded: roleLoaded } = useRole();
  if (!isLoaded || !roleLoaded) return null;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (role !== "teacher") return <Redirect to={role === "student" ? "/student" : "/select-role"} />;
  return <Component />;
}

function ProtectedStudent({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { role, isLoaded: roleLoaded } = useRole();
  if (!isLoaded || !roleLoaded) return null;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (role !== "student") return <Redirect to={role === "teacher" ? "/teacher" : "/select-role"} />;
  return <Component />;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <TooltipProvider>
      <TopNav />
      <Switch>
        <Route path="/" component={HomeRedirect} />

        {/* Auth */}
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/login">{() => <Redirect to="/sign-in" />}</Route>
        <Route path="/signup">{() => <Redirect to="/sign-up" />}</Route>
        <Route path="/select-role" component={RoleSelector} />

        {/* Teacher Routes */}
        <Route path="/teacher">{() => <ProtectedTeacher component={TeacherDashboard} />}</Route>
        <Route path="/teacher/classes">{() => <ProtectedTeacher component={TeacherClasses} />}</Route>
        <Route path="/teacher/classes/:id">{() => <ProtectedTeacher component={TeacherClassDetail} />}</Route>
        <Route path="/teacher/decks/:id">{() => <ProtectedTeacher component={TeacherDeckDetail} />}</Route>
        <Route path="/teacher/analytics">{() => <ProtectedTeacher component={TeacherAnalytics} />}</Route>

        {/* Student Routes */}
        <Route path="/student">{() => <ProtectedStudent component={StudentDashboard} />}</Route>
        <Route path="/student/study">{() => <ProtectedStudent component={StudentStudy} />}</Route>
        <Route path="/student/learning-lab">{() => <ProtectedStudent component={StudentLearningLab} />}</Route>
        <Route path="/student/progress">{() => <ProtectedStudent component={StudentProgress} />}</Route>
        <Route path="/student/achievements">{() => <ProtectedStudent component={StudentAchievements} />}</Route>

        {/* Public Pages */}
        <Route path="/build" component={BuildingInPublic} />
        <Route path="/pitch" component={PitchDeck} />
        <Route path="/settings" component={Settings} />

        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </TooltipProvider>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
