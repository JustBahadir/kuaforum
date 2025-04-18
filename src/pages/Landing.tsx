
import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { LoginSection } from '@/components/home/LoginSection';
import { Calendar, Heart, Search, Star } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Sol Bölüm - Login Section */}
          <LoginSection />
          
          {/* Sağ Bölüm - Avantajlar */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Kolay Randevu</h3>
              <p className="text-gray-600">İstediğiniz tarih ve saatte kolayca randevunuzu alın.</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100">
              <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-pink-900 mb-2">Hizmet Değerlendirmeleri</h3>
              <p className="text-gray-600">Diğer müşterilerin yorumlarını okuyun, kaliteli hizmet alın.</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Özel Teklifler</h3>
              <p className="text-gray-600">Size özel kampanyalardan ve indirimlerden faydalanın.</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100">
              <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-pink-900 mb-2">Salon Bul</h3>
              <p className="text-gray-600">Bölgenizdeki en iyi salonları kolayca keşfedin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
