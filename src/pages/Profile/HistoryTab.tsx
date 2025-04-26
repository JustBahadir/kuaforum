
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { Plus, Briefcase, FileText, Award } from "lucide-react";
import { StaffExperienceTable } from "@/components/staff-profile/history/StaffExperienceTable";
import { StaffCertificatesTable } from "@/components/staff-profile/history/StaffCertificatesTable";
import { StaffCompetitionsTable } from "@/components/staff-profile/history/StaffCompetitionsTable";
import { toast } from "sonner";

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
  // State for form values
  const [newWorkplace, setNewWorkplace] = useState<WorkExperience>({
    workplace: "",
    position: "",
    duration: ""
  });
  const [newCertificate, setNewCertificate] = useState("");
  const [newCompetition, setNewCompetition] = useState("");
  const [cvText, setCvText] = useState(historyData.cv || "");
  const [savingCv, setSavingCv] = useState(false);
  const [savingExperience, setSavingExperience] = useState(false);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [savingCompetition, setSavingCompetition] = useState(false);
  
  // State for edited items
  const [editCertificateIndex, setEditCertificateIndex] = useState<number | null>(null);
  const [editCompetitionIndex, setEditCompetitionIndex] = useState<number | null>(null);
  const [editExperienceIndex, setEditExperienceIndex] = useState<number | null>(null);
  
  // Parse stored data into arrays for tables
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [competitions, setCompetitions] = useState<string[]>([]);

  // Load data when component mounts or historyData changes
  useEffect(() => {
    // Parse experiences from stored string
    if (historyData.isyerleri) {
      try {
        const expLines = historyData.isyerleri.split('\n');
        const parsedExperiences: WorkExperience[] = [];
        
        expLines.forEach(line => {
          if (!line.trim()) return;
          // Format: workplace | position | duration
          const parts = line.split('|').map(part => part.trim());
          if (parts.length >= 3) {
            parsedExperiences.push({
              workplace: parts[0],
              position: parts[1],
              duration: parts[2]
            });
          }
        });
        
        setExperiences(parsedExperiences);
      } catch (error) {
        console.error("Error parsing experiences:", error);
      }
    }
    
    // Parse certificates
    if (historyData.belgeler) {
      setCertificates(historyData.belgeler.split('\n').filter(cert => cert.trim()));
    }
    
    // Parse competitions
    if (historyData.yarismalar) {
      setCompetitions(historyData.yarismalar.split('\n').filter(comp => comp.trim()));
    }
    
    // Set CV text
    setCvText(historyData.cv || "");
  }, [historyData]);

  // Handle experience form submission
  const addExperience = async () => {
    if (!newWorkplace.workplace || !newWorkplace.position || !newWorkplace.duration) {
      toast.error("Lütfen tüm alanları doldurunuz");
      return;
    }
    
    setSavingExperience(true);
    let updatedExperiences: WorkExperience[];
    
    if (editExperienceIndex !== null) {
      // Update existing experience
      updatedExperiences = [...experiences];
      updatedExperiences[editExperienceIndex] = newWorkplace;
      setEditExperienceIndex(null);
    } else {
      // Add new experience
      updatedExperiences = [...experiences, newWorkplace];
    }
    
    setExperiences(updatedExperiences);
    
    // Format experiences for storage
    const formattedExperiences = updatedExperiences.map(exp => 
      `${exp.workplace} | ${exp.position} | ${exp.duration}`
    ).join('\n');
    
    try {
      // Update the historyData state with new experiences
      const updatedHistoryData = {
        ...historyData,
        isyerleri: formattedExperiences
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      
      // Reset form
      setNewWorkplace({ workplace: "", position: "", duration: "" });
      toast.success("İş deneyimi başarıyla kaydedildi");
      
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("İş deneyimi kaydedilirken bir hata oluştu");
    } finally {
      setSavingExperience(false);
    }
  };

  // Handle certificate form submission
  const addCertificate = async () => {
    if (!newCertificate) {
      toast.error("Lütfen belge adını giriniz");
      return;
    }
    
    setSavingCertificate(true);
    let updatedCertificates: string[];
    
    if (editCertificateIndex !== null) {
      // Update existing certificate
      updatedCertificates = [...certificates];
      updatedCertificates[editCertificateIndex] = newCertificate;
      setEditCertificateIndex(null);
    } else {
      // Add new certificate
      updatedCertificates = [...certificates, newCertificate];
    }
    
    setCertificates(updatedCertificates);
    
    try {
      // Update the historyData state with new certificates
      const updatedHistoryData = {
        ...historyData,
        belgeler: updatedCertificates.join('\n')
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      
      // Reset form
      setNewCertificate("");
      toast.success("Belge başarıyla kaydedildi");
      
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error("Belge kaydedilirken bir hata oluştu");
    } finally {
      setSavingCertificate(false);
    }
  };

  // Handle competition form submission
  const addCompetition = async () => {
    if (!newCompetition) {
      toast.error("Lütfen yarışma adını giriniz");
      return;
    }
    
    setSavingCompetition(true);
    let updatedCompetitions: string[];
    
    if (editCompetitionIndex !== null) {
      // Update existing competition
      updatedCompetitions = [...competitions];
      updatedCompetitions[editCompetitionIndex] = newCompetition;
      setEditCompetitionIndex(null);
    } else {
      // Add new competition
      updatedCompetitions = [...competitions, newCompetition];
    }
    
    setCompetitions(updatedCompetitions);
    
    try {
      // Update the historyData state with new competitions
      const updatedHistoryData = {
        ...historyData,
        yarismalar: updatedCompetitions.join('\n')
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      
      // Reset form
      setNewCompetition("");
      toast.success("Yarışma başarıyla kaydedildi");
      
    } catch (error) {
      console.error("Error saving competition:", error);
      toast.error("Yarışma kaydedilirken bir hata oluştu");
    } finally {
      setSavingCompetition(false);
    }
  };

  // Handle CV save
  const handleSaveCv = async () => {
    setSavingCv(true);
    try {
      // Update the historyData state with new CV
      const updatedHistoryData = {
        ...historyData,
        cv: cvText
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      toast.success("Özgeçmiş başarıyla kaydedildi");
      
    } catch (error) {
      console.error("Error saving CV:", error);
      toast.error("Özgeçmiş kaydedilirken bir hata oluştu");
    } finally {
      setSavingCv(false);
    }
  };

  // Handle experience edit
  const handleEditExperience = (index: number) => {
    setEditExperienceIndex(index);
    setNewWorkplace(experiences[index]);
  };

  // Handle experience delete
  const handleDeleteExperience = async (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
    
    // Format experiences for storage
    const formattedExperiences = updatedExperiences.map(exp => 
      `${exp.workplace} | ${exp.position} | ${exp.duration}`
    ).join('\n');
    
    try {
      // Update the historyData state with new experiences
      const updatedHistoryData = {
        ...historyData,
        isyerleri: formattedExperiences
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("İş deneyimi silinirken bir hata oluştu");
    }
  };

  // Handle certificate edit
  const handleEditCertificate = (index: number) => {
    setEditCertificateIndex(index);
    setNewCertificate(certificates[index]);
  };

  // Handle certificate delete
  const handleDeleteCertificate = async (index: number) => {
    const updatedCertificates = [...certificates];
    updatedCertificates.splice(index, 1);
    setCertificates(updatedCertificates);
    
    try {
      // Update the historyData state with new certificates
      const updatedHistoryData = {
        ...historyData,
        belgeler: updatedCertificates.join('\n')
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Belge silinirken bir hata oluştu");
    }
  };

  // Handle competition edit
  const handleEditCompetition = (index: number) => {
    setEditCompetitionIndex(index);
    setNewCompetition(competitions[index]);
  };

  // Handle competition delete
  const handleDeleteCompetition = async (index: number) => {
    const updatedCompetitions = [...competitions];
    updatedCompetitions.splice(index, 1);
    setCompetitions(updatedCompetitions);
    
    try {
      // Update the historyData state with new competitions
      const updatedHistoryData = {
        ...historyData,
        yarismalar: updatedCompetitions.join('\n')
      };
      
      // Save to database using the onSave callback
      await onSave(updatedHistoryData);
      
    } catch (error) {
      console.error("Error deleting competition:", error);
      toast.error("Yarışma silinirken bir hata oluştu");
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        {/* İş Yerleri / Görevler */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Briefcase size={18} />
            İş Yerleri / Görevler
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="İşyeri adı"
              value={newWorkplace.workplace}
              onChange={(e) => setNewWorkplace({ ...newWorkplace, workplace: e.target.value })}
            />
            <Input
              placeholder="Görev / Pozisyon"
              value={newWorkplace.position}
              onChange={(e) => setNewWorkplace({ ...newWorkplace, position: e.target.value })}
            />
            <Input
              placeholder="Çalışma Süresi"
              value={newWorkplace.duration}
              onChange={(e) => setNewWorkplace({ ...newWorkplace, duration: e.target.value })}
            />
          </div>
          
          <div className="flex justify-end">
            <LoadingButton
              onClick={addExperience}
              loading={savingExperience}
              disabled={savingExperience || !newWorkplace.workplace || !newWorkplace.position || !newWorkplace.duration}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              {editExperienceIndex !== null ? 'Güncelle' : 'Tecrübe Ekle'}
            </LoadingButton>
          </div>
          
          {experiences.length > 0 && (
            <StaffExperienceTable 
              experiences={experiences} 
              onEdit={handleEditExperience} 
              onDelete={handleDeleteExperience} 
            />
          )}
        </div>
        
        {/* Belgeler / Sertifikalar */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FileText size={18} />
            Belgeler / Sertifikalar
          </h3>
          
          <div className="flex gap-4">
            <Input
              placeholder="Belge / Sertifika adı"
              value={newCertificate}
              onChange={(e) => setNewCertificate(e.target.value)}
              className="flex-grow"
            />
            <LoadingButton
              onClick={addCertificate}
              loading={savingCertificate}
              disabled={savingCertificate || !newCertificate}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              {editCertificateIndex !== null ? 'Güncelle' : 'Belge Ekle'}
            </LoadingButton>
          </div>
          
          {certificates.length > 0 && (
            <StaffCertificatesTable 
              certificates={certificates} 
              onEdit={handleEditCertificate} 
              onDelete={handleDeleteCertificate} 
            />
          )}
        </div>
        
        {/* Yarışmalar */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Award size={18} />
            Yarışmalar
          </h3>
          
          <div className="flex gap-4">
            <Input
              placeholder="Yarışma adı / Derece"
              value={newCompetition}
              onChange={(e) => setNewCompetition(e.target.value)}
              className="flex-grow"
            />
            <LoadingButton
              onClick={addCompetition}
              loading={savingCompetition}
              disabled={savingCompetition || !newCompetition}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              {editCompetitionIndex !== null ? 'Güncelle' : 'Yarışma Ekle'}
            </LoadingButton>
          </div>
          
          {competitions.length > 0 && (
            <StaffCompetitionsTable 
              competitions={competitions} 
              onEdit={handleEditCompetition} 
              onDelete={handleDeleteCompetition} 
            />
          )}
        </div>
        
        {/* Özgeçmiş */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-lg font-medium">Özgeçmiş</h3>
          
          <Textarea
            placeholder="Özgeçmiş bilgilerinizi buraya yazınız..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            rows={6}
            className="resize-none"
          />
          
          <div className="flex justify-end">
            <LoadingButton
              onClick={handleSaveCv}
              loading={savingCv}
              disabled={savingCv}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Özgeçmiş Kaydet
            </LoadingButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryTab;
