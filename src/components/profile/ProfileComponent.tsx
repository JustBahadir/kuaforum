
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { LogOut, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useForm } from "react-hook-form";

// Define types for props
export interface EducationData {
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  universitedurumu: string;
  universitebolum: string;
  meslekibrans: string;
}

export interface HistoryData {
  isyerleri: string;
  gorevpozisyon: string;
  belgeler: string;
  yarismalar: string;
  cv: string;
}

export interface ProfileComponentProps {
  activeTab?: string;
  userProfile: any;
  loading?: boolean;
  handleLogout?: () => void;
  handleSave?: (data: any) => Promise<void>;
  handleAvatarUpload?: (file: File | string) => Promise<void>;
  isUploading?: boolean;
  educationData?: EducationData;
  historyData?: HistoryData;
  setEducationData?: React.Dispatch<React.SetStateAction<EducationData>>;
  setHistoryData?: React.Dispatch<React.SetStateAction<HistoryData>>;
}

export function ProfileComponent({
  activeTab = "personal",
  userProfile,
  loading = false,
  handleLogout,
  handleSave,
  handleAvatarUpload,
  isUploading = false,
  educationData,
  historyData,
  setEducationData,
  setHistoryData
}: ProfileComponentProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  
  const form = useForm({
    defaultValues: {
      first_name: userProfile?.first_name || "",
      last_name: userProfile?.last_name || "",
      phone: userProfile?.phone || "",
      email: userProfile?.email || "",
      address: userProfile?.address || "",
      iban: userProfile?.iban || ""
    }
  });

  const onProfileSubmit = async (formData: any) => {
    try {
      if (handleSave) {
        await handleSave(formData);
        toast.success("Profil başarıyla güncellendi", {
          position: "bottom-right"
        });
      }
    } catch (error) {
      toast.error("Profil güncellenirken bir hata oluştu", {
        position: "bottom-right"
      });
      console.error("Profile update error:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profilim</h1>
        {handleLogout && (
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Profil Bilgilerim</CardTitle>
              <CardDescription>Kişisel ve iletişim bilgilerinizi buradan yönetebilirsiniz.</CardDescription>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.first_name} />
                <AvatarFallback>{userProfile?.first_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              
              {handleAvatarUpload && (
                <FileUpload
                  onUploadComplete={handleAvatarUpload}
                  currentImageUrl={userProfile?.avatar_url}
                  label="Profil Fotoğrafı Yükle"
                  id="avatar-upload"
                  isUploading={isUploading}
                >
                  <Button size="sm" variant="outline" disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
                  </Button>
                </FileUpload>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
              <TabsTrigger value="history">Geçmiş Bilgileri</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soyad</FormLabel>
                          <FormControl>
                            <Input placeholder="Soyad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="05XX XXX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input placeholder="E-posta" {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adres</FormLabel>
                          <FormControl>
                            <Input placeholder="Adres" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>IBAN</FormLabel>
                          <FormControl>
                            <Input placeholder="IBAN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="education" className="mt-6">
              {educationData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
                      <Input
                        id="ortaokuldurumu"
                        value={educationData.ortaokuldurumu}
                        onChange={(e) => setEducationData && setEducationData({
                          ...educationData,
                          ortaokuldurumu: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lisedurumu">Lise Durumu</Label>
                      <Input
                        id="lisedurumu"
                        value={educationData.lisedurumu}
                        onChange={(e) => setEducationData && setEducationData({
                          ...educationData,
                          lisedurumu: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="liseturu">Lise Türü</Label>
                      <Input
                        id="liseturu"
                        value={educationData.liseturu}
                        onChange={(e) => setEducationData && setEducationData({
                          ...educationData,
                          liseturu: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
                      <Input
                        id="universitedurumu"
                        value={educationData.universitedurumu}
                        onChange={(e) => setEducationData && setEducationData({
                          ...educationData,
                          universitedurumu: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="universitebolum">Üniversite Bölüm</Label>
                      <Input
                        id="universitebolum"
                        value={educationData.universitebolum}
                        onChange={(e) => setEducationData && setEducationData({
                          ...educationData,
                          universitebolum: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="meslekibrans">Mesleki Branş</Label>
                      <Input
                        id="meslekibrans"
                        value={educationData.meslekibrans}
                        onChange={(e) => setEducationData && setEducationData({
                          ...educationData,
                          meslekibrans: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave && handleSave(educationData)} disabled={loading}>
                      {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              {historyData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="isyerleri">İş Yerleri</Label>
                      <Input
                        id="isyerleri"
                        value={historyData.isyerleri}
                        onChange={(e) => setHistoryData && setHistoryData({
                          ...historyData,
                          isyerleri: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gorevpozisyon">Görev/Pozisyon</Label>
                      <Input
                        id="gorevpozisyon"
                        value={historyData.gorevpozisyon}
                        onChange={(e) => setHistoryData && setHistoryData({
                          ...historyData,
                          gorevpozisyon: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="belgeler">Belgeler</Label>
                      <Input
                        id="belgeler"
                        value={historyData.belgeler}
                        onChange={(e) => setHistoryData && setHistoryData({
                          ...historyData,
                          belgeler: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yarismalar">Yarışmalar</Label>
                      <Input
                        id="yarismalar"
                        value={historyData.yarismalar}
                        onChange={(e) => setHistoryData && setHistoryData({
                          ...historyData,
                          yarismalar: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cv">CV</Label>
                      <Input
                        id="cv"
                        value={historyData.cv}
                        onChange={(e) => setHistoryData && setHistoryData({
                          ...historyData,
                          cv: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave && handleSave(historyData)} disabled={loading}>
                      {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
