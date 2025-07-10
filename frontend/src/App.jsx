// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthForms from "./pages/AuthForms";
import GitHubCallback from "./pages/GitHubCallback";
import HomePage from "./pages/HomePage";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectList } from "./pages/ProjectList";
import CreateProject from "./pages/CreateProject";
import Dashboard from "./pages/Dashboard";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/styles.css";
import Profile from "./pages/Profile";

const App = () => {
    // Auth state management
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Check authentication on app load
    useEffect(() => {
        const checkAuth = () => {
            const token = Cookies.get("accessToken");
            setIsAuthenticated(!!token);
            setAuthLoading(false);
        };

        checkAuth();
    }, []);

    // Protected Route component
    const ProtectedRoute = ({ children }) => {
        if (authLoading) {
            // Show loading spinner while checking authentication
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-slate-800/90 dark:to-gray-900">
                    <div className="text-center transform -translate-y-4">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-11 w-11 border-2 border-blue-200 dark:border-gray-700 mx-auto mb-6"></div>
                            <div className="animate-spin rounded-full h-11 w-11 border-t-3 border-blue-600 dark:border-blue-400 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium tracking-wide">
                            Just a moment...
                        </p>
                        <div className="mt-2 flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                            ></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return <Navigate to="/home" replace />;
        }
        return children;
    };

    // Auth route wrapper to redirect authenticated users
    const AuthRoute = ({ children }) => {
        if (authLoading) {
            // Show loading spinner while checking authentication
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-slate-800/90 dark:to-gray-900">
                    <div className="text-center transform translate-y-2">
                        <div className="relative mb-8">
                            <div className="w-16 h-16 border-4 border-blue-100 dark:border-gray-700 rounded-full mx-auto"></div>
                            <div className="w-16 h-16 border-t-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Getting things ready
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                            Setting up your workspace...
                        </p>
                    </div>
                </div>
            );
        }

        if (isAuthenticated) {
            return <Navigate to="/dashboard" replace />;
        }
        return children;
    };

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4500,
                        style: {
                            borderRadius: "12px",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                        },
                        success: {
                            style: {
                                background:
                                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                color: "white",
                            },
                        },
                        error: {
                            style: {
                                background:
                                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                color: "white",
                            },
                        },
                        loading: {
                            style: {
                                background:
                                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                color: "white",
                            },
                        },
                    }}
                />
                <Routes>
                    {/* Home Route */}
                    <Route path="/home" element={<HomePage />} />

                    {/* Auth Routes */}
                    <Route
                        path="/auth"
                        element={
                            <AuthRoute>
                                <AuthForms
                                    setIsAuthenticated={setIsAuthenticated}
                                />
                            </AuthRoute>
                        }
                    />

                    {/* GitHub OAuth Callback */}
                    <Route
                        path="/auth/github/callback"
                        element={<GitHubCallback />}
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout
                                    setIsAuthenticated={setIsAuthenticated}
                                />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route
                            path="create-project"
                            element={<CreateProject />}
                        />
                        <Route path="projects" element={<ProjectList />} />
                        <Route
                            path="projects/:projectId"
                            element={<ProjectDetail />}
                        />
                        <Route
                            path="profile"
                            element={<Profile />}
                        />
                        <Route
                            path="help-support"
                            element={<div>Help Content</div>}
                        />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
