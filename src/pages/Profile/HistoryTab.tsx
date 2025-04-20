
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, Trash } from "lucide-react";

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

interface IsYeriGorev {
  isYeri: string;
  gorevPozisyon: string;
}

const HistoryTab = ({
  historyData,
  onHistoryChange,
  onSave,
  isLoading
}: HistoryTabProps) => {
  // Parse JSON strings to arrays, fallback to empty arrays if invalid or empty
  const parseJsonArray = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch { }
    return [];
  };

  // Workplaces and positions paired list
  const [workplaceList, setWorkplaceList] = useState<IsYeriGorev[]>([]);
  // Documents list
  const [documentList, setDocumentList] = useState<string[]>([]);
  // Competitions list
  const [competitionList, setCompetitionList] = useState<string[]>([]);
  // CV text
  const [cvText, setCvText] = useState(historyData.cv || "");

  // Editing states:
  // For workplaces: track editing index with a copy of values for editing
  const [workplaceEditIndex, setWorkplaceEditIndex] = useState<number | null>(null);
  const [workplaceEditValues, setWorkplaceEditValues] = useState<IsYeriGorev>({isYeri: "", gorevPozisyon: ""});
  // For documents: editing index and value
  const [docEditIndex, setDocEditIndex] = useState<number | null>(null);
  const [docEditValue, setDocEditValue] = useState("");
  // For competitions: editing index and value
  const [compEditIndex, setCompEditIndex] = useState<number | null>(null);
  const [compEditValue, setCompEditValue] = useState("");

  // Input states for new entries
  const [newIsYeri, setNewIsYeri] = useState("");
  const [newGorevPozisyon, setNewGorevPozisyon] = useState("");
  const [newDocument, setNewDocument] = useState("");
  const [newCompetition, setNewCompetition] = useState("");

  // Initialize lists from props on mount or prop changes
  useEffect(() => {
    const isyerleriParsed = parseJsonArray(historyData.isyerleri);
    const gorevPozisyonParsed = parseJsonArray(historyData.gorevpozisyon);
    // Pair workplace and position arrays or fallback to empty array pairs
    const pairedList: IsYeriGorev[] = [];
    const length = Math.max(isyerleriParsed.length, gorevPozisyonParsed.length);
    for (let i = 0; i < length; i++) {
      pairedList.push({
        isYeri: isyerleriParsed[i] || "",
        gorevPozisyon: gorevPozisyonParsed[i] || ""
      });
    }
    setWorkplaceList(pairedList);

    // Documents and Competitions are single string arrays from JSON strings
    setDocumentList(parseJsonArray(historyData.belgeler));
    setCompetitionList(parseJsonArray(historyData.yarismalar));
    setCvText(historyData.cv || "");
  }, [historyData]);

  // Helper to update parent on change - serializes arrays to JSON strings for storage
  const updateHistoryField = () => {
    // Separate workplaceList into two arrays for isyerleri and gorevpozisyon respectively
    const isyerleriArr = workplaceList.map(item => item.isYeri);
    const gorevPozisyonArr = workplaceList.map(item => item.gorevPozisyon);
    onHistoryChange("isyerleri", JSON.stringify(isyerleriArr));
    onHistoryChange("gorevpozisyon", JSON.stringify(gorevPozisyonArr));
    onHistoryChange("belgeler", JSON.stringify(documentList));
    onHistoryChange("yarismalar", JSON.stringify(competitionList));
    onHistoryChange("cv", cvText);
  };

  // Workplaces handlers
  const handleAddWorkplace = () => {
    if (newIsYeri.trim() === "" && newGorevPozisyon.trim() === "") return;
    setWorkplaceList((prev) => [...prev, { isYeri: newIsYeri.trim(), gorevPozisyon: newGorevPozisyon.trim() }]);
    setNewIsYeri("");
    setNewGorevPozisyon("");
  };
  const handleEditWorkplace = (index: number) => {
    const editItem = workplaceList[index];
    setWorkplaceEditValues({ ...editItem });
    setWorkplaceEditIndex(index);
  };
  const handleSaveWorkplace = () => {
    if (workplaceEditIndex === null) return;
    setWorkplaceList(prev => {
      const newList = [...prev];
      newList[workplaceEditIndex] = {...workplaceEditValues};
      return newList;
    });
    setWorkplaceEditIndex(null);
    updateHistoryField();
  };
  const handleDeleteWorkplace = (index: number) => {
    setWorkplaceList(prev => prev.filter((_, i) => i !== index));
    // Also update after delete
    setTimeout(updateHistoryField, 0);
  };

  // Documents handlers
  const handleAddDocument = () => {
    if (newDocument.trim() === "") return;
    setDocumentList(prev => [...prev, newDocument.trim()]);
    setNewDocument("");
  };
  const handleEditDocument = (index: number) => {
    setDocEditValue(documentList[index]);
    setDocEditIndex(index);
  };
  const handleSaveDocument = () => {
    if (docEditIndex === null) return;
    setDocumentList(prev => {
      const newList = [...prev];
      newList[docEditIndex] = docEditValue.trim();
      return newList;
    });
    setDocEditIndex(null);
    updateHistoryField();
  };
  const handleDeleteDocument = (index: number) => {
    setDocumentList(prev => prev.filter((_, i) => i !== index));
    setTimeout(updateHistoryField, 0);
  };

  // Competition handlers
  const handleAddCompetition = () => {
    if (newCompetition.trim() === "") return;
    setCompetitionList(prev => [...prev, newCompetition.trim()]);
    setNewCompetition("");
  };
  const handleEditCompetition = (index: number) => {
    setCompEditValue(competitionList[index]);
    setCompEditIndex(index);
  };
  const handleSaveCompetition = () => {
    if (compEditIndex === null) return;
    setCompetitionList(prev => {
      const newList = [...prev];
      newList[compEditIndex] = compEditValue.trim();
      return newList;
    });
    setCompEditIndex(null);
    updateHistoryField();
  };
  const handleDeleteCompetition = (index: number) => {
    setCompetitionList(prev => prev.filter((_, i) => i !== index));
    setTimeout(updateHistoryField, 0);
  };

  // CV change handler
  const handleCvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(e.target.value);
    onHistoryChange("cv", e.target.value);
  };

  // Handle global save, delegates onSave prop callback
  const handleSaveAll = async () => {
    updateHistoryField();
    await onSave();
  };

  // Render helper for workplaces row with edit or display mode
  const renderWorkplaceRow = (item: IsYeriGorev, index: number) => {
    const isEditing = workplaceEditIndex === index;
    return (
      <tr key={index} className="border-b hover:bg-gray-50">
        <td className="p-2">
          {isEditing ? (
            <input
              className="input-primary w-full"
              value={workplaceEditValues.isYeri}
              onChange={(e) =>
                setWorkplaceEditValues((prev) => ({ ...prev, isYeri: e.target.value }))
              }
              placeholder="İş yeri"
            />
          ) : (
            item.isYeri
          )}
        </td>
        <td className="p-2">
          {isEditing ? (
            <input
              className="input-primary w-full"
              value={workplaceEditValues.gorevPozisyon}
              onChange={(e) =>
                setWorkplaceEditValues((prev) => ({ ...prev, gorevPozisyon: e.target.value }))
              }
              placeholder="Görev / Pozisyon"
            />
          ) : (
            item.gorevPozisyon
          )}
        </td>
        <td className="p-2 flex gap-2 justify-end">
          {isEditing ? (
            <Button
              size="sm"
              variant="default"
              aria-label="Kaydet"
              onClick={() => {
                handleSaveWorkplace();
              }}
              title="Kaydet"
            >
              <Save size={16} />
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Düzenle"
                onClick={() => handleEditWorkplace(index)}
                title="Düzenle"
              >
                <Edit size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Sil"
                onClick={() => handleDeleteWorkplace(index)}
                title="Sil"
                className="text-destructive"
              >
                <Trash size={16} />
              </Button>
            </>
          )}
        </td>
      </tr>
    );
  };

  // Render helper for documents row
  const renderDocumentRow = (doc: string, index: number) => {
    const isEditing = docEditIndex === index;
    return (
      <tr key={index} className="border-b hover:bg-gray-50">
        <td className="p-2">
          {isEditing ? (
            <input
              className="input-primary w-full"
              value={docEditValue}
              onChange={e => setDocEditValue(e.target.value)}
              placeholder="Belge adı"
            />
          ) : (
            doc
          )}
        </td>
        <td className="p-2 flex gap-2 justify-end">
          {isEditing ? (
            <Button size="sm" variant="default" onClick={handleSaveDocument} title="Kaydet">
              <Save size={16} />
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditDocument(index)}
                title="Düzenle"
              >
                <Edit size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDeleteDocument(index)}
                title="Sil"
              >
                <Trash size={16} />
              </Button>
            </>
          )}
        </td>
      </tr>
    );
  };

  // Render helper for competition row
  const renderCompetitionRow = (comp: string, index: number) => {
    const isEditing = compEditIndex === index;
    return (
      <tr key={index} className="border-b hover:bg-gray-50">
        <td className="p-2">
          {isEditing ? (
            <input
              value={compEditValue}
              onChange={e => setCompEditValue(e.target.value)}
              placeholder="Yarışma adı"
              className="input-primary w-full"
            />
          ) : (
            comp
          )}
        </td>
        <td className="p-2 flex gap-2 justify-end">
          {isEditing ? (
            <Button size="sm" variant="default" onClick={handleSaveCompetition} title="Kaydet">
              <Save size={16} />
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditCompetition(index)}
                title="Düzenle"
              >
                <Edit size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDeleteCompetition(index)}
                title="Sil"
              >
                <Trash size={16} />
              </Button>
            </>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold border-b pb-2">Geçmiş Bilgileri</h2>

      {/* İşyerleri ve Görev Pozisyonları */}
      <div>
        <h3 className="font-semibold mb-1">İş Yerleri ve Görevler</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="İş yeri"
            className="input-primary flex-grow"
            value={newIsYeri}
            onChange={(e) => setNewIsYeri(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Görev / Pozisyon"
            className="input-primary flex-grow"
            value={newGorevPozisyon}
            onChange={(e) => setNewGorevPozisyon(e.target.value)}
            disabled={isLoading}
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              handleAddWorkplace();
              updateHistoryField();
            }}
            disabled={isLoading}
          >
            İş Yeri Ekle
          </Button>
        </div>
        {workplaceList.length > 0 ? (
          <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2">İş Yeri</th>
                <th className="text-left p-2">Görev / Pozisyon</th>
                <th className="text-right p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {workplaceList.map(renderWorkplaceRow)}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Henüz iş yeri eklenmedi.</p>
        )}
      </div>

      {/* Belgeler */}
      <div>
        <h3 className="font-semibold mb-1">Belgeler</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Belge adı"
            className="input-primary flex-grow"
            value={newDocument}
            onChange={(e) => setNewDocument(e.target.value)}
            disabled={isLoading}
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              handleAddDocument();
              updateHistoryField();
            }}
            disabled={isLoading}
          >
            Belge Ekle
          </Button>
        </div>
        {documentList.length > 0 ? (
          <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2">Belge Adı</th>
                <th className="text-right p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {documentList.map(renderDocumentRow)}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Henüz belge eklenmedi.</p>
        )}
      </div>

      {/* Yarışmalar */}
      <div>
        <h3 className="font-semibold mb-1">Yarışmalar</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Yarışma adı"
            className="input-primary flex-grow"
            value={newCompetition}
            onChange={(e) => setNewCompetition(e.target.value)}
            disabled={isLoading}
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              handleAddCompetition();
              updateHistoryField();
            }}
            disabled={isLoading}
          >
            Yarışma Ekle
          </Button>
        </div>
        {competitionList.length > 0 ? (
          <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2">Yarışma Adı</th>
                <th className="text-right p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {competitionList.map(renderCompetitionRow)}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Henüz yarışma eklenmedi.</p>
        )}
      </div>

      {/* CV */}
      <div>
        <label className="block font-medium mb-1">CV</label>
        <textarea
          className="textarea-primary w-full min-h-[90px]"
          value={cvText}
          onChange={handleCvChange}
          placeholder="Serbest metin"
          disabled={isLoading}
        />
      </div>

      {/* Save and Cancel buttons */}
      <div className="mt-6 flex gap-2 justify-end">
        <Button
          className="px-6 py-2 rounded"
          variant="default"
          onClick={handleSaveAll}
          disabled={isLoading}
        >
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button
          className="px-6 py-2 rounded"
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            // Reset fields on cancel - re-load from props
            const isyerleriParsed = parseJsonArray(historyData.isyerleri);
            const gorevPozisyonParsed = parseJsonArray(historyData.gorevpozisyon);
            const pairedList: IsYeriGorev[] = [];
            const length = Math.max(isyerleriParsed.length, gorevPozisyonParsed.length);
            for (let i = 0; i < length; i++) {
              pairedList.push({
                isYeri: isyerleriParsed[i] || "",
                gorevPozisyon: gorevPozisyonParsed[i] || ""
              });
            }
            setWorkplaceList(pairedList);
            setDocumentList(parseJsonArray(historyData.belgeler));
            setCompetitionList(parseJsonArray(historyData.yarismalar));
            setCvText(historyData.cv || "");
            setNewIsYeri("");
            setNewGorevPozisyon("");
            setNewDocument("");
            setNewCompetition("");
            setWorkplaceEditIndex(null);
            setDocEditIndex(null);
            setCompEditIndex(null);
          }}
        >
          İptal
        </Button>
      </div>
    </div>
  );
};

export default HistoryTab;

