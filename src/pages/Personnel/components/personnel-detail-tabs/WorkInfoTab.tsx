
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      case "prim_komisyon":
        return "Yüzdelik Çalışma";
      default:
        return system;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Çalışma Sistemi</h3>
          <Badge variant={personnel.calisma_sistemi === "prim_komisyon" ? "secondary" : "outline"}>
            {getWorkingSystemLabel(personnel.calisma_sistemi)}
          </Badge>
        </div>

        {personnel.calisma_sistemi === "prim_komisyon" ? (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Prim Yüzdesi</h3>
            <div className="font-semibold">%{personnel.prim_yuzdesi}</div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Maaş Tutarı</h3>
            <div className="font-semibold">{formatCurrency(personnel.maas)}</div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Personel No</h3>
          <div>{personnel.personel_no || "-"}</div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-3">Özet Bilgiler</h3>
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-sm text-muted-foreground">Toplam Prim</td>
              <td className="py-2 text-right font-medium">{formatCurrency(personnel.toplam_prim || 0)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-sm text-muted-foreground">Toplam Ciro</td>
              <td className="py-2 text-right font-medium">{formatCurrency(personnel.toplam_ciro || 0)}</td>
            </tr>
            <tr>
              <td className="py-2 text-sm text-muted-foreground">İşlem Sayısı</td>
              <td className="py-2 text-right font-medium">{personnel.islem_sayisi || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
