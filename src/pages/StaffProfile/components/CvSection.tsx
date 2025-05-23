
import React from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";

interface CvSectionProps {
  cv: string;
  setCv: (cv: string) => void;
  user: any;
  saveHistoryDataWithParams: (
    isyerleri: string[],
    gorevpozisyon: string[],
    belgeler: string[],
    yarismalar: string[],
    cv: string
  ) => Promise<void>;
  cvEditMode: boolean;
  setCvEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CvSection({
  cv,
  setCv,
  user,
  saveHistoryDataWithParams,
  cvEditMode,
  setCvEditMode,
}: CvSectionProps) {
  const [localCv, setLocalCv] = React.useState(cv);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLocalCv(cv);
  }, [cv]);

  const handleSave = async () => {
    setLoading(true);
    try {
      setCv(localCv);
      await saveHistoryDataWithParams([], [], [], [], localCv);
      setCvEditMode(false);
    } catch (error) {
      console.error("Error saving CV:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Özgeçmiş</h2>
      {!cvEditMode ? (
        <div className="whitespace-pre-wrap border border-gray-300 rounded p-3">
          {cv || "Henüz CV eklenmemiş."}
        </div>
      ) : (
        <textarea
          className="w-full rounded border border-gray-300 p-2"
          rows={10}
          value={localCv}
          onChange={(e) => setLocalCv(e.target.value)}
          placeholder="Kendiniz hakkında belirtmek istedikleriniz, hedefleriniz, kariyer planlarınız ve hayallerinizi yazabilirsiniz."
        />
      )}
      <div className="mt-2">
        {!cvEditMode ? (
          <Button size="sm" onClick={() => setCvEditMode(true)}>
            Düzenle
          </Button>
        ) : (
          <LoadingButton size="sm" onClick={handleSave} loading={loading}>
            Kaydet
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
