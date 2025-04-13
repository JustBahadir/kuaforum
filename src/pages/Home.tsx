
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, User, Users, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, handleLogout } = useCustomerAuth();
  const [loading, setLoading] = useState(true);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const role = data.session.user.user_metadata?.role;
          console.log("Home page - detected role:", role);
          
          // Redirect based on role
          if (role === 'admin' || role === 'staff') {
            console.log("Redirecting admin/staff to shop-home");
            navigate('/shop-home');
            return;
          } else if (role === 'customer') {
            console.log("Redirecting customer to customer-dashboard");
            navigate('/customer-dashboard');
            return;
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Scissors className="h-8 w-8 text-pink-500 mr-2" />
            <span className="text-2xl font-bold text-gray-800">Kuaför Randevu</span>
          </div>
          
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => userRole === 'customer' ? 
                    navigate('/customer-dashboard') : 
                    navigate('/shop-home')}
                  variant="outline"
                >
                  Panele Git
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/auth')} 
                  variant="outline" 
                  className="flex items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  Müşteri Girişi
                </Button>
                <Button 
                  onClick={() => navigate('/staff-login')} 
                  variant="default" 
                  className="flex items-center"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Personel Girişi
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6">Kuaför Randevu Sistemi</h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">
              Kuaför randevularınızı kolayca yönetin veya randevu alın.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <User className="h-12 w-12 mx-auto text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Müşteri Girişi</h2>
              <p className="text-gray-600 mb-6">
                Randevu almak ve randevularınızı görmek için giriş yapın
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Müşteri Girişi
              </Button>
            </div>
            
            <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 mx-auto text-pink-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Personel Girişi</h2>
              <p className="text-gray-600 mb-6">
                Dükkan sahipleri ve personel için yönetim paneline erişin
              </p>
              <Button 
                onClick={() => navigate('/staff-login')}
                className="w-full"
                variant="secondary"
              >
                Personel Girişi
              </Button>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium text-center">
                Zaten giriş yapmışsınız. 
                <Link to={userRole === 'customer' ? '/customer-dashboard' : '/shop-home'} className="underline ml-2">
                  Panele gitmek için tıklayın
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-gray-500 text-sm">
        &copy; 2025 Kuaför Randevu Sistemi. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
