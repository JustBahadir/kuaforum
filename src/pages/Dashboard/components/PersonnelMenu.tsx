
import { Button } from "@/components/ui/button";
import { Users, User, Calendar, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PersonnelMenuProps = {
  onBackClick: () => void;
};

export const PersonnelMenu = ({ onBackClick }: PersonnelMenuProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Personel İşlemleri</h2>
        <Button variant="outline" onClick={onBackClick}>
          Geri Dön
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button 
          className="h-24 text-lg"
          onClick={() => navigate('/personnel')}
        >
          <Users className="mr-2 h-6 w-6" />
          Personel Yönetimi
        </Button>
        <Button 
          className="h-24 text-lg"
          onClick={() => navigate('/customers')}
        >
          <User className="mr-2 h-6 w-6" />
          Müşteri Listesi
        </Button>
        <Button 
          className="h-24 text-lg"
          onClick={() => navigate('/operations/staff')}
        >
          <Settings className="mr-2 h-6 w-6" />
          İşletme Ayarları
        </Button>
        <Button 
          className="h-24 text-lg"
          onClick={() => navigate('/appointments')}
        >
          <Calendar className="mr-2 h-6 w-6" />
          Randevu Takvimi
        </Button>
      </div>
    </div>
  );
};
