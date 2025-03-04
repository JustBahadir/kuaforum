
import { useState } from 'react';
import { CustomerSection } from '@/components/home/CustomerSection';
import { SalonOwnerSection } from '@/components/home/SalonOwnerSection';
import { useCityDistricts } from '@/hooks/useCityDistricts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { LogOut } from 'lucide-react';

export default function HomePage() {
  const {
    cities,
    districts,
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict
  } = useCityDistricts();
  
  const { isAuthenticated, userRole, handleLogout } = useCustomerAuth();
  
  const [activeTab, setActiveTab] = useState<'customer' | 'owner'>('customer');

  const handleFindSalons = () => {
    // In a real implementation, this would navigate to the search page with the selected filters
    // For now, we just log the selection
    console.log('Searching salons in city:', selectedCity, 'district:', selectedDistrict);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Kuaför Randevu</Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {userRole === 'customer' ? (
                  <Link to="/customer-dashboard">
                    <Button variant="secondary">Hesabım</Button>
                  </Link>
                ) : (
                  <Link to="/admin/dashboard">
                    <Button variant="secondary">Yönetim Paneli</Button>
                  </Link>
                )}
                
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={handleLogout}
                  title="Çıkış Yap"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="secondary">Müşteri Girişi</Button>
                </Link>
                <Link to="/admin">
                  <Button variant="outline" className="bg-white/20">Dükkan Girişi</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 mt-6">
        {/* Tab Buttons */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'customer'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('customer')}
          >
            Müşteriler İçin
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'owner'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('owner')}
          >
            Dükkan Sahipleri İçin
          </button>
        </div>
        
        {/* Content Sections */}
        <div className="flex flex-col lg:flex-row">
          {activeTab === 'customer' ? (
            <CustomerSection
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              cities={cities}
              districts={districts}
              handleFindSalons={handleFindSalons}
            />
          ) : (
            <SalonOwnerSection />
          )}
          
          {/* Image Section */}
          <div className="w-full lg:w-[35%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80"
              alt="Kuaför salonu"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Kuaför Randevu</h3>
              <p className="text-gray-400 max-w-md">
                En iyi kuaför salonlarını keşfedin ve kolayca randevu alın.
                Hem kuaförler hem de müşteriler için tasarlanmış kullanıcı dostu platform.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Bağlantılar</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Ana Sayfa</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Müşteri Girişi</Link></li>
                <li><Link to="/admin" className="text-gray-400 hover:text-white">Dükkan Girişi</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Kuaför Randevu. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
