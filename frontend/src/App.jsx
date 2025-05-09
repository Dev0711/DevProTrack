import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AuthGuard from "./components/auth/AuthGuard";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Views
import Dashboard from "./views/Dashboard";
import Repositories from "./views/Repositories";
import RepositoryDetail from "./views/RepositoryDetail";
import Settings from "./views/Settings";
import NotFound from "./views/NotFound";

// Auth context
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/repositories/:id" element={<RepositoryDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
