// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthForms from './pages/AuthForms';
import Cookies from "js-cookie";
import { Toaster } from 'react-hot-toast';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectList } from './pages/ProjectList';
import CreateProject from './pages/CreateProject';



const App = () => {
  // Simple auth check function
  const isAuthenticated = () => {
    return !!Cookies.get('accessToken');
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/auth" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Toaster
            position="top-right"
            toastOptions={{
                success: {
                    style: {
                        background: "#10B981",
                        color: "white",
                    },
                },
                error: {
                    style: {
                        background: "#EF4444",
                        color: "white",
                    },
                },
                loading: {
                    style: {
                        background: "#6366F1",
                        color: "white",
                    },
                },
            }}
        />
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthForms />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<div>Dashboard Content</div>} />
          <Route path="create-project" element={<CreateProject />} />
          <Route path="projects" element={<ProjectList />}/>
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="profile" element={<div>Profile Content</div>} />
          <Route path="help-support" element={<div>Help Content</div>} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;