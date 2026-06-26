import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { Shell } from "./Shell";

const Login      = lazy(() => import("@/pages/Login/Login"));
const Home       = lazy(() => import("@/pages/Home/Home"));
const EventRiver = lazy(() => import("@/pages/EventRiver/EventRiver"));
const DependencyMap = lazy(() => import("@/pages/DependencyMap/DependencyMap"));
const Ops        = lazy(() => import("@/pages/Ops/Ops"));
const Pulse      = lazy(() => import("@/pages/Pulse/Pulse"));
const Sankey     = lazy(() => import("@/pages/Sankey/Sankey"));
const Launchpad  = lazy(() => import("@/pages/Launchpad/Launchpad"));
const AIWorkspace = lazy(() => import("@/pages/AIWorkspace/AIWorkspace"));
const TeamOps    = lazy(() => import("@/pages/TeamOps/TeamOps"));
const Onboarding = lazy(() => import("@/pages/Onboarding/Onboarding"));

const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--dim)", fontSize: 13 }}>
    Loading...
  </div>
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Shell />
            </AuthGuard>
          }
        >
          <Route index element={<Home />} />
          <Route path="events"       element={<EventRiver />} />
          <Route path="dependencies" element={<DependencyMap />} />
          <Route path="ops"          element={<Ops />} />
          <Route path="pulse"        element={<Pulse />} />
          <Route path="sankey"       element={<Sankey />} />
          <Route path="launchpad"    element={<Launchpad />} />
          <Route path="ai"           element={<AIWorkspace />} />
          <Route path="team"         element={<TeamOps />} />
          <Route path="onboarding"   element={<Onboarding />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
