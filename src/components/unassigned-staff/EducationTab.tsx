
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export interface EducationTabProps {
  educationData: any;
  isLoading: boolean;
  onSave: () => void;
}

export function EducationTab({ educationData, isLoading, onSave }: EducationTabProps) {
  const handleChange = (field: string, value: string) => {
    // In a real implementation, this would update state
    console.log("Updating education field:", field, value);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
          <Input
            id="ortaokuldurumu"
            placeholder="Ortaokul eğitim durumu"
            value={educationData?.ortaokuldurumu || ""}
            onChange={(e) => handleChange("ortaokuldurumu", e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lisedurumu">Lise Durumu</Label>
          <Input
            id="lisedurumu"
            placeholder="Lise eğitim durumu"
            value={educationData?.lisedurumu || ""}
            onChange={(e) => handleChange("lisedurumu", e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="liseturu">Lise Türü</Label>
          <Input
            id="liseturu"
            placeholder="Mezun olunan lise türü"
            value={educationData?.liseturu || ""}
            onChange={(e) => handleChange("liseturu", e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
          <Input
            id="universitedurumu"
            placeholder="Üniversite eğitim durumu"
            value={educationData?.universitedurumu || ""}
            onChange={(e) => handleChange("universitedurumu", e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="universitebolum">Üniversite Bölüm</Label>
          <Input
            id="universitebolum"
            placeholder="Üniversite bölümü"
            value={educationData?.universitebolum || ""}
            onChange={(e) => handleChange("universitebolum", e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="meslekibrans">Mesleki Branş</Label>
          <Input
            id="meslekibrans"
            placeholder="Mesleki branş"
            value={educationData?.meslekibrans || ""}
            onChange={(e) => handleChange("meslekibrans", e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <Button className="w-full" onClick={onSave} disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </CardContent>
    </Card>
  );
}
