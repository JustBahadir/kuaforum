
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Hatası: Kullanıcı var olmayan bir sayfaya erişmeye çalıştı:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Üzgünüz! Sayfa bulunamadı</p>
        <p className="text-gray-500 mb-6">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  );
};

export default NotFound;
