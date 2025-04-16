
import React from "react";
import { PersonnelForm } from "@/components/operations/PersonnelForm";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import { toast } from "sonner";

interface PersonnelInfoTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelInfoTab({ personnel, onSave }: PersonnelInfoTabProps) {
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${label} kopyalandı`);
      })
      .catch((error) => {
        toast.error(`Kopyalama hatası: ${error}`);
      });
  };
  
  // Create copies of fields with copy buttons
  const renderFieldWithCopyButton = (value: string, label: string) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <span className="text-sm text-gray-600">{value}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => copyToClipboard(value, label)}
        >
          <Clipboard className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PersonnelForm 
        personnel={personnel} 
        readOnly={true} 
        showWorkInfo={false}
        showPersonalInfo={true}
      />
      
      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Hızlı Erişim</h3>
        {personnel.telefon && renderFieldWithCopyButton(personnel.telefon, "Telefon numarası")}
        {personnel.iban && renderFieldWithCopyButton(personnel.iban, "IBAN")}
      </div>
    </div>
  );
}
