
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Sayfa içe aktarmaları
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import ProfilKurulum from "@/pages/ProfilKurulum";
import AuthGoogleCallback from "@/pages/AuthGoogleCallback";
import KayitFormu from "@/pages/KayitFormu";

// Geçici olarak devre dışı bırakılmış bileşenler
import { 
  IsletmeSahibiSayfasi, 
  PersonelSayfasi, 
  DevreDisiBilesenSayfa 
} from "@/components/utils/DisabledComponents";

// Rota koruması
import { RouteProtection } from "@/components/auth/RouteProtection";

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Genel erişime açık sayfalar */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/auth-google-callback" element={<AuthGoogleCallback />} />
          <Route path="/profil-kurulum" element={<ProfilKurulum />} />
          <Route path="/kayit-formu" element={<KayitFormu />} />

          {/* İşletme sahibi korumalı sayfalar */}
          <Route
            path="/isletme/anasayfa"
            element={
              <RouteProtection allowedRoles={["isletme_sahibi"]}>
                <IsletmeSahibiSayfasi />
              </RouteProtection>
            }
          />
          <Route
            path="/isletme/olustur"
            element={
              <RouteProtection allowedRoles={["isletme_sahibi"]}>
                <IsletmeSahibiSayfasi />
              </RouteProtection>
            }
          />

          {/* Personel korumalı sayfalar */}
          <Route
            path="/personel/atanmamis"
            element={
              <RouteProtection allowedRoles={["personel"]}>
                <PersonelSayfasi durum="atanmamis" />
              </RouteProtection>
            }
          />
          <Route
            path="/personel/beklemede"
            element={
              <RouteProtection allowedRoles={["personel"]}>
                <PersonelSayfasi durum="beklemede" />
              </RouteProtection>
            }
          />
          <Route
            path="/personel/onaylandi"
            element={
              <RouteProtection allowedRoles={["personel"]}>
                <PersonelSayfasi durum="onaylandi" />
              </RouteProtection>
            }
          />

          {/* Diğer geçici olarak devre dışı sayfalar */}
          <Route
            path="/dashboard/*"
            element={<DevreDisiBilesenSayfa />}
          />
          <Route
            path="/personel/*"
            element={<DevreDisiBilesenSayfa />}
          />
          <Route
            path="/shop/*"
            element={<DevreDisiBilesenSayfa />}
          />
          
          {/* Müşteri sayfaları */}
          <Route
            path="/musteri/anasayfa"
            element={<DevreDisiBilesenSayfa />}
          />

          {/* Bilinmeyen rotaları ana sayfaya yönlendir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
