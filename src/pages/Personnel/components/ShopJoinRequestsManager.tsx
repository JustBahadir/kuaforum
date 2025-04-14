
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JoinRequest {
  id: number;
  personel_id: number;
  dukkan_id: number;
  status: string;
  created_at: string;
  auth_id?: string;
  personel?: {
    id: number;
    ad_soyad: string;
    telefon: string;
    eposta: string;
    avatar_url?: string;
  };
}

export function ShopJoinRequestsManager() {
  const { dukkanId, userRole } = useCustomerAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (dukkanId) {
      loadJoinRequests();
    }
  }, [dukkanId]);

  const loadJoinRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personel_shop_requests')
        .select('*, personel:personel_id(id, ad_soyad, telefon, eposta, avatar_url)')
        .eq('dukkan_id', dukkanId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading join requests:", error);
      toast.error("Katılım istekleri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: JoinRequest) => {
    setProcessingId(request.id);
    
    try {
      // Update request status
      const { error: updateStatusError } = await supabase
        .from('personel_shop_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);
        
      if (updateStatusError) throw updateStatusError;
      
      // Update personnel record with shop connection
      const { error: updatePersonnelError } = await supabase
        .from('personel')
        .update({ dukkan_id: dukkanId })
        .eq('id', request.personel_id);
        
      if (updatePersonnelError) throw updatePersonnelError;
      
      toast.success("Personel dükkana başarıyla eklendi");
      
      // Refresh requests
      loadJoinRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("İstek onaylanırken bir hata oluştu");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setProcessingId(requestId);
    
    try {
      const { error } = await supabase
        .from('personel_shop_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("İstek reddedildi");
      
      // Refresh requests
      loadJoinRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("İstek reddedilirken bir hata oluştu");
    } finally {
      setProcessingId(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!dukkanId || userRole !== 'admin') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Personel katılım isteklerini görüntülemek için dükkan sahibi olmanız gerekmektedir.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Personel Katılım İstekleri</span>
          <Badge variant="outline">{requests.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Bekleyen katılım isteği bulunmuyor.</p>
          </div>
        ) : (
          <ScrollArea className="h-[340px] pr-4">
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.personel?.avatar_url} />
                      <AvatarFallback>{getInitials(request.personel?.ad_soyad || '')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.personel?.ad_soyad}</p>
                      <p className="text-sm text-muted-foreground">{request.personel?.telefon}</p>
                      <p className="text-xs text-muted-foreground">{request.personel?.eposta}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reddet
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
