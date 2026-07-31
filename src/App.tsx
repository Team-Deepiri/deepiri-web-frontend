import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WebPushProvider } from "./contexts/WebPushContext";
import { SocketProvider } from "./contexts/SocketContext";
import { AdventureProvider } from "./contexts/AdventureContext";
import ErrorBoundary from "./components/ErrorBoundary";
import SidebarNav from "./components/SidebarNav.tsx";
import "./components/SidebarNav.css";
import Footer from "./components/Footer";
import HMRStatus from "./components/HMRStatus";
import { setupGlobalErrorHandling, setupPerformanceMonitoring } from "./utils/logger";
import Shell from "./app/Shell";
import AuthGuard from "./app/AuthGuard";
import { useAuthStore } from "./store/authStore";
import './styles/index.css';

// Public (eager — landing/auth)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Forgot from './pages/ForgotPassword.tsx';
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ComponentShowcase from "./pages/ComponentShowcase.tsx";

// Portal pages — lazy loaded (Phase 3)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdventureGenerator = lazy(() => import("./pages/AdventureGenerator"));
const AdventureDetail = lazy(() => import("./pages/AdventureDetail"));
const AdventureHistory = lazy(() => import("./pages/AdventureHistory"));
const DocumentsPage = lazy(() => import("./pages/Document.tsx"));
const DocumentDetail = lazy(() => import('./pages/LanguageIntelligence/DocumentDetail'));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const Profile = lazy(() => import("./pages/Profile"));
const Friends = lazy(() => import("./pages/Friends"));
const TaskManagement = lazy(() => import("./pages/TaskManagement"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const OpsHub = lazy(() => import("./pages/OpsHub"));
const JobsDashboard = lazy(() => import("./pages/Ops/JobsDashboard"));
const RegistryDashboard = lazy(() => import("./pages/Ops/RegistryDashboard"));
const TelemetryDashboard = lazy(() => import("./pages/Ops/TelemetryDashboard"));
const TrussDashboard = lazy(() => import("./pages/Ops/TrussDashboard"));
const RepoGraph = lazy(() => import("./pages/RepoGraph/RepoGraph"));
const AgentChat = lazy(() => import("./pages/AgentChat"));
const ProductivityChat = lazy(() => import("./pages/ProductivityChat"));
const GroupChats = lazy(() => import("./pages/GroupChats"));
const GroupChatView = lazy(() => import("./pages/GroupChatView"));
const PythonTools = lazy(() => import("./pages/PythonTools"));
const UserInventory = lazy(() => import("./pages/UserInventory"));
const ImmersiveWorkspace = lazy(() => import("./pages/ImmersiveWorkspace"));
const LeaseUpload = lazy(() => import('./pages/LanguageIntelligence/LeaseUpload'));
const LeaseDetail = lazy(() => import('./pages/LanguageIntelligence/LeaseDetail'));
const ChatWidget = lazy(() => import('./components/ChatWidget/ChatWidget'));

const EventRiver = lazy(() => import("./pages/EventRiver/EventRiver"));
const DependencyMap = lazy(() => import("./pages/DependencyMap/DependencyMap"));
const OpsDashboard = lazy(() => import("./pages/OpsDashboard/OpsDashboard"));
const PlatformPulse = lazy(() => import("./pages/Pulse/PlatformPulse"));
const SankeyJourney = lazy(() => import("./pages/Sankey/SankeyJourney"));
const Launchpad = lazy(() => import("./pages/Launchpad/Launchpad"));
const AIWorkspacePage = lazy(() =>
  import("./pages/placeholders/PortalPages").then((m) => ({ default: m.AIWorkspacePage }))
);
const TeamOpsPage = lazy(() =>
  import("./pages/placeholders/PortalPages").then((m) => ({ default: m.TeamOpsPage }))
);
const OnboardingPage = lazy(() =>
  import("./pages/placeholders/PortalPages").then((m) => ({ default: m.OnboardingPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function PortalFallback() {
  return <div className="portal-auth-loading">Loading portal…</div>;
}

const PublicShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    <div className="fixed inset-0 animated-bg opacity-30" />
    <div className="fixed inset-0 bg-pattern-overlay opacity-10" />
    <SidebarNav />
    <div className="app-main" style={{ marginLeft: 0 }}>
      <main className="app-content auth">
        <div className="site-container">{children}</div>
      </main>
      <Footer />
    </div>
    <HMRStatus />
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, token } = useAuth();
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  // Bridge AuthContext → Zustand authStore (Phase 3)
  useEffect(() => {
    if (isAuthenticated) setSession(user as never, token);
    else clearSession();
  }, [isAuthenticated, user, token, setSession, clearSession]);

  const isPublicMarketing =
    location.pathname === "/" ||
    location.pathname === "/home" ||
    location.pathname === "/about" ||
    location.pathname === "/features" ||
    location.pathname === "/contact" ||
    location.pathname === "/privacy" ||
    location.pathname === "/terms" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot" ||
    location.pathname === "/showcase";

  // Authenticated users get the Phase 3 portal shell for app routes
  if (isAuthenticated && !isPublicMarketing) {
    return (
      <>
        <Suspense fallback={<PortalFallback />}>
          <Routes>
            <Route
              element={
                <AuthGuard>
                  <Shell />
                </AuthGuard>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/ops" element={<OpsDashboard />} />
              <Route path="/ops/hub" element={<OpsHub />} />
              <Route path="/ops/jobs" element={<JobsDashboard />} />
              <Route path="/ops/registry" element={<RegistryDashboard />} />
              <Route path="/ops/truss" element={<TrussDashboard />} />
              <Route path="/ops/telemetry" element={<TelemetryDashboard />} />
              <Route path="/graph" element={<RepoGraph />} />
              <Route path="/repos/:repoId/graph" element={<RepoGraph />} />
              <Route path="/events-river" element={<EventRiver />} />
              <Route path="/dependencies" element={<DependencyMap />} />
              <Route path="/pulse" element={<PlatformPulse />} />
              <Route path="/sankey" element={<SankeyJourney />} />
              <Route path="/launchpad" element={<Launchpad />} />
              <Route path="/ai" element={<AIWorkspacePage />} />
              <Route path="/team" element={<TeamOpsPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/agent" element={<AgentChat />} />
              <Route path="/productivity-chat" element={<ProductivityChat />} />
              <Route path="/group-chats" element={<GroupChats />} />
              <Route path="/group-chats/:groupChatId" element={<GroupChatView />} />
              <Route path="/python-tools" element={<PythonTools />} />
              <Route path="/inventory" element={<UserInventory />} />
              <Route path="/workspace" element={<ImmersiveWorkspace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/adventures" element={<AdventureGenerator />} />
              <Route path="/adventures/:id" element={<AdventureDetail />} />
              <Route path="/adventure-history" element={<AdventureHistory />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/create" element={<CreateEvent />} />
              <Route path="/language-intelligence/leases/upload" element={<LeaseUpload />} />
              <Route path="/language-intelligence/leases/:id" element={<LeaseDetail />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
        <Toaster position="top-right" />
        <HMRStatus />
      </>
    );
  }

  return (
    <PublicShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/showcase" element={<ComponentShowcase />} />
        <Route path="/features" element={<About />} />
        {/* Authed deep-links hit login via AuthGuard when session exists after login redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
      <Toaster position="top-right" />
    </PublicShell>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    setupGlobalErrorHandling();
    setupPerformanceMonitoring();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebPushProvider>
            <SocketProvider>
              <AdventureProvider>
                <AppContent />
              </AdventureProvider>
            </SocketProvider>
          </WebPushProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
