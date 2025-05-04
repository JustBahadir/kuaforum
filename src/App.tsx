
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { RouteProtection } from '@/components/auth/RouteProtection';

// Core pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Auth from './pages/Auth';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AuthGoogleCallback from './pages/AuthGoogleCallback';
import ProfileSetup from './pages/ProfileSetup';

// Temporary pages for testing auth flow
import IsletmeAnasayfa from './pages/IsletmeAnasayfa';
import AtanmamisPersonel from './pages/AtanmamisPersonel';

// Create a placeholder component for disabled features
const DisabledFeature = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold mb-4">Bu Özellik Geçici Olarak Devre Dışı</h1>
      <p>Bu bölüm şu anda geliştirme aşamasındadır.</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <RouteProtection>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth-callback" element={<AuthCallbackPage />} />
            <Route path="/auth-google-callback" element={<AuthGoogleCallback />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            
            {/* Business Owner Routes */}
            <Route path="/isletme-anasayfa" element={<IsletmeAnasayfa />} />
            
            {/* Staff Routes */}
            <Route path="/atanmamis-personel" element={<AtanmamisPersonel />} />
            
            {/* Fallback for all disabled features */}
            <Route path="/shop-home" element={<DisabledFeature />} />
            <Route path="/shop-settings" element={<DisabledFeature />} />
            <Route path="/shop-statistics" element={<DisabledFeature />} />
            <Route path="/admin/services" element={<DisabledFeature />} />
            <Route path="/operations-history" element={<DisabledFeature />} />
            <Route path="/admin/appointments" element={<DisabledFeature />} />
            <Route path="/personnel" element={<DisabledFeature />} />
            <Route path="/customer-dashboard" element={<DisabledFeature />} />
            <Route path="/staff-profile" element={<DisabledFeature />} />
            <Route path="/unassigned-staff" element={<DisabledFeature />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteProtection>
      </Router>
    </>
  );
}

export default App;
