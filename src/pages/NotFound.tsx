
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Hatası: Kullanıcı var olmayan bir sayfaya erişmeye çalıştı:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-red-500 dark:text-red-400">404</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">Üzgünüz! Sayfa bulunamadı</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button variant="default" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
