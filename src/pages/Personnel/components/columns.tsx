
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const columns = [
  {
    id: "name",
    header: "Personel",
    cell: (row: any) => (
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
          {row.avatar_url ? (
            <img 
              src={row.avatar_url} 
              alt={row.ad_soyad || 'Personel'} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{(row.ad_soyad || "").charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div className="font-medium">{row.ad_soyad || 'İsimsiz'}</div>
          <div className="text-sm text-muted-foreground">{row.telefon || 'Telefon yok'}</div>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    header: "Rol",
    cell: (row: any) => (
      <Badge variant={row.role === "admin" ? "default" : "outline"}>
        {row.role === "admin" ? "Yönetici" : "Personel"}
      </Badge>
    ),
  },
  {
    id: "email",
    header: "E-posta",
    cell: (row: any) => row.eposta || "E-posta yok",
  },
  {
    id: "status",
    header: "Durum",
    cell: (row: any) => (
      <Badge variant={row.aktif ? "default" : "destructive"}>
        {row.aktif ? "Aktif" : "Pasif"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: (row: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Açık menü</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => console.log("Düzenle", row)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Düzenle</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log("Sil", row)}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Sil</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
