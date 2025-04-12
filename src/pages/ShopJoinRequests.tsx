
import { useState } from "react";
import { ShopJoinRequestsManager } from "./Personnel/components/ShopJoinRequestsManager";
import { PageHeader } from "@/components/ui/page-header";
import { UserPlus } from "lucide-react";
import { StaffLayout } from "@/components/layout/StaffLayout";

export default function ShopJoinRequests() {
  return (
    <StaffLayout>
      <PageHeader 
        title="Personel Katılım İstekleri" 
        subtitle="Dükkana katılmak isteyen personelleri görüntüleyin ve onaylayın"
        icon={<UserPlus className="h-6 w-6" />}
      />
      
      <div className="mt-6">
        <ShopJoinRequestsManager />
      </div>
    </StaffLayout>
  );
}
