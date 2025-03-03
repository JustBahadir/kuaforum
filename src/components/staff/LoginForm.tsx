
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import { useLoginForm } from "@/hooks/useLoginForm";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { AuthResponseDialog } from "./AuthResponseDialog";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    loginError,
    authResponseData,
    handleLogin,
    handleSendResetEmail
  } = useLoginForm({ onSuccess });

  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [showAuthResponse, setShowAuthResponse] = useState(false);

  // Forgot password handler
  const handleForgotPassword = () => {
    setShowForgotDialog(true);
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-email">E-posta</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="staff-email" 
              type="email" 
              placeholder="personel@salonyonetim.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="staff-password">Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="staff-password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        {loginError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {loginError}
            <div className="mt-2 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowAuthResponse(true)}
              >
                Detayları Göster
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-end items-center">
          <Button 
            type="button" 
            variant="link" 
            className="text-xs text-purple-600"
            onClick={handleForgotPassword}
          >
            Şifremi Unuttum
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotDialog}
        onOpenChange={setShowForgotDialog}
        defaultEmail={email}
        onSendReset={handleSendResetEmail}
      />
      
      {/* Auth Response Details Dialog */}
      <AuthResponseDialog
        open={showAuthResponse}
        onOpenChange={setShowAuthResponse}
        responseData={authResponseData}
      />
    </>
  );
}
