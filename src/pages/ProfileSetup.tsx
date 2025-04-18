
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "erkek",
    role: "personel",
    shopName: "",
    shopCode: ""
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (!data.session) {
          navigate("/login");
          return;
        }

        // Get user data from session
        const user = data.session.user;
        setUserData(user);

        // Pre-fill form with available user data
        const metadata = user.user_metadata || {};
        setFormData(prev => ({
          ...prev,
          firstName: metadata.first_name || user.user_metadata?.given_name || "",
          lastName: metadata.last_name || user.user_metadata?.family_name || "",
          phone: metadata.phone || "",
        }));

        // Check if the user profile is already complete
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, role, first_name, last_name, phone')
          .eq('id', user.id)
          .single();

        if (profileData && profileData.first_name && profileData.last_name && profileData.phone) {
          // Profile is already complete, redirect based on role
          if (profileData.role === 'admin') {
            navigate('/shop-home');
          } else if (profileData.role === 'staff') {
            navigate('/staff-profile');
          } else {
            navigate('/customer-dashboard');
          }
          return;
        }
      } catch (error) {
        console.error("Oturum kontrolü sırasında hata:", error);
        toast.error("Oturum bilgileriniz alınamadı. Lütfen tekrar giriş yapın.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 11 digits (including the leading 0)
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.substring(0, 11);
    
    setFormData(prev => ({ ...prev, phone: limitedDigits }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (formData.role === "admin" && !formData.shopName) {
      toast.error("İşletme adı zorunludur");
      return;
    }

    setSubmitting(true);

    try {
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          gender: formData.gender,
          role: formData.role === "admin" ? "admin" : "staff"
        }
      });

      // Update or create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          gender: formData.gender,
          role: formData.role === "admin" ? "admin" : "staff"
        });

      if (profileError) {
        throw new Error(`Profil güncellenirken hata: ${profileError.message}`);
      }

      // If user is admin, create shop
      if (formData.role === "admin" && formData.shopName) {
        // Generate a random shop code
        const shopCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const { error: shopError } = await supabase
          .from('dukkanlar')
          .insert({
            ad: formData.shopName,
            sahibi_id: userData.id,
            kod: shopCode
          });

        if (shopError) {
          throw new Error(`İşletme oluşturulurken hata: ${shopError.message}`);
        }

        toast.success("Profiliniz ve işletmeniz başarıyla oluşturuldu!");
        navigate('/shop-home');
      } 
      // If user is staff and provided shop code, connect to shop
      else if (formData.role === "staff" && formData.shopCode) {
        // First check if shop code is valid
        const { data: shopData, error: shopError } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('kod', formData.shopCode)
          .single();

        if (shopError || !shopData) {
          toast.error("Geçersiz işletme kodu. İşletmeye bağlanamadınız.");
          navigate('/staff-profile');
          return;
        }

        // Create personel record
        const { error: personelError } = await supabase
          .from('personel')
          .insert({
            auth_id: userData.id,
            ad_soyad: `${formData.firstName} ${formData.lastName}`,
            telefon: formData.phone,
            eposta: userData.email,
            adres: '',
            personel_no: `P${Math.floor(Math.random() * 10000)}`,
            dukkan_id: shopData.id,
            maas: 0,
            prim_yuzdesi: 0,
            calisma_sistemi: 'aylik_maas'
          });

        if (personelError) {
          throw new Error(`Personel kaydı oluşturulurken hata: ${personelError.message}`);
        }

        toast.success("Profiliniz başarıyla oluşturuldu ve işletmeye bağlandınız!");
        navigate('/staff-profile');
      }
      // If user is staff but no shop code, just redirect to profile
      else {
        toast.success("Profiliniz başarıyla oluşturuldu!");
        navigate('/staff-profile');
      }
    } catch (error: any) {
      console.error("Profil güncellenirken hata:", error);
      toast.error(`Profil güncellenirken hata oluştu: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-6 px-8 rounded-t-lg">
          <h2 className="text-2xl font-bold text-center">Profil Bilgilerinizi Tamamlayın</h2>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad*</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad*</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Telefon*</Label>
              <Input
                id="phone"
                name="phone"
                value={formatPhoneNumber(formData.phone)}
                onChange={handlePhoneChange}
                placeholder="05XX XXX XX XX"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Size ulaşabileceğimiz geçerli bir telefon numarası girin</p>
            </div>
            
            <div>
              <Label>Cinsiyet</Label>
              <RadioGroup value={formData.gender} onValueChange={handleGenderChange} className="flex gap-4 mt-2">
                <div className="flex items-center">
                  <RadioGroupItem id="gender-female" value="kadın" />
                  <Label htmlFor="gender-female" className="ml-2">Kadın</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem id="gender-male" value="erkek" />
                  <Label htmlFor="gender-male" className="ml-2">Erkek</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="role">Kayıt Türü*</Label>
              <Select defaultValue={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Kayıt türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Personel</SelectItem>
                  <SelectItem value="admin">İşletme Sahibi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional fields based on role */}
            {formData.role === "admin" && (
              <div>
                <Label htmlFor="shopName">İşletme Adı*</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  placeholder="Salonunuzun/işletmenizin ismini girin"
                  required={formData.role === "admin"}
                />
              </div>
            )}
            
            {formData.role === "staff" && (
              <div>
                <Label htmlFor="shopCode">İşletme Kodu (Opsiyonel)</Label>
                <Input
                  id="shopCode"
                  name="shopCode"
                  value={formData.shopCode}
                  onChange={handleInputChange}
                  placeholder="Varsa işletme kodunu girin"
                />
                <p className="text-xs text-gray-500 mt-1">Bağlı olduğunuz işletmenin size verdiği kodu girebilirsiniz</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              disabled={submitting}
            >
              {submitting ? "İşleniyor..." : "Profili Tamamla"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
