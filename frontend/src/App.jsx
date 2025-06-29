// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthForms from "./pages/AuthForms";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectList } from "./pages/ProjectList";
import CreateProject from "./pages/CreateProject";
import Dashboard from "./pages/Dashboard";
import { ThemeProvider } from "./contexts/ThemeContext";

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
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Loading...
                        </p>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            console.log("Not authenticated");
            return <Navigate to="/auth" replace />;
        }
        return children;
    };

    // Auth route wrapper to redirect authenticated users
    const AuthRoute = ({ children }) => {
        if (authLoading) {
            // Show loading spinner while checking authentication
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Loading...
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
                        success: {
                            style: {
                                background: "#22c55e",
                                color: "white",
                            },
                        },
                        error: {
                            style: {
                                background: "#ef4444",
                                color: "white",
                            },
                        },
                        loading: {
                            style: {
                                background: "#8b5cf6",
                                color: "white",
                            },
                        },
                    }}
                />
                <Routes>
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
                            element={<div>Profile Content</div>}
                        />
                        <Route
                            path="help-support"
                            element={<div>Help Content</div>}
                        />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
