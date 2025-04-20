
import React from "react";

export interface EducationTabProps {
  educationData: {
    ortaokuldurumu: string;
    lisedurumu: string;
    liseturu: string;
    meslekibrans: string;
    universitedurumu: string;
    universitebolum: string;
  };
  onEducationChange: (field: keyof EducationTabProps["educationData"], value: string) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

const EducationTab = ({
  educationData,
  onEducationChange,
  onSave,
  isLoading
}: EducationTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold border-b pb-2">Eğitim Bilgileri</h2>

      <div className="grid md:grid-cols-2 gap-4">
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

      <div className="mt-6 flex justify-end">
        <button
          className="btn btn-primary px-6 py-2 rounded"
          onClick={onSave}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
        </button>
      </div>
    </div>
  );
};

export default EducationTab;
