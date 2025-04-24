
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { StaffPreRegistrationTab } from "@/pages/Profile/StaffPreRegistrationTab";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";

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

      // Get profile data
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
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <div className="bg-gray-100 w-full h-full flex items-center justify-center text-xl font-semibold text-gray-500">
              {userProfile?.first_name?.[0] || 'P'}
            </div>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">Personel</h1>
            <p className="text-gray-500">{userProfile?.first_name} {userProfile?.last_name}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
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

          {/* Action Buttons */}
          <div className="mt-6 space-y-4">
            <Button
              onClick={() => navigate("/staff-join-request")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
        </div>
      </div>
    </div>
  );
}
