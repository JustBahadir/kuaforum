
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export type Personnel = {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  maas: number;
  prim_yuzdesi: number;
  avatar_url?: string;
}

export const columns: ColumnDef<Personnel>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Satırı seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ad_soyad",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ad Soyad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {row.original.avatar_url ? (
              <img src={row.original.avatar_url} alt={row.original.ad_soyad} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{row.original.ad_soyad.charAt(0)}</span>
            )}
          </div>
          <div>
            {row.getValue("ad_soyad")}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "telefon",
    header: "Telefon",
    cell: ({ row }) => {
      return <div>{row.getValue("telefon")}</div>
    }
  },
  {
    accessorKey: "eposta",
    header: "E-posta",
    cell: ({ row }) => {
      return <div>{row.getValue("eposta")}</div>
    }
  },
  {
    accessorKey: "maas",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Maaş
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("maas"))
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(amount)
      
      return <div className="text-right font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "prim_yuzdesi",
    header: "Prim Oranı",
    cell: ({ row }) => {
      return <div className="text-center">%{row.getValue("prim_yuzdesi")}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personnel = row.original
      
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(personnel.id.toString())}
            >
              ID Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Düzenle</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
