
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StaffPreRegistrationTabProps {
  educationData: {
    ortaokuldurumu: string;
    lisedurumu: string;
    liseturu: string;
    meslekibrans: string;
    universitedurumu: string;
    universitebolum: string;
  };
  historyData: {
    isyerleri: string;
    gorevpozisyon: string;
    belgeler: string;
    yarismalar: string;
    cv: string;
  };
  onEducationChange: (field: keyof StaffPreRegistrationTabProps["educationData"], value: string) => void;
  onHistoryChange: (field: keyof StaffPreRegistrationTabProps["historyData"], value: string) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function StaffPreRegistrationTab({
  educationData,
  historyData,
  onEducationChange,
  onHistoryChange,
  onSave,
  isLoading
}: StaffPreRegistrationTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Eğitim Bilgileri</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
              <Input
                id="ortaokuldurumu"
                value={educationData.ortaokuldurumu}
                onChange={(e) => onEducationChange("ortaokuldurumu", e.target.value)}
                placeholder="Ör: Mezun, Devam Ediyor..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lisedurumu">Lise Durumu</Label>
              <Input
                id="lisedurumu"
                value={educationData.lisedurumu}
                onChange={(e) => onEducationChange("lisedurumu", e.target.value)}
                placeholder="Ör: Mezun, Devam Ediyor..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="liseturu">Lise Türü</Label>
              <Input
                id="liseturu"
                value={educationData.liseturu}
                onChange={(e) => onEducationChange("liseturu", e.target.value)}
                placeholder="Ör: Anadolu, Meslek Lisesi..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meslekibrans">Mesleki Branş</Label>
              <Input
                id="meslekibrans"
                value={educationData.meslekibrans}
                onChange={(e) => onEducationChange("meslekibrans", e.target.value)}
                placeholder="Ör: Kuaförlük, Estetik..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
              <Input
                id="universitedurumu"
                value={educationData.universitedurumu}
                onChange={(e) => onEducationChange("universitedurumu", e.target.value)}
                placeholder="Ör: Mezun, Devam Ediyor..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="universitebolum">Üniversite Bölüm</Label>
              <Input
                id="universitebolum"
                value={educationData.universitebolum}
                onChange={(e) => onEducationChange("universitebolum", e.target.value)}
                placeholder="Ör: Kuaförlük, Estetik..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Geçmiş Bilgileri</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="isyerleri">İşyerleri</Label>
              <Textarea
                id="isyerleri"
                value={historyData.isyerleri}
                onChange={(e) => onHistoryChange("isyerleri", e.target.value)}
                placeholder="Çalıştığı işyerleri..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gorevpozisyon">Görev Pozisyon</Label>
              <Textarea
                id="gorevpozisyon"
                value={historyData.gorevpozisyon}
                onChange={(e) => onHistoryChange("gorevpozisyon", e.target.value)}
                placeholder="Üstlendiği görevler..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="belgeler">Belgeler</Label>
              <Textarea
                id="belgeler"
                value={historyData.belgeler}
                onChange={(e) => onHistoryChange("belgeler", e.target.value)}
                placeholder="Sahip olduğu belgeler..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="yarismalar">Yarışmalar</Label>
              <Textarea
                id="yarismalar"
                value={historyData.yarismalar}
                onChange={(e) => onHistoryChange("yarismalar", e.target.value)}
                placeholder="Katıldığı yarışmalar..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cv">CV</Label>
              <Textarea
                id="cv"
                value={historyData.cv}
                onChange={(e) => onHistoryChange("cv", e.target.value)}
                placeholder="Özgeçmiş..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
