import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { Plus, Briefcase, FileText, Award } from "lucide-react";
import { StaffExperienceTable } from "@/components/staff-profile/history/StaffExperienceTable";
import { StaffCertificatesTable } from "@/components/staff-profile/history/StaffCertificatesTable";
import { StaffCompetitionsTable } from "@/components/staff-profile/history/StaffCompetitionsTable";

interface WorkExperience {
  workplace: string;
  position: string;
  duration: string;
}

interface HistoryData {
  isyerleri: string;
  gorevpozisyon: string;
  belgeler: string;
  yarismalar: string;
  cv: string;
}

interface HistoryTabProps {
  historyData: HistoryData;
  onHistoryChange: (data: HistoryData) => void;
  onSave: (data: HistoryData) => Promise<void>;
  isLoading: boolean;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  historyData,
  onHistoryChange,
  onSave,
  isLoading,
}) => {
  const [newWorkplace, setNewWorkplace] = useState<WorkExperience>({
    workplace: "",
    position: "",
    duration: ""
  });
  const [newCertificate, setNewCertificate] = useState("");
  const [newCompetition, setNewCompetition] = useState("");
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [competitions, setCompetitions] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(historyData);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const addExperience = () => {
    if (!newWorkplace.workplace || !newWorkplace.position || !newWorkplace.duration) return;
    
    const newExperiences = [...experiences, newWorkplace];
    setExperiences(newExperiences);
    
    // Update history data
    const formattedExperiences = newExperiences.map(exp => 
      `${exp.workplace} | ${exp.position} | ${exp.duration}`
    ).join('\n');
    
    onHistoryChange({
      ...historyData,
      isyerleri: formattedExperiences
    });
    
    setNewWorkplace({ workplace: "", position: "", duration: "" });
  };

  const addCertificate = () => {
    if (!newCertificate) return;
    
    const newCertificates = [...certificates, newCertificate];
    setCertificates(newCertificates);
    
    // Update history data
    const formattedCertificates = newCertificates.join('\n');
    
    onHistoryChange({
      ...historyData,
      belgeler: formattedCertificates
    });
    
    setNewCertificate("");
  };

  const addCompetition = () => {
    if (!newCompetition) return;
    
    const newCompetitions = [...competitions, newCompetition];
    setCompetitions(newCompetitions);
    
    // Update history data
    const formattedCompetitions = newCompetitions.join('\n');
    
    onHistoryChange({
      ...historyData,
      yarismalar: formattedCompetitions
    });
    
    setNewCompetition("");
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onHistoryChange({
      ...historyData,
      cv: e.target.value
    });
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
              <Input
                placeholder="İş Yeri"
                value={newWorkplace.workplace}
                onChange={(e) => setNewWorkplace({...newWorkplace, workplace: e.target.value})}
                className="text-gray-900"
              />
              <Input
                placeholder="Görev / Pozisyon"
                value={newWorkplace.position}
                onChange={(e) => setNewWorkplace({...newWorkplace, position: e.target.value})}
                className="text-gray-900"
              />
              <Input
                placeholder="Çalışma Süresi"
                value={newWorkplace.duration}
                onChange={(e) => setNewWorkplace({...newWorkplace, duration: e.target.value})}
                className="text-gray-900"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={addExperience}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Tecrübe Ekle
              </Button>
            </div>
            
            <StaffExperienceTable
              experiences={experiences}
              onDelete={(index) => {
                const newExperiences = [...experiences];
                newExperiences.splice(index, 1);
                setExperiences(newExperiences);
                
                const formattedExperiences = newExperiences.map(exp => 
                  `${exp.workplace} | ${exp.position} | ${exp.duration}`
                ).join('\n');
                
                onHistoryChange({
                  ...historyData,
                  isyerleri: formattedExperiences
                });
              }}
              onEdit={(index) => {
                // Implement edit functionality here
                alert(`Edit experience at index ${index}`);
              }}
            />
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
            
            <StaffCertificatesTable
              certificates={certificates}
              onDelete={(index) => {
                const newCertificates = [...certificates];
                newCertificates.splice(index, 1);
                setCertificates(newCertificates);
                
                const formattedCertificates = newCertificates.join('\n');
                
                onHistoryChange({
                  ...historyData,
                  belgeler: formattedCertificates
                });
              }}
              onEdit={(index) => {
                // Implement edit functionality here
                alert(`Edit certificate at index ${index}`);
              }}
            />
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
            
            <StaffCompetitionsTable
              competitions={competitions}
              onDelete={(index) => {
                const newCompetitions = [...competitions];
                newCompetitions.splice(index, 1);
                setCompetitions(newCompetitions);
                
                const formattedCompetitions = newCompetitions.join('\n');
                
                onHistoryChange({
                  ...historyData,
                  yarismalar: formattedCompetitions
                });
              }}
              onEdit={(index) => {
                // Implement edit functionality here
                alert(`Edit competition at index ${index}`);
              }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Özgeçmiş</h3>
            <div>
              <Textarea
                value={historyData.cv}
                onChange={handleCvChange}
                placeholder="Kendiniz hakkında belirtmek istedikleriniz, hedefleriniz, kariyer planlarınız ve hayallerinizi yazabilirsiniz."
                rows={6}
                className="text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">İptal</Button>
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
