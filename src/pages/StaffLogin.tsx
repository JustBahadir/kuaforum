
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

export default function StaffLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");

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

  // Handle account deletion (Admin function)
  const handleAdminDeleteAccount = async () => {
    if (!emailToDelete) {
      toast.error("Lütfen silmek istediğiniz hesabın e-posta adresini girin");
      return;
    }

    setLoading(true);
    setDeleteStatus("İşlem başlatıldı...");

    try {
      // First, get the user by email
      const { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', emailToDelete)
        .single();

      if (userError) {
        console.error("Kullanıcı bulunamadı:", userError);
        setDeleteStatus("Kullanıcı bulunamadı. Lütfen e-posta adresini kontrol edin.");
        toast.error("Kullanıcı bulunamadı");
        setLoading(false);
        return;
      }

      if (!userData?.id) {
        setDeleteStatus("Kullanıcı bulunamadı");
        toast.error("Kullanıcı bulunamadı");
        setLoading(false);
        return;
      }

      // Delete the user using admin client
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
        userData.id
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
            <AlertDialogTitle>Hesap Silme</AlertDialogTitle>
            <AlertDialogDescription>
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
                  placeholder="silinicek@email.com"
                  required
                />
              </div>
              {deleteStatus && (
                <div className={`p-2 rounded ${deleteStatus.includes("hatası") || deleteStatus.includes("bulunamadı") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {deleteStatus}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAdminDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading || !emailToDelete}
            >
              {loading ? "İşlem yapılıyor..." : "Hesabı Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
