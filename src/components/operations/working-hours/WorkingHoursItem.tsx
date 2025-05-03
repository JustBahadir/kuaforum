
import { CalismaSaati } from "@/lib/supabase/types";
import { gunIsimleri } from "../constants/workingDays";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface WorkingHoursItemProps {
  saat: CalismaSaati;
  index: number;
  editingMode: boolean;
  onTimeChange: (index: number, field: "acilis" | "kapanis", value: string) => void;
  onStatusChange: (index: number, value: boolean) => void;
}

export function WorkingHoursItem({ 
  saat, 
  index, 
  editingMode, 
  onTimeChange, 
  onStatusChange 
}: WorkingHoursItemProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  if (editingMode) {
    return (
      <TableRow>
        <TableCell className="font-medium">
          {gunIsimleri[saat.gun] || saat.gun}
        </TableCell>
        <TableCell>
          <Input
            type="time"
            value={saat.acilis || ""}
            onChange={(e) => onTimeChange(index, "acilis", e.target.value)}
            disabled={saat.kapali}
            className="w-32"
          />
        </TableCell>
        <TableCell>
          <Input
            type="time"
            value={saat.kapanis || ""}
            onChange={(e) => onTimeChange(index, "kapanis", e.target.value)}
            disabled={saat.kapali}
            className="w-32"
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end space-x-2">
            <span>
              {saat.kapali ? "Kapalı" : "Açık"}
            </span>
            <Switch
              checked={saat.kapali}
              onCheckedChange={(value) => onStatusChange(index, value)}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {gunIsimleri[saat.gun] || saat.gun}
      </TableCell>
      {saat.kapali ? (
        <TableCell colSpan={2} className="text-center font-medium text-red-600">
          KAPALI
        </TableCell>
      ) : (
        <>
          <TableCell>{formatTime(saat.acilis)}</TableCell>
          <TableCell>{formatTime(saat.kapanis)}</TableCell>
        </>
      )}
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <span>
            {saat.kapali ? "Kapalı" : "Açık"}
          </span>
          <div className={`h-4 w-4 rounded-full ${
            saat.kapali ? "bg-red-500" : "bg-green-500"
          }`}></div>
        </div>
      </TableCell>
    </TableRow>
  );
}
