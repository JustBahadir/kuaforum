import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonCircle, Phone, Mail, CreditCard, Calendar, User, Home, CheckCircle, MapPin, BriefcaseBusiness } from "lucide-react";
import { profilServisi } from "@/lib/supabase";

interface PersonnelDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  personel: any;
}

export function PersonnelDetailsDialog({ open, onClose, personel }: PersonnelDetailsDialogProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (personel?.auth_id) {
        setLoading(true);
        try {
          const fetchedProfile = await profilServisi.getir(personel.auth_id);
          setProfile(fetchedProfile);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          // Handle error appropriately
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [personel?.auth_id]);

  if (!personel) {
    return null; // Or a suitable placeholder
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personel Detayları</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="w-full lg:w-1/3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PersonCircle className="w-4 h-4" />
                Personel Bilgileri
              </CardTitle>
              <CardDescription>
                Personel hakkında genel bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url || personel.avatar_url} alt={personel.ad_soyad} />
                  <AvatarFallback>{personel.ad_soyad?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold mt-2">{personel.ad_soyad}</h3>
                <Badge variant="secondary">{personel.pozisyon}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{profile?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{profile?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="w-4 h-4 text-gray-500" />
                  <span>{personel.pozisyon || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span>
                    Durum: {personel.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full lg:w-2/3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Detaylı Bilgiler
              </CardTitle>
              <CardDescription>
                Personel hakkında detaylı bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Ad Soyad:</span>
                  </div>
                  <p className="text-sm">{personel.ad_soyad || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Doğum Tarihi:</span>
                  </div>
                  <p className="text-sm">{profile?.birthdate || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span>Adres:</span>
                  </div>
                  <p className="text-sm">{personel.adres || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>Şehir:</span>
                  </div>
                  <p className="text-sm">{personel.sehir || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
