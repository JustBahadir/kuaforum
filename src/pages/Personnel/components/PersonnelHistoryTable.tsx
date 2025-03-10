
import { useState } from "react";
import { personelIslemleriServisi } from "@/lib/supabase";
import { PersonelIslemi } from "@/lib/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Eye } from "lucide-react";

export interface PersonnelHistoryTableProps {
  personelId?: number;
}

export const PersonnelHistoryTable = ({ personelId }: PersonnelHistoryTableProps) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });

  const [viewPhotoDialogOpen, setViewPhotoDialogOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  const { data: islemGecmisi = [], isLoading } = useQuery({
    queryKey: ['personelIslemleri', dateRange.from, dateRange.to, personelId],
    queryFn: async () => {
      let operations;
      
      if (personelId) {
        operations = await personelIslemleriServisi.personelIslemleriGetir(personelId);
      } else {
        operations = await personelIslemleriServisi.hepsiniGetir();
      }
      
      // Filter by date range
      return operations.filter((islem: PersonelIslemi) => {
        if (!islem.created_at) return true;
        const islemDate = new Date(islem.created_at);
        return islemDate >= dateRange.from && islemDate <= dateRange.to;
      });
    }
  });

  const handleViewPhotos = (photos: string[]) => {
    if (photos && photos.length > 0) {
      setCurrentPhotos(photos);
      setViewPhotoDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <span className="text-sm text-muted-foreground">Tarih aralığı seçin:</span>
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onSelect={({from, to}) => setDateRange({from, to})}
        />
      </div>

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
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
                    {islem.personel?.ad_soyad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {islem.aciklama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {islem.tutar} TL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    %{islem.prim_yuzdesi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {islem.odenen} TL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {islem.puan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {islem.photos && islem.photos.length > 0 ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewPhotos(islem.photos || [])}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        {islem.photos.length}
                      </Button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Seçilen tarih aralığında işlem bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Photo View Dialog */}
      <Dialog open={viewPhotoDialogOpen} onOpenChange={setViewPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Operation photo ${index + 1}`} 
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonnelHistoryTable;
