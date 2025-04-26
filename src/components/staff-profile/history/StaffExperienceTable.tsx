
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface WorkExperience {
  workplace: string;
  position: string;
  duration: string;
}

interface StaffExperienceTableProps {
  experiences: WorkExperience[];
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
}

export function StaffExperienceTable({ experiences, onDelete, onEdit }: StaffExperienceTableProps) {
  if (!experiences.length) {
    return <p className="text-muted-foreground">Henüz iş deneyimi eklenmemiş.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>İş Yeri</TableHead>
          <TableHead>Görev / Pozisyon</TableHead>
          <TableHead>Çalışma Süresi</TableHead>
          <TableHead className="w-[100px]">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {experiences.map((exp, index) => (
          <TableRow key={index}>
            <TableCell>{exp.workplace}</TableCell>
            <TableCell>{exp.position}</TableCell>
            <TableCell>{exp.duration}</TableCell>
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
