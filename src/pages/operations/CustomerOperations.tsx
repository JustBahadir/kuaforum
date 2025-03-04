
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function CustomerOperations() {
  const navigate = useNavigate();

  const { data: kategoriler = [], isLoading: loadingKategoriler } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .order('sira');
      if (error) throw error;
      return data;
    }
  });

  const { data: islemler = [], isLoading: loadingIslemler } = useQuery({
    queryKey: ['islemler'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .order('sira');
      if (error) throw error;
      return data;
    }
  });

  if (loadingKategoriler || loadingIslemler) {
    return <div className="container mx-auto py-6 flex justify-center">
      <p>Hizmetler yükleniyor...</p>
    </div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hizmetlerimiz</h1>
        <Button 
          onClick={() => navigate("/customer-dashboard")}
          variant="outline"
        >
          Müşteri Paneline Git
        </Button>
      </div>

      {kategoriler.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Henüz hiç hizmet kategorisi bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {kategoriler.map((kategori) => {
            const kategoriIslemleri = islemler.filter(
              (islem: any) => islem.kategori_id === kategori.id
            );

            return (
              <div key={kategori.id} className="border rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold">{kategori.kategori_adi}</h2>
                {kategoriIslemleri.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Bu kategoride henüz hizmet bulunmamaktadır.</p>
                ) : (
                  <div className="space-y-2">
                    {kategoriIslemleri.map((islem: any) => (
                      <div
                        key={islem.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                      >
                        <div>
                          <h3 className="font-medium">{islem.islem_adi}</h3>
                          <p className="text-sm text-muted-foreground">
                            {islem.fiyat} TL
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/appointments?service=${islem.id}`)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
                        >
                          Randevu Al
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
