
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SalonOwnerSection = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/admin");
  };

  const handleLoginClick = () => {
    navigate("/admin");
  };

  return (
    <div className="w-full lg:w-[65%] bg-white rounded-lg p-6 shadow-sm mb-6 lg:mb-0 lg:mr-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dükkanınızı Yönetin</h2>
      
      <p className="text-gray-600 mb-6">
        Kuaför salonunuzu dijital ortama taşıyın. Randevu yönetimini kolaylaştırın,
        müşteri portföyünüzü genişletin ve işletmenizi daha verimli hale getirin.
      </p>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-2">Dükkanınızı Kaydedin</h3>
          <p className="text-gray-600 mb-4">
            Dükkanınızı sistemimize ekleyin ve online randevu almaya hemen başlayın. Müşterileriniz
            sizi kolayca bulabilir ve randevu alabilir.
          </p>
          <Button 
            onClick={handleRegisterClick}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Dükkan Kaydı Oluştur
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-lg border border-pink-100">
          <h3 className="font-semibold text-pink-800 mb-2">Mevcut Hesabınıza Giriş Yapın</h3>
          <p className="text-gray-600 mb-4">
            Daha önce kaydolduysanız, hesabınıza giriş yaparak dükkanınızı yönetmeye devam edin.
          </p>
          <Button 
            onClick={handleLoginClick}
            variant="outline"
            className="border-pink-600 text-pink-600 hover:bg-pink-50"
          >
            Dükkan Girişi Yap
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Kolay Yönetim</h3>
          <p className="text-gray-600 text-sm">Tüm randevularınızı tek bir panel üzerinden yönetin.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Müşteri İlişkileri</h3>
          <p className="text-gray-600 text-sm">Müşteri profillerini görüntüleyin ve ilişkilerinizi geliştirin.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Personel Yönetimi</h3>
          <p className="text-gray-600 text-sm">Personellerinizin çalışma saatlerini ve performansını takip edin.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">İstatistikler ve Raporlar</h3>
          <p className="text-gray-600 text-sm">Dükkanınızın performansını analiz edin ve büyümeyi hızlandırın.</p>
        </div>
      </div>
    </div>
  );
}
