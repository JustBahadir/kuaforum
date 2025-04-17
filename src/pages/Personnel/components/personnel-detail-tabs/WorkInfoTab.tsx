
import React from "react";

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
            {personnel.ise_baslama_tarihi ? new Date(personnel.ise_baslama_tarihi).toLocaleDateString('tr-TR') : "-"}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">İşten Ayrılma Tarihi</h3>
          <div className="text-base font-normal">
            {personnel.isten_ayrilma_tarihi ? new Date(personnel.isten_ayrilma_tarihi).toLocaleDateString('tr-TR') : "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Çalışma Sistemi</h3>
          <div className="text-base font-normal capitalize">
            {personnel.calisma_sistemi || "-"}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Maaş</h3>
          <div className="text-base font-normal">
            {personnel.maas ? `₺${personnel.maas}` : "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Prim Yüzdesi</h3>
          <div className="text-base font-normal">
            {personnel.prim_yuzdesi ? `%${personnel.prim_yuzdesi}` : "-"}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Personel Numarası</h3>
          <div className="text-base font-normal">
            {personnel.personel_no || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
