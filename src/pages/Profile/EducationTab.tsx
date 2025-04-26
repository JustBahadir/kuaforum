
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";

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
  onEducationChange: (data: EducationData) => void;
  onSave: (data: EducationData) => Promise<void>;
  isLoading: boolean;
}

const EducationTab: React.FC<EducationTabProps> = ({
  educationData,
  onEducationChange,
  onSave,
  isLoading,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onEducationChange({
      ...educationData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(educationData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Eğitim Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ortaokul Durumu
                </label>
                <Input
                  name="ortaokuldurumu"
                  value={educationData.ortaokuldurumu}
                  onChange={handleChange}
                  placeholder="Ortaokul bilgisi"
                  className="text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lise Durumu
                </label>
                <Input
                  name="lisedurumu"
                  value={educationData.lisedurumu}
                  onChange={handleChange}
                  placeholder="Lise bilgisi"
                  className="text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lise Türü
                </label>
                <Input
                  name="liseturu"
                  value={educationData.liseturu}
                  onChange={handleChange}
                  placeholder="Lise türü"
                  className="text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesleki Branş
                </label>
                <Input
                  name="meslekibrans"
                  value={educationData.meslekibrans}
                  onChange={handleChange}
                  placeholder="Mesleki branşınız"
                  className="text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Üniversite Durumu
                </label>
                <Input
                  name="universitedurumu"
                  value={educationData.universitedurumu}
                  onChange={handleChange}
                  placeholder="Üniversite bilgisi"
                  className="text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Üniversite Bölüm
                </label>
                <Input
                  name="universitebolum"
                  value={educationData.universitebolum}
                  onChange={handleChange}
                  placeholder="Bölümünüz"
                  className="text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button" 
              variant="outline"
              onClick={() => onEducationChange({
                ortaokuldurumu: "",
                lisedurumu: "",
                liseturu: "",
                meslekibrans: "",
                universitedurumu: "",
                universitebolum: ""
              })}
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
