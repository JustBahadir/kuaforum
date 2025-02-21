
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Randevu, RandevuDurumu } from '@/lib/supabase';

interface AppointmentFormProps {
  formData: {
    customer_id: string;
    personel_id: string;
    tarih: string;
    saat: string;
    durum: RandevuDurumu;
    notlar: string;
    islemler: number[];
  };
  setFormData: (data: any) => void;
  musteriler: any[];
  personeller: any[];
  seciliRandevu: Randevu | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AppointmentForm({
  formData,
  setFormData,
  musteriler,
  personeller,
  seciliRandevu,
  onSubmit,
  onCancel
}: AppointmentFormProps) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {seciliRandevu ? 'Randevu Düzenle' : 'Yeni Randevu'}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="musteri">Müşteri</Label>
          <Select
            value={formData.customer_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Müşteri seçin" />
            </SelectTrigger>
            <SelectContent>
              {musteriler?.map((musteri) => (
                <SelectItem key={musteri.id} value={musteri.id.toString()}>
                  {musteri.ad_soyad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personel">Personel</Label>
          <Select
            value={formData.personel_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, personel_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Personel seçin" />
            </SelectTrigger>
            <SelectContent>
              {personeller?.map((personel) => (
                <SelectItem key={personel.id} value={personel.id.toString()}>
                  {personel.ad_soyad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tarih">Tarih</Label>
          <Input
            id="tarih"
            type="date"
            value={formData.tarih}
            onChange={(e) => setFormData(prev => ({ ...prev, tarih: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="saat">Saat</Label>
          <Input
            id="saat"
            type="time"
            value={formData.saat}
            onChange={(e) => setFormData(prev => ({ ...prev, saat: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="durum">Durum</Label>
          <Select
            value={formData.durum}
            onValueChange={(value: RandevuDurumu) => setFormData(prev => ({ ...prev, durum: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="onaylandi">Onaylandı</SelectItem>
              <SelectItem value="iptal_edildi">İptal Edildi</SelectItem>
              <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notlar">Notlar</Label>
          <Input
            id="notlar"
            value={formData.notlar}
            onChange={(e) => setFormData(prev => ({ ...prev, notlar: e.target.value }))}
            placeholder="Randevu notları..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button onClick={onSubmit}>
            {seciliRandevu ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
