
import { StaffLayout } from "@/components/ui/staff-layout";
import { StaffJoinRequests } from "@/components/personnel/StaffJoinRequests";

export default function PendingStaffRequests() {
  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Personel Talepleri</h1>
        <StaffJoinRequests />
      </div>
    </StaffLayout>
  );
}
