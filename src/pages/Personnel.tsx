
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Personel, personelServisi } from "@/lib/supabase";
import { UserPlus, Search, User } from "lucide-react";

export default function Personnel() {
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenPersonel, setSecilenPersonel] = useState<Personel | null>(null);

  // Personel verilerini çek
  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ["personeller", aramaMetni],
    queryFn: () => aramaMetni ? personelServisi.ara(aramaMetni) : personelServisi.hepsiniGetir()
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <UserPlus className="mr-2" />
              Yeni Personel
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Yeni Personel Ekle</SheetTitle>
            </SheetHeader>
            {/* Form içeriği daha sonra eklenecek */}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Personel ara..."
            className="pl-8"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personeller.map((personel: Personel) => (
            <div
              key={personel.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{personel.ad_soyad}</h3>
                    <p className="text-sm text-muted-foreground">{personel.telefon}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Çalışma Sistemi:</span>{" "}
                  {personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Prim Yüzdesi:</span> %{personel.prim_yuzdesi}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSecilenPersonel(personel)}
                >
                  Detayları Görüntüle
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personel detay modalı daha sonra eklenecek */}
    </div>
  );
}
