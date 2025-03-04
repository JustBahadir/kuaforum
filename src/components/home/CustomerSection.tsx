
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Scissors } from "lucide-react";
import { CityDistrictSelector } from "./CityDistrictSelector";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface City {
  name: string;
  value: string;
  districts: { name: string; value: string }[];
}

interface CustomerSectionProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  cities: City[];
  districts: { name: string, value: string }[];
  handleFindSalons: () => void;
}

export const CustomerSection = ({
  selectedCity,
  setSelectedCity,
  selectedDistrict,
  setSelectedDistrict,
  cities,
  districts,
  handleFindSalons
}: CustomerSectionProps) => {
  return (
    <div className="lg:w-[65%]">
      <Card className="shadow-lg border-t-4 border-t-blue-500 h-full">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-700">Müşteriler İçin</CardTitle>
          <CardDescription>
            En sevdiğiniz kuaförlerden kolayca randevu alın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CityDistrictSelector 
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            cities={cities}
            districts={districts}
          />

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
  );
};
