
import { useState, useEffect } from 'react';

// Define consistent types that work with both components
export interface District {
  id: number;
  name: string;
  value: string;
  city_id?: number;
}

export interface City {
  id: number;
  name: string;
  value: string;
  districts: District[];
}

export const useCityDistricts = () => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

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
        const formattedCities = Object.keys(data).map((cityName, index) => {
          return {
            id: index + 1,
            name: cityName,
            value: cityName.toLowerCase(),
            districts: data[cityName].map((districtName: string, dIndex: number) => ({
              id: dIndex + 1,
              name: districtName,
              value: districtName.toLowerCase(),
              city_id: index + 1
            }))
          };
        });
        
        setCities(formattedCities);
      } catch (error) {
        console.error('Error fetching cities data:', error);
        // Fallback with some major cities
        setCities([
          {
            id: 1,
            name: "İstanbul",
            value: "istanbul",
            districts: [
              { id: 1, name: "Kadıköy", value: "kadikoy", city_id: 1 },
              { id: 2, name: "Beşiktaş", value: "besiktas", city_id: 1 },
              { id: 3, name: "Şişli", value: "sisli", city_id: 1 },
              { id: 4, name: "Üsküdar", value: "uskudar", city_id: 1 },
              { id: 5, name: "Maltepe", value: "maltepe", city_id: 1 }
            ]
          },
          {
            id: 2,
            name: "Ankara",
            value: "ankara",
            districts: [
              { id: 6, name: "Çankaya", value: "cankaya", city_id: 2 },
              { id: 7, name: "Keçiören", value: "kecioren", city_id: 2 },
              { id: 8, name: "Yenimahalle", value: "yenimahalle", city_id: 2 }
            ]
          },
          {
            id: 3,
            name: "İzmir",
            value: "izmir",
            districts: [
              { id: 9, name: "Konak", value: "konak", city_id: 3 },
              { id: 10, name: "Karşıyaka", value: "karsiyaka", city_id: 3 },
              { id: 11, name: "Bornova", value: "bornova", city_id: 3 }
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

  return {
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    cities,
    districts
  };
};
