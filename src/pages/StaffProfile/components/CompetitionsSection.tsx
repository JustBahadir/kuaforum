
import React from "react";
import { Button } from "@/components/ui/button";

interface HistoryDataProps {
  historyData: {
    yarismalar: string[];
    _newYarisma?: string;
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

export default function CompetitionsSection({
  historyData,
  setHistoryData,
  user,
  saveHistoryDataWithParams,
}: HistoryDataProps) {
  const [newYarisma, setNewYarisma] = React.useState("");

  const addYarisma = async () => {
    if (!newYarisma.trim()) {
      return;
    }
    const newYarismalar = [...historyData.yarismalar, newYarisma.trim()];
    setHistoryData((prev: any) => ({
      ...prev,
      yarismalar: newYarismalar,
      _newYarisma: "",
    }));

    await saveHistoryDataWithParams(
      historyData.isyerleri,
      historyData.gorevpozisyon,
      historyData.belgeler,
      newYarismalar,
      historyData.cv
    );
    setNewYarisma("");
  };

  const removeYarisma = async (index: number) => {
    const newYarismalar = [...historyData.yarismalar];
    newYarismalar.splice(index, 1);
    setHistoryData((prev: any) => ({
      ...prev,
      yarismalar: newYarismalar,
    }));
    await saveHistoryDataWithParams(
      historyData.isyerleri,
      historyData.gorevpozisyon,
      historyData.belgeler,
      newYarismalar,
      historyData.cv
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Yarışmalar</h2>
      {historyData.yarismalar.length === 0 && <p>Henüz yarışma eklenmemiş.</p>}
      <ul className="mb-2 list-disc list-inside">
        {historyData.yarismalar.map((yarisma, idx) => (
          <li key={idx} className="flex justify-between items-center">
            <span>{yarisma}</span>
            <Button size="xs" variant="ghost" onClick={() => removeYarisma(idx)}>
              Sil
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newYarisma}
          onChange={(e) => setNewYarisma(e.target.value)}
          placeholder="Yeni yarışma adı"
          className="flex-grow rounded-md border border-gray-300 px-3 py-1"
        />
        <Button size="sm" onClick={addYarisma}>
          Ekle
        </Button>
      </div>
    </div>
  );
}

