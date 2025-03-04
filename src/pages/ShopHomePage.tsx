
import { useEffect, useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { authService } from "@/lib/auth/authService";
import { dukkanServisi } from "@/lib/supabase";
import { MapPin, Phone, Clock, Edit, ImagePlus, PlusCircle, Camera, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShopGallery } from "@/components/shop/ShopGallery";
import { ShopProfilePhotoUpload } from "@/components/shop/ShopProfilePhotoUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

export default function ShopHomePage() {
  const { dukkanId, userRole } = useCustomerAuth();
  const [dukkanData, setDukkanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch shop data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!dukkanId) {
          const user = await authService.getCurrentUser();
          if (!user) {
            throw new Error("Kullanıcı bulunamadı");
          }
          
          // Try to get dukkan from userId
          const dukkan = await dukkanServisi.kullanicininDukkani(user.id);
          if (!dukkan) {
            setError("Dükkan bulunamadı. Lütfen önce dükkan bilgilerinizi oluşturun.");
            setLoading(false);
            return;
          }
          
          setDukkanData(dukkan);
        } else {
          // We have a dukkanId, use getirById
          const dukkan = await dukkanServisi.getirById(dukkanId);
          if (!dukkan) {
            setError("Dükkan bilgileri alınamadı.");
            setLoading(false);
            return;
          }
          
          setDukkanData(dukkan);
        }
      } catch (err) {
        console.error("Dükkan bilgileri alınırken hata:", err);
        setError("Dükkan bilgileri alınamadı: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dukkanId]);

  const { data: personelListesi = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: async () => {
      if (!dukkanId && !dukkanData?.id) return [];
      const shopId = dukkanId || dukkanData?.id;
      try {
        const { data, error } = await supabase
          .from('personel')
          .select('*, auth_id')
          .eq('dukkan_id', shopId);
          
        if (error) throw error;
        
        // Get profiles for all personnel to get avatar_url
        if (data && data.length > 0) {
          for (const personel of data) {
            if (personel.auth_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', personel.auth_id)
                .maybeSingle();
                
              if (profileData && profileData.avatar_url) {
                personel.avatar_url = profileData.avatar_url;
              }
            }
          }
        }
        return data || [];
      } catch (error) {
        console.error("Personel listesi alınırken hata:", error);
        return [];
      }
    },
    enabled: !!dukkanId || !!dukkanData?.id
  });

  const { data: calisma_saatleri = [] } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calisma_saatleri')
          .select('*')
          .order('gun', { ascending: true });
          
        if (error) throw error;
        
        // Sort days properly
        const gunSirasi = {
          "pazartesi": 1,
          "sali": 2,
          "carsamba": 3,
          "persembe": 4,
          "cuma": 5,
          "cumartesi": 6,
          "pazar": 7
        };
        
        return data.sort((a, b) => {
          const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
          const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
          return aIndex - bIndex;
        });
      } catch (error) {
        console.error("Çalışma saatleri alınırken hata:", error);
        return [];
      }
    }
  });

  const updateShopMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!dukkanData?.id) throw new Error("Dükkan ID bulunamadı");
      return await dukkanServisi.dukkaniGuncelle(dukkanData.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dukkan'] });
      toast.success("Dükkan bilgileri güncellendi");
    },
    onError: (error) => {
      toast.error(`Güncelleme hatası: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  const gunIsimleri: Record<string, string> = {
    "pazartesi": "Pazartesi",
    "sali": "Salı",
    "carsamba": "Çarşamba",
    "persembe": "Perşembe",
    "cuma": "Cuma",
    "cumartesi": "Cumartesi",
    "pazar": "Pazar"
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Kapalı";
    return time.substring(0, 5); // Extract HH:MM from time string
  };
  
  const openInMaps = () => {
    if (!dukkanData?.acik_adres) {
      toast.error("Haritada göstermek için bir açık adres girilmelidir");
      return;
    }
    
    const encodedAddress = encodeURIComponent(dukkanData.acik_adres);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex justify-center items-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {userRole === 'admin' && (
          <div className="text-center mt-6">
            <Button onClick={() => window.location.href = "/create-shop"}>
              Dükkan Oluştur
            </Button>
          </div>
        )}
      </StaffLayout>
    );
  }

  if (!dukkanData) {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Dükkan bilgileri bulunamadı.</AlertDescription>
        </Alert>
        {userRole === 'admin' && (
          <div className="text-center mt-6">
            <Button onClick={() => window.location.href = "/create-shop"}>
              Dükkan Oluştur
            </Button>
          </div>
        )}
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section with Shop Name and Logo */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 rounded-lg border-2 border-purple-200">
                <AvatarImage src={dukkanData.logo_url || ''} alt={dukkanData.ad} />
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                  {dukkanData.ad?.substring(0, 2).toUpperCase() || "KU"}
                </AvatarFallback>
              </Avatar>
              
              {userRole === 'admin' && (
                <ShopProfilePhotoUpload 
                  dukkanId={dukkanData.id}
                  currentImageUrl={dukkanData.logo_url}
                  onSuccess={(url) => {
                    setDukkanData(prev => ({...prev, logo_url: url}));
                    queryClient.invalidateQueries({ queryKey: ['dukkan'] });
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="absolute bottom-2 right-2 p-1 bg-white rounded-full shadow cursor-pointer">
                    <Camera className="h-5 w-5 text-purple-600" />
                  </div>
                </ShopProfilePhotoUpload>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{dukkanData.ad}</h1>
              <p className="text-gray-600 mt-2">{dukkanData.adres}</p>
              
              {userRole === 'admin' && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = "/shop-settings"}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Dükkan Bilgilerini Düzenle
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Contact Info and Hours */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <div>{dukkanData.adres || "Adres bilgisi bulunmuyor"}</div>
                    {dukkanData.acik_adres && (
                      <div className="text-gray-500 text-sm mt-1">{dukkanData.acik_adres}</div>
                    )}
                  </div>
                </div>
                
                {dukkanData.acik_adres && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full flex items-center gap-2" 
                    onClick={openInMaps}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Haritada Göster
                  </Button>
                )}
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {dukkanData.telefon 
                      ? formatPhoneNumber(dukkanData.telefon) 
                      : "Telefon bilgisi bulunmuyor"}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Working Hours Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Çalışma Saatleri</CardTitle>
                {userRole === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = "/admin/operations"}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calisma_saatleri.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Çalışma saati bilgisi bulunmuyor.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {calisma_saatleri.map((saat: any) => (
                        <div key={saat.gun} className="flex justify-between py-2 border-b">
                          <span className="font-medium">{gunIsimleri[saat.gun] || saat.gun}</span>
                          <span>
                            {saat.kapali 
                              ? "Kapalı" 
                              : `${formatTime(saat.acilis)} - ${formatTime(saat.kapanis)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Middle and Right Columns - Gallery and Staff */}
          <div className="md:col-span-2 space-y-6">
            {/* Gallery Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dükkan Galerisi</CardTitle>
                {userRole === 'admin' && (
                  <ShopProfilePhotoUpload 
                    dukkanId={dukkanData.id} 
                    galleryMode
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['shop-photos', dukkanData.id] });
                    }}
                  >
                    <Button variant="outline" size="sm">
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Fotoğraf Ekle
                    </Button>
                  </ShopProfilePhotoUpload>
                )}
              </CardHeader>
              <CardContent>
                <ShopGallery dukkanId={dukkanData.id} />
              </CardContent>
            </Card>
            
            {/* Staff Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Uzman Personeller</CardTitle>
                {userRole === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = "/personnel"}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Personel Ekle
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {personelListesi.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Henüz personel bulunmuyor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personelListesi.map((personel: any) => (
                      <div key={personel.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <Avatar>
                          <AvatarImage src={personel.avatar_url} />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {personel.ad_soyad.split(' ').map((name: string) => name[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{personel.ad_soyad}</h3>
                          {userRole === 'admin' && personel.telefon && (
                            <p className="text-sm text-muted-foreground">
                              {formatPhoneNumber(personel.telefon)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Services Preview (This could link to a full services page) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sunulan Hizmetler</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = "/services"}
                >
                  Tüm Hizmetleri Gör
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">
                    Saç kesimi, boya, bakım ve daha fazlası için randevu alın.
                  </p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.href = "/appointments"}
                  >
                    Hemen Randevu Al
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
