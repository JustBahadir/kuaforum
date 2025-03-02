
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface ProfileDisplayProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: string;
  birthdate?: string;
}

export function ProfileDisplay({ 
  firstName, 
  lastName, 
  email, 
  phone, 
  gender, 
  birthdate 
}: ProfileDisplayProps) {
  
  // Format gender for display
  const formatGender = (gender?: string) => {
    if (!gender) return "Belirtilmemiş";
    
    switch(gender) {
      case "male": return "Erkek";
      case "female": return "Kadın";
      case "other": return "Diğer";
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

  return (
    <Card>
      <CardHeader>
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
        </div>
      </CardContent>
    </Card>
  );
}
