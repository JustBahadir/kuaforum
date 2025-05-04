
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CityDistrictSelector } from "./CityDistrictSelector";
import { City, District } from "@/hooks/useCityDistricts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Home } from "lucide-react";

interface CustomerSectionProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  cities: City[];
  districts: District[];
  handleFindSalons: () => void;
}

export const CustomerSection = ({
  selectedCity,
  setSelectedCity,
  selectedDistrict,
  setSelectedDistrict,
  cities,
  districts,
  handleFindSalons
}: CustomerSectionProps) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const handleCustomerLoginClick = () => {
    setShowDialog(true);
  };

  return (
    <div className="w-full lg:w-[65%] bg-white rounded-lg p-6 shadow-sm mb-6 lg:mb-0 lg:mr-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Kuaför Randevunuzu Hemen Alın</h2>
      
      <p className="text-gray-600 mb-6">
        Bölgenizdeki en iyi kuaförleri keşfedin, hizmetleri inceleyin ve birkaç tıklamayla randevunuzu oluşturun.
      </p>
      
      <div className="mb-8">
        <CityDistrictSelector
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          cities={cities}
          districts={districts}
        />
        
        <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Button 
            onClick={() => navigate("/staff-login")}
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Kuaför Girişi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Kolay Randevu</h3>
          <p className="text-gray-600 text-sm">İstediğiniz tarih ve saatte, uygun salonlarda hemen yerinizi ayırtın.</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Hizmet Değerlendirmeleri</h3>
          <p className="text-gray-600 text-sm">Diğer müşterilerin yorumlarını okuyun, en iyi hizmeti alın.</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Özel Teklifler</h3>
          <p className="text-gray-600 text-sm">Size özel indirimlerden ve kampanyalardan haberdar olun.</p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">Randevu Hatırlatmaları</h3>
          <p className="text-gray-600 text-sm">Otomatik hatırlatmalarla randevularınızı asla kaçırmayın.</p>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bilgilendirme</DialogTitle>
            <DialogDescription className="py-4">
              Bu bölüm gelecek sürümlerde eklenecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDialog(false);
                navigate("/");
              }}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
