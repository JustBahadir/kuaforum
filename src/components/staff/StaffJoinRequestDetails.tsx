import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatNameWithTitle } from "@/utils/userNameFormatter";

interface StaffProfile {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  avatar_url?: string;
  birth_date?: string;
  gender?: 'erkek' | 'kadın' | null;
  auth_id?: string;
}

interface StaffEducation {
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  universitedurumu: string;
  universitebolum: string;
  meslekibrans: string;
}

interface StaffHistory {
  isyerleri: string;
  gorevpozisyon: string;
  yarismalar: string;
  belgeler: string;
  cv: string;
}

interface StaffJoinRequestDetailsProps {
  staffId?: number;
  onClose: () => void;
}

export function StaffJoinRequestDetails({ staffId, onClose }: StaffJoinRequestDetailsProps) {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [education, setEducation] = useState<StaffEducation | null>(null);
  const [history, setHistory] = useState<StaffHistory | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  
  useEffect(() => {
    const loadStaffData = async () => {
      if (!staffId) return;
      
      setLoading(true);
      try {
        // Get the staff profile
        const { data: profileData, error: profileError } = await supabase
          .from("personel")
          .select("*")
          .eq("id", staffId)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Get the education data
        const { data: educationData, error: educationError } = await supabase
          .from("staff_education")
          .select("*")
          .eq("personel_id", staffId)
          .single();
          
        if (!educationError && educationData) {
          setEducation(educationData);
        }
        
        // Get the history data
        const { data: historyData, error: historyError } = await supabase
          .from("staff_history")
          .select("*")
          .eq("personel_id", staffId)
          .single();
          
        if (!historyError && historyData) {
          setHistory(historyData);
        }
        
        // Get the request ID
        const { data: requestData, error: requestError } = await supabase
          .from("staff_join_requests")
          .select("id")
          .eq("personel_id", staffId)
          .eq("durum", "pending")
          .single();
          
        if (!requestError && requestData) {
          setRequestId(requestData.id);
        }
        
      } catch (error) {
        console.error("Error loading staff data:", error);
        toast.error("Personel bilgileri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    loadStaffData();
  }, [staffId]);
  
  const handleAcceptRequest = async () => {
    if (!staffId || !requestId) return;
    
    setProcessingAction(true);
    try {
      // Get the shop ID from the request
      const { data: requestData, error: requestError } = await supabase
        .from("staff_join_requests")
        .select("dukkan_id")
        .eq("id", requestId)
        .single();
        
      if (requestError || !requestData?.dukkan_id) {
        throw new Error("İşletme bilgisi alınamadı");
      }
      
      // Update the request status
      const { error: updateRequestError } = await supabase
        .from("staff_join_requests")
        .update({ durum: "accepted", updated_at: new Date().toISOString() })
        .eq("id", requestId);
        
      if (updateRequestError) throw updateRequestError;
      
      // Assign staff to the shop
      const { error: updateStaffError } = await supabase
        .from("personel")
        .update({ dukkan_id: requestData.dukkan_id })
        .eq("id", staffId);
        
      if (updateStaffError) throw updateStaffError;
      
      // Update the staff profile role
      if (profile?.auth_id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .update({ role: "staff" })
          .eq("id", profile.auth_id);
          
        if (profileError) {
          console.error("Profile role update error:", profileError);
          // We don't throw here, as this is not a critical error
        }
      }
      
      toast.success("Personel başvurusu kabul edildi ve işletmenize eklendi");
      onClose();
      
    } catch (error) {
      console.error("Error processing staff request:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleRejectRequest = async () => {
    if (!requestId) return;
    
    setProcessingAction(true);
    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from("staff_join_requests")
        .update({ durum: "rejected", updated_at: new Date().toISOString() })
        .eq("id", requestId);
        
      if (updateError) throw updateError;
      
      toast.success("Personel başvurusu reddedildi");
      onClose();
      
    } catch (error) {
      console.error("Error rejecting staff request:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setProcessingAction(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Personel bilgileri bulunamadı</p>
        <Button variant="outline" onClick={onClose} className="mt-2">
          Kapat
        </Button>
      </div>
    );
  }
  
  const initials = profile.ad_soyad.split(" ").map(n => n[0]).join("").toUpperCase();
  const fullName = formatNameWithTitle(
    profile.ad_soyad.split(" ")[0] || '',
    profile.ad_soyad.split(" ").slice(1).join(" ") || '',
    profile.gender || null
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url || ""} alt={profile.ad_soyad} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{fullName}</h3>
          <p className="text-sm text-muted-foreground">{profile.eposta}</p>
          <p className="text-sm text-muted-foreground">{profile.telefon}</p>
        </div>
      </div>
      
      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Kişisel</TabsTrigger>
          <TabsTrigger value="education">Eğitim</TabsTrigger>
          <TabsTrigger value="history">Deneyim</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Doğum Tarihi</p>
                  <p className="text-sm">
                    {profile.birth_date 
                      ? new Date(profile.birth_date).toLocaleDateString() 
                      : "Belirtilmemiş"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cinsiyet</p>
                  <p className="text-sm">
                    {profile.gender === 'erkek' ? 'Erkek' : 
                     profile.gender === 'kadın' ? 'Kadın' : 
                     'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="education">
          <Card>
            <CardContent className="pt-4 space-y-3">
              {education ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Ortaokul Durumu</p>
                    <p className="text-sm">{education.ortaokuldurumu || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lise Durumu / Türü</p>
                    <p className="text-sm">
                      {education.lisedurumu} {education.liseturu ? `(${education.liseturu})` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Üniversite</p>
                    <p className="text-sm">
                      {education.universitedurumu} 
                      {education.universitebolum ? ` - ${education.universitebolum}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mesleki Branş</p>
                    <p className="text-sm">{education.meslekibrans || "Belirtilmemiş"}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Eğitim bilgileri belirtilmemiş</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-4 space-y-3">
              {history ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">İş Yerleri</p>
                    <p className="text-sm whitespace-pre-line">{history.isyerleri || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Görev / Pozisyon</p>
                    <p className="text-sm whitespace-pre-line">{history.gorevpozisyon || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Yarışmalar</p>
                    <p className="text-sm whitespace-pre-line">{history.yarismalar || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Belgeler / Sertifikalar</p>
                    <p className="text-sm whitespace-pre-line">{history.belgeler || "Belirtilmemiş"}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Geçmiş bilgileri belirtilmemiş</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between gap-3 pt-2">
        <LoadingButton
          variant="outline"
          loading={processingAction}
          onClick={handleRejectRequest}
          className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500"
        >
          Reddet
        </LoadingButton>
        <LoadingButton
          loading={processingAction}
          onClick={handleAcceptRequest}
          className="flex-1"
        >
          Kabul Et
        </LoadingButton>
      </div>
    </div>
  );
}
