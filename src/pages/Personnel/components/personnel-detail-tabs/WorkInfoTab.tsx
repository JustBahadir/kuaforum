
import React from "react";
import { formatDate, formatCurrency } from "@/lib/utils";

export interface WorkInfoTabProps {
  personnel: any;
  onSave?: () => void;
}

export function WorkInfoTab({ personnel, onSave }: WorkInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">İşe Başlama Tarihi</h3>
          <div className="text-base font-normal">
            {personnel.ise_baslama_tarihi ? formatDate(personnel.ise_baslama_tarihi) : "-"}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">İşten Ayrılma Tarihi</h3>
          <div className="text-base font-normal">
            {personnel.isten_ayrilma_tarihi ? formatDate(personnel.isten_ayrilma_tarihi) : "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Çalışma Sistemi</h3>
          <div className="text-base font-normal capitalize">
            {personnel.calisma_sistemi === "maas" ? "Maaşlı" : personnel.calisma_sistemi === "komisyon" ? "Komisyonlu" : "-"}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Prim Yüzdesi</h3>
          <div className="text-base font-normal">
            {personnel.prim_yuzdesi ? `%${personnel.prim_yuzdesi}` : "-"}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Maaş</h3>
        <div className="text-base font-normal">
          {personnel.maas ? formatCurrency(personnel.maas) : "-"}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Personel No</h3>
        <div className="text-base font-normal">
          {personnel.personel_no || "-"}
        </div>
      </div>
    </div>
  );
}
