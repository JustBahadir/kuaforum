
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function ShopHomePage() {
  const { refreshProfile } = useCustomerAuth();
  
  // Fix the refreshUserProfile function to call refreshProfile
  const refreshUserProfile = () => {
    refreshProfile();
  };
  
  // Rest of component logic
  // ...
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Salon Yönetim Sayfası</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Hızlı İşlemler</h2>
          <p className="text-gray-600 mb-4">Salondaki işlemleri ve personelleri yönetebilirsiniz.</p>
          <button 
            onClick={refreshUserProfile}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Bilgileri Yenile
          </button>
        </div>
      </div>
    </div>
  );
}
