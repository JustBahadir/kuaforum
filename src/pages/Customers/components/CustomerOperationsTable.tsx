
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { CameraIcon, EditIcon, FolderIcon, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";

interface CustomerOperationsTableProps {
  customerId: number;
}

interface Operation {
  id: number;
  tarih: string;
  service_name: string;
  personnel_name: string;
  notlar: string;
  amount: number;
  points: number;
  photos?: string[];
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [uploadType, setUploadType] = useState<"camera" | "gallery" | null>(null);
  const queryClient = useQueryClient();

  // Fetch customer operations
  const { data: operations, isLoading, error } = useQuery({
    queryKey: ['customer_operations', customerId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("recover_customer_appointments", {
        body: { customer_id: customerId }
      });
      
      if (error) throw error;
      return data as Operation[];
    }
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number, notes: string }) => {
      const { data, error } = await supabase
        .from('randevular')
        .update({ notlar: notes })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_operations', customerId] });
      toast.success("Notlar başarıyla güncellendi");
      setIsNotesModalOpen(false);
    },
    onError: (error) => {
      console.error("Notlar güncellenirken hata oluştu:", error);
      toast.error("Notlar güncellenemedi");
    }
  });

  // Update photos mutation
  const updatePhotosMutation = useMutation({
    mutationFn: async ({ id, photo }: { id: number, photo: string }) => {
      // Get operation to update
      const { data: currentOperation, error: fetchError } = await supabase
        .from('personel_islemleri')
        .select('photos')
        .eq('randevu_id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update photos array (max 2 photos)
      const currentPhotos = currentOperation?.photos || [];
      const newPhotos = currentPhotos.length >= 2 
        ? [photo, currentPhotos[0]] // Replace oldest photo
        : [...currentPhotos, photo];

      const { data, error } = await supabase
        .from('personel_islemleri')
        .update({ photos: newPhotos })
        .eq('randevu_id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_operations', customerId] });
      toast.success("Fotoğraf başarıyla eklendi");
      setIsPhotoModalOpen(false);
      setUploadType(null);
    },
    onError: (error) => {
      console.error("Fotoğraf eklenirken hata oluştu:", error);
      toast.error("Fotoğraf eklenemedi");
    }
  });

  const handleOpenNotesModal = (operation: Operation) => {
    setSelectedOperation(operation);
    setEditedNotes(operation.notlar || "");
    setIsNotesModalOpen(true);
  };

  const handleOpenPhotoModal = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsPhotoModalOpen(true);
  };

  const handleSaveNotes = () => {
    if (selectedOperation) {
      updateNotesMutation.mutate({ id: selectedOperation.id, notes: editedNotes });
    }
  };

  const handlePhotoOptionSelect = (type: "camera" | "gallery") => {
    setUploadType(type);
  };

  const handlePhotoUploadComplete = async (url: string) => {
    if (selectedOperation) {
      updatePhotosMutation.mutate({ id: selectedOperation.id, photo: url });
    }
  };

  // Check if an operation has photos
  const hasPhotos = (operation: Operation): boolean => {
    return operation.photos && operation.photos.length > 0;
  };

  if (isLoading) {
    return <div className="p-6 text-center">İşlem geçmişi yükleniyor...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">İşlem geçmişi yüklenirken bir hata oluştu.</div>;
  }

  return (
    <div className="space-y-4">
      {operations && operations.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead>Personel</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">Puan</TableHead>
                <TableHead>Notlar</TableHead>
                <TableHead>Fotoğraf</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-medium">
                    {format(new Date(operation.tarih), "dd MMM yyyy", { locale: tr })}
                  </TableCell>
                  <TableCell>{operation.service_name}</TableCell>
                  <TableCell>{operation.personnel_name}</TableCell>
                  <TableCell className="text-right">{operation.amount?.toFixed(2)} ₺</TableCell>
                  <TableCell className="text-right">
                    {operation.points ? (
                      <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700">
                        {operation.points}
                      </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenNotesModal(operation)}
                      title="Notları görüntüle veya düzenle"
                    >
                      {operation.notlar ? (
                        <span className="flex items-center">
                          <EditIcon size={14} className="mr-1" />
                          Düzenle
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <EditIcon size={14} className="mr-1" />
                          Not Ekle
                        </span>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPhotoModal(operation)}
                      title="Fotoğraf ekle"
                    >
                      {hasPhotos(operation) ? (
                        <span className="flex items-center">
                          <ImageIcon size={14} className="mr-1 text-purple-700" />
                          Görüntüle
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <ImageIcon size={14} className="mr-1" />
                          Ekle
                        </span>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Bu müşteriye ait tamamlanmış işlem bulunmuyor.
        </div>
      )}

      {/* Notes Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Notları</DialogTitle>
            <DialogDescription>
              {selectedOperation?.service_name} işlemi için notları görüntüleyin veya düzenleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Bu işleme ait notları buraya girin..."
              className="min-h-[120px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesModalOpen(false)}>İptal</Button>
            <Button onClick={handleSaveNotes} disabled={updateNotesMutation.isPending}>
              {updateNotesMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Fotoğrafları</DialogTitle>
            <DialogDescription>
              {selectedOperation?.service_name} işlemi için fotoğraf ekleyin veya görüntüleyin.
            </DialogDescription>
          </DialogHeader>
          
          {!uploadType ? (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <Button 
                  className="flex-1 flex flex-col items-center justify-center h-24"
                  variant="outline"
                  onClick={() => handlePhotoOptionSelect("camera")}
                >
                  <CameraIcon size={24} className="mb-2" />
                  <span>Kamera</span>
                </Button>
                <Button 
                  className="flex-1 flex flex-col items-center justify-center h-24"
                  variant="outline"
                  onClick={() => handlePhotoOptionSelect("gallery")}
                >
                  <FolderIcon size={24} className="mb-2" />
                  <span>Galeri</span>
                </Button>
              </div>
              
              {selectedOperation && selectedOperation.photos && selectedOperation.photos.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Mevcut Fotoğraflar</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOperation.photos.map((photo, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-md border">
                        <img 
                          src={photo} 
                          alt={`${selectedOperation.service_name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Not: En fazla 2 fotoğraf eklenebilir. Yeni fotoğraf eklerseniz en eski fotoğraf silinecektir.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <FileUpload
                onUploadComplete={handlePhotoUploadComplete}
                bucketName="photos"
                folderPath={`customers/${customerId}/operations`}
                label={uploadType === "camera" ? "Fotoğraf Çek" : "Fotoğraf Seç"}
                maxFileSize={10 * 1024 * 1024} // 10 MB
                useCamera={uploadType === "camera"}
              />
              
              <Button 
                variant="outline" 
                onClick={() => setUploadType(null)}
                className="w-full mt-4"
              >
                Geri Dön
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPhotoModalOpen(false);
              setUploadType(null);
            }}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
