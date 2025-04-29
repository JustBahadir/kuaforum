
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

const HistoryTab = ({
  historyData,
  onHistoryChange,
  onSave,
  isLoading
}: HistoryTabProps) => {
  const [localData, setLocalData] = useState<HistoryData>(historyData);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof HistoryData, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    setIsDirty(true);
    onHistoryChange(newData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(localData);
      toast.success("Geçmiş bilgileriniz başarıyla kaydedildi");
      setIsDirty(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Geçmiş Bilgileri</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="isyerleri">İşyerleri</Label>
                <Textarea
                  id="isyerleri"
                  value={localData.isyerleri}
                  onChange={(e) => handleChange("isyerleri", e.target.value)}
                  placeholder="Çalıştığınız işyerlerini giriniz..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gorevpozisyon">Görev ve Pozisyonlar</Label>
                <Textarea
                  id="gorevpozisyon"
                  value={localData.gorevpozisyon}
                  onChange={(e) => handleChange("gorevpozisyon", e.target.value)}
                  placeholder="Üstlendiğiniz görev ve pozisyonları giriniz..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="belgeler">Belgeler ve Sertifikalar</Label>
                <Textarea
                  id="belgeler"
                  value={localData.belgeler}
                  onChange={(e) => handleChange("belgeler", e.target.value)}
                  placeholder="Sahip olduğunuz belge ve sertifikaları giriniz..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="yarismalar">Katıldığınız Yarışmalar</Label>
                <Textarea
                  id="yarismalar"
                  value={localData.yarismalar}
                  onChange={(e) => handleChange("yarismalar", e.target.value)}
                  placeholder="Katıldığınız yarışmaları giriniz..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cv">CV / Özgeçmiş</Label>
                <Textarea
                  id="cv"
                  value={localData.cv}
                  onChange={(e) => handleChange("cv", e.target.value)}
                  placeholder="Özgeçmiş bilgilerinizi giriniz..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const resetData = {
                  isyerleri: "",
                  gorevpozisyon: "",
                  belgeler: "",
                  yarismalar: "",
                  cv: ""
                };
                setLocalData(resetData);
                onHistoryChange(resetData);
                setIsDirty(true);
              }}
            >
              Temizle
            </Button>
            <LoadingButton
              type="submit"
              loading={saving || isLoading}
              disabled={!isDirty || saving || isLoading}
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
