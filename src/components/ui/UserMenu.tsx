import { BellRing, LogOut, Settings, User as UserIcon, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Link } from "react-router-dom";

export function UserMenu() {
  const { userName, handleLogout, userRole } = useCustomerAuth();
  
  const initials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userRole === 'admin' ? 'Dükkan Sahibi' : userRole === 'staff' ? 'Personel' : 'Müşteri'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userRole === 'customer' && (
            <DropdownMenuItem asChild>
              <Link to="/customer-profile" className="flex cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                Hesabım
              </Link>
            </DropdownMenuItem>
          )}
          
          {userRole === 'admin' && (
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex cursor-pointer">
                <Store className="mr-2 h-4 w-4" />
                Dükkan Ayarları
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/notifications" className="flex cursor-pointer">
              <BellRing className="mr-2 h-4 w-4" />
              Bildirimler
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
