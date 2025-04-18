
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";

interface ShopProfileHeaderProps {
  dukkanData: any;
  userRole: string;
  queryClient: QueryClient;
}

export function ShopProfileHeader({ dukkanData, userRole }: ShopProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{dukkanData?.isletme_adi || "İsimsiz İşletme"}</h1>
          <p className="text-muted-foreground">{dukkanData?.aciklama}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            onClick={() => navigate("/appointments")}
          >
            Hemen Randevu Al
          </Button>
          
          {userRole === 'admin' && (
            <Button
              variant="outline"
              onClick={() => navigate("/shop-settings")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
