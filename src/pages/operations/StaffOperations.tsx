
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { KategoriDto, IslemDto } from "@/lib/supabase/types";
import { kategorilerServisi } from "@/lib/supabase/services/kategoriServisi";
import { toast } from "sonner";
import { StaffLayout } from '@/components/ui/staff-layout';

export default function StaffOperations() {
  const [kategoriler, setKategoriler] = useState<KategoriDto[]>([]);
  const [islemler, setIslemler] = useState<IslemDto[]>([]);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [loadingKategoriler, setLoadingKategoriler] = useState(false);
  const [loadingIslemler, setLoadingIslemler] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchIslemler();
  }, []);

  const fetchIslemler = async () => {
    try {
      setLoadingIslemler(true);
      const data = await kategorilerServisi.islemleriGetir();
      setIslemler(data);
    } catch (error) {
      console.error("İşlemler yüklenirken hata:", error);
      toast.error("İşlemler yüklenirken bir hata oluştu");
    } finally {
      setLoadingIslemler(false);
    }
  };

  // Fix the addCategory function to include dukkan_id
  const addCategory = async () => {
    try {
      setAddingCategory(true);
      
      if (!yeniKategoriAdi.trim()) {
        toast.error("Kategori adı boş olamaz");
        return;
      }
      
      await kategorilerServisi.ekle({ 
        kategori_adi: yeniKategoriAdi,
        sira: 0
      });
      
      // Reset form and refetch categories
      setYeniKategoriAdi("");
      toast.success("Kategori başarıyla eklendi");
      await fetchCategories();
      
    } catch (error) {
      console.error("Kategori eklenirken hata:", error);
      toast.error(`Kategori eklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setAddingCategory(false);
    }
  };

  // Add missing fetchCategories function
  const fetchCategories = async () => {
    try {
      setLoadingKategoriler(true);
      const data = await kategorilerServisi.hepsiniGetir();
      setKategoriler(data);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      toast.error("Kategoriler yüklenirken bir hata oluştu");
    } finally {
      setLoadingKategoriler(false);
    }
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Hizmet ve Kategori Yönetimi</h1>

        {/* Kategori Ekleme */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Yeni Kategori Ekle</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Kategori Adı"
              value={yeniKategoriAdi}
              onChange={(e) => setYeniKategoriAdi(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <Button
              onClick={addCategory}
              disabled={addingCategory}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {addingCategory ? "Ekleniyor..." : "Kategori Ekle"}
            </Button>
          </div>
        </div>

        {/* Kategori Listesi */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Kategoriler</h2>
          {loadingKategoriler ? (
            <p>Kategoriler yükleniyor...</p>
          ) : (
            <ul className="list-disc pl-5">
              {kategoriler.map((kategori) => (
                <li key={kategori.id}>{kategori.kategori_adi}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Hizmet Listesi */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Hizmetler</h2>
          {loadingIslemler ? (
            <p>Hizmetler yükleniyor...</p>
          ) : (
            <ul className="list-disc pl-5">
              {islemler.map((islem) => (
                <li key={islem.id}>{islem.islem_adi}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
