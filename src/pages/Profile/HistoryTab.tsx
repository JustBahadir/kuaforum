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
  // Helper: parse JSON array safely
  const parseJsonArray = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  };

  // States for grouped İş Yeri + Pozisyon (workplaces)
  const [workplaceList, setWorkplaceList] = useState<IsYeriGorev[]>([]);
  // Documents and competitions as arrays of strings
  const [documentList, setDocumentList] = useState<string[]>([]);
  const [competitionList, setCompetitionList] = useState<string[]>([]);
  // CV text
  const [cvText, setCvText] = useState(historyData.cv || "");

  // Editing states for workplaces
  const [workplaceEditIndex, setWorkplaceEditIndex] = useState<number | null>(null);
  const [workplaceEditValues, setWorkplaceEditValues] = useState<IsYeriGorev>({
    isYeri: "",
    gorevPozisyon: ""
  });
  // Editing documents
  const [docEditIndex, setDocEditIndex] = useState<number | null>(null);
  const [docEditValue, setDocEditValue] = useState("");
  // Editing competitions
  const [compEditIndex, setCompEditIndex] = useState<number | null>(null);
  const [compEditValue, setCompEditValue] = useState("");

  // New input states
  const [newIsYeri, setNewIsYeri] = useState("");
  const [newGorevPozisyon, setNewGorevPozisyon] = useState("");
  const [newDocument, setNewDocument] = useState("");
  const [newCompetition, setNewCompetition] = useState("");
  useEffect(() => {
    // Load from incoming props
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

    // Reset editing and inputs on prop change
    setNewIsYeri("");
    setNewGorevPozisyon("");
    setNewDocument("");
    setNewCompetition("");
    setWorkplaceEditIndex(null);
    setDocEditIndex(null);
    setCompEditIndex(null);
  }, [historyData]);

  // Serialize and propagate changes up
  const updateHistoryField = (updatedWorkplaceList = workplaceList, updatedDocuments = documentList, updatedCompetitions = competitionList, updatedCv = cvText) => {
    const isyerleriArr = updatedWorkplaceList.map(item => item.isYeri);
    const gorevPozisyonArr = updatedWorkplaceList.map(item => item.gorevPozisyon);
    onHistoryChange("isyerleri", JSON.stringify(isyerleriArr));
    onHistoryChange("gorevpozisyon", JSON.stringify(gorevPozisyonArr));
    onHistoryChange("belgeler", JSON.stringify(updatedDocuments));
    onHistoryChange("yarismalar", JSON.stringify(updatedCompetitions));
    onHistoryChange("cv", updatedCv);
  };

  // Handle add for workplace (experience)
  const handleAddWorkplace = () => {
    if (newIsYeri.trim() === "" && newGorevPozisyon.trim() === "") return;
    const newEntry = {
      isYeri: newIsYeri.trim(),
      gorevPozisyon: newGorevPozisyon.trim()
    };
    const updated = [...workplaceList, newEntry];
    setWorkplaceList(updated);
    setNewIsYeri("");
    setNewGorevPozisyon("");
    updateHistoryField(updated, documentList, competitionList, cvText);
  };
  // Edit workplace start
  const handleEditWorkplace = (index: number) => {
    const item = workplaceList[index];
    setWorkplaceEditValues({
      ...item
    });
    setWorkplaceEditIndex(index);
  };
  // Save edited workplace
  const handleSaveWorkplace = () => {
    if (workplaceEditIndex === null) return;
    const updated = [...workplaceList];
    updated[workplaceEditIndex] = {
      ...workplaceEditValues
    };
    setWorkplaceList(updated);
    setWorkplaceEditIndex(null);
    updateHistoryField(updated, documentList, competitionList, cvText);
  };
  // Delete workplace
  const handleDeleteWorkplace = (index: number) => {
    const updated = workplaceList.filter((_, i) => i !== index);
    setWorkplaceList(updated);
    updateHistoryField(updated, documentList, competitionList, cvText);
  };

  // Add document
  const handleAddDocument = () => {
    if (newDocument.trim() === "") return;
    const updated = [...documentList, newDocument.trim()];
    setDocumentList(updated);
    setNewDocument("");
    updateHistoryField(workplaceList, updated, competitionList, cvText);
  };
  // Edit document
  const handleEditDocument = (index: number) => {
    setDocEditValue(documentList[index]);
    setDocEditIndex(index);
  };
  // Save document edit
  const handleSaveDocument = () => {
    if (docEditIndex === null) return;
    const updated = [...documentList];
    updated[docEditIndex] = docEditValue.trim();
    setDocumentList(updated);
    setDocEditIndex(null);
    updateHistoryField(workplaceList, updated, competitionList, cvText);
  };
  // Delete document
  const handleDeleteDocument = (index: number) => {
    const updated = documentList.filter((_, i) => i !== index);
    setDocumentList(updated);
    updateHistoryField(workplaceList, updated, competitionList, cvText);
  };

  // Add competition
  const handleAddCompetition = () => {
    if (newCompetition.trim() === "") return;
    const updated = [...competitionList, newCompetition.trim()];
    setCompetitionList(updated);
    setNewCompetition("");
    updateHistoryField(workplaceList, documentList, updated, cvText);
  };
  // Edit competition
  const handleEditCompetition = (index: number) => {
    setCompEditValue(competitionList[index]);
    setCompEditIndex(index);
  };
  // Save competition edit
  const handleSaveCompetition = () => {
    if (compEditIndex === null) return;
    const updated = [...competitionList];
    updated[compEditIndex] = compEditValue.trim();
    setCompetitionList(updated);
    setCompEditIndex(null);
    updateHistoryField(workplaceList, documentList, updated, cvText);
  };
  // Delete competition
  const handleDeleteCompetition = (index: number) => {
    const updated = competitionList.filter((_, i) => i !== index);
    setCompetitionList(updated);
    updateHistoryField(workplaceList, documentList, updated, cvText);
  };

  // CV textarea change handler
  const handleCvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(e.target.value);
    onHistoryChange("cv", e.target.value);
  };

  // Save all - update then call parent's onSave
  const handleSaveAll = async () => {
    updateHistoryField();
    await onSave();
  };

  // Render helpers with white background and input text color white for dark mode, placeholder changed
  const renderWorkplaceRow = (item: IsYeriGorev, index: number) => {
    const isEditing = workplaceEditIndex === index;
    return <tr key={index} className="border-b hover:bg-gray-50">
        <td className="p-2">
          {isEditing ? <input className="bg-white text-black rounded-md border border-gray-300 px-2 py-1 w-full placeholder:text-gray-400" value={workplaceEditValues.isYeri} onChange={e => setWorkplaceEditValues(prev => ({
          ...prev,
          isYeri: e.target.value
        }))} placeholder="İş yeri adı giriniz..." autoFocus disabled={isLoading} /> : <span className="text-black">{item.isYeri}</span>}
        </td>
        <td className="p-2">
          {isEditing ? <input className="bg-white text-black rounded-md border border-gray-300 px-2 py-1 w-full placeholder:text-gray-400" value={workplaceEditValues.gorevPozisyon} onChange={e => setWorkplaceEditValues(prev => ({
          ...prev,
          gorevPozisyon: e.target.value
        }))} placeholder="Görev veya pozisyon giriniz..." disabled={isLoading} /> : <span className="text-black">{item.gorevPozisyon}</span>}
        </td>
        <td className="p-2 flex gap-2 justify-end">
          {isEditing ? <Button size="sm" variant="default" aria-label="Kaydet" onClick={() => {
          handleSaveWorkplace();
        }} title="Kaydet" className="bg-purple-600 text-white hover:bg-purple-700">
              <Save size={16} />
            </Button> : <>
              <Button size="sm" variant="ghost" aria-label="Düzenle" onClick={() => handleEditWorkplace(index)} title="Düzenle">
                <Edit size={16} />
              </Button>
              <Button size="sm" variant="ghost" aria-label="Sil" onClick={() => handleDeleteWorkplace(index)} title="Sil" className="text-destructive">
                <Trash size={16} />
              </Button>
            </>}
        </td>
      </tr>;
  };
  const renderDocumentRow = (doc: string, index: number) => {
    const isEditing = docEditIndex === index;
    return <tr key={index} className="border-b hover:bg-gray-50">
        <td className="p-2">
          {isEditing ? <input className="bg-white text-black rounded-md border border-gray-300 px-2 py-1 w-full placeholder:text-gray-400" value={docEditValue} onChange={e => setDocEditValue(e.target.value)} placeholder="Belge adını giriniz..." autoFocus disabled={isLoading} /> : <span className="text-black">{doc}</span>}
        </td>
        <td className="p-2 flex gap-2 justify-end">
          {isEditing ? <Button size="sm" variant="default" onClick={handleSaveDocument} title="Kaydet" className="bg-purple-600 text-white hover:bg-purple-700">
              <Save size={16} />
            </Button> : <>
              <Button size="sm" variant="ghost" onClick={() => handleEditDocument(index)} title="Düzenle">
                <Edit size={16} />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteDocument(index)} title="Sil">
                <Trash size={16} />
              </Button>
            </>}
        </td>
      </tr>;
  };
  const renderCompetitionRow = (comp: string, index: number) => {
    const isEditing = compEditIndex === index;
    return <tr key={index} className="border-b hover:bg-gray-50">
        <td className="p-2">
          {isEditing ? <input className="bg-white text-black rounded-md border border-gray-300 px-2 py-1 w-full placeholder:text-gray-400" value={compEditValue} onChange={e => setCompEditValue(e.target.value)} placeholder="Yarışma adını giriniz..." autoFocus disabled={isLoading} /> : <span className="text-black">{comp}</span>}
        </td>
        <td className="p-2 flex gap-2 justify-end">
          {isEditing ? <Button size="sm" variant="default" onClick={handleSaveCompetition} title="Kaydet" className="bg-purple-600 text-white hover:bg-purple-700">
              <Save size={16} />
            </Button> : <>
              <Button size="sm" variant="ghost" onClick={() => handleEditCompetition(index)} title="Düzenle">
                <Edit size={16} />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCompetition(index)} title="Sil">
                <Trash size={16} />
              </Button>
            </>}
        </td>
      </tr>;
  };
  return <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold border-b pb-2">Geçmiş Bilgileri</h2>

      {/* İş Yerleri ve Görevler */}
      <div>
        <h3 className="font-semibold mb-1">İş Yerleri ve Görevler</h3>
        <div className="flex gap-2 mb-1">
          <input type="text" placeholder="İş yeri adı giriniz..." value={newIsYeri} onChange={e => setNewIsYeri(e.target.value)} disabled={isLoading} className="text-white placeholder:text-gray-400 rounded-md border border-gray-600 px-3 py-2 flex-grow bg-slate-50" />
          <input type="text" placeholder="Görev / Pozisyon giriniz..." className="bg-black text-white placeholder:text-gray-400 rounded-md border border-gray-600 px-3 py-2 flex-grow" value={newGorevPozisyon} onChange={e => setNewGorevPozisyon(e.target.value)} disabled={isLoading} />
          <Button variant="default" size="sm" onClick={() => {
          handleAddWorkplace();
        }} disabled={isLoading} className="bg-purple-600 text-white hover:bg-purple-700">
            Tecrübe Ekle
          </Button>
        </div>
        <p className="text-xs text-gray-400 mb-2">İş yeri ve görev bilgileri birlikte kaydedilir.</p>
        {workplaceList.length > 0 ? <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2">İş Yeri</th>
                <th className="text-left p-2">Görev / Pozisyon</th>
                <th className="text-right p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>{workplaceList.map(renderWorkplaceRow)}</tbody>
          </table> : <p className="text-sm text-gray-500">Henüz iş tecrübesi eklenmedi.</p>}
      </div>

      {/* Belgeler */}
      <div>
        <h3 className="font-semibold mb-1">Belgeler</h3>
        <div className="flex gap-2 mb-1">
          <input type="text" placeholder="Belge adını giriniz..." className="bg-black text-white placeholder:text-gray-400 rounded-md border border-gray-600 px-3 py-2 flex-grow" value={newDocument} onChange={e => setNewDocument(e.target.value)} disabled={isLoading} />
          <Button variant="default" size="sm" onClick={() => {
          handleAddDocument();
        }} disabled={isLoading} className="bg-purple-600 text-white hover:bg-purple-700">
            Belge Ekle
          </Button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Belgeler tek başına kaydedilir.</p>
        {documentList.length > 0 ? <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2">Belge Adı</th>
                <th className="text-right p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>{documentList.map(renderDocumentRow)}</tbody>
          </table> : <p className="text-sm text-gray-500">Henüz belge eklenmedi.</p>}
      </div>

      {/* Yarışmalar */}
      <div>
        <h3 className="font-semibold mb-1">Yarışmalar</h3>
        <div className="flex gap-2 mb-1">
          <input type="text" placeholder="Yarışma adını giriniz..." className="bg-black text-white placeholder:text-gray-400 rounded-md border border-gray-600 px-3 py-2 flex-grow" value={newCompetition} onChange={e => setNewCompetition(e.target.value)} disabled={isLoading} />
          <Button variant="default" size="sm" onClick={() => {
          handleAddCompetition();
        }} disabled={isLoading} className="bg-purple-600 text-white hover:bg-purple-700">
            Yarışma Ekle
          </Button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Yarışmalar tek başına kaydedilir.</p>
        {competitionList.length > 0 ? <table className="w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2">Yarışma Adı</th>
                <th className="text-right p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>{competitionList.map(renderCompetitionRow)}</tbody>
          </table> : <p className="text-sm text-gray-500">Henüz yarışma eklenmedi.</p>}
      </div>

      {/* CV */}
      <div>
        <label className="block font-medium mb-1">CV</label>
        <textarea className="bg-black text-white rounded-md border border-gray-600 px-3 py-2 w-full min-h-[90px] placeholder:text-gray-400" value={cvText} onChange={handleCvChange} placeholder="Serbest metin" disabled={isLoading} />
      </div>

      {/* Save and Cancel buttons */}
      <div className="mt-6 flex gap-2 justify-end">
        <Button className="px-6 py-2 rounded bg-purple-600 text-white hover:bg-purple-700" variant="default" onClick={handleSaveAll} disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button className="px-6 py-2 rounded" variant="outline" disabled={isLoading} onClick={() => {
        // Reset fields on cancel - reload from props
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
      }}>
          İptal
        </Button>
      </div>
    </div>;
};
export default HistoryTab;