import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { musteriServisi, isletmeServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface NewCustomerFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function NewCustomerForm({ onSave, onCancel }: NewCustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(true);
  const [isletmeId, setIsletmeId] = useState<string>('');
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    dogum_tarihi: '',
    adres: ''
  });
  
  // Get the current user's shop
  useEffect(() => {
    const getCurrentShop = async () => {
      try {
        const isletme = await isletmeServisi.kullaniciIsletmesiniGetir(); // Use the correct function name
        if (isletme) {
          setIsletmeId(isletme.id);
        }
      } catch (error) {
        console.error("İşletme bilgileri alınamadı:", error);
      } finally {
        setShopLoading(false);
      }
    };
    
    getCurrentShop();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!isletmeId) {
      toast.error("İşletme bilgisi bulunamadı");
      setLoading(false);
      return;
    }
    
    try {
      await musteriServisi.ekle({
        ad_soyad: formData.ad_soyad,
        telefon: formData.telefon,
        dogum_tarihi: formData.dogum_tarihi,
        adres: formData.adres,
        isletme_id: isletmeId
      });
      
      toast.success("Yeni müşteri eklendi");
      onSave();
    } catch (error) {
      console.error("Müşteri ekleme hatası:", error);
      toast.error("Müşteri eklenemedi");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ad_soyad" className="block text-sm font-medium text-gray-700">
          Ad Soyad
        </label>
        <Input
          type="text"
          name="ad_soyad"
          id="ad_soyad"
          value={formData.ad_soyad}
          onChange={handleChange}
          placeholder="Ad Soyad"
          required
        />
      </div>
      
      <div>
        <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
          Telefon
        </label>
        <Input
          type="tel"
          name="telefon"
          id="telefon"
          value={formData.telefon}
          onChange={handleChange}
          placeholder="05XX XXX XX XX"
          required
        />
      </div>
      
      <div>
        <label htmlFor="dogum_tarihi" className="block text-sm font-medium text-gray-700">
          Doğum Tarihi
        </label>
        <Input
          type="date"
          name="dogum_tarihi"
          id="dogum_tarihi"
          value={formData.dogum_tarihi}
          onChange={handleChange}
          placeholder="Doğum Tarihi"
        />
      </div>
      
      <div>
        <label htmlFor="adres" className="block text-sm font-medium text-gray-700">
          Adres
        </label>
        <Input
          type="text"
          name="adres"
          id="adres"
          value={formData.adres}
          onChange={handleChange}
          placeholder="Adres"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={loading || shopLoading}
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
