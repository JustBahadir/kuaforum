
import React, { useState } from "react";
import { PersonnelForm } from "@/components/operations/PersonnelForm";
import { Button } from "@/components/ui/button";
import { Copy, X, Check } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";

interface PersonnelInfoTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelInfoTab({ personnel, onSave }: PersonnelInfoTabProps) {
  const { userRole } = useCustomerAuth();
  const isAdmin = userRole === "admin";
  
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${label} başarıyla kopyalandı`);
      })
      .catch(err => {
        toast.error(`${label} kopyalanırken hata oluştu`);
        console.error('Copy failed:', err);
      });
  };

  // This is a read-only view for personnel info
  return (
    <div className="space-y-6">
      {/* Display key information with copy buttons */}
      {personnel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Ad Soyad</h3>
            <div className="text-base font-normal">{personnel.ad_soyad}</div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefon</h3>
            <div className="flex items-center">
              <div className="text-base font-normal">{personnel.telefon}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 ml-1" 
                onClick={() => handleCopyText(personnel.telefon, "Telefon numarası")}
                title="Kopyala"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">E-posta</h3>
            <div className="text-base font-normal">{personnel.eposta}</div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">IBAN</h3>
            <div className="flex items-center">
              <div className="text-base font-normal font-mono">{personnel.iban || "-"}</div>
              {personnel.iban && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 ml-1" 
                  onClick={() => handleCopyText(personnel.iban, "IBAN")}
                  title="Kopyala"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Adres</h3>
            <div className="text-base font-normal">{personnel.adres}</div>
          </div>
        </div>
      )}
      
      <PersonnelForm 
        personnel={personnel} 
        readOnly={true} 
        showWorkInfo={false}
        showPersonalInfo={true}
      />
    </div>
  );
}
