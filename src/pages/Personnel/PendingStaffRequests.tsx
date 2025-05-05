
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function PendingStaffRequests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [isletmeId, setIsletmeId] = useState<string | null>(null);
  
  // Function to fetch the current user's shop/business ID
  const fetchIsletmeId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      // Get the business ID from isletmeler table
      const { data: isletme, error: isletmeError } = await supabase
        .from("isletmeler")
        .select("id")
        .eq("sahip_kimlik", user.id)
        .maybeSingle();
      
      if (isletmeError) {
        console.error("İşletme bilgisi alınamadı:", isletmeError);
        return;
      }
      
      if (!isletme) {
        toast.error("Henüz bir işletmeniz bulunmamaktadır.");
        navigate("/isletme/olustur");
        return;
      }
      
      setIsletmeId(isletme.id);
      return isletme.id;
    } catch (error) {
      console.error("İşletme ID alınamadı:", error);
      return null;
    }
  };
  
  // Function to fetch all pending staff join requests for this business
  const fetchPendingRequests = async (businessId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personel_basvurular")
        .select(`
          *,
          kullanici:kullanici_kimlik (
            ad,
            soyad,
            eposta,
            telefon,
            cinsiyet
          )
        `)
        .eq("isletme_id", businessId)
        .eq("durum", "beklemede");
      
      if (error) {
        console.error("Başvurular alınamadı:", error);
        return;
      }
      
      setRequests(data || []);
    } catch (error) {
      console.error("Başvuru listesi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle approval of a request
  const handleApproveRequest = async (requestId: string | number) => {
    try {
      setLoading(true);
      
      // Update request status
      const { error: updateError } = await supabase
        .from("personel_basvurular")
        .update({
          durum: "onaylandi",
          onay_tarihi: new Date().toISOString()
        })
        .eq("id", requestId);
      
      if (updateError) {
        toast.error("Başvuru onaylanamadı");
        console.error("Başvuru onaylama hatası:", updateError);
        return;
      }
      
      // Refresh the list
      if (isletmeId) await fetchPendingRequests(isletmeId);
      toast.success("Personel başvurusu onaylandı");
    } catch (error) {
      console.error("Başvuru onaylama hatası:", error);
      toast.error("İşlem sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle rejection of a request
  const handleRejectRequest = async (requestId: string | number) => {
    try {
      setLoading(true);
      
      // Update request status
      const { error: updateError } = await supabase
        .from("personel_basvurular")
        .update({
          durum: "reddedildi",
          ret_tarihi: new Date().toISOString()
        })
        .eq("id", requestId);
      
      if (updateError) {
        toast.error("Başvuru reddedilemedi");
        console.error("Başvuru reddetme hatası:", updateError);
        return;
      }
      
      // Refresh the list
      if (isletmeId) await fetchPendingRequests(isletmeId);
      toast.success("Personel başvurusu reddedildi");
    } catch (error) {
      console.error("Başvuru reddetme hatası:", error);
      toast.error("İşlem sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      const id = await fetchIsletmeId();
      if (id) await fetchPendingRequests(id);
    };
    
    init();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bekleyen Personel Başvuruları</h1>
        <Button onClick={() => navigate("/isletme/anasayfa")}>
          İşletme Ana Sayfası
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">Bekleyen personel başvurusu bulunmamaktadır</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.kullanici?.ad} {request.kullanici?.soyad}
                    </CardTitle>
                    <CardDescription>
                      Başvuru Tarihi: {new Date(request.tarih).toLocaleDateString('tr-TR')}
                    </CardDescription>
                  </div>
                  <Badge variant={request.durum === 'beklemede' ? 'outline' : 'default'}>
                    {request.durum === 'beklemede' ? 'Bekliyor' : 
                     request.durum === 'onaylandi' ? 'Onaylandı' : 'Reddedildi'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">E-posta</p>
                      <p>{request.kullanici?.eposta || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p>{request.kullanici?.telefon || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">İşletme Kodu</p>
                    <p>{request.isletme_kodu}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={loading}
                  className="border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reddet
                </Button>
                <Button 
                  onClick={() => handleApproveRequest(request.id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Onayla
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
