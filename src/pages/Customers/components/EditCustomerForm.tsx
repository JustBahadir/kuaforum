import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Musteri } from "@/lib/supabase/types";
import { musteriServisi, isletmeServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface EditCustomerFormProps {
  customer: Musteri;
  onSave: () => void;
  onCancel: () => void;
}

export function EditCustomerForm({ customer, onSave, onCancel }: EditCustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad_soyad: customer.ad_soyad || `${customer.ad || customer.first_name || ''} ${customer.soyad || customer.last_name || ''}`,
    telefon: customer.telefon || customer.phone || '',
    dogum_tarihi: customer.dogum_tarihi || customer.birthdate || '',
    // Use customer.adres if exists or fallback to customer.address
    adres: customer.adres || customer.address || ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert customer.id to string since that's what the API expects
      await musteriServisi.guncelle(String(customer.id), {
        ad_soyad: formData.ad_soyad,
        telefon: formData.telefon,
        dogum_tarihi: formData.dogum_tarihi,
        adres: formData.adres,
        isletme_id: customer.isletme_id // Use isletme_id instead of dukkan_id
      });
      
      toast.success("Müşteri bilgileri güncellendi");
      onSave();
    } catch (error) {
      console.error("Müşteri güncelleme hatası:", error);
      toast.error("Müşteri bilgileri güncellenemedi");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
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
            className="mt-1 block w-full"
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
            className="mt-1 block w-full"
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
            className="mt-1 block w-full"
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
            className="mt-1 block w-full"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </form>
  );
}
