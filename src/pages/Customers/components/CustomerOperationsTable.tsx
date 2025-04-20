
import { useState, useRef } from "react";
import { useCustomerOperations } from "@/hooks/useCustomerOperations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker-adapter";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarIcon, RefreshCw, FileDown, Camera, Image, Check, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface CustomerOperationsTableProps {
  customerId: number;
}

interface OperationNote {
  id: number;
  note: string;
  isEditing: boolean;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [operationNotes, setOperationNotes] = useState<OperationNote[]>([]);
  const [currentNote, setCurrentNote] = useState("");

  // Refs for file inputs
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const {
    operations,
    isLoading,
    dateRange,
    setDateRange,
    handleForceRecover,
    totals,
    refetch
  } = useCustomerOperations(customerId);

  const handleRecovery = async () => {
    setIsRefreshing(true);
    try {
      await handleForceRecover();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReportDownload = () => {
    console.log("Downloading report for operations:", operations);
    toast.info("Rapor indirme özelliği yakında eklenecek");
  };

  const handleOpenNoteDialog = (operation: any) => {
    setSelectedOperation(operation);
    setCurrentNote(operation.notlar || "");

    const existingNote = operationNotes.find(note => note.id === operation.id);
    if (!existingNote) {
      setOperationNotes([...operationNotes, { id: operation.id, note: operation.notlar || "", isEditing: false }]);
    }
    setIsNoteDialogOpen(true);
  };

  const handleOpenPhotoDialog = (operation: any) => {
    setSelectedOperation(operation);
    setIsPhotoDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedOperation) return;

    try {
      await supabase
        .from('personel_islemleri')
        .update({ notlar: currentNote })
        .eq('id', selectedOperation.id);

      setOperationNotes(operationNotes.map(note =>
        note.id === selectedOperation.id
          ? { ...note, note: currentNote, isEditing: false }
          : note
      ));

      toast.success("Not başarıyla kaydedildi");
      setIsNoteDialogOpen(false);

      // Refresh data
      await refetch();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Not kaydedilirken bir hata oluştu");
    }
  };

  // Handler to delete note
  const handleDeleteNote = async () => {
    if (!selectedOperation) return;

    try {
      await supabase
        .from('personel_islemleri')
        .update({ notlar: "" })
        .eq('id', selectedOperation.id);

      setCurrentNote("");
      setOperationNotes(operationNotes.map(note =>
        note.id === selectedOperation.id
          ? { ...note, note: "", isEditing: false }
          : note
      ));

      toast.success("Not başarıyla silindi");
      setIsNoteDialogOpen(false);

      // Refresh data
      await refetch();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Not silinirken bir hata oluştu");
    }
  };

  // Trigger native camera input
  const triggerCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''; // Clear previous selected file
      cameraInputRef.current.click();
    }
  };

  // Trigger native gallery input
  const triggerGalleryInput = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''; // Clear previous selected file
      galleryInputRef.current.click();
    }
  };

  // Upload photo function
  const uploadPhoto = async (file: File) => {
    if (!selectedOperation) {
      toast.error("İşlem seçilmedi");
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast.error("Dosya boyutu 20MB'dan büyük olamaz");
      return;
    }

    try {
      toast.info("Fotoğraf yükleniyor...");

      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedOperation.id}_${Date.now()}.${fileExt}`;
      const bucket = 'operation-photos';

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // Add photo URL to operation in the DB
      const updatedPhotos = selectedOperation.photos ? [...selectedOperation.photos, publicUrlData.publicUrl] : [publicUrlData.publicUrl];

      const { error: updateError } = await supabase
        .from('personel_islemleri')
        .update({ photos: updatedPhotos })
        .eq('id', selectedOperation.id);

      if (updateError) {
        throw updateError;
      }

      toast.success("Fotoğraf başarıyla yüklendi");
      setIsPhotoDialogOpen(false);

      // Refresh data
      await refetch();

    } catch (error: any) {
      console.error("Fotoğraf yüklenirken hata:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu: " + (error.message || error));
    }
  };

  // Handle file input change for camera/gallery
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    uploadPhoto(files[0]);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd.MM.yyyy");
  };

  const showPointsColumn = totals && totals.totalPoints > 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 text-center">
        <div className="w-8 h-8 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">İşlem geçmişi yükleniyor...</p>
      </div>
    );
  }

  const hasNotes = (operation: any) => {
    return operation.notlar && operation.notlar.trim().length > 0;
  };

  const hasPhotos = (operation: any) => {
    return operation.photos && operation.photos.length > 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-base md:text-lg font-medium">İşlem Geçmişi</h3>
          <p className="text-xs md:text-sm text-gray-500">Müşterinin daha önce yaptırdığı işlemler</p>
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
          <div className="w-full md:w-auto">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRecovery}
              disabled={isRefreshing}
              className="h-10 w-10"
              title="İşlem geçmişini yenile"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            {operations && operations.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleReportDownload}
                className="h-10 w-10"
                title="Rapor İndir"
              >
                <FileDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {operations && operations.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="p-3 md:p-4 bg-purple-50 text-center">
              <p className="text-xs md:text-sm text-gray-600">Toplam İşlem Tutarı</p>
              <p className="text-lg md:text-2xl font-bold text-purple-700">
                {totals?.totalAmount ? totals.totalAmount.toFixed(2) : "0.00"} ₺
              </p>
            </Card>
            <Card className="p-3 md:p-4 bg-blue-50 text-center">
              <p className="text-xs md:text-sm text-gray-600">Toplam Puan</p>
              <p className="text-lg md:text-2xl font-bold text-blue-700">
                {totals?.totalPoints || "0"} Puan
              </p>
            </Card>
            <Card className="p-3 md:p-4 bg-green-50 text-center">
              <p className="text-xs md:text-sm text-gray-600">İşlem Sayısı</p>
              <p className="text-lg md:text-2xl font-bold text-green-700">
                {operations.length} İşlem
              </p>
            </Card>
          </div>

          <div className="overflow-auto -mx-4 px-4">
            <table className="w-full border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">Tarih</th>
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">İşlem</th>
                  <th className="py-2 px-2 md:px-4 text-left text-xs md:text-sm">Personel</th>
                  <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Tutar</th>
                  {showPointsColumn && (
                    <th className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">Puan</th>
                  )}
                  <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm">Not</th>
                  <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm">Fotoğraf</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm whitespace-nowrap">
                      {op.date ? formatDate(op.date) : "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">
                      {op.service_name || op.aciklama || "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-xs md:text-sm">
                      {op.personnel_name || "Belirtilmemiş"}
                    </td>
                    <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm whitespace-nowrap">
                      {op.amount ? `${op.amount.toFixed(2)} ₺` : "-"}
                    </td>
                    {showPointsColumn && (
                      <td className="py-2 px-2 md:px-4 text-right text-xs md:text-sm">
                        {op.points || "0"}
                      </td>
                    )}
                    <td className="py-2 px-2 md:px-4 text-center text-xs md:text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenNoteDialog(op)}
                      >
                        {hasNotes(op) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="py-2 px-2 md:px-4 text-center text-xs md:text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenPhotoDialog(op)}
                      >
                        {hasPhotos(op) ? (
                          <Camera className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center p-4 md:p-8 bg-gray-50 rounded-md">
          <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-2" />
          <h4 className="text-base md:text-lg font-medium mb-1">İşlem Geçmişi Bulunamadı</h4>
          <p className="text-xs md:text-sm text-gray-500 mb-4">Bu müşteri için kayıtlı işlem bulunamadı.</p>
          <Button onClick={handleRecovery} disabled={isRefreshing} className="text-xs md:text-sm">
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                İşlemler Yenileniyor
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                İşlem Geçmişini Yenile
              </>
            )}
          </Button>
        </div>
      )}

      {/* Hidden file inputs for camera and gallery */}
      <input
        type="file"
        capture="environment"
        accept="image/*"
        ref={cameraInputRef}
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        className="hidden"
        onChange={handlePhotoFileChange}
      />

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>İşlem Notu</DialogTitle>
            <DialogDescription>
              {selectedOperation?.service_name || selectedOperation?.aciklama || "İşlem"} için notunuzu düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="İşlem hakkında notlarınızı buraya ekleyin..."
              className="min-h-[150px]"
            />

            <div className="flex justify-between">
              <div>
                <Button variant="destructive" onClick={handleDeleteNote}>
                  Sil
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSaveNote}>
                  Kaydet
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fotoğraf Ekle</DialogTitle>
            <DialogDescription>
              {selectedOperation?.service_name || selectedOperation?.aciklama || "İşlem"} için fotoğraf ekleyin (en fazla 2 fotoğraf)
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                triggerCameraInput();
                setIsPhotoDialogOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <Camera className="h-5 w-5" />
              Kamera ile Çek
            </Button>

            <Button
              onClick={() => {
                triggerGalleryInput();
                setIsPhotoDialogOpen(false);
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Image className="h-5 w-5" />
              Galeriden Seç
            </Button>

            {selectedOperation && selectedOperation.photos && selectedOperation.photos.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Mevcut Fotoğraflar</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOperation.photos.map((photo: string, index: number) => (
                    <div key={index} className="border rounded overflow-hidden aspect-square">
                      <img
                        src={photo}
                        alt={`İşlem fotoğrafı ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

