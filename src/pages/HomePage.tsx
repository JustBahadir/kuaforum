
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Scissors, Calendar, Users, Settings, BarChart3 } from "lucide-react";

interface City {
  name: string;
  value: string;
  districts: { name: string; value: string }[];
}

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<{name: string, value: string}[]>([]);

  // Fetch Turkey cities and districts
  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
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
          }
        ]);
      }
    };

    fetchCitiesData();
  }, []);

  // Update districts when city is selected
  useEffect(() => {
    if (selectedCity) {
      const selectedCityData = cities.find(city => city.value === selectedCity);
      if (selectedCityData) {
        setDistricts(selectedCityData.districts);
      } else {
        setDistricts([]);
      }
      setSelectedDistrict("");
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedCity, cities]);

  const handleFindSalons = () => {
    if (!selectedCity) {
      alert("Lütfen bir il seçin");
      return;
    }
    
    // In a real app, this would navigate to search results
    // For now, we'll navigate to the login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-700 to-blue-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kuaför Randevu Sistemi</h1>
          <p className="text-xl md:text-2xl mb-8">İster müşteri ister salon sahibi olun, size özel çözümlerimiz var</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Customer Section (65%) */}
          <div className="lg:w-[65%]">
            <Card className="shadow-lg border-t-4 border-t-blue-500 h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-700">Müşteriler İçin</CardTitle>
                <CardDescription>
                  En sevdiğiniz kuaförlerden kolayca randevu alın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">İl</Label>
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
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
                      value={selectedDistrict}
                      onValueChange={setSelectedDistrict}
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

                <Button 
                  className="w-full"
                  onClick={handleFindSalons}
                >
                  Salonları Bul
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                    <Calendar className="text-blue-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Kolay Randevu</h3>
                      <p className="text-sm text-gray-600">Sevdiğiniz kuaförlerden birkaç tıkla randevu alın</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                    <Scissors className="text-blue-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Kişiselleştirilmiş Hizmet</h3>
                      <p className="text-sm text-gray-600">Tercih ettiğiniz hizmetleri ve uzmanları kaydedin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-4 justify-between border-t pt-6">
                <Link to="/login" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full">Giriş Yap</Button>
                </Link>
                <Link to="/login" className="w-full md:w-auto">
                  <Button className="w-full">Randevu Al</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Salon Owner Section (35%) */}
          <div className="lg:w-[35%]">
            <Card className="shadow-lg border-t-4 border-t-purple-500 h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-700">Salon Sahipleri İçin</CardTitle>
                <CardDescription>
                  İşletmenizi daha verimli yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
                    <Calendar className="text-purple-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Randevu Yönetimi</h3>
                      <p className="text-sm text-gray-600">Randevuları tek bir yerden yönetin</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
                    <Users className="text-purple-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Müşteri Yönetimi</h3>
                      <p className="text-sm text-gray-600">Müşteri bilgilerini saklayın ve analiz edin</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
                    <Settings className="text-purple-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Hizmet Yönetimi</h3>
                      <p className="text-sm text-gray-600">Hizmetlerinizi ve fiyatlarınızı kolayca güncelleyin</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
                    <BarChart3 className="text-purple-500 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">İstatistikler</h3>
                      <p className="text-sm text-gray-600">Salonunuzun performansını takip edin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-4 justify-between border-t pt-6">
                <Link to="/staff-login" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full">Giriş Yap</Button>
                </Link>
                <Link to="/staff-login" className="w-full md:w-auto">
                  <Button className="w-full">Hemen Kaydolun</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Kuaför Randevu Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
