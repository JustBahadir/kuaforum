
import { useState, useEffect } from 'react';

interface District {
  name: string;
  value: string;
}

export interface City {
  name: string;
  value: string;
  districts: District[];
}

export const useCityDistricts = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
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

  return {
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    cities,
    districts
  };
};
