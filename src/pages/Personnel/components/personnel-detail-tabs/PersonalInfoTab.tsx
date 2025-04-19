import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, CalendarDays, Copy, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PersonalInfoTabProps {
  personnel: any;
  onEdit?: () => void;
}

export function PersonalInfoTab({ personnel = {}, onEdit }: PersonalInfoTabProps) {
  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
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

  const {
    avatar_url = null,
    ad_soyad = '',
    birth_date = null,
    eposta = null,
    telefon = null,
    adres = null,
    iban = null,
    formattedIban = null
  } = personnel || {};

  const displayIban = formattedIban || iban || "-";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                {avatar_url ? (
                  <AvatarImage src={avatar_url} alt={ad_soyad} />
                ) : (
                  <AvatarFallback className="text-3xl bg-purple-100 text-purple-600">
                    {getInitials(ad_soyad)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ad Soyad</p>
                  <p className="text-base">{ad_soyad || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doğum Tarihi</p>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-base">{formatDate(birth_date)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-base">{eposta || "-"}</p>
                    {eposta && (
                      <button 
                        onClick={() => handleCopy(eposta, "E-posta")}
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
                    <p className="text-base">{telefon || "-"}</p>
                    {telefon && (
                      <button 
                        onClick={() => handleCopy(telefon, "Telefon")}
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
                    <p className="text-base">{adres || "-"}</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-base">{displayIban}</p>
                    {displayIban !== "-" && (
                      <button 
                        onClick={() => handleCopy(iban || displayIban, "IBAN")}
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
