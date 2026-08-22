import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { DataProvider } from "./context/DataContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Researchers from "./pages/Researchers";
import Publications from "./pages/Publications";
import Collaborations from "./pages/Collaborations";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Conferences from "./pages/Conferences";
import Institutions from "./pages/Institutions";
import Citations from "./pages/Citations";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <DataProvider>
      <Router>

        <Routes>

          {/* Login */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Main Pages */}
          <Route
            path="/researchers"
            element={<Researchers />}
          />

          <Route
            path="/publications"
            element={<Publications />}
          />

          <Route
            path="/collaborations"
            element={<Collaborations />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/conferences"
            element={<Conferences />}
          />

          <Route
            path="/institutions"
            element={<Institutions />}
          />

          <Route
            path="/citations"
            element={<Citations />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* Unknown route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </Router>
    </DataProvider>
  );
}