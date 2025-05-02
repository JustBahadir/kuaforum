
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

// Create a type for the personnel data
export type Personnel = {
  id: number;
  ad_soyad: string;
  telefon: string;
  calisma_sistemi: string;
  maas: number;
  prim_yuzdesi: number;
};

// Create action buttons component with navigation
const ActionButtons = ({ row }: { row: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate(`/personnel/${row.original.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate(`/personnel/${row.original.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        className="text-red-500 hover:text-red-600"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Define columns
export const columns: ColumnDef<Personnel>[] = [
  {
    accessorKey: "ad_soyad",
    header: "İsim",
  },
  {
    accessorKey: "telefon",
    header: "Telefon",
    cell: ({ row }) => formatPhoneNumber(String(row.getValue("telefon") || "")),
  },
  {
    accessorKey: "calisma_sistemi",
    header: "Çalışma Sistemi",
    cell: ({ row }) => {
      const system = row.getValue("calisma_sistemi");
      switch (system) {
        case "aylik_maas": return "Aylık";
        case "haftalik_maas": return "Haftalık";
        case "gunluk_maas": return "Günlük";
        case "komisyon": return "Komisyon";
        case "prim_komisyon": return "Prim + Komisyon";
        default: return String(system);
      }
    },
  },
  {
    accessorKey: "maas",
    header: "Maaş / Komisyon",
    cell: ({ row }) => {
      const system = row.getValue("calisma_sistemi");
      const maas = parseFloat(String(row.getValue("maas") || 0));
      const prim = parseFloat(String(row.getValue("prim_yuzdesi") || 0));
      
      if (system === "komisyon" || system === "prim_komisyon") {
        return `%${prim}`;
      } else {
        return formatCurrency(maas);
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionButtons row={row} />,
  },
];
