
import React from "react";
import { Scissors } from "lucide-react";

export const HeroSection = () => {
  return (
    <header className="min-h-[600px] bg-gradient-to-r from-purple-600 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold">
              Güzellik Hizmetleriniz için Tek Adres
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Online randevu sistemi ile güzellik hizmetlerinizi kolayca yönetin
            </p>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sunduğumuz Hizmetler:</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Online randevu yönetimi
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Personel ve müşteri takibi
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Gelir-gider raporlaması
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  SMS ile bilgilendirme
                </li>
                <li className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Müşteri memnuniyeti takibi
                </li>
              </ul>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src="/lovable-uploads/c3b69903-13bc-40b2-8771-3bfaf470d490.png" 
              alt="Salon" 
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
