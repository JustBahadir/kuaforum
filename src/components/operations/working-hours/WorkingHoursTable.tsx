
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { CalismaSaati } from "@/lib/supabase/types";
import { gunIsimleri } from "../constants/workingDays";
import { WorkingHoursItem } from "./WorkingHoursItem";

interface WorkingHoursTableProps {
  hours: CalismaSaati[];
  editingMode: boolean;
  onTimeChange: (index: number, field: "acilis" | "kapanis", value: string) => void;
  onStatusChange: (index: number, value: boolean) => void;
}

export function WorkingHoursTable({ 
  hours, 
  editingMode, 
  onTimeChange, 
  onStatusChange 
}: WorkingHoursTableProps) {
  return (
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
          {hours.length > 0 ? (
            hours.map((saat, index) => (
              <WorkingHoursItem
                key={saat.id || index}
                saat={saat}
                index={index}
                editingMode={editingMode}
                onTimeChange={onTimeChange}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            Array.from({ length: 7 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="font-medium">{gunIsimleri[index.toString()] || 'Gün ' + index}</TableCell>
                <TableCell>09:00</TableCell>
                <TableCell>19:00</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <span>Açık</span>
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
