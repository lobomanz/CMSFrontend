import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../auth/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';

// CRUD Pages
// About Us
import AboutUsDetailPage from '../pages/about-us/AboutUsDetailPage';
import AboutUsEditPage from '../pages/about-us/AboutUsEditPage';
import AboutUsCreatePage from '../pages/about-us/AboutUsCreatePage';

// Blog
import BlogListPage from '../pages/blog/BlogListPage';
import BlogDetailPage from '../pages/blog/BlogDetailPage';
import BlogEditPage from '../pages/blog/BlogEditPage';
import BlogCreatePage from '../pages/blog/BlogCreatePage';

// Contact Info
import ContactInfoPage from '../pages/contact-info/ContactInfoPage';

// Images
import ImageListPage from '../pages/images/ImageListPage';
import ImageDetailPage from '../pages/images/ImageDetailPage';
import ImageEditPage from '../pages/images/ImageEditPage';
import ImageCreatePage from '../pages/images/ImageCreatePage';
import ImageUploadPage from '../pages/images/ImageUploadPage';

// Projects
import ProjectListPage from '../pages/projects/ProjectListPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import ProjectEditPage from '../pages/projects/ProjectEditPage';
import ProjectCreatePage from '../pages/projects/ProjectCreatePage';

import { useAuthStore } from '../auth/useAuth';
import AdminOnlyPage from '../pages/AdminOnlyPage';

// ✅ Preview Sites (match the 2-page setup)
import PreviewSitesPage from '../pages/preview-sites/PreviewSitesPage';
import PreviewSiteEditPage from '../pages/preview-sites/PreviewSiteEditPage';

const AppRoutes: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Redirect from root based on auth status */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* About Us Routes */}
          <Route path="/about-us" element={<AboutUsDetailPage />} />
          <Route path="/about-us/create" element={<AboutUsCreatePage />} />
          <Route path="/about-us/:id" element={<AboutUsDetailPage />} />
          <Route path="/about-us/:id/edit" element={<AboutUsEditPage />} />

          {/* Blog Routes */}
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/create" element={<BlogCreatePage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/blogs/:id/edit" element={<BlogEditPage />} />

          {/* Contact Info Routes */}
          <Route path="/contact-info" element={<ContactInfoPage />} />

          {/* Image Routes */}
          <Route path="/images" element={<ImageListPage />} />
          <Route path="/images/upload" element={<ImageUploadPage />} />
          <Route path="/images/create" element={<ImageCreatePage />} />
          <Route path="/images/:id" element={<ImageDetailPage />} />
          <Route path="/images/:id/edit" element={<ImageEditPage />} />

          {/* Project Routes */}
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/create" element={<ProjectCreatePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/edit" element={<ProjectEditPage />} />

          {/* ✅ Preview Sites Routes (NEW, 2 pages) */}
          <Route path="/preview-sites" element={<PreviewSitesPage />} />
          <Route path="/preview-sites/:id" element={<PreviewSiteEditPage />} />

          {/* Admin Only Route */}
          <Route path="/admin-only" element={<AdminOnlyPage />} />
        </Route>
      </Route>

      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;