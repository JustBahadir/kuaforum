
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";

export interface EducationTabProps {
  educationData: {
    ortaokuldurumu: string;
    liseturu: string;
    lisedurumu: string;
    universitedurumu: string;
    universitebolum: string;
    meslekibrans: string;
  };
  onEducationChange: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export default function EducationTab({ educationData, onEducationChange, onSave, isLoading }: EducationTabProps) {
  const handleChange = (field: string, value: string) => {
    onEducationChange({ ...educationData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eğitim Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
              <Select
                value={educationData?.ortaokuldurumu || ""}
                onValueChange={(value) => handleChange("ortaokuldurumu", value)}
              >
                <SelectTrigger id="ortaokuldurumu">
                  <SelectValue placeholder="Seçim yapınız" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mezun">Mezun</SelectItem>
                  <SelectItem value="devamediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="terketmis">Terk Etmiş</SelectItem>
                  <SelectItem value="yok">Eğitim Yok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="liseturu">Lise Türü</Label>
              <Select
                value={educationData?.liseturu || ""}
                onValueChange={(value) => handleChange("liseturu", value)}
              >
                <SelectTrigger id="liseturu">
                  <SelectValue placeholder="Seçim yapınız" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duz">Düz Lise</SelectItem>
                  <SelectItem value="anadolu">Anadolu Lisesi</SelectItem>
                  <SelectItem value="meslek">Meslek Lisesi</SelectItem>
                  <SelectItem value="fen">Fen Lisesi</SelectItem>
                  <SelectItem value="sosyal">Sosyal Bilimler Lisesi</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lisedurumu">Lise Durumu</Label>
              <Select
                value={educationData?.lisedurumu || ""}
                onValueChange={(value) => handleChange("lisedurumu", value)}
              >
                <SelectTrigger id="lisedurumu">
                  <SelectValue placeholder="Seçim yapınız" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mezun">Mezun</SelectItem>
                  <SelectItem value="devamediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="terketmis">Terk Etmiş</SelectItem>
                  <SelectItem value="yok">Eğitim Yok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
              <Select
                value={educationData?.universitedurumu || ""}
                onValueChange={(value) => handleChange("universitedurumu", value)}
              >
                <SelectTrigger id="universitedurumu">
                  <SelectValue placeholder="Seçim yapınız" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mezun">Mezun</SelectItem>
                  <SelectItem value="devamediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="terketmis">Terk Etmiş</SelectItem>
                  <SelectItem value="yok">Eğitim Yok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="universitebolum">Üniversite Bölüm</Label>
              <Input
                id="universitebolum"
                placeholder="Üniversite bölümünüz"
                value={educationData?.universitebolum || ""}
                onChange={(e) => handleChange("universitebolum", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meslekibrans">Mesleki Branş</Label>
              <Input
                id="meslekibrans"
                placeholder="Mesleki branşınız"
                value={educationData?.meslekibrans || ""}
                onChange={(e) => handleChange("meslekibrans", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <LoadingButton onClick={onSave} isLoading={isLoading}>
              Kaydet
            </LoadingButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
