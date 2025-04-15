
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

interface PersonnelCardProps {
  name: string;
  phone?: string;
  email?: string;
  workingSystem?: string;
  onClick?: () => void;
}

export function PersonnelCard({ name, phone, email, workingSystem, onClick }: PersonnelCardProps) {
  // Correctly format the working system label with proper Turkish characters
  const formatWorkingSystem = (system: string): string => {
    if (!system) return "";
    
    switch (system.toLowerCase()) {
      case "aylik":
      case "aylık":
      case "aylik_maas":
        return "Aylık";
      case "haftalik":
      case "haftalık":
      case "haftalik_maas":
        return "Haftalık";
      case "gunluk":
      case "günlük":
      case "gunluk_maas":
        return "Günlük";
      case "prim_komisyon":
      case "yuzdelik":
      case "yüzdelik":
        return "Yüzdelik";
      default:
        return system;
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-lg">{name}</h3>
          {workingSystem && (
            <span className="bg-gray-100 px-2 py-1 text-xs rounded-full">
              {formatWorkingSystem(workingSystem)}
            </span>
          )}
        </div>
        
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{phone}</span>
          </div>
        )}
        
        {email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
