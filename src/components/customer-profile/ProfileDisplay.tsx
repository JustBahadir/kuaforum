
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProfileDisplayProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function ProfileDisplay({ firstName, lastName, email, phone }: ProfileDisplayProps) {
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
        </div>
      </CardContent>
    </Card>
  );
}
