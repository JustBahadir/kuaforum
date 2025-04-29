
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Scissors, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

interface MainMenuOptionsProps {
  onMenuSelect?: (tab: string) => void;
}

export function MainMenuOptions({ onMenuSelect }: MainMenuOptionsProps) {
  const handleMenuSelect = (tab: string) => {
    if (onMenuSelect) {
      onMenuSelect(tab);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Müşteriler */}
        <Link to="/customers" onClick={() => handleMenuSelect('customer')}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <Users className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-medium">Müşteriler</h3>
            </div>
          </Card>
        </Link>

        {/* Randevular */}
        <Link to="/appointments">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-medium">Randevular</h3>
            </div>
          </Card>
        </Link>

        {/* Personel */}
        <Link to="/personnel" onClick={() => handleMenuSelect('personnel')}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <UserCog className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-medium">Personel</h3>
            </div>
          </Card>
        </Link>

        {/* Hizmetler */}
        <Link to="/services">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <Scissors className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-medium">Hizmetler</h3>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
