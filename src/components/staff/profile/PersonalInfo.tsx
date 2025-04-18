
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function PersonalInfo() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data && !error) {
          setProfile(data);
        }
      }
    };
    
    getProfile();
  }, []);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ad</Label>
            <p className="mt-1">{profile?.first_name || '-'}</p>
          </div>
          <div>
            <Label>Soyad</Label>
            <p className="mt-1">{profile?.last_name || '-'}</p>
          </div>
          <div>
            <Label>Telefon</Label>
            <p className="mt-1">{profile?.phone || '-'}</p>
          </div>
          <div>
            <Label>Cinsiyet</Label>
            <p className="mt-1">{profile?.gender === 'male' ? 'Erkek' : profile?.gender === 'female' ? 'Kadın' : '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
