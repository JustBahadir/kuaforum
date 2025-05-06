
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { RegistrationForm } from "@/components/registration/RegistrationForm";

export default function KayitFormu() {
  const {
    loading,
    submitting,
    formData,
    errors,
    handleSubmit,
    handleInputChange,
    handleSelectChange,
    navigate
  } = useRegistrationForm();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Profil Oluşturma</CardTitle>
          <CardDescription className="text-center">
            Hesabınızı tamamlamak için lütfen aşağıdaki bilgileri doldurun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm 
            submitting={submitting}
            formData={formData}
            errors={errors}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onCancel={() => navigate("/login")}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm">
            Vazgeç ve Giriş Sayfasına Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
