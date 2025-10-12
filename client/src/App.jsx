import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

// Services
import { authService } from "./services/authService";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Check if we're in demo mode (you can set this in your .env file)
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  if (isDemoMode) {
    return children; // Bypass auth in demo mode
  }

  return authService.isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  return authService.isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
};

export default App;
