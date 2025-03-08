
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";
import { InputWithIcon } from "./auth/InputWithIcon";
import { LoginError } from "./auth/LoginError";
import { useLoginHandler } from "./auth/useLoginHandler";
import { useState, useEffect } from "react";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    loginError,
    handleLogin
  } = useLoginHandler(onSuccess);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Form gönderildiğinde loading true olur
    if (loading) {
      setIsSubmitting(true);
    }
  }, [loading]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    await handleLogin(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <LoginError error={loginError} />

      <InputWithIcon
        id="email"
        label="E-posta"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ornek@email.com"
        icon={<User className="h-4 w-4" />}
        required
        disabled={isSubmitting}
      />

      <InputWithIcon
        id="password"
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="h-4 w-4" />}
        required
        disabled={isSubmitting}
      />

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
