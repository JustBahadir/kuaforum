
import React from "react";
import { Button } from "@/components/ui/button";

interface HistoryDataProps {
  historyData: {
    isyerleri: string[];
    gorevpozisyon: string[];
    belgeler: string[];
    yarismalar: string[];
    cv: string;
    _newBelge?: string;
  };
  setHistoryData: React.Dispatch<React.SetStateAction<any>>;
  user: any;
  saveHistoryDataWithParams: (
    isyerleri: string[],
    gorevpozisyon: string[],
    belgeler: string[],
    yarismalar: string[],
    cv: string
  ) => Promise<void>;
}

export default function DocumentsSection({
  historyData,
  setHistoryData,
  user,
  saveHistoryDataWithParams,
}: HistoryDataProps) {
  const [newBelge, setNewBelge] = React.useState("");

  const addBelge = async () => {
    if (!newBelge.trim()) {
      return;
    }
    const newBelgeler = [...historyData.belgeler, newBelge.trim()];
    setHistoryData((prev: any) => ({
      ...prev,
      belgeler: newBelgeler,
      _newBelge: "",
    }));

    await saveHistoryDataWithParams(
      historyData.isyerleri,
      historyData.gorevpozisyon,
      newBelgeler,
      historyData.yarismalar,
      historyData.cv
    );
    setNewBelge("");
  };

  const removeBelge = async (index: number) => {
    const newBelgeler = [...historyData.belgeler];
    newBelgeler.splice(index, 1);
    setHistoryData((prev: any) => ({
      ...prev,
      belgeler: newBelgeler,
    }));
    await saveHistoryDataWithParams(
      historyData.isyerleri,
      historyData.gorevpozisyon,
      newBelgeler,
      historyData.yarismalar,
      historyData.cv
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Belgeler</h2>
      {historyData.belgeler.length === 0 && <p>Henüz belge eklenmemiş.</p>}
      <ul className="mb-2 list-disc list-inside">
        {historyData.belgeler.map((belge, idx) => (
          <li key={idx} className="flex justify-between items-center">
            <span>{belge}</span>
            <Button size="sm" variant="ghost" onClick={() => removeBelge(idx)}>
              Sil
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newBelge}
          onChange={(e) => setNewBelge(e.target.value)}
          placeholder="Yeni belge adı"
          className="flex-grow rounded-md border border-gray-300 px-3 py-1"
        />
        <Button size="sm" onClick={addBelge}>
          Ekle
        </Button>
      </div>
    </div>
  );
}
