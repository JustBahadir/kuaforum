
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { gunSiralama, gunIsimleri } from "./constants/workingDays";
import { CalismaSaati } from "@/lib/supabase/types";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkingHoursProps {
  isStaff?: boolean;
  dukkanId?: number;
}

export function WorkingHours({ isStaff = true, dukkanId }: WorkingHoursProps) {
  const [saatler, setSaatler] = useState<CalismaSaati[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [tempSaatler, setTempSaatler] = useState<CalismaSaati[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch working hours on component mount
  useEffect(() => {
    fetchWorkingHours();
  }, [dukkanId]);

  const fetchWorkingHours = async () => {
    try {
      setIsLoading(true);
      let data;
      
      if (dukkanId) {
        data = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      } else {
        data = await calismaSaatleriServisi.hepsiniGetir();
      }
      
      // Sort days based on our predefined order
      const sortedData = [...data].sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
      
      setSaatler(sortedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching working hours:", error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // Create a deep copy of saatler for editing
    setTempSaatler(JSON.parse(JSON.stringify(saatler)));
    setEditingMode(true);
  };

  const handleCancel = () => {
    setEditingMode(false);
    // Discard changes
    setTempSaatler([]);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate times
      for (const saat of tempSaatler) {
        if (!saat.kapali) {
          if (!saat.acilis || !saat.kapanis) {
            toast.error("Açık günler için açılış ve kapanış saatleri gereklidir");
            setIsSaving(false);
            return;
          }
          
          // Parse times and check if opening is before closing
          const acilis = saat.acilis.split(':').map(Number);
          const kapanis = saat.kapanis.split(':').map(Number);
          
          const acilisDakika = acilis[0] * 60 + acilis[1];
          const kapanisDakika = kapanis[0] * 60 + kapanis[1];
          
          if (acilisDakika >= kapanisDakika) {
            toast.error(`${gunIsimleri[saat.gun]} için açılış saati kapanış saatinden önce olmalıdır`);
            setIsSaving(false);
            return;
          }
        }
      }
      
      // Prepare data for update
      const updateData = tempSaatler.map(saat => ({
        ...saat,
        dukkan_id: dukkanId || saat.dukkan_id
      }));
      
      // Save to database
      const result = await calismaSaatleriServisi.guncelle(updateData);
      
      if (result && result.length > 0) {
        setSaatler(result);
        toast.success("Çalışma saatleri başarıyla güncellendi");
        setEditingMode(false);
      } else {
        toast.error("Güncelleme sırasında bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving working hours:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = (index: number, field: "acilis" | "kapanis", value: string) => {
    const updatedSaatler = [...tempSaatler];
    updatedSaatler[index][field] = value;
    setTempSaatler(updatedSaatler);
  };

  const handleStatusChange = (index: number, value: boolean) => {
    const updatedSaatler = [...tempSaatler];
    updatedSaatler[index].kapali = value;
    
    // Clear times if closed
    if (value) {
      updatedSaatler[index].acilis = null;
      updatedSaatler[index].kapanis = null;
    } else {
      // Set default times if opening
      updatedSaatler[index].acilis = "09:00";
      updatedSaatler[index].kapanis = "19:00";
    }
    
    setTempSaatler(updatedSaatler);
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Çalışma Saatleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        <div className="flex space-x-2">
          {!editingMode ? (
            <Button variant="outline" onClick={handleEdit}>
              Düzenle
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Gün</TableHead>
                <TableHead>Açılış</TableHead>
                <TableHead>Kapanış</TableHead>
                <TableHead className="text-right">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editingMode ? (
                // Editing mode
                tempSaatler.map((saat, index) => (
                  <TableRow key={saat.gun}>
                    <TableCell className="font-medium">
                      {gunIsimleri[saat.gun] || saat.gun}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={saat.acilis || ""}
                        onChange={(e) => handleTimeChange(index, "acilis", e.target.value)}
                        disabled={saat.kapali}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={saat.kapanis || ""}
                        onChange={(e) => handleTimeChange(index, "kapanis", e.target.value)}
                        disabled={saat.kapali}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Label htmlFor={`closed-${index}`}>
                          {saat.kapali ? "Kapalı" : "Açık"}
                        </Label>
                        <Switch
                          id={`closed-${index}`}
                          checked={saat.kapali}
                          onCheckedChange={(value) => handleStatusChange(index, value)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // View mode
                saatler.map((saat) => (
                  <TableRow key={saat.gun}>
                    <TableCell className="font-medium">
                      {gunIsimleri[saat.gun] || saat.gun}
                    </TableCell>
                    <TableCell>
                      {saat.kapali ? "-" : formatTime(saat.acilis)}
                    </TableCell>
                    <TableCell>
                      {saat.kapali ? "-" : formatTime(saat.kapanis)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        saat.kapali ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {saat.kapali ? "Kapalı" : "Açık"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
