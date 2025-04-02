
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Image, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CustomerHistoryTableProps {
  customerId?: number;
}

export function CustomerHistoryTable({ customerId }: CustomerHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const itemsPerPage = 10;

  const { data: islemGecmisi = [], isLoading } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      console.log("Fetching customer operations for ID:", customerId);
      try {
        if (!customerId) return [];
        
        // First attempt to get operations
        let result = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
        
        // If no operations found, try to recover them automatically
        if (!result || result.length === 0) {
          console.log("No operations found, attempting to recover from appointments...");
          await personelIslemleriServisi.recoverOperationsFromCustomerAppointments(customerId);
          result = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
        }
        
        console.log("Retrieved customer operations:", result);
        return result;
      } catch (error) {
        console.error("Error fetching customer operations:", error);
        toast.error("İşlem geçmişi yüklenirken bir hata oluştu");
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000, // Cache for 1 second to avoid immediate refetches
    refetchInterval: 10000, // Refetch every 10 seconds
    enabled: !!customerId
  });

  // Filter operations based on search query
  const filteredOperations = searchQuery.trim() 
    ? islemGecmisi.filter(op => {
        const opText = `${op.personel?.ad_soyad || ''} ${op.islem?.islem_adi || ''} ${op.aciklama || ''} ${op.notlar || ''}`.toLowerCase();
        return opText.includes(searchQuery.toLowerCase());
      })
    : islemGecmisi;

  // Pagination
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);
  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Effect to reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openUploadDialog = (operation: any) => {
    setSelectedOperation(operation);
    setUploadedPhotos([]);
    setPhotoNote("");
    setUploadDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedPhotos(prev => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (!selectedOperation || uploadedPhotos.length === 0) return;
    
    setIsUploading(true);
    
    const operation = selectedOperation;
    const uploadedPhotoUrls: string[] = [];
    
    try {
      // Upload each photo
      for (const photo of uploadedPhotos) {
        const timestamp = new Date().getTime();
        const operationDate = new Date(operation.created_at);
        const dateStr = format(operationDate, 'yyyy-MM-dd', { locale: tr });
        
        // Create a descriptive filename
        const serviceNamePart = operation.islem?.islem_adi ? 
          `${operation.islem.islem_adi.replace(/\s+/g, '-')}_` : '';
        const notePart = photoNote ? 
          `_${photoNote.slice(0, 20).replace(/\s+/g, '-')}` : '';
        
        const fileName = `${dateStr}_${serviceNamePart}${notePart}_${timestamp}`;
        const fileExt = photo.name.split('.').pop();
        const fullPath = `customer_photos/${operation.musteri_id}/${fileName}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('customer-photos')
          .upload(fullPath, photo, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          throw uploadError;
        }
        
        if (uploadData?.path) {
          uploadedPhotoUrls.push(uploadData.path);
        }
      }
      
      // Update the operation with the new photos
      const currentPhotos = operation.photos || [];
      const updatedPhotos = [...currentPhotos, ...uploadedPhotoUrls];
      
      console.log("Updating operation with photos:", updatedPhotos);
      
      const { data: updatedOp, error: updateError } = await supabase
        .from('personel_islemleri')
        .update({ 
          photos: updatedPhotos,
          notlar: photoNote ? (operation.notlar ? `${operation.notlar}\n${photoNote}` : photoNote) : operation.notlar
        })
        .eq('id', operation.id)
        .select();
        
      if (updateError) {
        console.error("Error updating operation with photos:", updateError);
        throw updateError;
      }
      
      toast.success("Fotoğraflar başarıyla yüklendi");
      setUploadDialogOpen(false);
    } catch (error) {
      console.error("Error in photo upload process:", error);
      toast.error(`Fotoğraf yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (filteredOperations.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        {searchQuery.trim() 
          ? "Arama kriterlerine uygun işlem bulunamadı."
          : customerId 
            ? "Bu müşteriye ait işlem bulunamadı." 
            : "Henüz işlem kaydı bulunmamaktadır."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Toplam {filteredOperations.length} işlem bulundu
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              placeholder="İşlem ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-3"
            />
          </div>
        </div>
      </div>
      
      {filteredOperations.length > itemsPerPage && (
        <div className="flex justify-end items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">{currentPage} / {totalPages}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Personel</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Puan</TableHead>
              <TableHead>Notlar</TableHead>
              <TableHead className="text-right">Fotoğraf</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.map((islem) => {
              const createdAt = new Date(islem.created_at!);
              const dateFormatted = format(createdAt, 'dd MMMM yyyy HH:mm', { locale: tr });
              
              return (
                <TableRow key={islem.id}>
                  <TableCell>{dateFormatted}</TableCell>
                  <TableCell>
                    {islem.personel?.ad_soyad || 'Belirtilmemiş'}
                  </TableCell>
                  <TableCell>{islem.islem?.islem_adi || islem.aciklama}</TableCell>
                  <TableCell>{formatCurrency(islem.tutar || 0)}</TableCell>
                  <TableCell>{islem.puan}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {islem.notlar}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {islem.photos && islem.photos.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {islem.photos.length}
                        </span>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openUploadDialog(islem)}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fotoğraf Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedOperation && (
              <div className="text-sm">
                <div className="font-medium">{selectedOperation.islem?.islem_adi || selectedOperation.aciklama}</div>
                <div className="text-muted-foreground">
                  {format(new Date(selectedOperation.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Fotoğraflar</label>
              
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Yüklenen fotoğraf ${index + 1}`}
                        className="h-full w-full object-cover rounded"
                      />
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="flex items-center justify-center border-2 border-dashed py-4 cursor-pointer rounded-md hover:bg-gray-50">
                <Image className="h-4 w-4 mr-2" />
                <span className="text-sm">Fotoğraf Seç</span>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Not</label>
              <Textarea 
                placeholder="Fotoğraflar hakkında not ekleyin..." 
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUploadDialogOpen(false)}
              disabled={isUploading}
            >
              İptal
            </Button>
            <Button 
              onClick={handleUploadSubmit} 
              disabled={uploadedPhotos.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-white/20 rounded-full animate-spin mr-2"></div>
                  Yükleniyor...
                </>
              ) : (
                'Yükle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
