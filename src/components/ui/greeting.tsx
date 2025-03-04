
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useQuery } from "@tanstack/react-query";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { personelServisi } from "@/lib/supabase/services/personelServisi";

interface GreetingProps {
  className?: string;
}

export function Greeting({ className }: GreetingProps) {
  const { userRole, userId } = useCustomerAuth();
  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string | null>(null);
  
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profilServisi.getir(userId!),
    enabled: !!userId && userRole !== 'staff',
  });
  
  const { data: staff } = useQuery({
    queryKey: ['staff', userId],
    queryFn: () => personelServisi.getirByAuthId(userId!),
    enabled: !!userId && userRole === 'staff',
  });
  
  useEffect(() => {
    if (profile) {
      setUserName(profile.first_name || "");
      setUserGender(profile.gender || null);
    } else if (staff) {
      // Parse first name from staff's full name
      const fullName = staff.ad_soyad || "";
      const firstName = fullName.split(" ")[0];
      setUserName(firstName);
      setUserGender(staff.cinsiyet || null);
    }
  }, [profile, staff]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "";
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = "Günaydın";
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = "İyi günler";
    } else {
      timeGreeting = "İyi akşamlar";
    }
    
    if (!userName) {
      return `${timeGreeting}, Değerli Kullanıcımız`;
    }
    
    const honorific = userGender === 'erkek' ? 'Bey' : 
                     userGender === 'kadın' ? 'Hanım' : '';
    
    return `${timeGreeting}, ${userName} ${honorific}`;
  };
  
  return (
    <div className={className}>
      <h2 className="text-xl font-medium">{getGreeting()}</h2>
    </div>
  );
}
