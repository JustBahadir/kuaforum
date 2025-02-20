
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock, Plus, Edit, Trash, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

import { Randevu, RandevuDurumu, randevuServisi, musteriServisi, personelServisi, islemServisi } from '@/lib/supabase';

export default function Appointments() {
  // State tanımları
  const [yeniRandevuAcik, setYeniRandevuAcik] = useState(false);
  const [seciliRandevu, setSeciliRandevu] = useState<Randevu | null>(null);
  const [silinecekRandevu, setSilinecekRandevu] = useState<Randevu | null>(null);
  
  // Form state'leri
  const [formData, setFormData] = useState({
    musteri_id: '',
    personel_id: '',
    tarih: '',
    saat: '',
    durum: 'beklemede' as RandevuDurumu,
    notlar: '',
    islemler: [] as number[]
  });

  // Veri çekme işlemleri
  const { data: randevular, isLoading: randevularYukleniyor } = useQuery({
    queryKey: ['randevular'],
    queryFn: randevuServisi.hepsiniGetir
  });

  const { data: musteriler } = useQuery({
    queryKey: ['musteriler'],
    queryFn: musteriServisi.hepsiniGetir
  });

  const { data: personeller } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir
  });

  const { data: islemler } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  // Form işlemleri
  const formReset = () => {
    setFormData({
      musteri_id: '',
      personel_id: '',
      tarih: '',
      saat: '',
      durum: 'beklemede',
      notlar: '',
      islemler: []
    });
    setSeciliRandevu(null);
  };

  const randevuKaydet = async () => {
    try {
      if (seciliRandevu) {
        await randevuServisi.guncelle(seciliRandevu.id, {
          ...formData,
          musteri_id: Number(formData.musteri_id),
          personel_id: Number(formData.personel_id)
        });
      } else {
        await randevuServisi.ekle({
          ...formData,
          musteri_id: Number(formData.musteri_id),
          personel_id: Number(formData.personel_id)
        });
      }
      setYeniRandevuAcik(false);
      formReset();
    } catch (error) {
      console.error('Randevu kaydedilirken hata:', error);
    }
  };

  const randevuSil = async (id: number) => {
    try {
      await randevuServisi.sil(id);
      setSilinecekRandevu(null);
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
    }
  };

  // Durum badge'i için renk belirleme
  const durumRengi = (durum: RandevuDurumu) => {
    switch (durum) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'iptal_edildi':
        return 'bg-red-100 text-red-800';
      case 'tamamlandi':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (randevularYukleniyor) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Randevular</h1>
        <Dialog open={yeniRandevuAcik} onOpenChange={setYeniRandevuAcik}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                formReset();
                setYeniRandevuAcik(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Randevu
            </Button>
          </DialogTrigger>
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
                  value={formData.musteri_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, musteri_id: value }))}
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
                <Button variant="outline" onClick={() => setYeniRandevuAcik(false)}>
                  İptal
                </Button>
                <Button onClick={randevuKaydet}>
                  {seciliRandevu ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {randevular?.map((randevu) => (
          <div
            key={randevu.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-medium">
                  {randevu.musteri?.ad_soyad}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(randevu.tarih), 'dd MMMM yyyy', { locale: tr })}
                  <Clock className="w-4 h-4 ml-2" />
                  {randevu.saat}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${durumRengi(randevu.durum)}`}>
                {randevu.durum}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSeciliRandevu(randevu);
                  setFormData({
                    musteri_id: randevu.musteri_id.toString(),
                    personel_id: randevu.personel_id.toString(),
                    tarih: randevu.tarih,
                    saat: randevu.saat,
                    durum: randevu.durum,
                    notlar: randevu.notlar || '',
                    islemler: randevu.islemler
                  });
                  setYeniRandevuAcik(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => setSilinecekRandevu(randevu)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                {silinecekRandevu && (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Randevu Silme</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu randevuyu silmek istediğinizden emin misiniz?
                        Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSilinecekRandevu(null)}>
                        İptal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => randevuSil(silinecekRandevu.id)}
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                )}
              </AlertDialog>

              {randevu.durum === 'beklemede' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-500"
                  onClick={() => randevuServisi.guncelle(randevu.id, { durum: 'onaylandi' })}
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}

              {randevu.durum === 'beklemede' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => randevuServisi.guncelle(randevu.id, { durum: 'iptal_edildi' })}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
