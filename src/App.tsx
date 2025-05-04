
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import IsletmeAnasayfa from "./pages/isletme/IsletmeAnasayfa";
import IsletmeOlustur from "./pages/isletme/IsletmeOlustur";
import ProtectedRoute from "./components/ProtectedRoute";

// Oturum durumunu kontrol eden bileşen
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth-callback" element={<AuthCallbackPage />} />
          <Route path="/profil-olustur" element={<ProfileSetupPage />} />

          {/* İşletme sahibi routes */}
          <Route 
            path="/isletme/anasayfa" 
            element={
              <ProtectedRoute allowedRoles={["isletme_sahibi"]}>
                <IsletmeAnasayfa />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/isletme/olustur" 
            element={
              <ProtectedRoute allowedRoles={["isletme_sahibi"]}>
                <IsletmeOlustur />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

export default App;
