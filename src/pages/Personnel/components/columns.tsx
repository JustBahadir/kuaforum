
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the Personnel data structure
export type Personnel = {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  maas: number;
  prim_yuzdesi: number;
  personel_no: string;
}

export const columns: ColumnDef<Personnel>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate") || 
          false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ad_soyad",
    header: "Adı Soyadı",
  },
  {
    accessorKey: "telefon",
    header: "Telefon",
  },
  {
    accessorKey: "eposta",
    header: "E-posta",
  },
  {
    accessorKey: "maas",
    header: "Maaş",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("maas"));
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(amount);
      
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "prim_yuzdesi",
    header: "Prim Yüzdesi",
    cell: ({ row }) => {
      const percent = parseFloat(row.getValue("prim_yuzdesi"));
      
      return <div className="font-medium">%{percent}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personnel = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(personnel.id.toString())}>
              ID Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Düzenle</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
