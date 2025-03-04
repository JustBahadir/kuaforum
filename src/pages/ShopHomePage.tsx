
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Users, 
  Scissors, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Image, 
  Plus, 
  X, 
  Edit 
} from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { randevuServisi } from "@/lib/supabase/services/randevuServisi";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { FileUpload } from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { dukkanServisi } from "@/lib/supabase/services/dukkanServisi";
import { toast } from "sonner";

export default function ShopHomePage() {
  const { userRole, dukkanId, dukkanAdi, refreshProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPersonnel, setTotalPersonnel] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [shopImageDialogOpen, setShopImageDialogOpen] = useState(false);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  
  useEffect(() => {
    refreshProfile();
    
    const fetchDashboardData = async () => {
      if (!dukkanId) return;
      
      try {
        setLoading(true);
        
        // Fetch shop information
        const shopData = await dukkanServisi.getirById(dukkanId);
        setShopInfo(shopData);
        
        // Fetch appointments for today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const appointments = await randevuServisi.dukkanRandevulariniGetir(dukkanId);
        const todayAppointments = appointments.filter(a => a.tarih === todayStr);
        setTodayAppointments(todayAppointments.length);
        
        // Fetch total customers
        const customers = await musteriServisi.hepsiniGetir();
        setTotalCustomers(customers.length);
        
        // Fetch total personnel
        const personnelData = await personelServisi.hepsiniGetir();
        const shopPersonnel = personnelData.filter(p => p.dukkan_id === dukkanId);
        setPersonnel(shopPersonnel);
        setTotalPersonnel(shopPersonnel.length || 1); // At least 1 for shop owner
        
        // Fetch total services
        const services = await islemServisi.hepsiniGetir();
        setTotalServices(services.length);
        
        // Fetch gallery images
        fetchGalleryImages();
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dukkanId, refreshProfile]);
  
  const fetchGalleryImages = async () => {
    try {
      if (!dukkanId) return;

      const { data: filesList, error } = await supabase
        .storage
        .from('shop-photos')
        .list(`gallery/${dukkanId}`);
      
      if (error) {
        console.error("Error fetching gallery images:", error);
        return;
      }
      
      if (filesList && filesList.length > 0) {
        const imageUrls = filesList.map(file => {
          const { data } = supabase.storage
            .from('shop-photos')
            .getPublicUrl(`gallery/${dukkanId}/${file.name}`);
          return data.publicUrl;
        });
        
        setGalleryImages(imageUrls);
      }
    } catch (error) {
      console.error("Gallery fetch error:", error);
    }
  };
  
  const handleLogoUpload = async (url: string) => {
    if (!dukkanId) return;
    
    try {
      setIsUploading(true);
      
      await dukkanServisi.dukkaniGuncelle(dukkanId, {
        logo_url: url
      });
      
      setShopInfo((prev: any) => ({
        ...prev,
        logo_url: url
      }));
      
      toast.success("Dükkan logosu başarıyla güncellendi");
    } catch (error) {
      console.error("Logo update error:", error);
      toast.error("Logo güncellenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleGalleryUpload = async (url: string) => {
    if (!url) return;
    
    setGalleryImages(prev => [...prev, url]);
    setGalleryDialogOpen(false);
    toast.success("Görsel başarıyla galeriye eklendi");
  };
  
  const deleteGalleryImage = async (imageUrl: string) => {
    try {
      if (!dukkanId) return;
      
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `gallery/${dukkanId}/${fileName}`;
      
      const { error } = await supabase
        .storage
        .from('shop-photos')
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
      
      setGalleryImages(prev => prev.filter(img => img !== imageUrl));
      toast.success("Görsel başarıyla silindi");
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      toast.error("Görsel silinirken bir hata oluştu");
    }
  };
  
  const navigateTo = (path: string) => {
    navigate(path);
  };
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-100 flex items-center justify-center bg-white">
              {shopInfo?.logo_url ? (
                <img 
                  src={shopInfo.logo_url} 
                  alt={dukkanAdi || "Kuaför Logo"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Scissors className="w-12 h-12 text-purple-500" />
              )}
              <button 
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md"
                onClick={() => setShopImageDialogOpen(true)}
              >
                <Edit className="w-4 h-4 text-purple-500" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{dukkanAdi || "Kuaför Dükkanı"}</h1>
              <p className="text-sm text-muted-foreground">
                {shopInfo?.adres || "Adres henüz eklenmedi"}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigateTo("/shop-settings")} 
            variant="outline"
            className="ml-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            Dükkan Bilgilerini Düzenle
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList>
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="gallery">Galeri</TabsTrigger>
                <TabsTrigger value="personnel">Personel</TabsTrigger>
                <TabsTrigger value="info">İletişim Bilgileri</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Randevular</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{todayAppointments}</div>
                        <CalendarDays className="h-5 w-5 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Müşteriler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{totalCustomers}</div>
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Personel Sayısı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{totalPersonnel}</div>
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Hizmet Sayısı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{totalServices}</div>
                        <Scissors className="h-5 w-5 text-pink-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Hızlı İşlemler</CardTitle>
                      <CardDescription>Sık kullanılan işlemler</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <Button 
                        onClick={() => navigateTo("/appointments")} 
                        variant="outline" 
                        className="justify-start"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Randevuları Yönet
                      </Button>
                      
                      <Button 
                        onClick={() => navigateTo("/personnel")} 
                        variant="outline" 
                        className="justify-start"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Personel İşlemleri
                      </Button>
                      
                      <Button 
                        onClick={() => navigateTo("/operations/staff")} 
                        variant="outline" 
                        className="justify-start"
                      >
                        <Scissors className="mr-2 h-4 w-4" />
                        Hizmetleri Yönet
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Galeri Ön İzleme</CardTitle>
                      <CardDescription>Dükkanınızdan görüntüler</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {galleryImages.length > 0 ? (
                          <>
                            {galleryImages.slice(0, 5).map((image, index) => (
                              <div 
                                key={index} 
                                className="relative aspect-square rounded-md overflow-hidden cursor-pointer"
                                onClick={() => navigateTo("/shop-settings")}
                              >
                                <img src={image} alt="Dükkan" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {galleryImages.length > 5 && (
                              <div 
                                className="aspect-square bg-gray-100 rounded-md flex items-center justify-center cursor-pointer"
                                onClick={() => navigateTo("/shop-settings")}
                              >
                                <span className="text-lg font-medium text-gray-600">
                                  +{galleryImages.length - 5}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="col-span-3 py-8 text-center">
                            <Image className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-muted-foreground">
                              Galeri boş. Dükkanınızın görsellerini ekleyin.
                            </p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => setGalleryDialogOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Görsel Ekle
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="gallery">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Dükkan Galerisi</CardTitle>
                      <CardDescription>Dükkanınızın görselleri</CardDescription>
                    </div>
                    <Button onClick={() => setGalleryDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Görsel
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {galleryImages.length === 0 ? (
                      <div className="text-center py-12">
                        <Image className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium mb-2">Henüz görsel eklenmemiş</h3>
                        <p className="text-muted-foreground mb-4">
                          Dükkanınızın görsellerini ekleyerek müşterilerinize dükkanınızı tanıtın.
                        </p>
                        <Button onClick={() => setGalleryDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          İlk Görseli Ekle
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((image, index) => (
                          <div key={index} className="group relative aspect-square rounded-md overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Dükkan görsel ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onClick={() => setSelectedGalleryImage(image)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button 
                                variant="destructive" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteGalleryImage(image)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="personnel">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personel</CardTitle>
                      <CardDescription>Dükkanınızdaki çalışanlar</CardDescription>
                    </div>
                    <Button onClick={() => navigateTo("/personnel")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Personel Ekle
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {personnel.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium mb-2">Henüz personel eklenmemiş</h3>
                        <p className="text-muted-foreground mb-4">
                          Dükkanınıza personel ekleyerek iş bölümünü kolaylaştırın.
                        </p>
                        <Button onClick={() => navigateTo("/personnel")}>
                          <Plus className="mr-2 h-4 w-4" />
                          İlk Personeli Ekle
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {personnel.map((person) => (
                          <Card key={person.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{person.ad_soyad}</h3>
                                  <p className="text-sm text-muted-foreground">{person.telefon}</p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <div className="text-sm text-muted-foreground">
                                {person.calisma_sistemi === 'maas' ? 'Maaşlı' : 'Primli'}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigateTo(`/personnel/${person.id}`)}
                              >
                                Detaylar
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="info">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>İletişim Bilgileri</CardTitle>
                      <CardDescription>Müşterilerinizin size ulaşabileceği bilgiler</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h3 className="font-medium">Telefon</h3>
                          <p className="text-muted-foreground">
                            {shopInfo?.telefon || "Henüz telefon numarası eklenmemiş"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h3 className="font-medium">E-posta</h3>
                          <p className="text-muted-foreground">
                            {"Henüz e-posta adresi eklenmemiş"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h3 className="font-medium">Adres</h3>
                          <p className="text-muted-foreground">
                            {shopInfo?.adres || "Henüz adres eklenmemiş"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => navigateTo("/shop-settings")} 
                        variant="outline"
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        İletişim Bilgilerini Düzenle
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Çalışma Saatleri</CardTitle>
                      <CardDescription>Dükkanınızın çalışma saatleri</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((gun, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="font-medium">{gun}</span>
                            <span className="text-muted-foreground">09:00 - 19:00</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => navigateTo("/operations/staff")} 
                        variant="outline"
                        className="w-full"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Çalışma Saatlerini Düzenle
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      {/* Logo Upload Dialog */}
      <Dialog open={shopImageDialogOpen} onOpenChange={setShopImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dükkan Logosu Yükle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUpload
              id="shop-logo-upload"
              onUploadComplete={handleLogoUpload}
              currentImageUrl={shopInfo?.logo_url || ""}
              label="Logo Seç"
              bucketName="shop-photos"
              folderPath="logos"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Gallery Upload Dialog */}
      <Dialog open={galleryDialogOpen} onOpenChange={setGalleryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Galeriye Görsel Ekle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUpload
              id="shop-gallery-upload"
              onUploadComplete={handleGalleryUpload}
              label="Görsel Seç"
              bucketName="shop-photos"
              folderPath={`gallery/${dukkanId}`}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Gallery Image View Dialog */}
      <Dialog 
        open={!!selectedGalleryImage} 
        onOpenChange={(open) => !open && setSelectedGalleryImage(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedGalleryImage && (
            <div className="relative">
              <img 
                src={selectedGalleryImage} 
                alt="Dükkan görsel" 
                className="w-full rounded-md"
              />
              <Button 
                variant="destructive" 
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  if (selectedGalleryImage) {
                    deleteGalleryImage(selectedGalleryImage);
                    setSelectedGalleryImage(null);
                  }
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Görseli Sil
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}
