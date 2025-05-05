
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kategoriServisi } from '@/lib/supabase';
import { toast } from 'sonner';

interface ServiceCategoryFormProps {
  isletmeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceCategoryForm({ isletmeId, onSuccess, onCancel }: ServiceCategoryFormProps) {
  const [kategoriAdi, setKategoriAdi] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kategoriAdi.trim()) {
      toast.error('Kategori adı boş olamaz');
      return;
    }
    
    if (!isletmeId) {
      toast.error('İşletme ID gereklidir');
      return;
    }
    
    setLoading(true);
    
    try {
      await kategoriServisi.ekle({
        kategori_adi: kategoriAdi,
        isletme_id: isletmeId,
        baslik: kategoriAdi
      });
      
      toast.success('Kategori başarıyla eklendi');
      setKategoriAdi('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      toast.error('Kategori eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kategori_adi">Kategori Adı</Label>
          <Input 
            id="kategori_adi" 
            value={kategoriAdi}
            onChange={(e) => setKategoriAdi(e.target.value)}
            placeholder="Kategori adını giriniz"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
