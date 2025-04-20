
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export interface EducationTabProps {
  educationData: {
    ortaokuldurumu: string;
    lisedurumu: string;
    liseturu: string;
    meslekibrans: string;
    universitedurumu: string;
    universitebolum: string;
  };
  onEducationChange: (
    field: keyof EducationTabProps["educationData"],
    value: string
  ) => void;
  historyData: {
    isyerleri: Array<{ id?: number; isyeri: string; pozisyon: string }>;
    gorevpozisyon: string; // will not be used as single string, removed usage
    belgeler: Array<{ id?: number; belgeadi: string }>;
    yarismalar: Array<{ id?: number; yarismaadi: string }>;
    cv: string;
  };
  onHistoryChange: (
    field: keyof EducationTabProps["historyData"],
    value:
      | string
      | Array<{ id?: number; isyeri?: string; pozisyon?: string }>
      | Array<{ id?: number; belgeadi?: string }>
      | Array<{ id?: number; yarismaadi?: string }>
  ) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

const liseOptions = [
  "Fen Lisesi",
  "Sosyal Bilimler Lisesi",
  "Anadolu Lisesi",
  "Güzel Sanatlar Lisesi",
  "Spor Lisesi",
  "Anadolu İmam Hatip Lisesi",
  "Çok Programlı Anadolu Lisesi",
  "Mesleki ve Teknik Anadolu Lisesi",
  "Akşam Lisesi",
  "Açık Öğretim Lisesi",
];

const universiteBolumOptions = [
  "Saç Bakımı ve Güzellik Hizmetleri",
  "Diğer",
];

const EducationTab = ({
  educationData,
  onEducationChange,
  onSave,
  isLoading,
  historyData,
  onHistoryChange,
}: EducationTabProps) => {
  // Determine visibility based on selection
  const ortaokulBitirdi =
    educationData.ortaokuldurumu.toLowerCase().includes("mezun") ||
    educationData.ortaokuldurumu.toLowerCase().includes("bitiriyor") ||
    educationData.ortaokuldurumu.toLowerCase().includes("devam ediyor");

  const liseBitirdi =
    educationData.lisedurumu.toLowerCase().includes("mezun") ||
    educationData.lisedurumu.toLowerCase().includes("bitiriyor") ||
    educationData.lisedurumu.toLowerCase().includes("devam ediyor");

  const showUniversite = liseBitirdi;

  const showMeslekBrans = [
    "Çok Programlı Anadolu Lisesi",
    "Mesleki ve Teknik Anadolu Lisesi",
  ].includes(educationData.liseturu);

  // Local state for experience inputs (workplace+position)
  const [isyeriInput, setIsyeriInput] = useState("");
  const [pozisyonInput, setPozisyonInput] = useState("");
  const [belgeInput, setBelgeInput] = useState("");
  const [yarismaInput, setYarismaInput] = useState("");

  // Handlers for adding items
  const handleAddExperience = () => {
    if (!isyeriInput.trim() || !pozisyonInput.trim()) {
      toast.error("Lütfen iş yeri adı ve görev/pozisyon bilgisini girin.");
      return;
    }
    const exists = historyData.isyerleri.some(
      (item) =>
        item.isyeri.toLowerCase() === isyeriInput.trim().toLowerCase() &&
        item.pozisyon.toLowerCase() === pozisyonInput.trim().toLowerCase()
    );
    if (exists) {
      toast.error("Bu iş yeri ve pozisyon zaten ekli.");
      return;
    }
    const newList = [
      ...historyData.isyerleri,
      { isyeri: isyeriInput.trim(), pozisyon: pozisyonInput.trim() },
    ];
    onHistoryChange("isyerleri", newList);
    setIsyeriInput("");
    setPozisyonInput("");
  };

  const handleRemoveExperience = (index: number) => {
    const newList = historyData.isyerleri.filter((_, i) => i !== index);
    onHistoryChange("isyerleri", newList);
  };

  const handleAddBelge = () => {
    if (!belgeInput.trim()) {
      toast.error("Lütfen belge adını girin.");
      return;
    }
    const exists = historyData.belgeler.some(
      (item) => item.belgeadi.toLowerCase() === belgeInput.trim().toLowerCase()
    );
    if (exists) {
      toast.error("Bu belge zaten ekli.");
      return;
    }
    const newList = [...historyData.belgeler, { belgeadi: belgeInput.trim() }];
    onHistoryChange("belgeler", newList);
    setBelgeInput("");
  };

  const handleRemoveBelge = (index: number) => {
    const newList = historyData.belgeler.filter((_, i) => i !== index);
    onHistoryChange("belgeler", newList);
  };

  const handleAddYarisma = () => {
    if (!yarismaInput.trim()) {
      toast.error("Lütfen yarışma adını girin.");
      return;
    }
    const exists = historyData.yarismalar.some(
      (item) => item.yarismaadi.toLowerCase() === yarismaInput.trim().toLowerCase()
    );
    if (exists) {
      toast.error("Bu yarışma zaten ekli.");
      return;
    }
    const newList = [...historyData.yarismalar, { yarismaadi: yarismaInput.trim() }];
    onHistoryChange("yarismalar", newList);
    setYarismaInput("");
  };

  const handleRemoveYarisma = (index: number) => {
    const newList = historyData.yarismalar.filter((_, i) => i !== index);
    onHistoryChange("yarismalar", newList);
  };

  // Update CV value immediate on textarea change
  const handleCvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onHistoryChange("cv", e.target.value);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold border-b pb-2 text-black dark:text-white">Eğitim Bilgileri</h2>

      {/* Ortaokul Durumu */}
      <div>
        <label className="block font-medium mb-1 text-black dark:text-white">Ortaokul Durumu</label>
        <Select
          onValueChange={(value) => onEducationChange("ortaokuldurumu", value)}
          value={educationData.ortaokuldurumu || ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ortaokul mezuniyet durumunu seçiniz..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Mezun">Mezun</SelectItem>
              <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
              <SelectItem value="Bitirmedi">Bitirmedi</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
          Ortaokul mezuniyet durumunuzu seçiniz. Örneğin "Mezun" seçerseniz diğer eğitim aşamalarına erişebilirsiniz.
        </p>
      </div>

      {/* Lise Durumu */}
      {ortaokulBitirdi && (
        <div>
          <label className="block font-medium mb-1 text-black dark:text-white">Lise Durumu</label>
          <Select
            onValueChange={(value) => onEducationChange("lisedurumu", value)}
            value={educationData.lisedurumu || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lise mezuniyet durumunu seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Mezun">Mezun</SelectItem>
                <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                <SelectItem value="Bitirmedi">Bitirmedi</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Lise mezuniyet durumunuzu seçiniz. "Mezun" ya da "Devam Ediyor" seçerseniz sonraki alanlar aktif olur.
          </p>
        </div>
      )}

      {/* Lise Türü */}
      {ortaokulBitirdi && liseBitirdi && (
        <div>
          <label className="block font-medium mb-1 text-black dark:text-white">Lise Türü</label>
          <Select
            onValueChange={(value) => onEducationChange("liseturu", value)}
            value={educationData.liseturu || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lise türünüzü seçiniz..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectGroup>
                {liseOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Lise türünü seçiniz. Mesleki lise seçerseniz mesleki branş alanı aktiflecektir.
          </p>
        </div>
      )}

      {/* Mesleki Branş */}
      {showMeslekBrans && (
        <div>
          <label className="block font-medium mb-1 text-black dark:text-white">Mesleki Branş</label>
          <input
            type="text"
            className="input-primary w-full bg-black text-white placeholder-gray-400"
            value={educationData.meslekibrans}
            onChange={(e) => onEducationChange("meslekibrans", e.target.value)}
            placeholder="Örneğin Kuaförlük, Estetik..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Çok Programlı Anadolu Lisesi veya Mesleki ve Teknik Anadolu Lisesi için mesleki branşı detaylı olarak giriniz.
          </p>
        </div>
      )}

      {/* Üniversite Durumu */}
      {showUniversite && (
        <div>
          <label className="block font-medium mb-1 text-black dark:text-white">Üniversite Durumu</label>
          <Select
            onValueChange={(value) => onEducationChange("universitedurumu", value)}
            value={educationData.universitedurumu || "Yok"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Üniversite mezuniyet durumunuzu seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Mezun">Mezun</SelectItem>
                <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                <SelectItem value="Bitirmedi">Bitirmedi</SelectItem>
                <SelectItem value="Yok">Yok</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Üniversite mezuniyet durumunuzu seçiniz. "Mezun" ya da "Devam Ediyor" ise bölümünü belirtiniz.
          </p>
        </div>
      )}

      {/* Üniversite Bölüm */}
      {(educationData.universitedurumu === "Mezun" ||
        educationData.universitedurumu === "Devam Ediyor") && (
        <div>
          <label className="block font-medium mb-1 text-black dark:text-white">Üniversite Bölüm</label>
          <Select
            onValueChange={(value) => onEducationChange("universitebolum", value)}
            value={educationData.universitebolum || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Üniversite bölümünüzü seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {universiteBolumOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Üniversite bölümünü belirtiniz.
          </p>
        </div>
      )}

      {/* Yeni Bölüm: Geçmiş Bilgileri - İş Yeri ve Görevler */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-black dark:text-white">İş Yeri ve Görevler (Tecrübeler)</h3>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="İş yeri adı giriniz..."
            className="input-primary flex-grow bg-black text-white placeholder-gray-400"
            value={isyeriInput}
            onChange={(e) => setIsyeriInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Görev / Pozisyon giriniz..."
            className="input-primary flex-grow bg-black text-white placeholder-gray-400"
            value={pozisyonInput}
            onChange={(e) => setPozisyonInput(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddExperience}
            className="btn btn-primary self-center px-4 py-1"
          >
            Tecrübe Ekle
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-300 mb-4">İş yeri ve görev bilgileri birlikte kaydedilir.</p>

        {/* İş Yeri-Pozisyon Tablosu */}
        <table className="w-full table-auto border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-left">İş Yeri</th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-left">Görev / Pozisyon</th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-black dark:text-white">
            {historyData.isyerleri.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-4 italic text-gray-500 dark:text-gray-400">Henüz iş yeri ve görev bilgisi eklenmemiş.</td>
              </tr>
            ) : (
              historyData.isyerleri.map((item, index) => (
                <tr key={`${item.isyeri}-${index}`}>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1">{item.isyeri}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1">{item.pozisyon}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-center">
                    <button
                      type="button"
                      aria-label="Düzenle"
                      className="mr-2 text-purple-700 dark:text-purple-300 hover:text-purple-900"
                      onClick={() => {
                        // For this example, edit will put values to inputs for update. Remove from list.
                        setIsyeriInput(item.isyeri);
                        setPozisyonInput(item.pozisyon);
                        // Remove edited item for update
                        handleRemoveExperience(index);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 010 2.828L8.414 14.414a2 2 0 01-1.414.586H5v-2a2 2 0 01.586-1.414l9-9a2 2 0 012.828 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Sil"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveExperience(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9H7v2h6V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Belgeler */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-black dark:text-white">Belgeler</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Belge adını giriniz..."
            className="input-primary flex-grow bg-black text-white placeholder-gray-400"
            value={belgeInput}
            onChange={(e) => setBelgeInput(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddBelge}
            className="btn btn-primary self-center px-4 py-1"
          >
            Belge Ekle
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-300 mb-4">Belgeler tek başına kaydedilir.</p>

        {/* Belgeler Tablosu */}
        <table className="w-full table-auto border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-left">Belge Adı</th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-black dark:text-white">
            {historyData.belgeler.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-4 italic text-gray-500 dark:text-gray-400">Henüz belge eklenmemiş.</td>
              </tr>
            ) : (
              historyData.belgeler.map((item, index) => (
                <tr key={`${item.belgeadi}-${index}`}>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1">{item.belgeadi}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-center">
                    <button
                      type="button"
                      aria-label="Düzenle"
                      className="mr-2 text-purple-700 dark:text-purple-300 hover:text-purple-900"
                      onClick={() => {
                        setBelgeInput(item.belgeadi);
                        const newList = historyData.belgeler.filter((_, i) => i !== index);
                        onHistoryChange("belgeler", newList);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 010 2.828L8.414 14.414a2 2 0 01-1.414.586H5v-2a2 2 0 01.586-1.414l9-9a2 2 0 012.828 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Sil"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        const newList = historyData.belgeler.filter((_, i) => i !== index);
                        onHistoryChange("belgeler", newList);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9H7v2h6V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Yarışmalar */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-black dark:text-white">Yarışmalar</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Yarışma adını giriniz..."
            className="input-primary flex-grow bg-black text-white placeholder-gray-400"
            value={yarismaInput}
            onChange={(e) => setYarismaInput(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddYarisma}
            className="btn btn-primary self-center px-4 py-1"
          >
            Yarışma Ekle
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-300 mb-4">Yarışmalar tek başına kaydedilir.</p>

        {/* Yarışmalar Tablosu */}
        <table className="w-full table-auto border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-left">Yarışma Adı</th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-black dark:text-white">
            {historyData.yarismalar.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-4 italic text-gray-500 dark:text-gray-400">Henüz yarışma eklenmemiş.</td>
              </tr>
            ) : (
              historyData.yarismalar.map((item, index) => (
                <tr key={`${item.yarismaadi}-${index}`}>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1">{item.yarismaadi}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-center">
                    <button
                      type="button"
                      aria-label="Düzenle"
                      className="mr-2 text-purple-700 dark:text-purple-300 hover:text-purple-900"
                      onClick={() => {
                        setYarismaInput(item.yarismaadi);
                        const newList = historyData.yarismalar.filter((_, i) => i !== index);
                        onHistoryChange("yarismalar", newList);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 010 2.828L8.414 14.414a2 2 0 01-1.414.586H5v-2a2 2 0 01.586-1.414l9-9a2 2 0 012.828 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Sil"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        const newList = historyData.yarismalar.filter((_, i) => i !== index);
                        onHistoryChange("yarismalar", newList);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9H7v2h6V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CV */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-black dark:text-white">CV</h3>
        <textarea
          value={historyData.cv}
          onChange={handleCvChange}
          className="input-primary w-full min-h-[120px] bg-black text-white placeholder-gray-400 resize-y"
          placeholder="CV'nizi buraya giriniz..."
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

export default EducationTab;
