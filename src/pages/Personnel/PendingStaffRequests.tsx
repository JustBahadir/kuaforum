import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StaffJoinRequestDetails from "@/components/staff/StaffJoinRequestDetails"; // Fixed import - using default import instead of named import
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    avatar_url?: string;
  };
}

export default function PendingStaffRequests() {
  const { dukkanId, userRole } = useCustomerAuth();
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const navigate = useNavigate();
  
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['staff_join_requests', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      const { data, error } = await supabase
        .from("staff_join_requests")
        .select(`
          *,
          personel:personel_id (id, ad_soyad, avatar_url)
        `)
        .eq("dukkan_id", dukkanId)
        .eq("durum", "pending")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching join requests:", error);
        throw error;
      }
      
      return data as JoinRequest[];
    },
    enabled: !!dukkanId && userRole === 'admin'
  });
  
  if (userRole !== 'admin') {
    return (
      <StaffLayout>
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </AlertDescription>
          </Alert>
        </div>
      </StaffLayout>
    );
  }
  
  const handleDetailsClose = () => {
    setSelectedRequest(null);
    refetch();
  };
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Personel Başvuruları</h1>
            <p className="text-muted-foreground">
              İşletmenize katılmak isteyen personel başvurularını yönetin
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/personnel")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Personele Dön
          </Button>
        </div>
        
        {selectedRequest ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Başvuru Detayı</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRequest(null)}
                >
                  Listeye Dön
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaffJoinRequestDetails 
                staffId={selectedRequest} 
                onClose={handleDetailsClose} 
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="text-center p-8">
                  <p className="text-muted-foreground">
                    Bekleyen personel başvurusu bulunmamaktadır.
                  </p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {request.personel?.avatar_url ? (
                            <AvatarImage src={request.personel.avatar_url} alt={request.personel.ad_soyad} />
                          ) : (
                            <AvatarFallback>
                              {request.personel?.ad_soyad
                                ? request.personel.ad_soyad.split(" ").map(n => n[0]).join("").toUpperCase()
                                : "??"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.personel?.ad_soyad || "İsimsiz Personel"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()} tarihinde başvurdu
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedRequest(request.personel_id)}
                      >
                        Detay Gör
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
