
import { Button } from "@/components/ui/button";
import { Scissors, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CustomerMenuProps = {
  onBackClick: () => void;
};

export const CustomerMenu = ({ onBackClick }: CustomerMenuProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Müşteri İşlemleri</h2>
        <Button variant="outline" onClick={onBackClick}>
          Geri Dön
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button 
          className="h-24 text-lg"
          onClick={() => navigate('/operations')}
        >
          <Scissors className="mr-2 h-6 w-6" />
          Hizmetlerimiz
        </Button>
        <Button 
          className="h-24 text-lg"
          onClick={() => navigate('/appointments')}
        >
          <Calendar className="mr-2 h-6 w-6" />
          Randevu Al
        </Button>
      </div>
    </div>
  );
};
