
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PersonnelImageTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelImageTab({ personnel, onSave }: PersonnelImageTabProps) {
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Avatar className="w-32 h-32 border-2 border-primary">
        <AvatarImage 
          src={personnel.avatar_url} 
          alt={personnel.ad_soyad} 
        />
        <AvatarFallback className="text-2xl">{getInitials(personnel.ad_soyad)}</AvatarFallback>
      </Avatar>
      
      <div className="mt-6 text-center">
        <h3 className="font-medium text-lg">{personnel.ad_soyad}</h3>
        {personnel.telefon && (
          <p className="text-muted-foreground">{personnel.telefon}</p>
        )}
      </div>
    </div>
  );
}
