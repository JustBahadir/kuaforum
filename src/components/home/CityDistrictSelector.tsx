
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { City, District } from "@/hooks/useCityDistricts";

interface CityDistrictSelectorProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  cities: City[];
  districts: District[];
}

export const CityDistrictSelector = ({ 
  selectedCity, 
  setSelectedCity, 
  selectedDistrict, 
  setSelectedDistrict,
  cities,
  districts
}: CityDistrictSelectorProps) => {
  return (
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
  );
};
