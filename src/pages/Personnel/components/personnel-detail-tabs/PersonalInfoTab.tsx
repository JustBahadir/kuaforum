
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PersonalInfoTabProps {
  personnel: any;
}

export function PersonalInfoTab({ personnel }: PersonalInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Ad Soyad</h3>
          <div className="text-base font-normal">{personnel.ad_soyad}</div>
        </div>
        
        {personnel.birth_date && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Doğum Tarihi</h3>
            <div className="text-base font-normal">
              {format(new Date(personnel.birth_date), "dd MMMM yyyy", { locale: tr })}
            </div>
          </div>
        )}
        
        {personnel.telefon && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefon</h3>
            <div className="text-base font-normal">{personnel.telefon}</div>
          </div>
        )}
        
        {personnel.eposta && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">E-posta</h3>
            <div className="text-base font-normal">{personnel.eposta}</div>
          </div>
        )}
      </div>
      
      {personnel.adres && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Adres</h3>
          <div className="text-base font-normal">{personnel.adres}</div>
        </div>
      )}
      
      {personnel.iban && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">IBAN</h3>
          <div className="text-base font-normal font-mono">
            {personnel.formattedIban || personnel.iban}
          </div>
        </div>
      )}
    </div>
  );
}
