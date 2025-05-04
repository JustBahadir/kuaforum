
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import IsletmeAnasayfa from "./pages/isletme/IsletmeAnasayfa";
import IsletmeOlustur from "./pages/isletme/IsletmeOlustur";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/giris" element={<LoginPage />} />
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
        
        {/* Personel routes */}
        <Route 
          path="/personel/anasayfa" 
          element={
            <ProtectedRoute allowedRoles={["personel"]}>
              <div>Personel Anasayfa (Bu sayfa henüz oluşturulmadı)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/personel/beklemede" 
          element={
            <ProtectedRoute allowedRoles={["personel"]}>
              <div>Personel Beklemede (Bu sayfa henüz oluşturulmadı)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/personel/atanmamis" 
          element={
            <ProtectedRoute allowedRoles={["personel"]}>
              <div>Atanmamış Personel (Bu sayfa henüz oluşturulmadı)</div>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

export default App;
