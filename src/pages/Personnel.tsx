import { useState } from "react";
import { useQuery, type UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PersonelIslemi, 
  Islem, 
  Personel, 
  personelIslemleriServisi, 
  islemServisi,
  personelServisi 
} from "@/lib/supabase";
import { supabase } from "@/lib/supabase"; // supabase client'ı ekledik
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // sonner'dan import ediyoruz
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Personnel() {
  const [islemDialogOpen, setIslemDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonelId, setSelectedPersonelId] = useState<number | null>(null);
  const [personelDuzenle, setPersonelDuzenle] = useState<Personel | null>(null);
  const [yeniPersonel, setYeniPersonel] = useState<Omit<Personel, 'id' | 'created_at'>>({
    ad_soyad: "",
    telefon: "",
    eposta: "",
    adres: "",
    personel_no: "",
    maas: 0,
    calisma_sistemi: "aylik",
    prim_yuzdesi: 0
  });
  
  const [yeniIslem, setYeniIslem] = useState<Omit<PersonelIslemi, 'id' | 'created_at' | 'islem'>>({
    personel_id: 0,
    islem_id: 0,
    aciklama: "",
    tutar: 0,
    prim_yuzdesi: 0,
    odenen: 0,
    puan: 0,
  });

  const queryClient = useQueryClient();

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const { mutate: islemEkle } = useMutation({
    mutationFn: personelIslemleriServisi.ekle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personelIslemleri'] });
      toast("İşlem başarıyla eklendi.");
      setIslemDialogOpen(false);
    },
  });

  const { data: personeller = [], isLoading } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  const { mutate: personelEkle, isPending: isEklemeLoading } = useMutation({
    mutationFn: async (data: Omit<Personel, 'id' | 'created_at'>) => {
      // Önce auth kullanıcısı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.eposta,
        password: 'gecici123', // Geçici şifre - gerçek uygulamada farklı bir yöntem kullanılmalı
        options: {
          data: {
            first_name: data.ad_soyad.split(' ')[0],
            last_name: data.ad_soyad.split(' ').slice(1).join(' '),
            role: 'staff'
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const personelData = {
        ...data,
        auth_id: authData.user?.id,
        personel_no: `P${Math.floor(Math.random() * 10000)}`
      };

      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .insert([personelData])
        .select()
        .single();

      if (personelError) {
        throw new Error('Personel kaydı oluşturulurken bir hata oluştu');
      }

      return personel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success('Personel başarıyla eklendi');
      setYeniPersonel({
        ad_soyad: "",
        telefon: "",
        eposta: "",
        adres: "",
        personel_no: "",
        maas: 0,
        calisma_sistemi: "aylik",
        prim_yuzdesi: 0
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    }
  });

  const { mutate: personelGuncelle } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personel> }) =>
      personelServisi.guncelle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast("Personel başarıyla güncellendi.");
      setPersonelDuzenle(null);
    },
  });

  const { mutate: personelSil } = useMutation({
    mutationFn: (id: number) => personelServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast("Personel başarıyla silindi.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    personelEkle(yeniPersonel);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (personelDuzenle) {
      const { id, created_at, ...guncellenecekVeriler } = personelDuzenle;
      personelGuncelle({ id, data: guncellenecekVeriler });
    }
  };

  const renderIslemEkleForm = (personelId: number) => (
    <Dialog open={islemDialogOpen} onOpenChange={setIslemDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Yeni İşlem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni İşlem Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          islemEkle({
            ...yeniIslem,
            personel_id: personelId
          });
        }}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>İşlem</Label>
              <Select
                onValueChange={(value) => {
                  const selectedIslem = islemler.find(i => i.id === Number(value));
                  if (selectedIslem) {
                    setYeniIslem(prev => ({
                      ...prev,
                      islem_id: selectedIslem.id,
                      tutar: selectedIslem.fiyat,
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="İşlem seçin" />
                </SelectTrigger>
                <SelectContent>
                  {islemler.map((islem) => (
                    <SelectItem key={islem.id} value={islem.id.toString()}>
                      {islem.islem_adi} - {islem.fiyat} TL
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Input
                value={yeniIslem.aciklama}
                onChange={(e) =>
                  setYeniIslem(prev => ({ ...prev, aciklama: e.target.value }))
                }
                placeholder="İşlem açıklaması..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">İşlem Ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Rapor için tarih filtresi state'i
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  // İşlem geçmişi ve performans verileri
  const { data: islemGecmisi = [] }: UseQueryResult<PersonelIslemi[], Error> = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: async () => {
      const data = await personelIslemleriServisi.hepsiniGetir();
      return data;
    }
  });

  // Performans verilerini hesapla
  const performansVerileri = personeller?.map(personel => {
    const islemler = islemGecmisi.filter(i => i.personel_id === personel.id);
    const toplamCiro = islemler.reduce((sum, i) => sum + i.tutar, 0);
    return {
      name: personel.ad_soyad,
      ciro: toplamCiro,
      islemSayisi: islemler.length,
      ortalamaPuan: islemler.reduce((sum, i) => sum + i.prim_yuzdesi, 0) / (islemler.length || 1)
    };
  }) || [];

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="personel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personel">Personel Yönetimi</TabsTrigger>
          <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="raporlar">Performans Raporları</TabsTrigger>
        </TabsList>

        <TabsContent value="personel">
          <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2" />
                    Yeni Personel Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Yeni Personel Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ad_soyad">Ad Soyad</Label>
                        <Input
                          id="ad_soyad"
                          value={yeniPersonel.ad_soyad}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              ad_soyad: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefon">Telefon</Label>
                        <Input
                          id="telefon"
                          type="tel"
                          value={yeniPersonel.telefon}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              telefon: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eposta">E-posta</Label>
                        <Input
                          id="eposta"
                          type="email"
                          value={yeniPersonel.eposta}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              eposta: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adres">Adres</Label>
                        <Input
                          id="adres"
                          value={yeniPersonel.adres}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              adres: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="personel_no">Personel No</Label>
                        <Input
                          id="personel_no"
                          value={yeniPersonel.personel_no}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              personel_no: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maas">Maaş</Label>
                        <Input
                          id="maas"
                          type="number"
                          value={yeniPersonel.maas}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              maas: Number(e.target.value),
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
                        <Select
                          onValueChange={(value) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              calisma_sistemi: value as "haftalik" | "aylik",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Çalışma Sistemi Seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="haftalik">Haftalık</SelectItem>
                            <SelectItem value="aylik">Aylık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prim_yuzdesi">Prim Yüzdesi</Label>
                        <Input
                          id="prim_yuzdesi"
                          type="number"
                          value={yeniPersonel.prim_yuzdesi}
                          onChange={(e) =>
                            setYeniPersonel((prev) => ({
                              ...prev,
                              prim_yuzdesi: Number(e.target.value),
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isEklemeLoading}>
                        {isEklemeLoading ? "Ekleniyor..." : "Personel Ekle"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div>Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personeller.map((personel) => (
                  <div
                    key={personel.id}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{personel.ad_soyad}</h3>
                        <p className="text-sm text-muted-foreground">
                          Telefon: {personel.telefon} | E-posta: {personel.eposta}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <form onSubmit={handleUpdate}>
                              <DialogHeader>
                                <DialogTitle>Personel Düzenle</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit_ad_soyad">Ad Soyad</Label>
                                  <Input
                                    id="edit_ad_soyad"
                                    value={personelDuzenle?.ad_soyad || personel.ad_soyad}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev ? { ...prev, ad_soyad: e.target.value } : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_telefon">Telefon</Label>
                                  <Input
                                    id="edit_telefon"
                                    type="tel"
                                    value={personelDuzenle?.telefon || personel.telefon}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev ? { ...prev, telefon: e.target.value } : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_eposta">E-posta</Label>
                                  <Input
                                    id="edit_eposta"
                                    type="email"
                                    value={personelDuzenle?.eposta || personel.eposta}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev ? { ...prev, eposta: e.target.value } : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_adres">Adres</Label>
                                  <Input
                                    id="edit_adres"
                                    value={personelDuzenle?.adres || personel.adres}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev ? { ...prev, adres: e.target.value } : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_personel_no">Personel No</Label>
                                  <Input
                                    id="edit_personel_no"
                                    value={personelDuzenle?.personel_no || personel.personel_no}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev ? { ...prev, personel_no: e.target.value } : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_maas">Maaş</Label>
                                  <Input
                                    id="edit_maas"
                                    type="number"
                                    value={personelDuzenle?.maas || personel.maas}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev ? { ...prev, maas: Number(e.target.value) } : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_calisma_sistemi">Çalışma Sistemi</Label>
                                  <Select
                                    onValueChange={(value) =>
                                      setPersonelDuzenle((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              calisma_sistemi: value as "haftalik" | "aylik",
                                            }
                                          : personel
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          personelDuzenle?.calisma_sistemi ||
                                          personel.calisma_sistemi
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="haftalik">Haftalık</SelectItem>
                                      <SelectItem value="aylik">Aylık</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit_prim_yuzdesi">Prim Yüzdesi</Label>
                                  <Input
                                    id="edit_prim_yuzdesi"
                                    type="number"
                                    value={personelDuzenle?.prim_yuzdesi || personel.prim_yuzdesi}
                                    onChange={(e) =>
                                      setPersonelDuzenle((prev) =>
                                        prev
                                          ? { ...prev, prim_yuzdesi: Number(e.target.value) }
                                          : personel
                                      )
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Değişiklikleri Kaydet</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu personeli silmek istediğinizden emin misiniz?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => personelSil(personel.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          onClick={() => {
                            setSelectedPersonelId(personel.id);
                            setIslemDialogOpen(true);
                          }}
                        >
                          İşlem Ekle
                        </Button>
                      </div>
                    </div>
                    {selectedPersonelId === personel.id && renderIslemEkleForm(personel.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="islemler">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
              <div className="flex gap-4">
                <DateRangePicker 
                  from={dateRange.from}
                  to={dateRange.to}
                  onSelect={({from, to}) => setDateRange({from, to})}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {islemGecmisi.map((islem) => (
                      <tr key={islem.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.aciklama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.tutar} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          %{islem.prim_yuzdesi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.odenen} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.puan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raporlar">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ciro Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performansVerileri}
                      dataKey="ciro"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {performansVerileri.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personel Performans Karşılaştırması</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performansVerileri}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="islemSayisi" name="İşlem Sayısı" fill="#0088FE" />
                    <Bar dataKey="ortalamaPuan" name="Ortalama Puan" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
