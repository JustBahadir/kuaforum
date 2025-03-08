
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";
import { InputWithIcon } from "./auth/InputWithIcon";
import { LoginError } from "./auth/LoginError";
import { useLoginHandler } from "./auth/useLoginHandler";

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

  return (
    <form onSubmit={handleLogin} className="space-y-4">
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
      />

      <InputWithIcon
        id="password"
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="h-4 w-4" />}
        required
      />

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={loading}
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
