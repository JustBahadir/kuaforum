
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section with 65-35 Split */}
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left content area (65%) */}
          <div className="w-full md:w-[65%] pr-0 md:pr-8 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-900">
              Profesyonel Kuaför Hizmetleri
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Uzman ekibimiz ve kaliteli ürünlerimizle saç ve güzellik hizmetlerinde en iyisini sunuyoruz.
              Randevu alarak zaman kazanın ve bekleme yapmadan hizmet alın.
            </p>
            <div className="flex space-x-4">
              <Button 
                onClick={() => navigate("/appointments")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
                size="lg"
              >
                Hemen Randevu Al
              </Button>
              <Button 
                onClick={() => navigate("/customer-dashboard")}
                variant="outline"
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
                size="lg"
              >
                Müşteri Paneline Git
              </Button>
            </div>
          </div>
          
          {/* Right content area (35%) - Image */}
          <div className="w-full md:w-[35%]">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/f7293d7f-094b-4699-9925-97ef8c28d7b6.png" 
                alt="Kuaför Hizmetleri" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-purple-800">Hizmetlerimiz</h2>

        {kategoriler.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Henüz hiç hizmet kategorisi bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {kategoriler.map((kategori) => {
              const kategoriIslemleri = islemler.filter(
                (islem: any) => islem.kategori_id === kategori.id
              );

              return (
                <div key={kategori.id} className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold mb-6 text-purple-700 border-b pb-2">{kategori.kategori_adi}</h2>
                  {kategoriIslemleri.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Bu kategoride henüz hizmet bulunmamaktadır.</p>
                  ) : (
                    <div className="space-y-4">
                      {kategoriIslemleri.map((islem: any) => (
                        <div
                          key={islem.id}
                          className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <div>
                            <h3 className="font-medium text-purple-900">{islem.islem_adi}</h3>
                            <p className="text-sm text-purple-700 font-semibold">
                              {islem.fiyat} TL
                            </p>
                          </div>
                          <Button
                            onClick={() => navigate(`/appointments?service=${islem.id}`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Randevu Al
                          </Button>
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

      {/* Call to action section */}
      <div className="bg-purple-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-purple-900">Hemen Randevu Alın</h2>
          <p className="text-lg text-purple-700 mb-8 max-w-2xl mx-auto">
            Profesyonel ekibimizle tanışmak ve kaliteli hizmet almak için hemen randevu oluşturun.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate("/appointments")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
              size="lg"
            >
              Randevu Oluştur
            </Button>
            <Button 
              onClick={() => navigate("/customer-dashboard")}
              variant="outline"
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
              size="lg"
            >
              Müşteri Paneline Git
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
