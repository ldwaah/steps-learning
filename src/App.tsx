import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ApiBootstrap from "./components/ApiBootstrap";
import StudentLayout from "./components/StudentLayout";
import { getCurrentUser } from "./lib/authSession";
import ActivityPage from "./pages/ActivityPage";
import CheckInPage from "./pages/CheckInPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import PathwaysPage from "./pages/PathwaysPage";
import ProgressPage from "./pages/ProgressPage";
import RegulatePage from "./pages/RegulatePage";
import StaffQualityPage from "./pages/StaffQualityPage";
import TopicPage from "./pages/TopicPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <ApiBootstrap>
    <Routes>
      <Route
        path="/"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <StudentLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/pathways" element={<PathwaysPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/regulate" element={<RegulatePage />} />
        <Route path="/staff-quality" element={<StaffQualityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ApiBootstrap>
  );
}
