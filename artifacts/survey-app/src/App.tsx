import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SurveyEditor from "@/pages/survey-editor";
import SurveyTake from "@/pages/survey-take";
import SurveyResults from "@/pages/survey-results";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile" component={Profile} />
      <Route path="/surveys/new" component={SurveyEditor} />
      <Route path="/surveys/:id/edit" component={SurveyEditor} />
      <Route path="/surveys/:id/results" component={SurveyResults} />
      <Route path="/surveys/:id" component={SurveyTake} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;