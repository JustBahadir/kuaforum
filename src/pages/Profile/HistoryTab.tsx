
import React from "react";

export interface HistoryTabProps {
  historyData: {
    isyerleri: string;
    gorevpozisyon: string;
    belgeler: string;
    yarismalar: string;
    cv: string;
  };
  onHistoryChange: (field: keyof HistoryTabProps["historyData"], value: string) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

const HistoryTab = ({
  historyData,
  onHistoryChange,
  onSave,
  isLoading
}: HistoryTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold border-b pb-2">Geçmiş Bilgileri</h2>

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

export default HistoryTab;
