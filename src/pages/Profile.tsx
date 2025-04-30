
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { ProfileTabs } from "./ProfileTabs";

export default function Profile() {
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        <ProfileTabs />
      </div>
    </StaffLayout>
  );
}
