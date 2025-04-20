
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { PhoneInputField } from "./Customers/components/FormFields/PhoneInputField";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    role: "",
    shopName: "",
    shopCode: "",
  });

  const [errors, setErrors] = useState<{
    role?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    shopName?: string;
  }>({});

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          navigate("/login");
          return;
        }

        const user = data.session.user;
        setUserData(user);

        const metadata = user.user_metadata || {};
        setFormData((prev) => ({
          ...prev,
          firstName: metadata.first_name || user.user_metadata?.given_name || "",
          lastName: metadata.last_name || user.user_metadata?.family_name || "",
          phone: metadata.phone || "",
          gender: metadata.gender || "",
          shopName: metadata.shopname || "",
        }));

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name, phone, gender, shopname")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast.error("Profil bilgileri alınırken bir hata oluştu.");
          setLoading(false);
          return;
        }

        // If profile exists and required fields present, redirect accordingly
        if (
          profileData &&
          profileData.first_name &&
          profileData.last_name &&
          profileData.phone &&
          profileData.role &&
          profileData.gender &&
          profileData.shopname // check shopname presence
        ) {
          // Navigate based on role
          if (profileData.role === "admin") {
            navigate("/shop-home");
          } else if (profileData.role === "staff") {
            navigate("/staff-profile");
          } else {
            navigate("/customer-dashboard");
          }
          return;
        }

        // If profile incomplete, stay here for completion
        setLoading(false);
      } catch (error) {
        console.error("Oturum kontrolü sırasında hata:", error);
        toast.error(
          "Oturum bilgileriniz alınamadı. Lütfen tekrar giriş yapın."
        );
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      shopCode: value !== "staff" ? "" : prev.shopCode,
    }));

    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Bu alan zorunludur";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Bu alan zorunludur";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Bu alan zorunludur";
    }
    if (!formData.gender.trim()) {
      newErrors.gender = "Bu alan zorunludur";
    }
    if (!formData.role.trim()) {
      newErrors.role = "Bu alan zorunludur";
    }
    if (formData.role === "admin" && !formData.shopName.trim()) {
      newErrors.shopName = "Bu alan zorunludur";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Compose the update data ensuring role matches enum: 'admin' or 'staff'
      const updateData: Record<string, any> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        gender: formData.gender || null,
        role: formData.role === "admin" ? "admin" : "staff",
        shopname: formData.role === "admin" ? formData.shopName.trim() : null,
      };

      if (formData.role === "staff" && formData.shopCode.trim().length > 0) {
        updateData.shopCode = formData.shopCode.trim();
      }

      console.log("Profil güncelleme için gönderilen veri:", updateData);

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userData.id, ...updateData });

      if (error) {
        console.error("Profil güncellenirken detaylı hata: ", error);
        toast.error(
          `Profil bilgileri kaydedilirken bir sorun oluştu: ${
            error.message || "Bilinmeyen hata"
          }`
        );
        setSubmitting(false);
        return;
      }

      toast.success("Profil başarıyla kaydedildi!");

      // After successful save, navigate based on role
      if (formData.role === "admin") {
        // For admins, if profile might still be incomplete (shopname?), allow staying here or redirect to setup page
        navigate("/shop-home");
      } else if (formData.role === "staff") {
        navigate("/staff-profile");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (error: any) {
      console.error("Profil güncelleme sırasında istisna:", error);
      toast.error("Profil bilgileri kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.");
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
          <h2 className="text-2xl font-bold text-center">
            Profil Bilgilerinizi Tamamlayın
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className={`block ${errors.firstName ? "text-red-600" : ""}`}
                >
                  Ad*
                </Label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.firstName
                      ? "border-red-600 ring-red-600"
                      : "border-gray-300 ring-pink-500"
                  }`}
                  required
                  aria-invalid={!!errors.firstName}
                  aria-describedby="firstName-error"
                />
                {errors.firstName && (
                  <p
                    id="firstName-error"
                    className="text-xs text-red-600 mt-1"
                  >
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className={`block ${errors.lastName ? "text-red-600" : ""}`}
                >
                  Soyad*
                </Label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.lastName
                      ? "border-red-600 ring-red-600"
                      : "border-gray-300 ring-pink-500"
                  }`}
                  required
                  aria-invalid={!!errors.lastName}
                  aria-describedby="lastName-error"
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-xs text-red-600 mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label 
                htmlFor="phone" 
                className={`block font-semibold mb-1 ${errors.phone ? "text-red-600" : ""}`}
              >
                Telefon Numarası*
              </label>
              <PhoneInputField
                id="phone"
                value={formData.phone}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, phone: val }));
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="05XX XXX XX XX"
                error={errors.phone}
                disabled={false}
              />
            </div>

            <div>
              <Label
                htmlFor="gender"
                className={`block ${errors.gender ? "text-red-600" : ""}`}
              >
                Cinsiyet*
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, gender: value }));
                  if (errors.gender)
                    setErrors((prev) => ({ ...prev, gender: undefined }));
                }}
                aria-invalid={!!errors.gender}
                aria-describedby="gender-error"
                aria-required="true"
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Cinsiyet seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p id="gender-error" className="text-xs text-red-600 mt-1">
                  {errors.gender}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="role"
                className={`block ${errors.role ? "text-red-600" : ""}`}
              >
                Kayıt Türü*
              </Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
                required
                aria-invalid={!!errors.role}
                aria-describedby="role-error"
                aria-required="true"
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Kayıt türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Personel</SelectItem>
                  <SelectItem value="admin">İşletme Sahibi</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p id="role-error" className="text-xs text-red-600 mt-1">
                  {errors.role}
                </p>
              )}
            </div>

            {formData.role === "admin" && (
              <div>
                <Label
                  htmlFor="shopName"
                  className={`block ${errors.shopName ? "text-red-600" : ""}`}
                >
                  İşletme Adı*
                </Label>
                <input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  placeholder="Salonunuzun/işletmenizin ismini girin"
                  className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.shopName
                      ? "border-red-600 ring-red-600"
                      : "border-gray-300 ring-pink-500"
                  }`}
                  required={formData.role === "admin"}
                  aria-invalid={!!errors.shopName}
                  aria-describedby="shopName-error"
                  aria-required="true"
                />
                {errors.shopName && (
                  <p id="shopName-error" className="text-xs text-red-600 mt-1">
                    {errors.shopName}
                  </p>
                )}
              </div>
            )}

            {formData.role === "staff" && (
              <div className="space-y-2">
                <Label htmlFor="shopCode" className="block">
                  İşletme Kodu (Opsiyonel)
                </Label>
                <input
                  id="shopCode"
                  name="shopCode"
                  value={formData.shopCode}
                  onChange={handleInputChange}
                  placeholder="Dükkan yöneticisinden alınan kod"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 ring-pink-500"
                />
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

