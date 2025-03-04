
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { profileService } from "@/lib/auth/profileService";

interface GreetingProps {
  userName: string;
  loading: boolean;
  activeTab: string;
  handleLogout: () => void;
  refreshProfile: () => void;
  userRole: string | null;
  isAuthenticated: boolean;
  dukkanId: number | null;
  dukkanAdi: string | null;
}

export function Greeting({ userName, loading, activeTab, handleLogout, refreshProfile, userRole, isAuthenticated, dukkanId, dukkanAdi }: GreetingProps) {
  const [displayName, setDisplayName] = useState(userName || "Değerli Müşterimiz");

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Use profileService.getUserNameWithTitle instead of getGenderSpecificTitle
  const fetchUserName = async () => {
    try {
      const name = await profileService.getUserNameWithTitle();
      setDisplayName(name);
    } catch (error) {
      console.error("Error fetching user name:", error);
      setDisplayName(userName || "Değerli Müşterimiz");
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchUserName();
    }
  }, [userName, loading]);

  const handleSignOut = async () => {
    // Use handleLogout which is passed as a prop, not signOut
    handleLogout();
  };

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatars/01.png" alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          if (userRole === 'admin' || userRole === 'staff') {
            window.location.href = '/admin/profile';
          } else {
            window.location.href = '/profile';
          }
        }}>Profil</DropdownMenuItem>
        {userRole === 'admin' && dukkanId && (
          <DropdownMenuItem onClick={() => { window.location.href = '/admin/shop-settings' }}>
            Dükkan Ayarları
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => {
          if (userRole === 'admin' || userRole === 'staff') {
            window.location.href = '/admin/settings';
          } else {
            window.location.href = '/account';
          }
        }}>Ayarlar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
