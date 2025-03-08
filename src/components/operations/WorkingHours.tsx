
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
import { useWorkingHours } from "./hooks/useWorkingHours";

interface WorkingHoursProps {
  isStaff?: boolean;
  dukkanId?: number;
}

export function WorkingHours({ isStaff = true, dukkanId }: WorkingHoursProps) {
  const [editingMode, setEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    hours,
    updateDay,
    saveHours,
    resetHours,
    isLoading,
    isError,
    hasChanges,
    refetch
  } = useWorkingHours({ 
    dukkanId: dukkanId || 0,
    onMutationSuccess: () => setEditingMode(false)
  });

  useEffect(() => {
    if (dukkanId) {
      console.log("WorkingHours component: dukkanId changed to:", dukkanId);
      refetch();
    }
  }, [dukkanId, refetch]);

  const handleEdit = () => {
    setEditingMode(true);
  };

  const handleCancel = () => {
    resetHours();
    setEditingMode(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate times
      for (const saat of hours) {
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
      
      await saveHours();
      toast.success("Çalışma saatleri başarıyla güncellendi");
    } catch (error) {
      console.error("Error saving working hours:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = (index: number, field: "acilis" | "kapanis", value: string) => {
    updateDay(index, { [field]: value });
  };

  const handleStatusChange = (index: number, value: boolean) => {
    const updates: Partial<CalismaSaati> = { kapali: value };
    
    // Clear times if closed
    if (value) {
      updates.acilis = null;
      updates.kapanis = null;
    } else {
      // Set default times if opening
      updates.acilis = "09:00";
      updates.kapanis = "19:00";
    }
    
    updateDay(index, updates);
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

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Çalışma Saatleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
            Çalışma saatleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
          </div>
          <Button onClick={() => refetch()} className="mt-4">Yeniden Dene</Button>
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
                disabled={isSaving || !hasChanges()}
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
                hours.map((saat, index) => (
                  <TableRow key={index}>
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
                hours.length > 0 ? (
                  hours.map((saat, index) => (
                    <TableRow key={index}>
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
                ) : (
                  gunSiralama.map((gun) => (
                    <TableRow key={gun} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{gunIsimleri[gun]}</TableCell>
                      <TableCell>09:00</TableCell>
                      <TableCell>19:00</TableCell>
                      <TableCell className="text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Açık
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
