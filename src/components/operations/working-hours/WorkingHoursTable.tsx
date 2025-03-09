
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { CalismaSaati } from "@/lib/supabase/types";
import { gunSiralama, gunIsimleri } from "../constants/workingDays";
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
                key={index}
                saat={saat}
                index={index}
                editingMode={editingMode}
                onTimeChange={onTimeChange}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            gunSiralama.map((gun) => (
              <TableRow key={gun} className="hover:bg-gray-50">
                <TableCell className="font-medium">{gunIsimleri[gun]}</TableCell>
                <TableCell>09:00</TableCell>
                <TableCell>19:00</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Label>Açık</Label>
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
