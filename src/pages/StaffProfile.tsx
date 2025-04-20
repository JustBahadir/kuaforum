
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { StaffSidebar } from "@/components/ui/staff-sidebar";

export default function StaffProfile() {
  const [loading, setLoading] = useState(false);
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

  // useEffect boş, kaldı çünkü başka fetch yok
  useEffect(() => {
    // Fetch or initialize profile data here if needed
  }, []);

  const saveEducation = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Kullanıcı getirilemedi", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("staff_education")
        .upsert({
          personel_id: Number(user.id),
          ortaokuldurumu: educationData.ortaokuldurumu,
          lisedurumu: educationData.lisedurumu,
          liseturu: educationData.liseturu,
          meslekibrans: educationData.meslekibrans,
          universitedurumu: educationData.universitedurumu,
          universitebolum: educationData.universitebolum,
          updated_at: new Date().toISOString(),
        }, { onConflict: "personel_id" });

      if (error) {
        console.error("Error saving education data", error);
      } else {
        console.log("Education data saved", data);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Kullanıcı getirilemedi", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("staff_history")
        .upsert({
          personel_id: Number(user.id),
          isyerleri: historyData.isyerleri,
          gorevpozisyon: historyData.gorevpozisyon,
          belgeler: historyData.belgeler,
          yarismalar: historyData.yarismalar,
          cv: historyData.cv,
          updated_at: new Date().toISOString(),
        }, { onConflict: "personel_id" });

      if (error) {
        console.error("Error saving history data", error);
      } else {
        console.log("History data saved", data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <StaffSidebar />
      <main className="flex-grow p-8 overflow-y-auto">
        {/* Placeholders for UI to update educationData and historyData */}
        <button onClick={saveEducation} className="btn btn-primary mb-4" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Save Education"}
        </button>
        <button onClick={saveHistory} className="btn btn-primary" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Save History"}
        </button>
      </main>
    </div>
  );
}
