
import React from "react";
import { useStaffJoinRequests } from "@/hooks/useStaffJoinRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function JoinRequestsAdmin() {
  const { data, isLoading, isError, mutateStatus } = useStaffJoinRequests();

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (isError) {
    return <div>Yükleme hatası oluştu.</div>;
  }

  if (!data || data.length === 0) {
    return <div>Bekleyen katılım talebi yok.</div>;
  }

  const handleAccept = (id: number) => {
    mutateStatus.mutate({ id, status: "accepted" });
    toast.success("Talep kabul edildi.");
  };

  const handleReject = (id: number) => {
    mutateStatus.mutate({ id, status: "rejected" });
    toast.error("Talep reddedildi.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personel Katılım Talepleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((request) => (
            <div key={request.id} className="border p-3 rounded-md flex justify-between items-center">
              <div>
                <p>
                  Personel ID: {request.personel_id} | Dükkan ID: {request.dukkan_id}
                </p>
                <p>Status: {request.durum}</p>
                <p>Talep Tarihi: {new Date(request.created_at).toLocaleString("tr-TR")}</p>
              </div>
              <div className="flex space-x-2">
                {request.durum === "pending" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleAccept(request.id)}>
                      Kabul Et
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                      Reddet
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

