
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi, islemServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Islem, Personel } from "@/lib/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Camera, FileImage } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define form schema with zod
const operationFormSchema = z.object({
  islemId: z.string().min(1, { message: "İşlem seçilmelidir" }),
  personelId: z.string().min(1, { message: "Personel seçilmelidir" }),
  tutar: z.string().min(1, { message: "Tutar girilmelidir" }),
  puan: z.string().min(1, { message: "Puan girilmelidir" }),
  notlar: z.string().optional(),
});

type OperationFormValues = z.infer<typeof operationFormSchema>;

interface AddOperationFormProps {
  customerId?: number;
  personnelId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AddOperationForm({
  customerId,
  personnelId,
  isOpen,
  onClose,
}: AddOperationFormProps) {
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [currentOperationId, setCurrentOperationId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch services and personnel
  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: personelServisi.hepsiniGetir,
  });

  // Create form
  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: {
      islemId: "",
      personelId: personnelId ? String(personnelId) : "",
      tutar: "",
      puan: "",
      notlar: "",
    },
  });

  // When personnelId prop changes, update form value
  useEffect(() => {
    if (personnelId) {
      form.setValue("personelId", String(personnelId));
    }
  }, [personnelId, form]);

  // When an islem (service) is selected, update tutar and puan automatically
  const watchIslemId = form.watch("islemId");
  useEffect(() => {
    if (watchIslemId) {
      const selectedIslem = islemler.find(islem => islem.id === parseInt(watchIslemId));
      if (selectedIslem) {
        form.setValue("tutar", String(selectedIslem.fiyat));
        form.setValue("puan", String(selectedIslem.puan));
      }
    }
  }, [watchIslemId, islemler, form]);

  // Add operation mutation
  const addOperation = useMutation({
    mutationFn: async (data: {
      islemId: number;
      personelId: number;
      customerId: number;
      tutar: number;
      puan: number;
      notlar?: string;
    }) => {
      const response = await fetch("/api/add-operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "İşlem eklenirken bir hata oluştu");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentOperationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['personelIslemleri'] });
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("İşlem başarıyla eklendi");
      
      if (uploadedPhotos.length > 0) {
        // If there are photos, open the photo dialog
        setIsPhotoDialogOpen(true);
      } else {
        // If no photos, close the form
        onClose();
      }
    },
    onError: (error) => {
      console.error("Error adding operation:", error);
      toast.error(`İşlem eklenirken bir hata oluştu: ${error.message}`);
    },
  });

  // Photo upload mutation
  const addPhoto = useMutation({
    mutationFn: async ({ operationId, photoUrl }: { operationId: number; photoUrl: string }) => {
      const response = await fetch("/api/add-operation-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operationId, photoUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Fotoğraf eklenirken bir hata oluştu");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personelIslemleri'] });
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("Fotoğraf başarıyla eklendi");
    },
    onError: (error) => {
      console.error("Error adding photo:", error);
      toast.error(`Fotoğraf eklenirken bir hata oluştu: ${error.message}`);
    },
  });

  const handlePhotoUpload = (photoUrl: string) => {
    setUploadedPhotos(prev => {
      if (prev.length >= 2) {
        toast.warning("En fazla 2 fotoğraf yükleyebilirsiniz");
        return prev;
      }
      return [...prev, photoUrl];
    });
  };

  const handlePhotoDialogClose = () => {
    setIsPhotoDialogOpen(false);
    onClose();
  };

  const handlePhotoSubmit = async () => {
    if (!currentOperationId) return;
    
    try {
      // Upload all photos
      for (const photo of uploadedPhotos) {
        await addPhoto.mutateAsync({
          operationId: currentOperationId,
          photoUrl: photo,
        });
      }
      
      handlePhotoDialogClose();
    } catch (error) {
      console.error("Error submitting photos:", error);
    }
  };

  const onSubmit = async (values: OperationFormValues) => {
    if (!customerId && !personnelId) {
      toast.error("Müşteri veya personel belirtilmelidir");
      return;
    }
    
    try {
      await addOperation.mutateAsync({
        islemId: parseInt(values.islemId),
        personelId: parseInt(values.personelId),
        customerId: customerId!,
        tutar: parseFloat(values.tutar),
        puan: parseInt(values.puan),
        notlar: values.notlar,
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni İşlem Ekle</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* İşlem (Service) Selection */}
              <FormField
                control={form.control}
                name="islemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşlem</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="İşlem seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {islemler.map((islem) => (
                          <SelectItem key={islem.id} value={String(islem.id)}>
                            {islem.islem_adi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      İşlem seçildiğinde ücret ve puan otomatik belirlenecektir.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Personel (Staff) Selection */}
              <FormField
                control={form.control}
                name="personelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!personnelId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Personel seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {personeller.map((personel) => (
                          <SelectItem key={personel.id} value={String(personel.id)}>
                            {personel.ad_soyad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Price Field */}
              <FormField
                control={form.control}
                name="tutar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutar (₺)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Points Field */}
              <FormField
                control={form.control}
                name="puan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puan</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Notes Field */}
              <FormField
                control={form.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="İşlem ile ilgili notlar..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsPhotoDialogOpen(true)}
                    disabled={!form.formState.isValid}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Fotoğraf Ekle
                  </Button>
                  
                  {uploadedPhotos.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({uploadedPhotos.length}/2 fotoğraf)
                    </span>
                  )}
                </div>
                
                <div className="space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!form.formState.isValid || addOperation.isPending}
                  >
                    {addOperation.isPending ? "Ekleniyor..." : "Ekle"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafı Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fotoğraf Yükle (Maks. 2)</label>
              
              <FileUpload
                onUploadComplete={handlePhotoUpload}
                bucketName="photos"
                folderPath="operations"
                acceptedFileTypes="image/*"
                maxFileSize={5 * 1024 * 1024} // 5MB
                label={
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <span>Fotoğraf Seç</span>
                  </div>
                }
              />
              
              <p className="text-xs text-muted-foreground">
                Maksimum 5MB boyutunda JPG, PNG veya GIF dosyaları yükleyebilirsiniz.
                En fazla 2 fotoğraf yüklenebilir.
              </p>
            </div>
            
            {/* Preview uploaded photos */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={photo} 
                      alt={`Yüklenen fotoğraf ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={handlePhotoDialogClose}
              >
                İptal
              </Button>
              <Button 
                onClick={handlePhotoSubmit}
                disabled={uploadedPhotos.length === 0 || addPhoto.isPending}
              >
                {addPhoto.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
