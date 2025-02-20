
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Users, Search, Plus, 
  Phone, Mail, MapPin, Pencil, Trash
} from "lucide-react";
import { musteriServisi, type Musteri } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";

export default function Musteriler() {
  const [aramaMetni, setAramaMetni] = useState("");
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenecekMusteri, setDuzenlenecekMusteri] = useState<Musteri | null>(null);
  const [yeniMusteri, setYeniMusteri] = useState<Partial<Musteri>>({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    musteri_no: ""
  });

  // Müşteri verilerini çek
  const { data: musteriler = [], isLoading, error, refetch } = useQuery({
    queryKey: ['musteriler', aramaMetni],
    queryFn: () => aramaMetni ? musteriServisi.ara(aramaMetni) : musteriServisi.hepsiniGetir()
  });

  // Form gönderme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (duzenlenecekMusteri) {
        // Müşteriyi güncelle
        await musteriServisi.guncelle(duzenlenecekMusteri.id, yeniMusteri);
        toast({
          title: "Başarılı",
          description: "Müşteri başarıyla güncellendi.",
        });
      } else {
        // Yeni müşteri ekle
        await musteriServisi.ekle(yeniMusteri as Omit<Musteri, 'id' | 'olusturulma_tarihi'>);
        toast({
          title: "Başarılı",
          description: "Yeni müşteri başarıyla eklendi.",
        });
      }
      setModalAcik(false);
      setDuzenlenecekMusteri(null);
      setYeniMusteri({
        ad_soyad: "",
        telefon: "",
        eposta: "",
        adres: "",
        musteri_no: ""
      });
      refetch(); // Listeyi yenile
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  // Müşteri silme işlemi
  const handleDelete = async (id: number) => {
    if (window.confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      try {
        await musteriServisi.sil(id);
        toast({
          title: "Başarılı",
          description: "Müşteri başarıyla silindi.",
        });
        refetch(); // Listeyi yenile
      } catch (error) {
        toast({
          title: "Hata",
          description: "Müşteri silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  // Müşteri düzenleme modalını aç
  const handleEdit = (musteri: Musteri) => {
    setDuzenlenecekMusteri(musteri);
    setYeniMusteri(musteri);
    setModalAcik(true);
  };

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Bir hata oluştu. Lütfen tekrar deneyin.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setDuzenlenecekMusteri(null);
              setYeniMusteri({
                ad_soyad: "",
                telefon: "",
                eposta: "",
                adres: "",
                musteri_no: ""
              });
              setModalAcik(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Yeni Müşteri
          </Button>
        </div>

        {/* Arama ve Filtreleme */}
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
                    Müşteri No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adres
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {musteriler.map((musteri) => (
                  <tr key={musteri.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {musteri.musteri_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {musteri.ad_soyad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {musteri.telefon}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {musteri.eposta}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {musteri.adres}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(musteri)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(musteri.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Müşteri Ekleme/Düzenleme Modalı */}
      <Sheet open={modalAcik} onOpenChange={setModalAcik}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {duzenlenecekMusteri ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
            </SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Müşteri No"
                value={yeniMusteri.musteri_no}
                onChange={(e) => setYeniMusteri({...yeniMusteri, musteri_no: e.target.value})}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Ad Soyad"
                value={yeniMusteri.ad_soyad}
                onChange={(e) => setYeniMusteri({...yeniMusteri, ad_soyad: e.target.value})}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Telefon"
                value={yeniMusteri.telefon}
                onChange={(e) => setYeniMusteri({...yeniMusteri, telefon: e.target.value})}
                required
              />
            </div>
            <div>
              <Input
                placeholder="E-posta"
                type="email"
                value={yeniMusteri.eposta}
                onChange={(e) => setYeniMusteri({...yeniMusteri, eposta: e.target.value})}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Adres"
                value={yeniMusteri.adres}
                onChange={(e) => setYeniMusteri({...yeniMusteri, adres: e.target.value})}
                required
              />
            </div>
            
            <SheetFooter>
              <Button type="submit">
                {duzenlenecekMusteri ? "Güncelle" : "Ekle"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
