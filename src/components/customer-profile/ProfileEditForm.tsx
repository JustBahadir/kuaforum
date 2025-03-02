
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Calendar } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface ProfileEditFormProps {
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    gender: string;
    age: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => Promise<void>;
  isSaving: boolean;
}

export function ProfileEditForm({ 
  profile, 
  handleChange, 
  handleSave, 
  isSaving 
}: ProfileEditFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profili Düzenle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User size={16} />
              Adınız
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              placeholder="Adınız"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User size={16} />
              Soyadınız
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              placeholder="Soyadınız"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone size={16} />
            Telefon Numaranız
          </Label>
          <Input
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="05XX XXX XX XX"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2">
              <User size={16} />
              Cinsiyet (Opsiyonel)
            </Label>
            <Input
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              placeholder="Cinsiyet"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2">
              <Calendar size={16} />
              Yaş (Opsiyonel)
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={profile.age}
              onChange={handleChange}
              placeholder="Yaşınız"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 opacity-70">
            <Mail size={16} />
            E-posta (değiştirilemez)
          </Label>
          <Input
            id="email"
            name="email"
            value={profile.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">E-posta adresinizi değiştirmek için lütfen yetkili ile iletişime geçin.</p>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? "Kaydediliyor..." : "Bilgilerimi Güncelle"}
        </Button>
      </CardFooter>
    </Card>
  );
}
