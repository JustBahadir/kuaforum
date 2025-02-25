
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function UserMenu() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    const loadUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserDetails(data);
      }
    };
    loadUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Oturum kapatıldı');
    } catch (error) {
      toast.error('Oturum kapatılırken bir hata oluştu');
    }
  };

  if (!userDetails) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {userDetails.first_name} {userDetails.last_name}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          {userDetails.role === 'staff' ? 'Personel' : 'Müşteri'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Oturumu Kapat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
