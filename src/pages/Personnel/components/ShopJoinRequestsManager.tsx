
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Check, X, PhoneCall, Mail } from "lucide-react";

interface ShopJoinRequest {
  id: number;
  personel_id: number;
  dukkan_id: number;
  status: string;
  created_at: string;
  personel: {
    id: number;
    ad_soyad: string;
    telefon: string;
    eposta: string;
    avatar_url?: string;
  };
}

interface ShopJoinRequestsManagerProps {
  isLoading?: boolean;
  requests: ShopJoinRequest[];
  onRequestApproved?: () => void;
  onRequestRejected?: () => void;
}

export function ShopJoinRequestsManager({ 
  isLoading = false, 
  requests = [],
  onRequestApproved,
  onRequestRejected
}: ShopJoinRequestsManagerProps) {
  const { dukkanId } = useCustomerAuth();

  const handleApprove = async (request: ShopJoinRequest) => {
    try {
      // Update the request status to approved
      const { error: requestError } = await supabase
        .from('personel_shop_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Update the personnel record with the shop ID
      const { error: personnelError } = await supabase
        .from('personel')
        .update({ dukkan_id: dukkanId })
        .eq('id', request.personel_id);

      if (personnelError) throw personnelError;

      // Callback to refresh the requests list
      if (onRequestApproved) onRequestApproved();

    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      // Update the request status to rejected
      const { error } = await supabase
        .from('personel_shop_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Callback to refresh the requests list
      if (onRequestRejected) onRequestRejected();

    } catch (error) {
      console.error("Error rejecting request:", error);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bekleyen Katılım İstekleri</CardTitle>
        <CardDescription>
          Dükkana katılmak isteyen personeller aşağıda listelenmiştir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <div className="p-4 flex items-start">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={request.personel.avatar_url} />
                    <AvatarFallback>{getInitials(request.personel.ad_soyad)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{request.personel.ad_soyad}</h4>
                    <div className="flex flex-col gap-1 mt-2 text-sm">
                      <div className="flex items-center">
                        <PhoneCall className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        <span>{request.personel.telefon}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        <span>{request.personel.eposta}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      İstek tarihi: {new Date(request.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleReject(request.id)}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Reddet
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(request)}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Onayla
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            Bekleyen personel katılım isteği bulunmamaktadır.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
