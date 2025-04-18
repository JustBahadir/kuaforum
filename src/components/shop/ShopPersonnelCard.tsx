
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserRound } from "lucide-react";

interface ShopPersonnelCardProps {
  personelListesi: any[] | null;
  userRole: string | null;
  canEdit?: boolean;
}

export function ShopPersonnelCard({ personelListesi, userRole, canEdit = false }: ShopPersonnelCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Uzman Personeller</CardTitle>
        {canEdit && (
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Personel Yönetimi
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!personelListesi || personelListesi.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <UserRound className="h-10 w-10 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Henüz personel bulunmuyor.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1" /> Personel Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {personelListesi.map((personel) => (
              <div key={personel.id} className="flex items-center gap-3 border rounded-lg p-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {personel.ad_soyad?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="font-medium">{personel.ad_soyad}</p>
                  <p className="text-xs text-gray-500">
                    {personel.calisma_sistemi === 'sahip' ? 'Dükkan Sahibi' : 'Personel'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
