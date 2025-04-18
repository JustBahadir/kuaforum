
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ShopServicesCardProps {
  canEdit?: boolean;
}

export function ShopServicesCard({ canEdit = false }: ShopServicesCardProps) {
  const [services, setServices] = useState<any[]>([]);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sunulan Hizmetler</CardTitle>
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigate("/admin/operations")}
          >
            <Plus className="h-4 w-4" /> Hizmet Yönetimi
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Scissors className="h-10 w-10 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Henüz tanımlanmış hizmet bulunmuyor.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/operations")}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1" /> Hizmet Ekle
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Services would be listed here */}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate('/services')}>
            Tüm Hizmetleri Gör <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
