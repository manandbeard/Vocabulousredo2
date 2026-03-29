import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { RoleProvider, useRole } from "@/hooks/use-role";

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

// Public Pages
import BuildingInPublic from "./pages/BuildingInPublic";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function RootRedirect() {
  const { role } = useRole();
  return <Redirect to={role === "teacher" ? "/teacher" : "/student"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      
      {/* Teacher Routes */}
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/classes" component={TeacherClasses} />
      <Route path="/teacher/classes/:id" component={TeacherClassDetail} />
      <Route path="/teacher/decks/:id" component={TeacherDeckDetail} />
      <Route path="/teacher/analytics" component={TeacherAnalytics} />

      {/* Student Routes */}
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/study" component={StudentStudy} />
      <Route path="/student/progress" component={StudentProgress} />

      {/* Public Pages */}
      <Route path="/build" component={BuildingInPublic} />
      
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
            <Router />
          </WouterRouter>
        </RoleProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
