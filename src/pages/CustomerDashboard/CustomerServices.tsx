
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Scissors, DollarSign, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerServices() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('islem_kategorileri')
          .select('*')
          .order('sira');
          
        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
        } else {
          setCategories(categoriesData || []);
        }
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('islemler')
          .select('*')
          .order('sira');
          
        if (servicesError) {
          console.error("Error fetching services:", servicesError);
        } else {
          setServices(servicesData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Puanı yıldızlara dönüştüren yardımcı fonksiyon
  const renderStars = (points: number) => {
    // Puan 0-5 arası olsun
    const normalizedPoints = Math.min(5, Math.max(0, Math.floor(points / 20)));
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <Star 
            key={index} 
            className={`h-4 w-4 ${index < normalizedPoints ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Hizmetler yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Hizmetlerimiz</h1>
        <p className="text-gray-600 mt-1">Salonumuzun sunduğu tüm hizmetleri görüntüleyin</p>
      </div>
      
      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Henüz tanımlanmış hizmet kategorisi bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={categories[0]?.id.toString()}>
          <TabsList className="mb-4 flex overflow-x-auto pb-px" style={{ maxWidth: "100%" }}>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id.toString()}>
                {category.kategori_adi}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id.toString()} className="space-y-4">
              {services.filter(service => service.kategori_id === category.id).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>Bu kategoride henüz hizmet tanımlanmamış.</p>
                  </CardContent>
                </Card>
              ) : (
                services
                  .filter(service => service.kategori_id === category.id)
                  .map(service => (
                    <Card key={service.id} className="overflow-hidden border-l-4 border-l-purple-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Scissors className="mr-2 h-5 w-5 text-purple-500" />
                          {service.islem_adi}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex flex-wrap justify-between gap-4">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span>Fiyat: {service.fiyat} TL</span>
                          </div>
                          {service.puan > 0 && (
                            <div className="flex items-center">
                              {renderStars(service.puan)}
                              <span className="ml-2 text-sm text-gray-500">{service.puan} Puan</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 bg-gray-50">
                        <Link to={`/appointments?service=${service.id}`} className="w-full">
                          <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50 hover:text-purple-700">
                            Bu Hizmet İçin Randevu Al
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      <Card className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-center">Yeni Randevu Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center">
            İstediğiniz hizmeti seçerek hızlıca randevu oluşturabilirsiniz.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/appointments" className="w-full max-w-xs">
            <Button className="w-full bg-purple-700 hover:bg-purple-800">Randevu Oluştur</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
