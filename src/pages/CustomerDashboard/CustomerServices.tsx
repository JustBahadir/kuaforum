
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Scissors, Clock, DollarSign } from "lucide-react";
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
          <TabsList className="mb-4">
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
                    <Card key={service.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Scissors className="mr-2 h-5 w-5 text-purple-500" />
                          {service.islem_adi}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span>Fiyat: {service.fiyat} TL</span>
                          </div>
                          {service.puan > 0 && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-blue-600 mr-1" />
                              <span>Tahmini Süre: {service.puan} dk</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3">
                        <Link to={`/appointments?service=${service.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Yeni Randevu Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            İstediğiniz hizmeti seçerek hızlıca randevu oluşturabilirsiniz.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/appointments" className="w-full">
            <Button className="w-full">Randevu Oluştur</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
