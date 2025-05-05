
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-range-picker-adapter";
import { personelServisi } from '@/lib/supabase';
import { toast } from 'sonner';

interface WorkInfoTabProps {
  personel: any;
  onEdit: () => void;
}

export function WorkInfoTab({ personel, onEdit }: WorkInfoTabProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ise_baslama_tarihi: personel?.ise_baslama_tarihi || '',
    unvan: personel?.unvan || '',
    gorev: personel?.gorev || '',
    maas: personel?.maas || 0,
    prim_yuzdesi: personel?.prim_yuzdesi || 0,
    personel_no: personel?.personel_no || '',
    iban: personel?.iban || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, ise_baslama_tarihi: date.toISOString().split('T')[0] }));
    } else {
      setFormData((prev) => ({ ...prev, ise_baslama_tarihi: '' }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (personel?.id) {
        await personelServisi.guncelle(personel.id.toString(), {
          ise_baslama_tarihi: formData.ise_baslama_tarihi,
          unvan: formData.unvan,
          gorev: formData.gorev,
          maas: Number(formData.maas),
          prim_yuzdesi: Number(formData.prim_yuzdesi),
          personel_no: formData.personel_no,
          iban: formData.iban,
        });
        
        toast.success('Personel bilgileri güncellendi');
        setEditing(false);
        if (onEdit) onEdit();
      }
    } catch (error) {
      console.error('Personel güncelleme hatası:', error);
      toast.error('Personel bilgileri güncellenirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Çalışma Bilgileri</h3>
        <Button
          variant="ghost"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'İptal' : 'Düzenle'}
        </Button>
      </div>

      <div className="space-y-4">
        {/* İşe Başlama Tarihi */}
        <div>
          <Label>İşe Başlama Tarihi</Label>
          {editing ? (
            <DatePicker
              value={formData.ise_baslama_tarihi ? new Date(formData.ise_baslama_tarihi) : undefined}
              onChange={handleDateChange}
              placeholder="İşe başlama tarihi seçin"
            />
          ) : (
            <p className="mt-1">{formData.ise_baslama_tarihi || 'Belirtilmemiş'}</p>
          )}
        </div>

        {/* Ünvan */}
        <div>
          <Label htmlFor="unvan">Ünvan</Label>
          {editing ? (
            <Input
              id="unvan"
              name="unvan"
              value={formData.unvan}
              onChange={handleInputChange}
              placeholder="Örn: Kuaför"
              className="mt-1"
            />
          ) : (
            <p className="mt-1">{formData.unvan || 'Belirtilmemiş'}</p>
          )}
        </div>

        {/* Görev */}
        <div>
          <Label htmlFor="gorev">Görev</Label>
          {editing ? (
            <Input
              id="gorev"
              name="gorev"
              value={formData.gorev}
              onChange={handleInputChange}
              placeholder="Örn: Saç Kesimi, Boyama"
              className="mt-1"
            />
          ) : (
            <p className="mt-1">{formData.gorev || 'Belirtilmemiş'}</p>
          )}
        </div>

        {/* Maaş */}
        <div>
          <Label htmlFor="maas">Maaş</Label>
          {editing ? (
            <Input
              id="maas"
              name="maas"
              type="number"
              value={formData.maas}
              onChange={handleInputChange}
              placeholder="Maaş miktarı"
              className="mt-1"
            />
          ) : (
            <p className="mt-1">{formData.maas ? `${formData.maas} ₺` : 'Belirtilmemiş'}</p>
          )}
        </div>

        {/* Prim Yüzdesi */}
        <div>
          <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
          {editing ? (
            <Input
              id="prim_yuzdesi"
              name="prim_yuzdesi"
              type="number"
              value={formData.prim_yuzdesi}
              onChange={handleInputChange}
              placeholder="Örn: 5"
              className="mt-1"
            />
          ) : (
            <p className="mt-1">%{formData.prim_yuzdesi || '0'}</p>
          )}
        </div>

        {/* Personel No */}
        <div>
          <Label htmlFor="personel_no">Personel No</Label>
          {editing ? (
            <Input
              id="personel_no"
              name="personel_no"
              value={formData.personel_no}
              onChange={handleInputChange}
              placeholder="Personel numarası"
              className="mt-1"
            />
          ) : (
            <p className="mt-1">{formData.personel_no || 'Belirtilmemiş'}</p>
          )}
        </div>

        {/* IBAN */}
        <div>
          <Label htmlFor="iban">IBAN</Label>
          {editing ? (
            <Input
              id="iban"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              placeholder="TR..."
              className="mt-1"
            />
          ) : (
            <p className="mt-1">{formData.iban || 'Belirtilmemiş'}</p>
          )}
        </div>

        {editing && (
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              Kaydet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
