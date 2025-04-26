
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, BookOpen, GraduationCap } from "lucide-react";

interface EducationData {
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  meslekibrans: string;
  universitedurumu: string;
  universitebolum: string;
}

interface EducationTabProps {
  educationData: EducationData;
  onEducationChange: ((data: EducationData) => void) | ((field: keyof EducationData, value: string) => void);
  onSave: (data: EducationData) => Promise<void>;
  isLoading: boolean;
}

const EducationTab: React.FC<EducationTabProps> = ({
  educationData,
  onEducationChange,
  onSave,
  isLoading,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const handleChange = (field: keyof EducationData, value: string) => {
    // Check if onEducationChange accepts a complete data object or field-value pair
    if (typeof onEducationChange === 'function') {
      if (onEducationChange.length === 1) {
        // It accepts the whole object
        (onEducationChange as (data: EducationData) => void)({
          ...educationData,
          [field]: value,
        });
      } else {
        // It accepts field-value pair
        (onEducationChange as (field: keyof EducationData, value: string) => void)(
          field, 
          value
        );
      }
    }
    
    // Handle step progression based on selection
    if (field === 'ortaokuldurumu' && value === 'Mezun') {
      setCurrentStep(2); // Show Lise Durumu
    } else if (field === 'lisedurumu' && value === 'Mezun') {
      setCurrentStep(4); // Show Lise Türü and Mesleki Branş
    } else if (field === 'liseturu' || field === 'meslekibrans') {
      if (educationData.liseturu && educationData.meslekibrans) {
        setCurrentStep(5); // Show Üniversite Durumu
      }
    } else if (field === 'universitedurumu' && value === 'Mezun') {
      setCurrentStep(6); // Show Üniversite Bölümü
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(educationData);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const statusOptions = ["Mezun", "Devam Ediyor", "Terk", "Tamamlanmadı"];

  const highSchoolTypes = [
    "Anadolu Lisesi",
    "Fen Lisesi",
    "Meslek Lisesi",
    "İmam Hatip Lisesi",
    "Özel Lise",
    "Açık Öğretim",
    "Diğer"
  ];

  const vocationalBranches = [
    "Kuaförlük",
    "Estetisyenlik",
    "Makyaj Uzmanlığı",
    "Cilt Bakımı",
    "Manikür/Pedikür",
    "Saç Bakımı",
    "Diğer"
  ];

  const universityOptions = [
    "Mezun",
    "Devam Ediyor",
    "Terk",
    "Tamamlanmadı",
    "Yüksek Lisans",
    "Doktora"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <School size={18} />
              Eğitim Bilgileri
            </h3>
            
            {/* Step 1: Ortaokul Durumu */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ortaokul Durumu</label>
                <Select
                  value={educationData.ortaokuldurumu}
                  onValueChange={(value) => handleChange("ortaokuldurumu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Ortaokul durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={`ortaokul-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Step 2: Lise Durumu (Only shown if ortaokul is Mezun) */}
            {currentStep >= 2 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen size={16} />
                  Lise Durumu
                </label>
                <Select
                  value={educationData.lisedurumu}
                  onValueChange={(value) => handleChange("lisedurumu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Lise durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={`lise-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 3 & 4: Lise Türü and Mesleki Branş (Only shown if lise is Mezun) */}
            {currentStep >= 4 && (
              <div className="grid gap-4 pt-4 border-t border-gray-100">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Lise Türü</label>
                    <Select
                      value={educationData.liseturu}
                      onValueChange={(value) => handleChange("liseturu", value)}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Lise türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {highSchoolTypes.map((type) => (
                          <SelectItem key={`type-${type}`} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Mesleki Branş</label>
                    <Select
                      value={educationData.meslekibrans}
                      onValueChange={(value) => handleChange("meslekibrans", value)}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Branş seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {vocationalBranches.map((branch) => (
                          <SelectItem key={`branch-${branch}`} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 5: Üniversite Durumu */}
            {currentStep >= 5 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap size={16} />
                  Üniversite Durumu
                </label>
                <Select
                  value={educationData.universitedurumu}
                  onValueChange={(value) => handleChange("universitedurumu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Üniversite durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {universityOptions.map((option) => (
                      <SelectItem key={`uni-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 6: Üniversite Bölümü (Only shown if üniversite is Mezun) */}
            {currentStep >= 6 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium">Üniversite Bölümü</label>
                <Input
                  value={educationData.universitebolum}
                  onChange={(e) => handleChange("universitebolum", e.target.value)}
                  placeholder="Bölümünüz"
                  className="text-gray-900"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button" 
              variant="outline"
              onClick={() => {
                // Reset form and steps
                setCurrentStep(1);
                
                // Handle reset based on which type of onEducationChange we have
                if (typeof onEducationChange === 'function') {
                  if (onEducationChange.length === 1) {
                    (onEducationChange as (data: EducationData) => void)({
                      ortaokuldurumu: "",
                      lisedurumu: "",
                      liseturu: "",
                      meslekibrans: "",
                      universitedurumu: "",
                      universitebolum: ""
                    });
                  } else {
                    // Reset each field individually
                    const emptyData: EducationData = {
                      ortaokuldurumu: "",
                      lisedurumu: "",
                      liseturu: "",
                      meslekibrans: "",
                      universitedurumu: "",
                      universitebolum: ""
                    };
                    
                    Object.entries(emptyData).forEach(([key, value]) => {
                      (onEducationChange as (field: keyof EducationData, value: string) => void)(
                        key as keyof EducationData,
                        value
                      );
                    });
                  }
                }
              }}
            >
              İptal
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Kaydet
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EducationTab;
