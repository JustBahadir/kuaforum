
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, ChevronRight, Plus, PenSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ShopServicesCardProps {
  canEdit?: boolean;
  services?: any[];
}

export function ShopServicesCard({ canEdit = false, services = [] }: ShopServicesCardProps) {
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
            <PenSquare className="h-4 w-4" /> Hizmet Yönetimi
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {services.slice(0, 4).map((service) => (
              <div key={service.id} className="flex items-center gap-3 border rounded-lg p-4">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Scissors className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{service.islem_adi}</p>
                  <p className="text-sm text-gray-500">
                    {service.fiyat ? `₺${service.fiyat}` : 'Fiyat belirtilmemiş'}
                  </p>
                </div>
              </div>
            ))}
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
