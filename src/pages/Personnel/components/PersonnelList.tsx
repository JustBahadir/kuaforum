
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelForm } from "./PersonnelForm";
import { personelServisi } from "@/lib/supabase";
import { useForm } from "react-hook-form";

interface Personnel {
  id: number;
  ad_soyad: string;
  eposta: string;
  telefon: string;
  adres: string;
  iban: string;
  birth_date: string;
  ise_baslama_tarihi: string;
  isten_ayrilma_tarihi: string;
  calisma_sistemi: string;
  maas: number;
  prim_yuzdesi: number;
  personel_no: string;
  avatar_url: string;
}

interface PersonnelListProps {
  onPersonnelSelect?: (id: number | null) => void;
  personnel?: Personnel[];
}

export function PersonnelList({ onPersonnelSelect, personnel }: PersonnelListProps) {
  const [isAddPersonnelDialogOpen, setIsAddPersonnelDialogOpen] = useState(false);
  const [isEditPersonnelDialogOpen, setIsEditPersonnelDialogOpen] = useState(false);
  const [isPersonnelDetailsDialogOpen, setIsPersonnelDetailsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [search, setSearch] = useState("");
  const [sortModel, setSortModel] = useState<SortingState>([
    { id: "ad_soyad", desc: false }
  ]);
  
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const {
    data: personeller = [],
    isLoading,
    refetch: refreshList,
  } = useQuery({
    queryKey: ["personeller"],
    queryFn: () => personelServisi.hepsiniGetir(),
  });

  const addPersonnelMutation = useMutation({
    mutationFn: async (values: any) => {
      // Map any email field to eposta
      if (values.email) {
        values.eposta = values.email;
        delete values.email;
      }
      
      // Remove tc_kimlik_no if it exists but is not part of the schema
      if (values.tc_kimlik_no) {
        delete values.tc_kimlik_no;
      }
      
      return await personelServisi.ekle(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      toast.success("Personel başarıyla eklendi.");
      setIsAddPersonnelDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Personel eklenirken bir hata oluştu.");
      console.error("Error adding personnel:", error);
    }
  });

  const updatePersonnelMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: number, [key: string]: any }) => {
      // Map any email field to eposta
      if (values.email) {
        values.eposta = values.email;
        delete values.email;
      }
      
      return await personelServisi.guncelle(id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      toast.success("Personel başarıyla güncellendi.");
      setIsEditPersonnelDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Personel güncellenirken bir hata oluştu.");
      console.error("Error updating personnel:", error);
    }
  });

  // For the delete mutation
  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: number) => {
      return await personelServisi.sil(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      toast.success("Personel başarıyla silindi.");
    },
    onError: (error) => {
      toast.error("Personel silinirken bir hata oluştu.");
      console.error("Error deleting personnel:", error);
    }
  });

  const columns: ColumnDef<Personnel>[] = [
    {
      accessorKey: "ad_soyad",
      header: "Ad Soyad",
    },
    {
      accessorKey: "eposta",
      header: "E-posta",
    },
    {
      accessorKey: "telefon",
      header: "Telefon",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const personnel = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPersonnel(personnel);
                  setIsPersonnelDetailsDialogOpen(true);
                  if (onPersonnelSelect) {
                    onPersonnelSelect(personnel.id);
                  }
                }}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Görüntüle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPersonnel(personnel);
                  setIsEditPersonnelDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem geri alınamaz. Devam etmek istediğinizden emin
                        misiniz?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deletePersonnelMutation.mutate(personnel.id);
                        }}
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: personeller.filter((personel) =>
      personel.ad_soyad.toLowerCase().includes(search.toLowerCase())
    ),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSortModel,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sortModel,
    },
  });

  const onSubmit = async (values: any) => {
    if (selectedPersonnel) {
      updatePersonnelMutation.mutate({ id: selectedPersonnel.id, ...values });
    } else {
      addPersonnelMutation.mutate(values);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Personel Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm personelleri görüntüleyebilir, düzenleyebilir ve
            silebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              type="search"
              placeholder="Personel ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={() => {
                setSelectedPersonnel(null);
                setIsAddPersonnelDialogOpen(true);
              }}
              className="ml-auto"
            >
              Personel Ekle
            </Button>
          </div>
          <div className="rounded-md border">
            <ScrollArea>
              <div className="relative min-w-[600px]">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : (
                                  <div
                                    className="cursor-pointer group flex items-center justify-between"
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    {{
                                      asc: "▲",
                                      desc: "▼",
                                    }[header.column.getIsSorted() as string] ?? null}
                                  </div>
                                )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : personeller.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Kayıt bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sonraki
            </Button>
          </div>
        </CardContent>
      </Card>

      <PersonnelDetailsDialog
        isOpen={isPersonnelDetailsDialogOpen}
        onOpenChange={setIsPersonnelDetailsDialogOpen}
        personnel={selectedPersonnel}
        onUpdate={refreshList}
        onClose={() => setSelectedPersonnel(null)}
      />

      <AlertDialog open={isAddPersonnelDialogOpen} onOpenChange={setIsAddPersonnelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personel Ekle</AlertDialogTitle>
          </AlertDialogHeader>
          <PersonnelForm
            personnel={null}
            readOnly={false}
            showWorkInfo={true}
            showPersonalInfo={true}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEditPersonnelDialogOpen} onOpenChange={setIsEditPersonnelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personel Düzenle</AlertDialogTitle>
          </AlertDialogHeader>
          <PersonnelForm
            personnel={selectedPersonnel}
            readOnly={false}
            showWorkInfo={true}
            showPersonalInfo={true}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
