
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Check, Edit, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

import { PersonalInfoTab } from "./personnel-detail-tabs/PersonalInfoTab";
import { EducationTab } from "./personnel-detail-tabs/EducationTab";
import { WorkHistoryTab } from "./personnel-detail-tabs/WorkHistoryTab";
import { OperationsHistoryTab } from "./personnel-detail-tabs/OperationsHistoryTab";

interface PersonnelDetailProps {
  personel: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function PersonnelDetail({ personel, open, onOpenChange, onRefresh }: PersonnelDetailProps) {
  const [activeTab, setActiveTab] = useState("personalInfo");
  
  if (!personel) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    
    // Format as (5xx) xxx xx xx
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]} ${match[3]} ${match[4]}`;
    }
    
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
        <div className="z-50 grid w-full max-w-5xl gap-4 p-6 bg-background shadow-lg rounded-lg overflow-y-auto max-h-[90vh]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {personel.avatar_url ? (
                  <AvatarImage src={personel.avatar_url} alt={personel.ad_soyad} />
                ) : (
                  <AvatarFallback>{getInitials(personel.ad_soyad)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{personel.ad_soyad}</h2>
                <p className="text-muted-foreground">Personel No: {personel.personel_no}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Kapat</Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {personel.telefon && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPhoneNumber(personel.telefon)}</span>
                  </div>
                )}
                
                {personel.eposta && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{personel.eposta}</span>
                  </div>
                )}
                
                {personel.adres && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{personel.adres}</span>
                  </div>
                )}
                
                {personel.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(personel.birth_date).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Çalışma Sistemi:</span>
                  <span>{personel.calisma_sistemi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maaş:</span>
                  <span>{formatCurrency(personel.maas)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prim Yüzdesi:</span>
                  <span>%{personel.prim_yuzdesi}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hesap Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {personel.iban ? (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">IBAN:</span>
                    <span className="font-mono text-sm break-all">{personel.iban}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">
                    IBAN bilgisi eklenmemiş
                  </div>
                )}
                
                {personel.auth_id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Sisteme giriş yetkisi var
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic mt-2">
                    Sisteme giriş yetkisi yok
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="personalInfo">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
              <TabsTrigger value="workHistory">İş Geçmişi</TabsTrigger>
              <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personalInfo" className="mt-6">
              <PersonalInfoTab personel={personel} onRefresh={onRefresh} />
            </TabsContent>
            
            <TabsContent value="education" className="mt-6">
              <EducationTab personnelId={personel.id} />
            </TabsContent>
            
            <TabsContent value="workHistory" className="mt-6">
              <WorkHistoryTab personnelId={personel.id} />
            </TabsContent>
            
            <TabsContent value="operations" className="mt-6">
              <OperationsHistoryTab personnelId={personel.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Dialog>
  );
}
