
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { CalendarCheck, Scissors, Users, Home } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, userRole } = useCustomerAuth();
  
  const getRedirectPath = () => {
    if (!isAuthenticated) return "/staff-login";
    
    if (userRole === 'admin' || userRole === 'staff') {
      return "/personnel";
    } else if (userRole === 'customer') {
      return "/customer-dashboard";
    }
    
    return "/staff-login";
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kuaför Sistemi</h1>
          <div className="space-x-2">
            {isAuthenticated ? (
              <Link to={getRedirectPath()}>
                <Button variant="outline">Panele Git</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Müşteri Girişi</Button>
                </Link>
                <Link to="/staff-login">
                  <Button variant="outline">Personel Girişi</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Kuaför Yönetim Sistemi</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Kuaför salonunuzu daha verimli yönetin, randevuları düzenleyin ve müşteri memnuniyetini artırın.
          </p>
          <Link to={getRedirectPath()}>
            <Button size="lg">Hemen Başlayın</Button>
          </Link>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <CalendarCheck className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Randevu Yönetimi</h3>
              <p className="text-muted-foreground">Randevuları kolayca yönetin, çakışmaları önleyin ve daha verimli çalışın.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Scissors className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hizmet Yönetimi</h3>
              <p className="text-muted-foreground">Hizmetlerinizi kolayca tanımlayın, fiyatlandırın ve kategorize edin.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personel Yönetimi</h3>
              <p className="text-muted-foreground">Personel performansını takip edin, primleri hesaplayın ve iş akışını optimize edin.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Home className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dükkan İstatistikleri</h3>
              <p className="text-muted-foreground">Dükkanınızın performansını analiz edin, gelir raporlarını görüntüleyin.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted mt-auto py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2023 Kuaför Yönetim Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
