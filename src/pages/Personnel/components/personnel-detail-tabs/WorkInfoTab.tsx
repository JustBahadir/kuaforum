
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-range-picker-adapter";
import { toast } from 'sonner';
import { personelServisi } from '@/lib/supabase';
import { Personel } from '@/lib/supabase/types';

interface WorkInfoTabProps {
  personel: Personel;
  onUpdate?: () => void;
  readOnly?: boolean;
}

export function WorkInfoTab({ personel, onUpdate, readOnly = false }: WorkInfoTabProps) {
  const [formData, setFormData] = useState({
    unvan: personel.unvan || '',
    gorev: personel.gorev || '',
    calisma_sistemi: personel.calisma_sistemi || '',
    maas: personel.maas || 0,
    prim_yuzdesi: personel.prim_yuzdesi || 0,
    ise_baslama_tarihi: personel.ise_baslama_tarihi ? new Date(personel.ise_baslama_tarihi) : null,
    personel_no: personel.personel_no || '',
    izin_baslangic: personel.izin_baslangic ? new Date(personel.izin_baslangic) : null,
    izin_bitis: personel.izin_bitis ? new Date(personel.izin_bitis) : null,
    iban: personel.iban || '',
  });

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (readOnly) return;
    
    setLoading(true);
    try {
      await personelServisi.guncelle(personel.id.toString(), {
        unvan: formData.unvan || null,
        gorev: formData.gorev || null,
        calisma_sistemi: formData.calisma_sistemi || null,
        maas: formData.maas || 0,
        prim_yuzdesi: formData.prim_yuzdesi || 0,
        ise_baslama_tarihi: formData.ise_baslama_tarihi ? formData.ise_baslama_tarihi.toISOString() : null,
        personel_no: formData.personel_no || null,
        izin_baslangic: formData.izin_baslangic ? formData.izin_baslangic.toISOString() : null,
        izin_bitis: formData.izin_bitis ? formData.izin_bitis.toISOString() : null,
        iban: formData.iban || null,
      });
      
      toast.success("Personel bilgileri güncellendi");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Personel güncellenirken hata:", error);
      toast.error("Personel güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unvan">Ünvan</Label>
          <Input
            id="unvan"
            value={formData.unvan}
            onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
            placeholder="Örn: Kuaför, Asistan"
            disabled={readOnly}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gorev">Görev</Label>
          <Input
            id="gorev"
            value={formData.gorev}
            onChange={(e) => setFormData({ ...formData, gorev: e.target.value })}
            placeholder="Örn: Saç Kesimi, Renklendirme"
            disabled={readOnly}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calisma-sistemi">Çalışma Sistemi</Label>
          <Select
            value={formData.calisma_sistemi}
            onValueChange={(value) => setFormData({ ...formData, calisma_sistemi: value })}
            disabled={readOnly}
          >
            <SelectTrigger id="calisma-sistemi">
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tam-zamanli">Tam Zamanlı</SelectItem>
              <SelectItem value="yarim-zamanli">Yarım Zamanlı</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="stajyer">Stajyer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ise-baslama-tarihi">İşe Başlama Tarihi</Label>
          <DatePicker
            id="ise-baslama-tarihi"
            date={formData.ise_baslama_tarihi || undefined}
            onSelect={(date) => setFormData({ ...formData, ise_baslama_tarihi: date || null })}
            disabled={readOnly}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maas">Maaş (₺)</Label>
          <Input
            id="maas"
            type="number"
            value={formData.maas || ''}
            onChange={(e) => setFormData({ ...formData, maas: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            disabled={readOnly}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="prim-yuzdesi">Prim Yüzdesi (%)</Label>
          <Input
            id="prim-yuzdesi"
            type="number"
            value={formData.prim_yuzdesi || ''}
            onChange={(e) => setFormData({ ...formData, prim_yuzdesi: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            disabled={readOnly}
            min={0}
            max={100}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="personel-no">Personel No</Label>
          <Input
            id="personel-no"
            value={formData.personel_no}
            onChange={(e) => setFormData({ ...formData, personel_no: e.target.value })}
            placeholder="Personel numarası"
            disabled={readOnly}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input
            id="iban"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            disabled={readOnly}
          />
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-4">İzin Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="izin-baslangic">İzin Başlangıç</Label>
            <DatePicker
              id="izin-baslangic"
              date={formData.izin_baslangic || undefined}
              onSelect={(date) => setFormData({ ...formData, izin_baslangic: date || null })}
              disabled={readOnly}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="izin-bitis">İzin Bitiş</Label>
            <DatePicker
              id="izin-bitis"
              date={formData.izin_bitis || undefined}
              onSelect={(date) => setFormData({ ...formData, izin_bitis: date || null })}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
      
      {!readOnly && (
        <div className="flex justify-end mt-6">
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
          </Button>
        </div>
      )}
    </div>
  );
}
