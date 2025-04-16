
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi, islemKategoriServisi } from "@/lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CustomerOperations() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const { data: kategoriler = [], isLoading: kategorilerLoading } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: islemKategoriServisi.hepsiniGetir
  });

  const { data: islemler = [], isLoading: islemlerLoading } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
  });

  const handleRandevuAl = (islemId: number) => {
    toast.info("Randevu sayfasına yönlendiriliyorsunuz...");
    navigate("/appointments", { state: { selectedServiceId: islemId } });
  };

  const isLoading = kategorilerLoading || islemlerLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">Hizmetlerimiz</h1>
          <p className="text-gray-600">Sunduğumuz hizmetler ve fiyatları</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Kategori ve Hizmetler</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-4"
              value={openCategory || undefined}
              onValueChange={(value) => setOpenCategory(value)}
            >
              {kategoriler.map((kategori) => {
                const categoryServices = islemler.filter((islem) => islem.kategori_id === kategori.id);
                
                if (categoryServices.length === 0) return null;
                
                return (
                  <AccordionItem 
                    key={kategori.id} 
                    value={String(kategori.id)} 
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 bg-slate-50 hover:bg-slate-100 font-medium">
                      {kategori.kategori_adi}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-4 py-2">
                        {categoryServices.map((islem) => (
                          <div key={islem.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <div>
                              <h3 className="font-medium">{islem.islem_adi}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{islem.fiyat} ₺</span>
                                {islem.puan > 0 && (
                                  <span className="text-emerald-600">{islem.puan} puan</span>
                                )}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleRandevuAl(islem.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Randevu Al
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
