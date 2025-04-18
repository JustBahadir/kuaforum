
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseIcon, PercentIcon, CreditCard, Banknote, BadgeCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WorkInfoTabProps {
  personnel: any;
}

export function WorkInfoTab({ personnel }: WorkInfoTabProps) {
  const getWorkingSystemLabel = (system: string) => {
    switch (system) {
      case "aylik_maas":
        return "Aylık Maaş";
      case "haftalik_maas":
        return "Haftalık Maaş";
      case "gunluk_maas":
        return "Günlük Maaş";
      case "komisyon":
        return "Komisyon";
      case "prim_komisyon":
        return "Prim ve Komisyon";
      default:
        return system;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personel Numarası</p>
                <div className="flex items-center mt-1">
                  <BadgeCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">{personnel.personel_no || "-"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Çalışma Sistemi</p>
                <div className="flex items-center mt-1">
                  <BriefcaseIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">{getWorkingSystemLabel(personnel.calisma_sistemi)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maaş</p>
                <div className="flex items-center mt-1">
                  <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">{formatCurrency(personnel.maas)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prim Yüzdesi</p>
                <div className="flex items-center mt-1">
                  <PercentIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">%{personnel.prim_yuzdesi || 0}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                <div className="flex items-center mt-1">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-base">{personnel.iban || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
