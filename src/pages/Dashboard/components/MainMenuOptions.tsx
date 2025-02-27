
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";

type MainMenuOptionsProps = {
  onSelectCustomer: () => void;
  onSelectPersonnel: () => void;
};

export const MainMenuOptions = ({ onSelectCustomer, onSelectPersonnel }: MainMenuOptionsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Müşteri Seçeneği */}
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer" 
        onClick={onSelectCustomer}
      >
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Müşteri İşlemleri
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Randevu alma ve müşteri hizmetleri için tıklayın
        </CardContent>
      </Card>

      {/* Personel Seçeneği */}
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onSelectPersonnel}
      >
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Personel İşlemleri
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Personel ve işletme yönetimi için tıklayın
        </CardContent>
      </Card>
    </div>
  );
};
