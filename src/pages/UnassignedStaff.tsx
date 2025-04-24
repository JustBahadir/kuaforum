
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { StaffPreRegistrationTab } from "@/pages/Profile/StaffPreRegistrationTab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export default function UnassignedStaff() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [educationData, setEducationData] = useState({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    meslekibrans: "",
    universitedurumu: "",
    universitebolum: ""
  });
  
  const [historyData, setHistoryData] = useState({
    isyerleri: "",
    gorevpozisyon: "",
    belgeler: "",
    yarismalar: "",
    cv: ""
  });

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Load existing education data if any
      const { data: educationData } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', user.id)
        .maybeSingle();

      if (educationData) {
        setEducationData(educationData);
      }

      // Load existing history data if any
      const { data: historyData } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', user.id)
        .maybeSingle();

      if (historyData) {
        setHistoryData(historyData);
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Kullanıcı bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    } else {
      navigate("/login");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      await supabase
        .from('staff_education')
        .upsert({
          personel_id: user.id,
          ...educationData
        });

      await supabase
        .from('staff_history')
        .upsert({
          personel_id: user.id,
          ...historyData
        });

      toast.success("Bilgiler başarıyla kaydedildi");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                  {userProfile?.first_name?.[0] || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h1 className="text-2xl font-semibold">
                  {userProfile?.first_name} {userProfile?.last_name}
                </h1>
                <p className="text-gray-500">Personel</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{userProfile?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{userProfile?.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                <MapPin className="w-4 h-4" />
                <span>{userProfile?.address || '-'}</span>
              </div>
            </div>

            <StaffPreRegistrationTab
              educationData={educationData}
              historyData={historyData}
              onEducationChange={(field, value) => 
                setEducationData(prev => ({ ...prev, [field]: value }))}
              onHistoryChange={(field, value) => 
                setHistoryData(prev => ({ ...prev, [field]: value }))}
              onSave={handleSave}
              isLoading={loading}
            />

            <div className="mt-6 space-y-4">
              <Button
                onClick={() => navigate("/staff-join-request")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                İşletmeye Katıl
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                Oturumu Kapat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
