
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StaffLayout } from "@/components/ui/staff-layout";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { dukkanServisi } from "@/lib/supabase";
import { Store, Phone, Mail, MapPin, Edit2, Save, Image, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  const handleSave = () => {
    updateShopMutation.mutate(shopData);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{dukkanAdi || shopData.ad}</h1>
          {isAdmin && (
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
              className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
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
          )}
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
                        <Label htmlFor="calisma_saatleri">Çalışma Saatleri</Label>
                        <Input 
                          id="calisma_saatleri" 
                          name="calisma_saatleri" 
                          value={shopData.calisma_saatleri} 
                          onChange={handleChange}
                          placeholder="Pazartesi-Cumartesi: 09:00-19:00"
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="logo_url">Logo URL</Label>
                        <Input 
                          id="logo_url" 
                          name="logo_url" 
                          value={shopData.logo_url} 
                          onChange={handleChange}
                          placeholder="https://example.com/logo.png"
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
                      
                      <div className="flex items-start gap-2">
                        <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">Çalışma Saatleri</span>
                          <span>{shopData.calisma_saatleri || "Belirtilmemiş"}</span>
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
              
              {/* Logo ve Resim Kartı */}
              <Card>
                <CardHeader>
                  <CardTitle>Dükkan Logosu</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
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
                  
                  {isAdmin && isEditing && (
                    <Button className="w-full">
                      <Image className="w-4 h-4 mr-2" />
                      Logo Yükle
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="personel">
            <Card>
              <CardHeader>
                <CardTitle>Personel Listesi</CardTitle>
                <CardDescription>Dükkanımızda çalışan uzman personellerimiz</CardDescription>
              </CardHeader>
              <CardContent>
                {shopPersonnel.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shopPersonnel.map((personel) => (
                      <Card key={personel.id} className="overflow-hidden">
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          <Users className="h-16 w-16 text-gray-400" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg">{personel.ad_soyad}</h3>
                          <p className="text-sm text-muted-foreground">{personel.telefon}</p>
                          <p className="text-sm text-muted-foreground">{personel.eposta}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Henüz personel bulunmamaktadır.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
