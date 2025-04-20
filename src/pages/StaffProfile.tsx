import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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

  // Helper for converting string arrays to comma separated string (assumed before was array, fix to string)
  // But now expecting string fields so this helper isn't needed here.

  useEffect(() => {
    // Fetch or initialize profile data here if needed
  }, []);

  const saveEducation = async () => {
    const { data, error } = await supabase
      .from("staff_education")
      .upsert({
        personel_id: Number(supabase.auth.user()?.id),
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
  };

  const saveHistory = async () => {
    const { data, error } = await supabase
      .from("staff_history")
      .upsert({
        personel_id: Number(supabase.auth.user()?.id),
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
  };

  return (
    <div className="p-4">
      {/* Placeholders for UI to update educationData and historyData */}
      <button onClick={saveEducation} className="btn btn-primary mb-4">
        Save Education
      </button>
      <button onClick={saveHistory} className="btn btn-primary">
        Save History
      </button>
    </div>
  );
}
