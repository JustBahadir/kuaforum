
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UnassignedStaffMainProps {
  joinRequests: any[];
  shop: any;
  onRefresh: () => void;
}

export function UnassignedStaffMain({ joinRequests, shop, onRefresh }: UnassignedStaffMainProps) {
  const [shopCode, setShopCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast.error("Lütfen bir işletme kodu girin");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('id, ad, kod')
        .eq('kod', searchCode.trim())
        .single();

      if (error) {
        toast.error("İşletme bulunamadı");
        setSearchResult(null);
      } else {
        setSearchResult(data);
      }
    } catch (error) {
      console.error('Error searching shop:', error);
      toast.error('İşletme aranırken bir hata oluştu');
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!searchResult) return;

    setLoading(true);
    try {
      // Check if user already has a pending request to this shop
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bilgisi bulunamadı');

      // Check for existing request
      const { data: existingRequest } = await supabase
        .from('staff_join_requests')
        .select('*')
        .eq('dukkan_id', searchResult.id)
        .eq('personel_id', user.id)
        .maybeSingle();

      if (existingRequest) {
        toast.info('Bu işletmeye zaten katılma isteği gönderilmiş');
        return;
      }

      // Create join request
      const { error } = await supabase
        .from('staff_join_requests')
        .insert([
          {
            dukkan_id: searchResult.id,
            personel_id: user.id,
            durum: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('Katılma isteği gönderildi');
      onRefresh();
      setSearchResult(null);
      setSearchCode('');
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('İstek gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('staff_join_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('İstek iptal edildi');
      onRefresh();
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error('İstek iptal edilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atanmamış Personel Hesabı</CardTitle>
            <CardDescription>
              Henüz bir işletmeye atanmamışsınız. İşletme koduyla katılabilir veya işletme yöneticisinin sizi eklemesini bekleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">İşletme Kodu ile Katıl</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="İşletme kodunu girin"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchCode.trim()}>
                    {isSearching ? "Aranıyor..." : "Ara"}
                  </Button>
                </div>
              </div>

              {searchResult && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{searchResult.ad}</CardTitle>
                    <CardDescription>Kod: {searchResult.kod}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button onClick={handleJoinRequest} disabled={loading}>
                      {loading ? "İstek Gönderiliyor..." : "Katılma İsteği Gönder"}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {joinRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Gönderilen Katılma İstekleri</CardTitle>
              <CardDescription>İşletme yöneticileri onaylayana kadar bekleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{request.dukkanlar?.ad || "Bilinmeyen İşletme"}</CardTitle>
                      <CardDescription>
                        Durum: {
                          request.durum === 'pending' ? 'Beklemede' :
                          request.durum === 'approved' ? 'Onaylandı' :
                          request.durum === 'rejected' ? 'Reddedildi' : 'Bilinmiyor'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={loading}
                      >
                        {loading ? "İptal Ediliyor..." : "İsteği İptal Et"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
