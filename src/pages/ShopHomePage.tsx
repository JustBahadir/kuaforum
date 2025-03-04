
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { dukkanServisi } from "@/lib/supabase";
import { Store, Phone, Mail, MapPin, Edit2, Save, Image, Users, Star, Clock, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dukkan, Personel } from "@/lib/supabase/types";
import { FileUpload } from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { Badge } from "@/components/ui/badge";

export default function ShopHomePage() {
  const { dukkanId, dukkanAdi, userRole } = useCustomerAuth();
  const queryClient = useQueryClient();
  const isAdmin = userRole === 'admin';
  
  const [isEditing, setIsEditing] = useState(false);
  const [shopData, setShopData] = useState({
    ad: "",
    adres: "",
    il_ilce: "",
    telefon: "",
    email: "",
    calisma_saatleri: "",
    aciklama: "",
    logo_url: ""
  });
  
  const [selectedPersonel, setSelectedPersonel] = useState<Personel | null>(null);
  const [personelDialogOpen, setPersonelDialogOpen] = useState(false);
  
  const { data: dukkan, isLoading } = useQuery({
    queryKey: ['dukkan', dukkanId],
    queryFn: () => dukkanId ? dukkanServisi.getirById(dukkanId) : null,
    enabled: !!dukkanId
  });
  
  const { data: personeller = [] } = useQuery({
    queryKey: ['personeller', dukkanId],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !!dukkanId
  });
  
  const { data: calismaSaatleri = [] } = useQuery({
    queryKey: ['calismaSaatleri', dukkanId],
    queryFn: () => dukkanId ? calismaSaatleriServisi.hepsiniGetir(dukkanId) : [],
    enabled: !!dukkanId
  });
  
  // Filter personnel for this shop only
  const shopPersonnel = personeller.filter(p => p.dukkan_id === dukkanId);
  
  useEffect(() => {
    if (dukkan) {
      setShopData({
        ad: dukkan.ad || "",
        adres: dukkan.adres || "",
        il_ilce: dukkan.il_ilce || "",
        telefon: dukkan.telefon || "",
        email: dukkan.email || "",
        calisma_saatleri: dukkan.calisma_saatleri || "",
        aciklama: dukkan.aciklama || "",
        logo_url: dukkan.logo_url || ""
      });
    }
  }, [dukkan]);
  
  const updateShopMutation = useMutation({
    mutationFn: (data: typeof shopData) => {
      if (!dukkanId) throw new Error("Dükkan ID bulunamadı");
      return dukkanServisi.dukkaniGuncelle(dukkanId, {
        ad: data.ad,
        adres: data.adres,
        il_ilce: data.il_ilce,
        telefon: data.telefon,
        email: data.email,
        calisma_saatleri: data.calisma_saatleri,
        aciklama: data.aciklama,
        logo_url: data.logo_url
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dukkan'] });
      toast.success("Dükkan bilgileri güncellendi");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Güncelleme hatası: ${error.message}`);
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShopData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleLogoUpload = (url: string) => {
    setShopData(prev => ({ ...prev, logo_url: url }));
  };
  
  const handleSave = () => {
    updateShopMutation.mutate(shopData);
  };
  
  const handlePersonelDetails = (personel: Personel) => {
    setSelectedPersonel(personel);
    setPersonelDialogOpen(true);
  };
  
  const renderWorkingHours = () => {
    const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    
    if (calismaSaatleri.length > 0) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gün</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açılış</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapanış</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gunler.map(gun => {
                const gunSaati = calismaSaatleri.find(saat => saat.gun.toLowerCase() === gun.toLowerCase());
                return (
                  <tr key={gun}>
                    <td className="px-4 py-2 whitespace-nowrap">{gun}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{gunSaati?.kapali ? '-' : gunSaati?.acilis || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{gunSaati?.kapali ? '-' : gunSaati?.kapanis || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {gunSaati?.kapali ? (
                        <Badge variant="destructive">Kapalı</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Açık</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    
    return (
      <div className="text-center py-4 text-gray-500">
        Çalışma saatleri eklenmemiş
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <StaffLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </StaffLayout>
    );
  }
  
  if (!dukkan && !isLoading) {
    return (
      <StaffLayout>
        <Alert className="mb-4">
          <AlertDescription>
            Dükkan bilgisi bulunamadı. Lütfen dükkan bilgilerinizi doldurunuz.
          </AlertDescription>
        </Alert>
      </StaffLayout>
    );
  }
  
  return (
    <StaffLayout>
      <div className="container p-4">
        {/* Hero Section */}
        <div className="relative mb-8 bg-gradient-to-r from-purple-700 to-purple-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 px-6 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white flex-shrink-0 shadow-xl border-4 border-white">
              {shopData.logo_url ? (
                <img 
                  src={shopData.logo_url} 
                  alt={shopData.ad} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Store className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{shopData.ad}</h1>
              {shopData.il_ilce && (
                <div className="flex items-center justify-center md:justify-start mt-2 text-white/80">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{shopData.il_ilce}</span>
                </div>
              )}
              {shopData.telefon && (
                <div className="flex items-center justify-center md:justify-start mt-1 text-white/80">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{shopData.telefon}</span>
                </div>
              )}
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  5.0
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white">
                  <Users className="h-3 w-3 mr-1" />
                  {shopPersonnel.length} Personel
                </Badge>
              </div>
            </div>
            {isAdmin && (
              <div className="md:ml-auto">
                <Button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  variant={isEditing ? "default" : "outline"}
                  className={isEditing ? "bg-green-600 hover:bg-green-700 text-white" : "bg-white/20 text-white hover:bg-white/30"}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Düzenle
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="bilgiler" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="bilgiler">Dükkan Bilgileri</TabsTrigger>
            <TabsTrigger value="personel">Personel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bilgiler">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dükkan Bilgi Kartı */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Dükkan Bilgileri</CardTitle>
                  <CardDescription>Dükkanınızın temel bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ad">Dükkan Adı</Label>
                        <Input 
                          id="ad" 
                          name="ad" 
                          value={shopData.ad} 
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="il_ilce">İl/İlçe</Label>
                        <Input 
                          id="il_ilce" 
                          name="il_ilce" 
                          value={shopData.il_ilce} 
                          onChange={handleChange}
                          placeholder="İstanbul/Kadıköy"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adres">Açık Adres</Label>
                        <Textarea 
                          id="adres" 
                          name="adres" 
                          value={shopData.adres} 
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telefon">Telefon</Label>
                        <Input 
                          id="telefon" 
                          name="telefon" 
                          value={shopData.telefon} 
                          onChange={handleChange}
                          placeholder="0212 XXX XX XX"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          value={shopData.email} 
                          onChange={handleChange}
                          placeholder="ornek@dukkan.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="aciklama">Hakkında</Label>
                        <Textarea 
                          id="aciklama" 
                          name="aciklama" 
                          value={shopData.aciklama} 
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground text-sm">Dükkan Adı</span>
                        <span className="text-lg font-medium">{shopData.ad}</span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">İl/İlçe</span>
                          <span>{shopData.il_ilce || "Belirtilmemiş"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">Açık Adres</span>
                          <span>{shopData.adres || "Belirtilmemiş"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">Telefon</span>
                          <span>{shopData.telefon || "Belirtilmemiş"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">E-posta</span>
                          <span>{shopData.email || "Belirtilmemiş"}</span>
                        </div>
                      </div>
                      
                      {shopData.aciklama && (
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-medium mb-2">Hakkında</h3>
                          <p className="text-muted-foreground">{shopData.aciklama}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Logo ve Çalışma Saatleri Kartı */}
              <div className="space-y-6">
                {/* Logo Kartı */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dükkan Logosu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <FileUpload 
                        onUploadComplete={handleLogoUpload}
                        currentImageUrl={shopData.logo_url}
                        label="Logo Yükle"
                        bucketName="photos"
                        folderPath="logos"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {shopData.logo_url ? (
                          <img 
                            src={shopData.logo_url} 
                            alt={`${shopData.ad} logosu`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Image className="w-12 h-12 mb-2" />
                            <span>Logo eklenmemiş</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Çalışma Saatleri Kartı */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-purple-500" />
                        Çalışma Saatleri
                      </CardTitle>
                      <CardDescription>
                        Dükkanın çalışma saatleri
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderWorkingHours()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="personel">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopPersonnel.length > 0 ? (
                shopPersonnel.map((personel) => (
                  <Card key={personel.id} className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center relative">
                      {personel.avatar_url ? (
                        <img 
                          src={personel.avatar_url} 
                          alt={personel.ad_soyad} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-white absolute -bottom-12"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white absolute -bottom-12">
                          <Users className="h-12 w-12 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-16 pb-4">
                      <h3 className="font-bold text-lg text-center">{personel.ad_soyad}</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {personel.cinsiyet === 'erkek' ? 'Bay Kuaför' : personel.cinsiyet === 'kadın' ? 'Bayan Kuaför' : 'Kuaför'}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefon:</span>
                          <span>{personel.telefon}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">E-posta:</span>
                          <span className="truncate max-w-[180px]">{personel.eposta}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Çalışma:</span>
                          <span>{personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-2 pt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePersonelDetails(personel)}
                      >
                        Detaylar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Henüz personel bulunmamaktadır.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Personel Detay Dialog */}
        <Dialog open={personelDialogOpen} onOpenChange={setPersonelDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Personel Detayları</DialogTitle>
              <DialogDescription>
                Personel hakkında detaylı bilgiler
              </DialogDescription>
            </DialogHeader>
            
            {selectedPersonel && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 mb-6">
                  {selectedPersonel.avatar_url ? (
                    <img 
                      src={selectedPersonel.avatar_url} 
                      alt={selectedPersonel.ad_soyad} 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-12 w-12 text-purple-400" />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{selectedPersonel.ad_soyad}</h3>
                    <p className="text-muted-foreground">
                      {selectedPersonel.cinsiyet === 'erkek' ? 'Bay Kuaför' : selectedPersonel.cinsiyet === 'kadın' ? 'Bayan Kuaför' : 'Kuaför'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Telefon</Label>
                      <p>{selectedPersonel.telefon}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">E-posta</Label>
                      <p>{selectedPersonel.eposta}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Adres</Label>
                    <p>{selectedPersonel.adres || "Belirtilmemiş"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Çalışma Sistemi</Label>
                      <p>{selectedPersonel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</p>
                    </div>
                    
                    {isAdmin && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Prim Yüzdesi</Label>
                          <p>%{selectedPersonel.prim_yuzdesi}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Maaş</Label>
                          <p>{selectedPersonel.maas} TL</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="pt-4 flex justify-end">
                    <Button>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
