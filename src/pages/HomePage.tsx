
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/home/HeroSection";
import { CustomerSection } from "@/components/home/CustomerSection";
import { SalonOwnerSection } from "@/components/home/SalonOwnerSection";
import { Footer } from "@/components/home/Footer";
import { useCityDistricts } from "@/hooks/useCityDistricts";

export default function HomePage() {
  const navigate = useNavigate();
  const { 
    selectedCity, 
    setSelectedCity, 
    selectedDistrict, 
    setSelectedDistrict, 
    cities, 
    districts 
  } = useCityDistricts();

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
      <HeroSection />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <CustomerSection 
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            cities={cities}
            districts={districts}
            handleFindSalons={handleFindSalons}
          />
          
          <SalonOwnerSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
