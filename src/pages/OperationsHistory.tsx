
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { personelIslemleriServisi, islemServisi, personelServisi } from "@/lib/supabase";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { PersonelIslemi } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "lucide-react";

export default function OperationsHistory() {
  const { userRole } = useCustomerAuth();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });
  const [selectedOperation, setSelectedOperation] = useState<PersonelIslemi | null>(null);
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  // Get current user's personnel record
  const { data: personel } = useQuery({
    queryKey: ['personelByAuthId', currentUser?.id],
    queryFn: () => personelServisi.getirByAuthId(currentUser?.id || ""),
    enabled: !!currentUser?.id
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  const { data: islemGecmisi = [] } = useQuery({
    queryKey: ['personelIslemleri', dateRange.from, dateRange.to, personel?.id, userRole],
    queryFn: async () => {
      // If staff, only get their operations
      if (userRole === 'staff' && personel) {
        const allOperations = await personelIslemleriServisi.hepsiniGetir();
        return allOperations.filter(islem => {
          if (!islem.created_at) return false;
          const islemDate = new Date(islem.created_at);
          return islemDate >= dateRange.from && 
                islemDate <= dateRange.to && 
                islem.personel_id === personel.id;
        });
      } 
      // If admin, get all operations
      else {
        const allOperations = await personelIslemleriServisi.hepsiniGetir();
        return allOperations.filter(islem => {
          if (!islem.created_at) return false;
          const islemDate = new Date(islem.created_at);
          return islemDate >= dateRange.from && islemDate <= dateRange.to;
        });
      }
    },
    enabled: userRole === 'admin' || !!personel
  });

  const handleViewPhotos = (operation: PersonelIslemi) => {
    setSelectedOperation(operation);
    setPhotosDialogOpen(true);
  };

  return (
    <StaffLayout>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-muted-foreground">Tarih aralığı seçin:</span>
              <DateRangePicker 
                from={dateRange.from}
                to={dateRange.to}
                onSelect={({from, to}) => setDateRange({from, to})}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                    {userRole === 'admin' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fotoğraflar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {islemGecmisi.length > 0 ? (
                    islemGecmisi.map((islem: PersonelIslemi) => (
                      <tr key={islem.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.aciklama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.tutar} TL
                        </td>
                        {userRole === 'admin' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              %{islem.prim_yuzdesi}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {islem.odenen} TL
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.puan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.photos && islem.photos.length > 0 ? (
                            <button
                              onClick={() => handleViewPhotos(islem)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Image className="h-4 w-4" />
                              {islem.photos.length} Fotoğraf
                            </button>
                          ) : (
                            <span className="text-gray-400">Fotoğraf yok</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={userRole === 'admin' ? 8 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Seçilen tarih aralığında işlem bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photos Dialog */}
      <Dialog open={photosDialogOpen} onOpenChange={setPhotosDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {selectedOperation?.photos?.map((photo, index) => (
              <a href={photo} target="_blank" rel="noopener noreferrer" key={index} className="block">
                <img 
                  src={photo} 
                  alt={`İşlem fotoğrafı ${index + 1}`} 
                  className="rounded-md object-cover w-full h-48"
                />
              </a>
            ))}
          </div>
          {(!selectedOperation?.photos || selectedOperation.photos.length === 0) && (
            <p className="text-center text-gray-500 py-8">Bu işleme ait fotoğraf bulunmamaktadır</p>
          )}
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}
