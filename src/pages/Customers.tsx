
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, Eye } from "lucide-react";
import { musteriServisi, type Musteri } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { CustomerDetails } from "./Customers/components/CustomerDetails";

type ProfileWithStats = Musteri & {
  total_appointments?: number;
}

export default function Musteriler() {
  const [aramaMetni, setAramaMetni] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Musteri | null>(null);

  const { data: musteriler = [], isLoading } = useQuery<ProfileWithStats[]>({
    queryKey: ['musteriler', aramaMetni],
    queryFn: () => aramaMetni 
      ? musteriServisi.ara(aramaMetni) 
      : musteriServisi.istatistiklerGetir()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        </div>

        {/* Arama */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Müşteri Ara..."
              className="pl-10"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
            />
          </div>
        </div>

        {/* Müşteri Listesi */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Randevu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {musteriler.map((musteri) => (
                  <tr key={musteri.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {`${musteri.first_name} ${musteri.last_name}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {musteri.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {musteri.total_appointments || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {musteri.total_services || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {musteri.created_at ? new Date(musteri.created_at).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedCustomer(musteri)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detay
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CustomerDetails 
        open={!!selectedCustomer} 
        onOpenChange={(open) => !open && setSelectedCustomer(null)} 
        customer={selectedCustomer} 
      />
    </div>
  );
}
