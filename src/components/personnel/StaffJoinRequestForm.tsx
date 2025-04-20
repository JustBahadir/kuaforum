
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useStaffJoinRequests } from "@/hooks/useStaffJoinRequests";
import { toast } from "sonner";

export function StaffJoinRequestForm() {
  const { user } = useCustomerAuth();
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
      const { data: dukkanData, error } = await fetch(
        "/api/dukkanlar?code=" + encodeURIComponent(shopCode.trim())
      ).then((r) => r.json());

      if (error || !dukkanData?.length) {
        toast.error("Dükkan bulunamadı, lütfen kodu kontrol edin.");
        setLoading(false);
        return;
      }

      const dukkan = dukkanData[0];

      if (!user?.id) {
        toast.error("Kullanıcı bulunamadı, lütfen giriş yapın.");
        setLoading(false);
        return;
      }

      // Check if request already exists for this personel & dükkan
      const existingRequest = data?.find(
        (req) => req.personel_id === user.id && req.dukkan_id === dukkan.id
      );
      if (existingRequest) {
        toast.error("Bu dükkana zaten bir katılım talebiniz var.");
        setLoading(false);
        return;
      }

      await addRequest.mutateAsync({
        personel_id: user.id,
        dukkan_id: dukkan.id,
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

