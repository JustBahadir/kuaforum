
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkingHours } from "./hooks/useWorkingHours";
import { gunler } from "./utils/workingHoursUtils";

export function WorkingHours() {
  const { calisma_saatleri, loading, updateWorkingHour, saveWorkingHours } = useWorkingHours();
  const [saving, setSaving] = useState(false);

  const handleOpenHourChange = (id: string, value: string) => {
    updateWorkingHour(id, { acilis: value });
  };

  const handleCloseHourChange = (id: string, value: string) => {
    updateWorkingHour(id, { kapanis: value });
  };

  const handleClosedChange = (id: string, checked: boolean) => {
    updateWorkingHour(id, { kapali: checked });
  };

  const handleSave = async () => {
    setSaving(true);
    await saveWorkingHours();
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
        <CardDescription>
          İşletmenizin çalışma saatlerini ayarlayın.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {calisma_saatleri.map((saat) => (
              <div key={saat.id} className="grid grid-cols-8 items-center gap-4">
                <div className="col-span-2 font-medium">{saat.gun}</div>
                
                <div className="col-span-2">
                  <Input
                    type="time"
                    value={saat.acilis}
                    onChange={(e) => handleOpenHourChange(saat.id, e.target.value)}
                    disabled={saat.kapali}
                  />
                </div>
                
                <div className="col-span-2">
                  <Input
                    type="time"
                    value={saat.kapanis}
                    onChange={(e) => handleCloseHourChange(saat.id, e.target.value)}
                    disabled={saat.kapali}
                  />
                </div>
                
                <div className="col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id={`closed-${saat.id}`}
                    checked={saat.kapali}
                    onCheckedChange={(checked) => handleClosedChange(saat.id, Boolean(checked))}
                  />
                  <Label htmlFor={`closed-${saat.id}`}>Kapalı</Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default WorkingHours;
