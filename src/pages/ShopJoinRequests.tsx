
import { useState, useEffect } from "react";
import { ShopJoinRequestsManager } from "./Personnel/components/ShopJoinRequestsManager";
import { PageHeader } from "@/components/ui/page-header";
import { UserPlus } from "lucide-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { toast } from "sonner";
import { authService } from "@/lib/auth/services/authService";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function ShopJoinRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { dukkanId, userRole } = useCustomerAuth();

  useEffect(() => {
    if (dukkanId && userRole === 'admin') {
      loadRequests();
    }
  }, [dukkanId, userRole]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const pendingRequests = await authService.getPendingShopJoinRequests(dukkanId!);
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("İstekler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestApproved = () => {
    loadRequests();
    toast.success("İstek başarıyla onaylandı");
  };

  const handleRequestRejected = () => {
    loadRequests();
    toast.success("İstek reddedildi");
  };

  return (
    <StaffLayout>
      <PageHeader 
        title="Personel Katılım İstekleri" 
        subtitle="Dükkana katılmak isteyen personelleri görüntüleyin ve onaylayın"
        icon={<UserPlus className="h-6 w-6" />}
      />
      
      <div className="mt-6">
        <ShopJoinRequestsManager 
          isLoading={isLoading}
          requests={requests}
          onRequestApproved={handleRequestApproved}
          onRequestRejected={handleRequestRejected}
        />
      </div>
    </StaffLayout>
  );
}
