
import { useState, useEffect } from "react";

export interface City {
  id: number;
  name: string;
  value: string;
  districts: District[];
}

export interface District {
  id: number;
  name: string;
  value: string;
  city_id: number;
}

export const useCityDistricts = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        // Mock data for now - will be replaced with API call
        const mockCities: City[] = [
          { id: 1, name: "İstanbul", value: "istanbul", districts: [] },
          { id: 2, name: "Ankara", value: "ankara", districts: [] },
          { id: 3, name: "İzmir", value: "izmir", districts: [] },
          { id: 4, name: "Bursa", value: "bursa", districts: [] },
          { id: 5, name: "Antalya", value: "antalya", districts: [] }
        ];
        
        setCities(mockCities);

        return mockCities;
      } catch (error) {
        console.error("Error fetching cities data:", error);
        setError(new Error("Failed to fetch cities data"));
        return [];
      }
    };

    const fetchDistrictsData = async (cityId: string) => {
      if (!cityId) {
        setDistricts([]);
        return;
      }

      try {
        // Mock data based on selected city
        let mockDistricts: District[] = [];
        
        switch(cityId) {
          case "istanbul":
            mockDistricts = [
              { id: 1, name: "Kadıköy", value: "kadikoy", city_id: 1 },
              { id: 2, name: "Beşiktaş", value: "besiktas", city_id: 1 },
              { id: 3, name: "Şişli", value: "sisli", city_id: 1 },
              { id: 4, name: "Üsküdar", value: "uskudar", city_id: 1 }
            ];
            break;
          case "ankara":
            mockDistricts = [
              { id: 5, name: "Çankaya", value: "cankaya", city_id: 2 },
              { id: 6, name: "Keçiören", value: "kecioren", city_id: 2 },
              { id: 7, name: "Mamak", value: "mamak", city_id: 2 }
            ];
            break;
          case "izmir":
            mockDistricts = [
              { id: 8, name: "Konak", value: "konak", city_id: 3 },
              { id: 9, name: "Karşıyaka", value: "karsiyaka", city_id: 3 },
              { id: 10, name: "Bornova", value: "bornova", city_id: 3 }
            ];
            break;
          case "bursa":
            mockDistricts = [
              { id: 11, name: "Osmangazi", value: "osmangazi", city_id: 4 },
              { id: 12, name: "Nilüfer", value: "nilufer", city_id: 4 },
              { id: 13, name: "Yıldırım", value: "yildirim", city_id: 4 }
            ];
            break;
          case "antalya":
            mockDistricts = [
              { id: 14, name: "Muratpaşa", value: "muratpasa", city_id: 5 },
              { id: 15, name: "Konyaaltı", value: "konyaalti", city_id: 5 },
              { id: 16, name: "Kepez", value: "kepez", city_id: 5 }
            ];
            break;
        }
        
        setDistricts(mockDistricts);
      } catch (error) {
        console.error("Error fetching districts data:", error);
        setError(new Error("Failed to fetch districts data"));
      }
    };

    const loadData = async () => {
      setLoading(true);
      const citiesData = await fetchCitiesData();
      setLoading(false);
      
      // If there's a selected city, load its districts
      if (selectedCity && citiesData.length > 0) {
        await fetchDistrictsData(selectedCity);
      }
    };

    loadData();
  }, []);

  // Update districts when selected city changes
  useEffect(() => {
    const updateDistricts = async () => {
      if (selectedCity) {
        setLoading(true);
        
        try {
          // Mock data based on selected city
          let mockDistricts: District[] = [];
          
          switch(selectedCity) {
            case "istanbul":
              mockDistricts = [
                { id: 1, name: "Kadıköy", value: "kadikoy", city_id: 1 },
                { id: 2, name: "Beşiktaş", value: "besiktas", city_id: 1 },
                { id: 3, name: "Şişli", value: "sisli", city_id: 1 },
                { id: 4, name: "Üsküdar", value: "uskudar", city_id: 1 }
              ];
              break;
            case "ankara":
              mockDistricts = [
                { id: 5, name: "Çankaya", value: "cankaya", city_id: 2 },
                { id: 6, name: "Keçiören", value: "kecioren", city_id: 2 },
                { id: 7, name: "Mamak", value: "mamak", city_id: 2 }
              ];
              break;
            case "izmir":
              mockDistricts = [
                { id: 8, name: "Konak", value: "konak", city_id: 3 },
                { id: 9, name: "Karşıyaka", value: "karsiyaka", city_id: 3 },
                { id: 10, name: "Bornova", value: "bornova", city_id: 3 }
              ];
              break;
            case "bursa":
              mockDistricts = [
                { id: 11, name: "Osmangazi", value: "osmangazi", city_id: 4 },
                { id: 12, name: "Nilüfer", value: "nilufer", city_id: 4 },
                { id: 13, name: "Yıldırım", value: "yildirim", city_id: 4 }
              ];
              break;
            case "antalya":
              mockDistricts = [
                { id: 14, name: "Muratpaşa", value: "muratpasa", city_id: 5 },
                { id: 15, name: "Konyaaltı", value: "konyaalti", city_id: 5 },
                { id: 16, name: "Kepez", value: "kepez", city_id: 5 }
              ];
              break;
          }
          
          setDistricts(mockDistricts);
          setSelectedDistrict(""); // Reset district when city changes
        } catch (error) {
          console.error("Error updating districts:", error);
          setError(new Error("Failed to update districts"));
        } finally {
          setLoading(false);
        }
      } else {
        setDistricts([]);
        setSelectedDistrict("");
      }
    };

    updateDistricts();
  }, [selectedCity]);

  return {
    cities,
    districts,
    loading,
    error,
    selectedCity, 
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict
  };
};
