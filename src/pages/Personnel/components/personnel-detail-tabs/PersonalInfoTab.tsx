
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, CalendarDays, Copy } from "lucide-react";
import { toast } from "sonner";

interface PersonalInfoTabProps {
  personnel: any;
}

export function PersonalInfoTab({ personnel }: PersonalInfoTabProps) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleCopy = (text: string, label: string) => {
    if (!text || text === "-") return;
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} kopyalandı`);
    }).catch(err => {
      console.error('Kopyalama hatası:', err);
      toast.error('Kopyalama başarısız');
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={personnel.avatar_url} alt={personnel.ad_soyad} />
                <AvatarFallback className="text-3xl bg-purple-100 text-purple-600">
                  {getInitials(personnel.ad_soyad)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ad Soyad</p>
                  <p className="text-base">{personnel.ad_soyad || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doğum Tarihi</p>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-base">{formatDate(personnel.birth_date) || "-"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-base">{personnel.eposta || "-"}</p>
                    {personnel.eposta && (
                      <button 
                        onClick={() => handleCopy(personnel.eposta, "E-posta")}
                        className="ml-2 text-muted-foreground hover:text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-base">{personnel.telefon || "-"}</p>
                    {personnel.telefon && (
                      <button 
                        onClick={() => handleCopy(personnel.telefon, "Telefon")}
                        className="ml-2 text-muted-foreground hover:text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Adres</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <p className="text-base">{personnel.adres || "-"}</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                  <div className="flex items-center">
                    <p className="text-base">{personnel.iban || "-"}</p>
                    {personnel.iban && (
                      <button 
                        onClick={() => handleCopy(personnel.iban, "IBAN")}
                        className="ml-2 text-muted-foreground hover:text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
