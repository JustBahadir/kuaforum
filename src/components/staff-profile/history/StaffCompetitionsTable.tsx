
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface StaffCompetitionsTableProps {
  competitions: string[];
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
}

export function StaffCompetitionsTable({ competitions, onDelete, onEdit }: StaffCompetitionsTableProps) {
  if (!competitions.length) {
    return <p className="text-muted-foreground">Henüz yarışma eklenmemiş.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kazanılan Yarışmalar</TableHead>
          <TableHead className="w-[100px]">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {competitions.map((comp, index) => (
          <TableRow key={index}>
            <TableCell>{comp}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(index)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
