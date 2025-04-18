
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PersonnelCardProps {
  personnel: {
    id: number;
    ad_soyad: string;
    telefon: string;
    eposta: string;
    avatar_url?: string;
    calisma_sistemi: string;
    maas: number;
    prim_yuzdesi: number;
    islem_sayisi?: number;
    toplam_ciro?: number;
  };
  onClick?: () => void;
}

export function PersonnelCard({ personnel, onClick }: PersonnelCardProps) {
  const getWorkingSystemLabel = (system: string) => {
    switch (system) {
      case "aylik_maas":
        return "aylık";
      case "haftalik_maas":
        return "haftalık";
      case "gunluk_maas":
        return "günlük";
      case "komisyon":
      case "prim_komisyon":
        return "yüzdelik";
      default:
        return system;
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card 
      className="h-full flex flex-col transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 flex flex-col items-center space-y-3">
        <Badge 
          className="absolute top-3 right-3"
          variant={personnel.calisma_sistemi.includes("komisyon") ? "secondary" : "default"}
        >
          {getWorkingSystemLabel(personnel.calisma_sistemi)}
        </Badge>

        <Avatar className="h-20 w-20">
          <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />
          <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
            {getInitials(personnel.ad_soyad)}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h3 className="font-semibold text-base">{personnel.ad_soyad}</h3>
          <p className="text-sm text-muted-foreground">
            {personnel.calisma_sistemi.includes("komisyon") 
              ? `%${personnel.prim_yuzdesi} Komisyon`
              : formatCurrency(personnel.maas)
            }
          </p>
        </div>
      </div>

      <div className="px-4 pb-2 flex-1">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate">{personnel.telefon}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate">{personnel.eposta}</span>
          </div>
          <div className="mt-3 pt-3 border-t flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">İşlem</p>
              <p className="font-medium">{personnel.islem_sayisi || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ciro</p>
              <p className="font-medium">{formatCurrency(personnel.toplam_ciro || 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
