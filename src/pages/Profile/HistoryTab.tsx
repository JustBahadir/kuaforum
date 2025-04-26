
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";

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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onHistoryChange({
      ...historyData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(historyData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">İş Yerleri ve Görevler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  name="isyerleri"
                  value={historyData.isyerleri}
                  onChange={handleChange}
                  placeholder="İş Yeri"
                  className="text-gray-900"
                />
              </div>
              <div>
                <Input
                  name="gorevpozisyon"
                  value={historyData.gorevpozisyon}
                  onChange={handleChange}
                  placeholder="Görev / Pozisyon"
                  className="text-gray-900"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              İş yeri ve görev bilgileri birlikte kaydedilir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Belgeler</h3>
            <div>
              <Input
                name="belgeler"
                value={historyData.belgeler}
                onChange={handleChange}
                placeholder="Belge adını giriniz..."
                className="text-gray-900"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Belgeler tek başına kaydedilir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Yarışmalar</h3>
            <div>
              <Input
                name="yarismalar"
                value={historyData.yarismalar}
                onChange={handleChange}
                placeholder="Yarışma adını giriniz..."
                className="text-gray-900"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Yarışmalar tek başına kaydedilir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">CV</h3>
            <div>
              <Textarea
                name="cv"
                value={historyData.cv}
                onChange={handleChange}
                placeholder="Serbest metin"
                rows={6}
                className="text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button" 
              variant="outline"
              onClick={() => onHistoryChange({
                isyerleri: "",
                gorevpozisyon: "",
                belgeler: "",
                yarismalar: "",
                cv: ""
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

export default HistoryTab;
