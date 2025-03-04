
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { personelServisi } from "@/lib/supabase";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StaffProfile() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    birthdate: ""
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: () => profileService.getUserProfile(),
    enabled: !!currentUser
  });

  const { data: personel } = useQuery({
    queryKey: ['personelByAuthId', currentUser?.id],
    queryFn: () => personelServisi.getirByAuthId(currentUser?.id || ""),
    enabled: !!currentUser?.id
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        birthdate: profile.birthdate || ""
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await profileService.updateUserProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        gender: data.gender,
        birthdate: data.birthdate
      });
    },
    onSuccess: () => {
      toast.success("Profil başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refreshProfile();
    },
    onError: (error: any) => {
      toast.error(`Profil güncellenirken hata oluştu: ${error.message}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Profil Bilgilerim</h1>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="work">İş Bilgileri</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgilerim</CardTitle>
                <CardDescription>
                  Profilinizi güncelleyin. Adınız ve unvanınız sistemde görüntülenecektir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ad</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange}
                        placeholder="Adınız" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange}
                        placeholder="Soyadınız" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange}
                        placeholder="Telefon numaranız" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Cinsiyet</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => handleSelectChange("gender", value)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="erkek">Erkek</SelectItem>
                          <SelectItem value="kadın">Kadın</SelectItem>
                          <SelectItem value="diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birthdate">Doğum Tarihi</Label>
                      <Input 
                        id="birthdate" 
                        name="birthdate" 
                        type="date" 
                        value={formData.birthdate} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Güncelleniyor..." : "Profili Güncelle"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work">
            <Card>
              <CardHeader>
                <CardTitle>İş Bilgilerim</CardTitle>
                <CardDescription>
                  İş bilgileriniz ve dükkan detaylarınız.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personel ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Personel No</Label>
                        <Input value={personel.personel_no} readOnly />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Çalışma Sistemi</Label>
                        <Input 
                          value={personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'} 
                          readOnly 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Prim Yüzdesi</Label>
                        <Input value={`%${personel.prim_yuzdesi}`} readOnly />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Maaş</Label>
                        <Input value={`${personel.maas} TL`} readOnly />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-2">Dükkan Bilgileri</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Dükkan</Label>
                          <Input value={personel.dukkan?.ad || "Atanmamış"} readOnly />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Dükkan Adresi</Label>
                          <Input value={personel.dukkan?.adres || "Adres girilmemiş"} readOnly />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Not: İş bilgilerinizi değiştirmek için dükkan yöneticinize başvurun.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Personel bilgileriniz bulunamadı.
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
