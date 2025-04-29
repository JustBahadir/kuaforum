
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

export interface ProfileDisplayProps {
  profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: "erkek" | "kadın" | null;
    birthdate?: string;
    avatarUrl?: string;
    address?: string;
    iban?: string;
    role?: string;
  };
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const {
    firstName = '',
    lastName = '',
    email = '',
    phone = '',
    gender,
    birthdate,
    avatarUrl,
    address,
    iban
  } = profile;
  
  // Format gender for display
  const formatGender = (gender?: string | null) => {
    if (!gender) return "Belirtilmemiş";
    
    switch(gender) {
      case "erkek": return "Erkek";
      case "kadın": return "Kadın";
      default: return "Belirtilmemiş";
    }
  };
  
  // Format birthdate for display
  const formatBirthdate = (birthdate?: string) => {
    if (!birthdate) return "Belirtilmemiş";
    try {
      return format(new Date(birthdate), "dd.MM.yyyy");
    } catch (error) {
      return "Belirtilmemiş";
    }
  };

  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <CardTitle>Mevcut Bilgilerim</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-500">AD SOYAD</p>
            <p>{firstName} {lastName}</p>
          </div>
          <div className="flex-1 space-y-1 mt-4 md:mt-0">
            <p className="text-sm font-medium text-gray-500">E-POSTA ADRESİ</p>
            <p>{email}</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-500">TELEFON</p>
            <p>{phone || "Belirtilmemiş"}</p>
          </div>
          <div className="flex-1 space-y-1 mt-4 md:mt-0">
            <p className="text-sm font-medium text-gray-500">CİNSİYET</p>
            <p>{formatGender(gender)}</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-500">DOĞUM TARİHİ</p>
            <p>{formatBirthdate(birthdate)}</p>
          </div>
          <div className="flex-1 space-y-1 mt-4 md:mt-0">
            <p className="text-sm font-medium text-gray-500">ADRES</p>
            <p className="flex items-center gap-1">
              {address ? (
                <>
                  <MapPin size={14} className="text-gray-400" />
                  {address}
                </>
              ) : (
                "Belirtilmemiş"
              )}
            </p>
          </div>
        </div>
        
        {iban && (
          <div className="flex flex-col">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-gray-500">IBAN</p>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded">{iban}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
