import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  personelServisi,
  Personel as PersonelType,
} from "@/lib/supabase";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { PersonnelForm } from "@/components/operations/PersonnelForm";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";

const defaultPageSize = 10;

const formSchema = z.object({
  ad_soyad: z.string().min(2, {
    message: "Ad Soyad en az 2 karakter olmalıdır.",
  }),
  telefon: z.string().optional(),
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  adres: z.string().optional(),
  ise_baslama_tarihi: z.date().optional(),
  isten_ayrilma_tarihi: z.date().optional(),
  unvan: z.string().optional(),
  maas: z.number().optional(),
  prim_yuzdesi: z.number().optional(),
  cinsiyet: z.enum(["erkek", "kadin"]).optional(),
  dogum_tarihi: z.date().optional(),
  tc_kimlik_no: z.string().optional(),
  sigorta_no: z.string().optional(),
  pozisyon: z.string().optional(),
  izin_gun_sayisi: z.number().optional(),
  avatar_url: z.string().url().optional(),
  aktif: z.boolean().default(true).optional(),
  kullanici_adi: z.string().optional(),
  sifre: z.string().optional(),
  calisma_sistemi: z.enum(["komisyon", "maas"]).optional(),
});

interface PersonnelListProps {
  personnel?: PersonelType[];
  onPersonnelSelect: (personnelId: number | null) => void;
}

export function PersonnelList({ personnel, onPersonnelSelect }: PersonnelListProps) {
  const [rowId, setRowId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortModel, setSortModel] = useState([{ field: 'ad_soyad', sort: 'asc' }]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonelType | null>(null);

  const queryClient = useQueryClient();

  const { data: personeller = [], refetch: fetchPersonnel, isLoading } = useQuery({
    queryKey: ['personel', page, pageSize, sortModel, search],
    queryFn: () => personelServisi.hepsiniGetir({
      page: page,
      pageSize: pageSize,
      sort: sortModel,
      search: search
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ad_soyad: "",
      telefon: "",
      email: "",
      adres: "",
      ise_baslama_tarihi: undefined,
      isten_ayrilma_tarihi: undefined,
      unvan: "",
      maas: undefined,
      prim_yuzdesi: undefined,
      cinsiyet: undefined,
      dogum_tarihi: undefined,
      tc_kimlik_no: "",
      sigorta_no: "",
      pozisyon: "",
      izin_gun_sayisi: undefined,
      avatar_url: "",
      aktif: true,
      kullanici_adi: "",
      sifre: "",
      calisma_sistemi: undefined,
    },
  });

  const { mutate: createPersonnel, isLoading: isCreating } = useMutation(
    async (values: z.infer<typeof formSchema>) => {
      return personelServisi.ekle(values);
    },
    {
      onSuccess: () => {
        form.reset();
        fetchPersonnel();
        setIsCreateOpen(false);
        toast({
          title: "Personel başarıyla oluşturuldu.",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Bir şeyler ters gitti.",
          description: error.message,
        });
      },
    }
  );

  const { mutate: updatePersonnel, isLoading: isUpdating } = useMutation(
    async ({ id, ...values }: { id: number } & z.infer<typeof formSchema>) => {
      return personelServisi.guncelle(id, values);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['personel'] });
        fetchPersonnel();
        toast({
          title: "Personel başarıyla güncellendi.",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Bir şeyler ters gitti.",
          description: error.message,
        });
      },
    }
  );

  const { mutate: deletePersonnel, isLoading: isDeleting } = useMutation(
    async (id: number) => {
      return personelServisi.sil(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['personel'] });
        fetchPersonnel();
        toast({
          title: "Personel başarıyla silindi.",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Bir şeyler ters gitti.",
          description: error.message,
        });
      },
    }
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPersonnel(values);
  };

  const handleOpenDetails = (id: number) => {
    const person = personeller.find((p) => p.id === id);
    setSelectedPerson(person);
    setSelectedPersonId(id);
    setIsDetailsOpen(true);
    onPersonnelSelect(id);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedPersonId(null);
    setSelectedPerson(null);
    onPersonnelSelect(null);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "ad_soyad", headerName: "Ad Soyad", width: 200, sortable: true },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "telefon",
      headerName: "Telefon",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <span>{params.value || "-"}</span>
      ),
    },
    {
      field: "aktif",
      headerName: "Aktif",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <span>{params.value ? "Evet" : "Hayır"}</span>
      ),
    },
    {
      field: "actions",
      headerName: "İşlemler",
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenDetails(params.row.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Görüntüle
          </Button>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personel Düzenle</DialogTitle>
              <DialogDescription>
                Personel bilgilerini buradan düzenleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  updatePersonnel({ id: params.row.id, ...values })
                )}
                className="space-y-8"
              >
                <PersonnelForm
                  form={form}
                  personnel={params.row}
                  readOnly={false}
                  showWorkInfo={true}
                  showPersonalInfo={true}
                />
              </form>
            </Form>
          </DialogContent>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personel Sil</DialogTitle>
              <DialogDescription>
                Bu personeli silmek istediğinize emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => { }}>
                İptal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                onClick={() => deletePersonnel(params.row.id)}
              >
                Sil
              </Button>
            </div>
          </DialogContent>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Personel ara..."
            onChange={handleSearch}
            className="w-64"
          />
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Personel Ekle
            </Button>
          </DialogTrigger>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Ekle</DialogTitle>
            <DialogDescription>
              Yeni personel bilgilerini buradan ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <PersonnelForm
                form={form}
                readOnly={false}
                showWorkInfo={true}
                showPersonalInfo={true}
              />
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={personeller}
          columns={columns}
          loading={isLoading}
          disableColumnFilter
          disableDensitySelector
          disableColumnMenu
          paginationMode="server"
          sortingMode="server"
          rowCount={personeller.length}
          pageSizeOptions={[defaultPageSize, 25, 50, 100]}
          pagination
          page={page}
          pageSize={pageSize}
          sortModel={sortModel}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
          getRowId={(row) => row.id}
        />
      </div>
      <PersonnelDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        personnel={selectedPerson}
        onUpdate={fetchPersonnel}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
