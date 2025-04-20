
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const showMeslekBrans = ["Çok Programlı Anadolu Lisesi", "Mesleki ve Teknik Anadolu Lisesi"].includes(
    educationData.liseturu
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold border-b pb-2">Eğitim Bilgileri</h2>

      {/* Ortaokul Durumu */}
      <div>
        <label className="block font-medium mb-1">Ortaokul Durumu</label>
        <Select
          onValueChange={(value) => onEducationChange("ortaokuldurumu", value)}
          value={educationData.ortaokuldurumu || ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seçiniz..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Mezun">Mezun</SelectItem>
              <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
              <SelectItem value="Bitirmedi">Bitirmedi</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">Ortaokul mezuniyet durumunu seçiniz.</p>
      </div>

      {/* Lise Durumu */}
      {ortaokulBitirdi && (
        <div>
          <label className="block font-medium mb-1">Lise Durumu</label>
          <Select
            onValueChange={(value) => onEducationChange("lisedurumu", value)}
            value={educationData.lisedurumu || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Mezun">Mezun</SelectItem>
                <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                <SelectItem value="Bitirmedi">Bitirmedi</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Lise mezuniyet durumunu seçiniz.</p>
        </div>
      )}

      {/* Lise Türü */}
      {ortaokulBitirdi && liseBitirdi && (
        <div>
          <label className="block font-medium mb-1">Lise Türü</label>
          <Select
            onValueChange={(value) => onEducationChange("liseturu", value)}
            value={educationData.liseturu || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seçiniz..." />
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
          <p className="text-xs text-gray-500 mt-1">Lise türünü seçiniz.</p>
        </div>
      )}

      {/* Mesleki Branş */}
      {showMeslekBrans && (
        <div>
          <label className="block font-medium mb-1">Mesleki Branş</label>
          <input
            type="text"
            className="input-primary w-full"
            value={educationData.meslekibrans}
            onChange={(e) => onEducationChange("meslekibrans", e.target.value)}
            placeholder="Ör: Kuaförlük, Estetik..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Çok Programlı Anadolu Lisesi veya Mesleki ve Teknik Anadolu Lisesi için mesleki branşı giriniz.
          </p>
        </div>
      )}

      {/* Üniversite Durumu */}
      {showUniversite && (
        <div>
          <label className="block font-medium mb-1">Üniversite Durumu</label>
          <Select
            onValueChange={(value) => onEducationChange("universitedurumu", value)}
            value={educationData.universitedurumu || "Yok"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seçiniz..." />
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
          <p className="text-xs text-gray-500 mt-1">Üniversite mezuniyet durumunu seçiniz.</p>
        </div>
      )}

      {/* Üniversite Bölüm */}
      {(educationData.universitedurumu === "Mezun" ||
        educationData.universitedurumu === "Devam Ediyor") && (
        <div>
          <label className="block font-medium mb-1">Üniversite Bölüm</label>
          <Select
            onValueChange={(value) => onEducationChange("universitebolum", value)}
            value={educationData.universitebolum || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seçiniz..." />
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
          <p className="text-xs text-gray-500 mt-1">Üniversite bölümünü seçiniz.</p>
        </div>
      )}

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

