
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { Plus, Briefcase, FileText, Award } from "lucide-react";

interface WorkExperience {
  workplace: string;
  position: string;
  duration: string;
}

interface Certificate {
  name: string;
}

interface Competition {
  name: string;
}

interface HistoryData {
  isyerleri: string;
  gorevpozisyon: string;
  calisma_suresi?: string; // Added new field
  belgeler: string;
  yarismalar: string;
  cv: string;
}

interface HistoryTabProps {
  historyData: HistoryData;
  onHistoryChange: ((data: HistoryData) => void) | ((field: keyof HistoryData, value: string) => void);
  onSave: (data: HistoryData) => Promise<void>;
  isLoading: boolean;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  historyData,
  onHistoryChange,
  onSave,
  isLoading,
}) => {
  const [workplaces, setWorkplaces] = useState<WorkExperience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  const [newWorkplace, setNewWorkplace] = useState<WorkExperience>({
    workplace: "",
    position: "",
    duration: ""
  });
  
  const [newCertificate, setNewCertificate] = useState<string>("");
  const [newCompetition, setNewCompetition] = useState<string>("");
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Check if onHistoryChange accepts a complete data object or field-value pair
    if (typeof onHistoryChange === 'function') {
      if (onHistoryChange.length === 1) {
        // It accepts the whole object
        (onHistoryChange as (data: HistoryData) => void)({
          ...historyData,
          [name]: value,
        });
      } else {
        // It accepts field-value pair
        (onHistoryChange as (field: keyof HistoryData, value: string) => void)(
          name as keyof HistoryData, 
          value
        );
      }
    }
  };

  const addWorkplace = () => {
    if (!newWorkplace.workplace || !newWorkplace.position) return;
    
    const workplaceEntry = `${newWorkplace.workplace} / ${newWorkplace.position} / ${newWorkplace.duration || '-'}`;
    const updatedIsyerleri = historyData.isyerleri 
      ? historyData.isyerleri + "\n" + workplaceEntry 
      : workplaceEntry;
    
    // Update state with new workplace
    setWorkplaces([...workplaces, newWorkplace]);
    setNewWorkplace({ workplace: "", position: "", duration: "" });
    
    // Update history data
    if (typeof onHistoryChange === 'function') {
      if (onHistoryChange.length === 1) {
        (onHistoryChange as (data: HistoryData) => void)({
          ...historyData,
          isyerleri: updatedIsyerleri,
        });
      } else {
        (onHistoryChange as (field: keyof HistoryData, value: string) => void)(
          "isyerleri", 
          updatedIsyerleri
        );
      }
    }
  };

  const addCertificate = () => {
    if (!newCertificate) return;
    
    const updatedBelgeler = historyData.belgeler 
      ? historyData.belgeler + "\n" + newCertificate 
      : newCertificate;
    
    // Update state with new certificate
    setCertificates([...certificates, { name: newCertificate }]);
    setNewCertificate("");
    
    // Update history data
    if (typeof onHistoryChange === 'function') {
      if (onHistoryChange.length === 1) {
        (onHistoryChange as (data: HistoryData) => void)({
          ...historyData,
          belgeler: updatedBelgeler,
        });
      } else {
        (onHistoryChange as (field: keyof HistoryData, value: string) => void)(
          "belgeler", 
          updatedBelgeler
        );
      }
    }
  };

  const addCompetition = () => {
    if (!newCompetition) return;
    
    const updatedYarismalar = historyData.yarismalar 
      ? historyData.yarismalar + "\n" + newCompetition 
      : newCompetition;
    
    // Update state with new competition
    setCompetitions([...competitions, { name: newCompetition }]);
    setNewCompetition("");
    
    // Update history data
    if (typeof onHistoryChange === 'function') {
      if (onHistoryChange.length === 1) {
        (onHistoryChange as (data: HistoryData) => void)({
          ...historyData,
          yarismalar: updatedYarismalar,
        });
      } else {
        (onHistoryChange as (field: keyof HistoryData, value: string) => void)(
          "yarismalar", 
          updatedYarismalar
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(historyData);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Briefcase size={18} />
              İş Yerleri ve Görevler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="İş Yeri"
                  value={newWorkplace.workplace}
                  onChange={(e) => setNewWorkplace({...newWorkplace, workplace: e.target.value})}
                  className="text-gray-900"
                />
              </div>
              <div>
                <Input
                  placeholder="Görev / Pozisyon"
                  value={newWorkplace.position}
                  onChange={(e) => setNewWorkplace({...newWorkplace, position: e.target.value})}
                  className="text-gray-900"
                />
              </div>
              <div>
                <Input
                  placeholder="Çalışma Süresi"
                  value={newWorkplace.duration}
                  onChange={(e) => setNewWorkplace({...newWorkplace, duration: e.target.value})}
                  className="text-gray-900"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={addWorkplace}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Tecrübe Ekle
              </Button>
            </div>
            
            {historyData.isyerleri && (
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="font-medium mb-1 text-sm">Kaydedilen İş Yerleri:</p>
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{historyData.isyerleri}</pre>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              İş yeri, görev pozisyonu ve çalışma süresi bilgileri birlikte kaydedilir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText size={18} />
              Belgeler
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Belge adını giriniz..."
                value={newCertificate}
                onChange={(e) => setNewCertificate(e.target.value)}
                className="text-gray-900"
              />
              <Button 
                type="button" 
                onClick={addCertificate}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Belge Ekle
              </Button>
            </div>
            
            {historyData.belgeler && (
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="font-medium mb-1 text-sm">Kaydedilen Belgeler:</p>
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{historyData.belgeler}</pre>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Belgeler tek başına kaydedilir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Award size={18} />
              Yarışmalar
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Yarışma adını giriniz..."
                value={newCompetition}
                onChange={(e) => setNewCompetition(e.target.value)}
                className="text-gray-900"
              />
              <Button 
                type="button" 
                onClick={addCompetition}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Yarışma Ekle
              </Button>
            </div>
            
            {historyData.yarismalar && (
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="font-medium mb-1 text-sm">Kaydedilen Yarışmalar:</p>
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{historyData.yarismalar}</pre>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Yarışmalar tek başına kaydedilir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Özgeçmiş</h3>
            <div>
              <Textarea
                name="cv"
                value={historyData.cv}
                onChange={handleChange}
                placeholder="Kendiniz hakkında belirtmek istedikleriniz, hedefleriniz, kariyer planlarınız ve hayallerinizi yazabilirsiniz."
                rows={6}
                className="text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button" 
              variant="outline"
              onClick={() => {
                // Handle reset based on which type of onHistoryChange we have
                if (typeof onHistoryChange === 'function') {
                  if (onHistoryChange.length === 1) {
                    (onHistoryChange as (data: HistoryData) => void)({
                      isyerleri: "",
                      gorevpozisyon: "",
                      belgeler: "",
                      yarismalar: "",
                      cv: ""
                    });
                  } else {
                    // Reset each field individually
                    const emptyData: HistoryData = {
                      isyerleri: "",
                      gorevpozisyon: "",
                      belgeler: "",
                      yarismalar: "",
                      cv: ""
                    };
                    
                    Object.entries(emptyData).forEach(([key, value]) => {
                      (onHistoryChange as (field: keyof HistoryData, value: string) => void)(
                        key as keyof HistoryData,
                        value
                      );
                    });
                  }
                  
                  // Reset local state
                  setWorkplaces([]);
                  setCertificates([]);
                  setCompetitions([]);
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

export default HistoryTab;
