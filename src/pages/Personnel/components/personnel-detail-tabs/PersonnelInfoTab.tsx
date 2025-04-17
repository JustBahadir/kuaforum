
import React from "react";
import { formatDate } from "@/lib/utils";

export interface PersonnelInfoTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelInfoTab({ personnel }: PersonnelInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Ad Soyad</h3>
          <div className="text-base font-normal">{personnel.ad_soyad}</div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefon</h3>
          <div className="text-base font-normal">{personnel.telefon || "-"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">E-posta</h3>
          <div className="text-base font-normal">{personnel.eposta || "-"}</div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Doğum Tarihi</h3>
          <div className="text-base font-normal">
            {personnel.birth_date ? formatDate(personnel.birth_date) : "-"}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Adres</h3>
        <div className="text-base font-normal">{personnel.adres || "-"}</div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">IBAN</h3>
        <div className="text-base font-normal">{personnel.iban || "-"}</div>
      </div>
    </div>
  );
}
