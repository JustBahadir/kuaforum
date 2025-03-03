
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffCardHeader } from "@/components/staff/StaffCardHeader";
import { LoginTabs } from "@/components/staff/LoginTabs";
import { toast } from "sonner";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogDescription } from "@/components/ui/dialog";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");
  const [verifyStep, setVerifyStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Check for any pending password resets or email confirmations
  useEffect(() => {
    const checkHash = async () => {
      try {
        const hash = window.location.hash;
        
        // Handle password reset or email confirmation
        if (hash && (hash.includes("type=recovery") || hash.includes("type=signup"))) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            toast.error("Bağlantı geçersiz: " + error.message);
          } else if (data.session) {
            if (hash.includes("type=recovery")) {
              toast.success("Şifre başarıyla değiştirildi");
            } else {
              toast.success("E-posta adresiniz doğrulandı");
            }
            navigate("/personnel");
          }
        }
      } catch (error) {
        console.error("Hash check error:", error);
      }
    };
    
    checkHash();
  }, [navigate]);

  // Request verification code to delete account
  const requestVerificationCode = async () => {
    if (!emailToDelete) {
      toast.error("Lütfen silmek istediğiniz hesabın e-posta adresini girin");
      return;
    }

    setLoading(true);
    setDeleteStatus("Doğrulama kodu gönderiliyor...");

    try {
      // Send a one-time password to the user's email
      const { error } = await supabase.auth.signInWithOtp({
        email: emailToDelete,
      });

      if (error) {
        setDeleteStatus(`Doğrulama kodu gönderilemedi: ${error.message}`);
        toast.error("Doğrulama kodu gönderilemedi: " + error.message);
        setLoading(false);
        return;
      }

      setVerifyStep(true);
      setDeleteStatus("Doğrulama kodu e-posta adresinize gönderildi. Lütfen kontrol ediniz.");
      toast.success("Doğrulama kodu e-posta adresinize gönderildi");
    } catch (error: any) {
      console.error("Kod gönderim hatası:", error);
      setDeleteStatus(`Beklenmeyen hata: ${error.message}`);
      toast.error("Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion (Admin function)
  const handleAdminDeleteAccount = async () => {
    if (!emailToDelete) {
      toast.error("Lütfen silmek istediğiniz hesabın e-posta adresini girin");
      return;
    }

    if (verifyStep && !verificationCode) {
      toast.error("Lütfen e-posta adresinize gönderilen doğrulama kodunu girin");
      return;
    }

    setLoading(true);
    setDeleteStatus("İşlem başlatıldı...");

    try {
      if (verifyStep) {
        // First, verify the code and sign in the user
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email: emailToDelete,
          token: verificationCode,
          type: 'email'
        });

        if (verifyError) {
          setDeleteStatus(`Doğrulama hatası: ${verifyError.message}`);
          toast.error("Doğrulama başarısız: " + verifyError.message);
          setLoading(false);
          return;
        }

        if (!verifyData.user) {
          setDeleteStatus("Doğrulama başarısız. Geçersiz kod.");
          toast.error("Doğrulama başarısız. Geçersiz kod.");
          setLoading(false);
          return;
        }

        // Now delete the user using the admin client with the verified user ID
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
          verifyData.user.id
        );

        if (deleteError) {
          console.error("Hesap silme hatası:", deleteError);
          setDeleteStatus(`Hesap silme hatası: ${deleteError.message}`);
          toast.error("Hesap silinemedi: " + deleteError.message);
          setLoading(false);
          return;
        }

        setDeleteStatus("Hesap başarıyla silindi!");
        toast.success("Hesap başarıyla silindi. Şimdi yeniden kayıt olabilirsiniz.");
        setShowDeleteDialog(false);
        setVerifyStep(false);
        setVerificationCode("");
      } else {
        // Request verification code first
        await requestVerificationCode();
      }
    } catch (error: any) {
      console.error("Hesap silme hatası:", error);
      setDeleteStatus(`Beklenmeyen hata: ${error.message}`);
      toast.error("Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    // Redirect to personnel page
    navigate("/personnel");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setVerifyStep(false);
    setVerificationCode("");
    setDeleteStatus("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <StaffCardHeader onBack={handleBackClick} />
        <CardContent className="p-6">
          <LoginTabs onSuccess={handleLoginSuccess} />

          <div className="text-center mt-4 space-y-2">
            <Button 
              variant="link" 
              onClick={handleBackClick}
              className="text-purple-600 hover:text-purple-800"
            >
              Ana Sayfaya Dön
            </Button>
            
            <div className="pt-4 border-t border-gray-200 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                size="sm"
              >
                Hesap Sıfırlama Ekranı
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verifyStep ? "E-posta Doğrulama" : "Hesap Silme"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!verifyStep ? (
                <>
                  <p className="mb-4 text-red-600 font-semibold">
                    DİKKAT: Bu işlem geri alınamaz! Hesabınız kalıcı olarak silinecektir.
                  </p>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="delete-email">Silmek istediğiniz e-posta</Label>
                    <Input 
                      id="delete-email" 
                      type="email" 
                      value={emailToDelete}
                      onChange={(e) => setEmailToDelete(e.target.value)}
                      placeholder="silinecek@email.com"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    <span className="font-medium">{emailToDelete}</span> adresine bir doğrulama kodu gönderdik. 
                    Lütfen e-postanızı kontrol edin ve aşağıya gelen kodu girin.
                  </p>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="verification-code">Doğrulama Kodu</Label>
                    <Input 
                      id="verification-code" 
                      type="text" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      required
                    />
                  </div>
                </>
              )}
              
              {deleteStatus && (
                <div className={`p-2 rounded ${deleteStatus.includes("hatası") || deleteStatus.includes("beklenmeyen") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {deleteStatus}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAdminDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading || !emailToDelete || (verifyStep && !verificationCode)}
            >
              {loading ? "İşlem yapılıyor..." : verifyStep ? "Doğrula ve Hesabı Sil" : "Doğrulama Kodu Gönder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
