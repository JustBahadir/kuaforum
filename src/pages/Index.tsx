
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kuaför Randevu</h1>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="secondary">Müşteri Girişi</Button>
            </Link>
            <Link to="/staff-login">
              <Button variant="outline" className="bg-white/20">Dükkan Girişi</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-r from-pink-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Kuaför Randevu Sistemine Hoşgeldiniz
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            İster kuaför salonu sahibi olun, ister müşteri, tüm randevu işlemlerinizi kolayca yönetebilirsiniz.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
            <Link to="/login">
              <Button size="lg" className="w-full md:w-auto px-8">
                Müşteri Olarak Giriş Yap
              </Button>
            </Link>
            <Link to="/staff-login">
              <Button size="lg" variant="outline" className="w-full md:w-auto px-8 border-purple-500 text-purple-700 hover:bg-purple-50">
                Salon Sahibi/Personel Girişi
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Kuaför Randevu. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
