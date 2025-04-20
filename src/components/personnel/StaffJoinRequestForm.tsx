
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useStaffJoinRequests } from "@/hooks/useStaffJoinRequests";
import { toast } from "sonner";

export function StaffJoinRequestForm() {
  const { userId } = useCustomerAuth();
  const { addRequest, data } = useStaffJoinRequests();

  const [shopCode, setShopCode] = useState("");
  const [loading, setLoading] = useState(false);

  // On submit: validate shop code exists and send join request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopCode.trim()) {
      toast.error("Lütfen geçerli bir dükkan kodu girin.");
      return;
    }

    setLoading(true);

    try {
      // Lookup dükkan by code
      const { data: response } = await fetch(
        "/api/dukkanlar?code=" + encodeURIComponent(shopCode.trim())
      ).then((r) => r.json());

      const dukkanData = response?.dukkanData || response;
      if (!dukkanData || !Array.isArray(dukkanData) || dukkanData.length === 0) {
        toast.error("Dükkan bulunamadı, lütfen kodu kontrol edin.");
        setLoading(false);
        return;
      }

      const dukkan = dukkanData[0];

      if (!userId) {
        toast.error("Kullanıcı bulunamadı, lütfen giriş yapın.");
        setLoading(false);
        return;
      }

      // personel_id is number, userId may be string, convert accordingly
      const numericUserId = typeof userId === "string" && !isNaN(Number(userId)) ? Number(userId) : userId;

      // dukkan.id should be number, but confirm it
      const numericDukkanId = typeof dukkan.id === "number" ? dukkan.id : parseInt(dukkan.id, 10);

      // Check if request already exists for this personel & dükkan - ensure type consistency
      const existingRequest = data?.find(
        (req) =>
          req.personel_id === numericUserId &&
          req.dukkan_id === numericDukkanId
      );
      if (existingRequest) {
        toast.error("Bu dükkana zaten bir katılım talebiniz var.");
        setLoading(false);
        return;
      }

      await addRequest.mutateAsync({
        personel_id: numericUserId as number,
        dukkan_id: numericDukkanId,
      });

      toast.success(`Katılım talebiniz "${dukkan.ad}" için gönderildi.`);
      setShopCode("");
    } catch (err) {
      console.error(err);
      toast.error("Katılım talebi gönderilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Label htmlFor="shopCode">Dükkan Kodu ile Katıl</Label>
      <Input
        id="shopCode"
        placeholder="Dükkan kodunu girin"
        value={shopCode}
        onChange={(e) => setShopCode(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Gönderiliyor..." : "Talep Gönder"}
      </Button>
    </form>
  );
}
