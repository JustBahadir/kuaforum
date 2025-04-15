
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Edit, Trash2, ArrowUpRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PersonnelCard({ personnel, onClick, onEdit, onDelete }: PersonnelCardProps) {
  const getWorkingSystemLabel = (system: string) => {
    switch (system) {
      case "aylik_maas":
        return "Aylık";
      case "haftalik_maas":
        return "Haftalık";
      case "gunluk_maas":
        return "Günlük";
      case "prim_komisyon":
        return "Yüzdelik";
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

  const isCommissionBased = personnel.calisma_sistemi === "prim_komisyon";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="relative pb-2">
        <div className="absolute top-2 right-2">
          <Badge variant={isCommissionBased ? "secondary" : "default"} className="text-xs">
            {getWorkingSystemLabel(personnel.calisma_sistemi)}
          </Badge>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />
            <AvatarFallback className="text-lg">{getInitials(personnel.ad_soyad)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-semibold text-base">{personnel.ad_soyad}</h3>
            {isCommissionBased ? (
              <p className="text-sm text-muted-foreground">%{personnel.prim_yuzdesi} Komisyon</p>
            ) : (
              <p className="text-sm text-muted-foreground">{formatCurrency(personnel.maas)}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-1">
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
      </CardContent>

      <CardFooter className="pt-2">
        <div className="w-full grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="w-full">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="w-full text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onClick} className="w-full text-blue-500 hover:text-blue-600">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
