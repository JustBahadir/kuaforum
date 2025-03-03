
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { 
  CalendarCheck, 
  Scissors, 
  Users, 
  Search,
  Store,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Turkey cities and districts data
interface District {
  name: string;
  value: string;
}

interface City {
  name: string;
  value: string;
  districts: District[];
}

export default function HomePage() {
  const { isAuthenticated, userRole } = useCustomerAuth();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const navigate = useNavigate();
  
  // Fetch Turkey cities and districts
  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        // This is a placeholder URL - you should replace with a real API or source
        const response = await fetch('https://raw.githubusercontent.com/volkansenturk/turkiye-iller-ilceler/master/data/il-ilce.json');
        if (!response.ok) {
          throw new Error('Failed to fetch cities data');
        }
        
        const data = await response.json();
        
        // Transform the data into the format we need
        const formattedCities = Object.keys(data).map(cityName => {
          return {
            name: cityName,
            value: cityName.toLowerCase(),
            districts: data[cityName].map((districtName: string) => ({
              name: districtName,
              value: districtName.toLowerCase()
            }))
          };
        });
        
        setCities(formattedCities);
      } catch (error) {
        console.error('Error fetching cities data:', error);
        // Fallback with some major cities
        setCities([
          {
            name: "İstanbul",
            value: "istanbul",
            districts: [
              { name: "Kadıköy", value: "kadikoy" },
              { name: "Beşiktaş", value: "besiktas" },
              { name: "Şişli", value: "sisli" },
              { name: "Üsküdar", value: "uskudar" },
              { name: "Maltepe", value: "maltepe" }
            ]
          },
          {
            name: "Ankara",
            value: "ankara",
            districts: [
              { name: "Çankaya", value: "cankaya" },
              { name: "Keçiören", value: "kecioren" },
              { name: "Yenimahalle", value: "yenimahalle" }
            ]
          },
          {
            name: "İzmir",
            value: "izmir",
            districts: [
              { name: "Konak", value: "konak" },
              { name: "Karşıyaka", value: "karsiyaka" },
              { name: "Bornova", value: "bornova" }
            ]
          },
          {
            name: "Bursa",
            value: "bursa",
            districts: [
              { name: "Nilüfer", value: "nilufer" },
              { name: "Osmangazi", value: "osmangazi" }
            ]
          },
          {
            name: "Antalya",
            value: "antalya",
            districts: [
              { name: "Muratpaşa", value: "muratpasa" },
              { name: "Konyaaltı", value: "konyaalti" }
            ]
          }
        ]);
      }
    };

    fetchCitiesData();
  }, []);

  // Update districts when city is selected
  useEffect(() => {
    if (selectedCity) {
      const cityData = cities.find(city => city.value === selectedCity);
      if (cityData) {
        setDistricts(cityData.districts);
      } else {
        setDistricts([]);
      }
      // Reset selected district when city changes
      setSelectedDistrict("");
    } else {
      setDistricts([]);
    }
  }, [selectedCity, cities]);
  
  const getRedirectPath = () => {
    if (!isAuthenticated) return "/login";
    
    if (userRole === 'admin' || userRole === 'staff') {
      return "/personnel";
    } else if (userRole === 'customer') {
      return "/customer-dashboard";
    }
    
    return "/login";
  };

  const handleSearch = () => {
    if (!selectedCity) {
      toast.error("Lütfen bir il seçin");
      return;
    }
    
    console.log("Searching for salons in:", selectedCity, selectedDistrict);
    // In a real implementation, this would search for salons in the selected location
    // For now, we'll just redirect to the login page
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kuaför Sistemi</h1>
          <div className="space-x-2">
            {isAuthenticated ? (
              <Link to={getRedirectPath()}>
                <Button variant="outline">Panele Git</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Müşteri Girişi</Button>
                </Link>
                <Link to="/staff-login">
                  <Button variant="outline">Personel Girişi</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Split Layout */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Customer Section (65%) */}
        <section className="w-full md:w-[65%] bg-slate-50 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Kuaför Randevunuzu Kolayca Alın</h2>
            <p className="text-lg mb-8">
              Şehrinizde bulunan tüm kuaförleri keşfedin, randevunuzu hızlıca alın ve zaman kazanın.
            </p>
            
            {/* Location Search */}
            <Card className="mb-10">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Kuaför Bul</h3>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">İl</Label>
                    <Select onValueChange={setSelectedCity} value={selectedCity}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="İl seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe</Label>
                    <Select 
                      onValueChange={setSelectedDistrict} 
                      value={selectedDistrict}
                      disabled={!selectedCity}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder={selectedCity ? "İlçe seçin" : "Önce il seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.value} value={district.value}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSearch} className="w-full">
                  <Search className="mr-2 h-4 w-4" /> Kuaför Ara
                </Button>
              </CardContent>
            </Card>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kolay Randevu</h3>
                  <p className="text-muted-foreground">Dilediğiniz kuaför ile anında randevu alın, zamanınızı verimli kullanın.</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Zaman Kazanın</h3>
                  <p className="text-muted-foreground">Sıra beklemeden, önceden randevu alarak kuaförünüze gidebilirsiniz.</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Size Yakın Kuaförler</h3>
                  <p className="text-muted-foreground">Konumunuza en yakın kuaförleri bulun ve randevunuzu oluşturun.</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4">
                  <Scissors className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kaliteli Hizmet</h3>
                  <p className="text-muted-foreground">Yüzlerce profesyonel kuaför arasından seçim yapın.</p>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="text-center">
              <Link to="/login">
                <Button size="lg" className="px-8">Hemen Randevu Al</Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Shop Owner Section (35%) */}
        <section className="w-full md:w-[35%] bg-primary/5 p-6 md:p-10">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">Kuaför Salonu Sahipleri</h2>
            <p className="text-lg mb-8">
              İşletmenizi dijitalleştirin, müşteri ve randevu yönetimini kolaylaştırın.
            </p>
            
            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                <div className="mr-3">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Dükkan Yönetimi</h3>
                  <p className="text-sm text-muted-foreground">Dükkanınızı dijital olarak yönetin, istatistikleri görüntüleyin.</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                <div className="mr-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Personel Takibi</h3>
                  <p className="text-sm text-muted-foreground">Çalışanlarınızın performansını ve randevularını takip edin.</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                <div className="mr-3">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Randevu Sistemi</h3>
                  <p className="text-sm text-muted-foreground">Randevuları otomatik olarak alın ve yönetin.</p>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="space-y-4">
              <Link to="/staff-login" className="block">
                <Button variant="default" className="w-full">Giriş Yap</Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                Henüz üye değil misiniz?
              </p>
              <Link to="/staff-login" className="block">
                <Button variant="outline" className="w-full">Hemen Kaydolun</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2023 Kuaför Yönetim Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
