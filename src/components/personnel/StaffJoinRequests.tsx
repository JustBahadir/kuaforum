
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface JoinRequest {
  id: number;
  personel_id: number;
  dukkan_id: number;
  durum: string;
  created_at: string;
  updated_at: string;
  personel?: {
    id: number;
    ad_soyad: string;
    telefon: string;
    eposta: string;
    avatar_url?: string;
    education?: any;
    history?: any;
  };
}

export function StaffJoinRequests() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const { dukkanId } = useCustomerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    loadRequests();
  }, [dukkanId, activeTab]);

  const loadRequests = async () => {
    if (!dukkanId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("staff_join_requests")
        .select(`
          *,
          personel:personel_id (
            id, ad_soyad, telefon, eposta, avatar_url
          )
        `)
        .eq("dukkan_id", dukkanId)
        .eq("durum", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // For each personel, fetch education and history data
      const requestsWithDetails = await Promise.all((data || []).map(async (request) => {
        if (request.personel?.id) {
          // Fetch education data
          const { data: educationData } = await supabase
            .from("staff_education")
            .select("*")
            .eq("personel_id", request.personel.id)
            .maybeSingle();
            
          // Fetch history data
          const { data: historyData } = await supabase
            .from("staff_history")
            .select("*")
            .eq("personel_id", request.personel.id)
            .maybeSingle();
            
          return {
            ...request,
            personel: {
              ...request.personel,
              education: educationData || {},
              history: historyData || {}
            }
          };
        }
        return request;
      }));
      
      setRequests(requestsWithDetails);
    } catch (error) {
      console.error("Error loading join requests:", error);
      toast.error("Katılım talepleri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: JoinRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingAction(true);
      
      // 1. Update the request status
      const { error: updateError } = await supabase
        .from("staff_join_requests")
        .update({ durum: "accepted" })
        .eq("id", selectedRequest.id);
        
      if (updateError) throw updateError;
      
      // 2. Update the personel record to associate with this shop
      const { error: personelError } = await supabase
        .from("personel")
        .update({ dukkan_id: dukkanId })
        .eq("id", selectedRequest.personel?.id);
        
      if (personelError) throw personelError;
      
      // 3. Find the user's auth_id from the personel table
      const { data: personelData, error: personelFetchError } = await supabase
        .from("personel")
        .select("auth_id")
        .eq("id", selectedRequest.personel?.id)
        .single();
        
      if (personelFetchError) throw personelFetchError;
      
      if (personelData?.auth_id) {
        // 4. Update the user's role in profiles
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ 
            role: 'staff',
            dukkan_id: dukkanId 
          })
          .eq("id", personelData.auth_id);
          
        if (profileUpdateError) throw profileUpdateError;
        
        // 5. Send notification to the personel
        await supabase
          .from("notifications")
          .insert({
            user_id: personelData.auth_id,
            title: "Katılım Talebiniz Onaylandı",
            message: "İşletmeye katılım talebiniz onaylandı. Artık işletme personeli olarak giriş yapabilirsiniz.",
            type: "staff_join_accepted"
          });
      }
      
      toast.success("Personel işletmeye başarıyla eklendi");
      setDetailsOpen(false);
      loadRequests();
      
    } catch (error) {
      console.error("Error accepting join request:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingAction(true);
      
      // Update the request status
      const { error: updateError } = await supabase
        .from("staff_join_requests")
        .update({ durum: "rejected" })
        .eq("id", selectedRequest.id);
        
      if (updateError) throw updateError;
      
      // Send notification to the personel
      const { data: personelData } = await supabase
        .from("personel")
        .select("auth_id")
        .eq("id", selectedRequest.personel?.id)
        .single();
        
      if (personelData?.auth_id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: personelData.auth_id,
            title: "Katılım Talebiniz Reddedildi",
            message: "İşletmeye katılım talebiniz reddedildi.",
            type: "staff_join_rejected"
          });
      }
      
      toast.success("Personel talebi reddedildi");
      setDetailsOpen(false);
      loadRequests();
      
    } catch (error) {
      console.error("Error rejecting join request:", error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  if (!dukkanId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personel Talepleri</CardTitle>
          <CardDescription>
            Bu özelliği kullanmak için bir işletme sahibi olmalısınız.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personel Talepleri</CardTitle>
          <CardDescription>
            İşletmenize katılmak isteyen personellerin taleplerini yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Bekleyen Talepler</TabsTrigger>
              <TabsTrigger value="accepted">Kabul Edilenler</TabsTrigger>
              <TabsTrigger value="rejected">Reddedilenler</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {activeTab === "pending" ? "Bekleyen personel talebi bulunmamaktadır." : 
                   activeTab === "accepted" ? "Kabul edilmiş personel talebi bulunmamaktadır." :
                   "Reddedilmiş personel talebi bulunmamaktadır."}
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          {request.personel?.avatar_url ? (
                            <img 
                              src={request.personel.avatar_url} 
                              alt={request.personel.ad_soyad} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-medium">
                              {request.personel?.ad_soyad.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-medium">{request.personel?.ad_soyad}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleViewDetails(request)}
                          >
                            Detaylar
                          </Button>
                          
                          {activeTab === "pending" && (
                            <>
                              <Button 
                                variant="default" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  handleAcceptRequest();
                                }}
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Kabul Et
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  handleRejectRequest();
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reddet
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personel Bilgileri</DialogTitle>
            <DialogDescription>
              İşletmenize katılmak isteyen personelin detaylı bilgileri
            </DialogDescription>
          </DialogHeader>

          {selectedRequest?.personel && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold mb-2 text-lg">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ad Soyad</p>
                    <p>{selectedRequest.personel.ad_soyad}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                    <p>{selectedRequest.personel.telefon}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                    <p>{selectedRequest.personel.eposta}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Başvuru Tarihi</p>
                    <p>{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Education Info */}
              <div>
                <h3 className="font-semibold mb-2 text-lg">Eğitim Bilgileri</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ortaokul Durumu</p>
                    <p>{selectedRequest.personel.education?.ortaokuldurumu || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lise Durumu</p>
                    <p>{selectedRequest.personel.education?.lisedurumu || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lise Türü</p>
                    <p>{selectedRequest.personel.education?.liseturu || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mesleki Branş</p>
                    <p>{selectedRequest.personel.education?.meslekibrans || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Üniversite Durumu</p>
                    <p>{selectedRequest.personel.education?.universitedurumu || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Üniversite Bölüm</p>
                    <p>{selectedRequest.personel.education?.universitebolum || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Work History */}
              <div>
                <h3 className="font-semibold mb-2 text-lg">İş Deneyimi</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">İş Yerleri</p>
                    <p className="whitespace-pre-line">{selectedRequest.personel.history?.isyerleri || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Görev/Pozisyon</p>
                    <p className="whitespace-pre-line">{selectedRequest.personel.history?.gorevpozisyon || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Belgeler/Sertifikalar</p>
                    <p className="whitespace-pre-line">{selectedRequest.personel.history?.belgeler || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Yarışmalar</p>
                    <p className="whitespace-pre-line">{selectedRequest.personel.history?.yarismalar || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CV</p>
                    <p className="whitespace-pre-line">{selectedRequest.personel.history?.cv || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {activeTab === "pending" && (
              <div className="flex gap-2 w-full sm:justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDetailsOpen(false)}
                >
                  Kapat
                </Button>
                <LoadingButton
                  variant="destructive"
                  onClick={handleRejectRequest}
                  loading={processingAction}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reddet
                </LoadingButton>
                <LoadingButton
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptRequest}
                  loading={processingAction}
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Kabul Et
                </LoadingButton>
              </div>
            )}
            {activeTab !== "pending" && (
              <Button onClick={() => setDetailsOpen(false)}>
                Kapat
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
