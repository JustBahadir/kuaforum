
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export interface HistoryTabProps {
  historyData: any;
  isLoading: boolean;
  onSave: () => void;
}

export function HistoryTab({ historyData, isLoading, onSave }: HistoryTabProps) {
  const handleChange = (field: string, value: string) => {
    // In a real implementation, this would update state
    console.log("Updating history field:", field, value);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="isyerleri">Çalıştığı İşyerleri</Label>
          <Textarea
            id="isyerleri"
            placeholder="Daha önce çalıştığı işyerlerini giriniz"
            value={historyData?.isyerleri || ""}
            onChange={(e) => handleChange("isyerleri", e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gorevpozisyon">Görev ve Pozisyon</Label>
          <Textarea
            id="gorevpozisyon"
            placeholder="Önceki görev ve pozisyonları"
            value={historyData?.gorevpozisyon || ""}
            onChange={(e) => handleChange("gorevpozisyon", e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cv">Özgeçmiş</Label>
          <Textarea
            id="cv"
            placeholder="Özgeçmiş bilgisi"
            value={historyData?.cv || ""}
            onChange={(e) => handleChange("cv", e.target.value)}
            disabled={isLoading}
            rows={5}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="belgeler">Sertifikalar ve Belgeler</Label>
          <Textarea
            id="belgeler"
            placeholder="Sertifika ve belge bilgileri"
            value={historyData?.belgeler || ""}
            onChange={(e) => handleChange("belgeler", e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="yarismalar">Katıldığı Yarışmalar</Label>
          <Textarea
            id="yarismalar"
            placeholder="Katıldığı yarışma bilgileri"
            value={historyData?.yarismalar || ""}
            onChange={(e) => handleChange("yarismalar", e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>
        
        <Button className="w-full" onClick={onSave} disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </CardContent>
    </Card>
  );
}
