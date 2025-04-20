
import React from "react";

export interface StaffPreRegistrationTabProps {
  educationData: {
    ortaokuldurumu: string;
    lisedurumu: string;
    liseturu: string;
    meslekibrans: string;
    universitedurumu: string;
    universitebolum: string;
  };
  historyData: {
    isyerleri: string;
    gorevpozisyon: string;
    belgeler: string;
    yarismalar: string;
    cv: string;
  };
  onEducationChange: (field: keyof StaffPreRegistrationTabProps["educationData"], value: string) => void;
  onHistoryChange: (field: keyof StaffPreRegistrationTabProps["historyData"], value: string) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

const StaffPreRegistrationTab = ({
  educationData,
  historyData,
  onEducationChange,
  onHistoryChange,
  onSave,
  isLoading
}: StaffPreRegistrationTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold border-b pb-2">Eğitim Bilgileri</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Ortaokul Durumu</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.ortaokuldurumu}
            onChange={(e) => onEducationChange("ortaokuldurumu", e.target.value)}
            placeholder="Ör: Mezun, Devam Ediyor..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Lise Durumu</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.lisedurumu}
            onChange={(e) => onEducationChange("lisedurumu", e.target.value)}
            placeholder="Ör: Mezun, Devam Ediyor..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Lise Türü</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.liseturu}
            onChange={(e) => onEducationChange("liseturu", e.target.value)}
            placeholder="Ör: Anadolu, Meslek Lisesi..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Mesleki Branş</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.meslekibrans}
            onChange={(e) => onEducationChange("meslekibrans", e.target.value)}
            placeholder="Ör: Kuaförlük, Estetik..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Üniversite Durumu</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.universitedurumu}
            onChange={(e) => onEducationChange("universitedurumu", e.target.value)}
            placeholder="Ör: Mezun, Devam Ediyor..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Üniversite Bölüm</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.universitebolum}
            onChange={(e) => onEducationChange("universitebolum", e.target.value)}
            placeholder="Ör: Kuaförlük, Estetik..."
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold border-b pt-6 pb-2">Geçmiş Bilgileri</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">İşyerleri</label>
          <textarea
            className="textarea-primary w-full min-h-[90px]"
            value={historyData.isyerleri}
            onChange={(e) => onHistoryChange("isyerleri", e.target.value)}
            placeholder="Çalıştığı işyerleri..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Görev Pozisyon</label>
          <textarea
            className="textarea-primary w-full min-h-[90px]"
            value={historyData.gorevpozisyon}
            onChange={(e) => onHistoryChange("gorevpozisyon", e.target.value)}
            placeholder="Üstlendiği görevler..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Belgeler</label>
          <textarea
            className="textarea-primary w-full min-h-[90px]"
            value={historyData.belgeler}
            onChange={(e) => onHistoryChange("belgeler", e.target.value)}
            placeholder="Sahip olduğu belgeler..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Yarışmalar</label>
          <textarea
            className="textarea-primary w-full min-h-[90px]"
            value={historyData.yarismalar}
            onChange={(e) => onHistoryChange("yarismalar", e.target.value)}
            placeholder="Katıldığı yarışmalar..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">CV</label>
          <textarea
            className="textarea-primary w-full min-h-[90px]"
            value={historyData.cv}
            onChange={(e) => onHistoryChange("cv", e.target.value)}
            placeholder="Özgeçmiş..."
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="btn btn-primary px-6 py-2 rounded"
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
        </button>
      </div>
    </div>
  );
};

export default StaffPreRegistrationTab;
