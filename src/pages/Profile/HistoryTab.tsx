
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface HistoryTabProps {
  historyData: {
    isyerleri: string;
    gorevpozisyon: string;
    yarismalar: string;
    belgeler: string;
    cv: string;
  };
  onHistoryChange: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export default function HistoryTab({ historyData, onHistoryChange, onSave, isLoading }: HistoryTabProps) {
  const [activeTab, setActiveTab] = useState("experience");

  const handleChange = (field: string, value: string) => {
    onHistoryChange({ ...historyData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Özgeçmiş & Sertifikalar</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="experience">İş Deneyimi</TabsTrigger>
            <TabsTrigger value="certificates">Sertifikalar</TabsTrigger>
            <TabsTrigger value="competitions">Yarışmalar</TabsTrigger>
          </TabsList>

          <TabsContent value="experience" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="isyerleri">Çalıştığı Yerler</Label>
                <Textarea
                  id="isyerleri"
                  placeholder="Önceki iş deneyimlerinizi buraya yazın"
                  value={historyData?.isyerleri || ""}
                  onChange={(e) => handleChange("isyerleri", e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gorevpozisyon">Görev ve Pozisyonlar</Label>
                <Textarea
                  id="gorevpozisyon"
                  placeholder="Görev ve pozisyonlarınızı buraya yazın"
                  value={historyData?.gorevpozisyon || ""}
                  onChange={(e) => handleChange("gorevpozisyon", e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="belgeler">Sertifikalar ve Belgeler</Label>
              <Textarea
                id="belgeler"
                placeholder="Sahip olduğunuz sertifikaları ve belgeleri buraya yazın"
                value={historyData?.belgeler || ""}
                onChange={(e) => handleChange("belgeler", e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="competitions" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yarismalar">Katıldığı Yarışmalar</Label>
              <Textarea
                id="yarismalar"
                placeholder="Katıldığınız yarışmaları ve sonuçlarını buraya yazın"
                value={historyData?.yarismalar || ""}
                onChange={(e) => handleChange("yarismalar", e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Label htmlFor="cv">Özgeçmiş</Label>
          <Textarea
            id="cv"
            placeholder="Özgeçmişinizi buraya yazın"
            value={historyData?.cv || ""}
            onChange={(e) => handleChange("cv", e.target.value)}
            className="min-h-[150px] mt-2"
          />
        </div>

        <div className="flex justify-end mt-6">
          <LoadingButton onClick={onSave} isLoading={isLoading}>
            Kaydet
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
}
