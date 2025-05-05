
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, PhoneCall, MapPin, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShopProfilePhotoUpload } from './ShopProfilePhotoUpload';

interface ShopProfileHeaderProps {
  shopData: any;
  isOwner: boolean;
}

const ShopProfileHeader = ({ shopData, isOwner }: ShopProfileHeaderProps) => {
  const navigate = useNavigate();

  if (!shopData) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-purple-400 to-indigo-500">
        {shopData.kapak_url && (
          <img
            src={shopData.kapak_url}
            alt="Salon kapak fotoğrafı"
            className="w-full h-full object-cover"
          />
        )}
        
        {isOwner && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => navigate('/shop-settings')}
              variant="outline"
              className="bg-white/80 hover:bg-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="absolute -top-16 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
            {shopData.logo_url ? (
              <img
                src={shopData.logo_url}
                alt="Salon logosu"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-800 text-2xl font-bold">
                {shopData.ad ? shopData.ad.charAt(0).toUpperCase() : "S"}
              </div>
            )}
          </div>
          
          <div className="sm:ml-28 mt-8 sm:mt-0">
            <h1 className="text-2xl font-bold text-gray-800">{shopData.ad || "Salon Adı"}</h1>
            <p className="text-gray-600 mt-1">{shopData.aciklama || "Salon açıklaması"}</p>
            
            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
              {shopData.adres && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-purple-500" />
                  <span>{shopData.adres}</span>
                </div>
              )}
              {shopData.telefon && (
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 mr-1 text-purple-500" />
                  <span>{shopData.telefon}</span>
                </div>
              )}
              {shopData.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1 text-purple-500" />
                  <a 
                    href={shopData.website.startsWith('http') ? shopData.website : `https://${shopData.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {shopData.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProfileHeader;
