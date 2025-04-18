
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

export function PersonalInfo() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const profileData = await profilServisi.getir();
        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format the phone number for display
  const displayPhone = profile?.phone ? formatPhoneNumber(profile.phone) : "-";

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Ad</Label>
            <p className="mt-1">{profile?.first_name || "-"}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-500">Soyad</Label>
            <p className="mt-1">{profile?.last_name || "-"}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-500">Telefon</Label>
            <p className="mt-1">{displayPhone}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-500">Cinsiyet</Label>
            <p className="mt-1">{profile?.gender === 'male' ? 'Erkek' : profile?.gender === 'female' ? 'Kadın' : '-'}</p>
          </div>
          
          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-500">E-posta</Label>
            <p className="mt-1">{profile?.email || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
