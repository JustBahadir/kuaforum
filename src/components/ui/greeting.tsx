
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { profileService } from "@/lib/auth/profileService";

export function Greeting() {
  const { userName, userRole } = useCustomerAuth();
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    async function loadGenderTitle() {
      try {
        const titleValue = await profileService.getGenderSpecificTitle();
        setTitle(titleValue);
      } catch (error) {
        console.error("Error loading gender title:", error);
      }
    }

    loadGenderTitle();
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {title ? `${title} ${userName}` : userName}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'staff' ? 'Personel' : userRole === 'admin' ? 'Dükkan Sahibi' : 'Müşteri'} paneline hoş geldiniz.
        </p>
      </div>
    </div>
  );
}
