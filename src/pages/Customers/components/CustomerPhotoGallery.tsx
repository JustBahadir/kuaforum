
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, User, Camera } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";

interface CustomerPhotoGalleryProps {
  customerId: number;
}

interface Operation {
  id: number;
  tarih: string;
  service_name: string;
  personnel_name: string;
  amount: number;
  points: number;
  notlar: string;
  photos: string[];
}

interface GroupedPhotos {
  [key: string]: {
    date: string;
    serviceName: string;
    personnelName: string;
    amount: number;
    points: number;
    notlar: string;
    photos: string[];
  };
}

export function CustomerPhotoGallery({ customerId }: CustomerPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Operation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fetch operations with photos
  const { data: operations, isLoading } = useQuery({
    queryKey: ['customer_operations_photos', customerId],
    queryFn: async () => {
      // Get operations from the function
      const { data: appointments, error: appointmentsError } = await supabase.functions.invoke("recover_customer_appointments", {
        body: { customer_id: customerId }
      });
      
      if (appointmentsError) throw appointmentsError;
      
      // Get photos for each operation
      const { data: operationPhotos, error: photosError } = await supabase
        .from('personel_islemleri')
        .select('photos, randevu_id')
        .eq('musteri_id', customerId)
        .not('photos', 'is', null);
      
      if (photosError) throw photosError;
      
      // Map photos to operations
      const operations = appointments.map((op: any) => {
        const photoData = operationPhotos.find((p: any) => p.randevu_id === op.id);
        return {
          ...op,
          photos: photoData?.photos || []
        };
      });
      
      // Only return operations with photos
      return operations.filter((op: Operation) => op.photos && op.photos.length > 0);
    }
  });

  // Group photos by date
  const groupedPhotos: GroupedPhotos = {};
  
  if (operations) {
    operations.forEach((op: Operation) => {
      // Create a date key for grouping (YYYY-MM)
      const dateKey = op.tarih.substring(0, 7); // YYYY-MM
      
      if (!groupedPhotos[dateKey]) {
        groupedPhotos[dateKey] = {
          date: op.tarih,
          serviceName: op.service_name,
          personnelName: op.personnel_name,
          amount: op.amount,
          points: op.points,
          notlar: op.notlar,
          photos: []
        };
      }
      
      // Add each photo to the group
      if (op.photos) {
        op.photos.forEach(photo => {
          groupedPhotos[dateKey].photos.push(photo);
        });
      }
    });
  }

  // Filter operations based on search term and active tab
  const filteredOperations = operations ? operations.filter((op: Operation) => {
    // Filter by search term
    const matchesSearch = 
      op.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.personnel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.tarih?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") {
      return matchesSearch;
    }
    
    // Date-based filtering for other tabs
    const opDate = new Date(op.tarih);
    const now = new Date();
    
    if (activeTab === "month") {
      return matchesSearch && 
        opDate.getMonth() === now.getMonth() && 
        opDate.getFullYear() === now.getFullYear();
    }
    
    if (activeTab === "year") {
      return matchesSearch && opDate.getFullYear() === now.getFullYear();
    }
    
    return matchesSearch;
  }) : [];

  const handleOpenPhotoModal = (operation: Operation) => {
    setSelectedPhoto(operation);
    setCurrentPhotoIndex(0);
    setIsModalOpen(true);
  };

  const nextPhoto = () => {
    if (selectedPhoto && selectedPhoto.photos && currentPhotoIndex < selectedPhoto.photos.length - 1) {
      setCurrentPhotoIndex(prevIndex => prevIndex + 1);
    }
  };

  const previousPhoto = () => {
    if (selectedPhoto && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prevIndex => prevIndex - 1);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Fotoğraflar yükleniyor...</div>;
  }

  if (!operations || operations.length === 0 || !operations.some((op: Operation) => op.photos && op.photos.length > 0)) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-md">
          <div className="mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Henüz fotoğraf yok</h3>
          <p className="mt-2 text-sm text-gray-500">
            Bu müşteriye ait işlemlerle ilgili fotoğraf bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="İşlem, personel veya tarih ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="month">Bu Ay</TabsTrigger>
            <TabsTrigger value="year">Bu Yıl</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredOperations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOperations.map((operation: Operation) => {
            // Skip operations without photos
            if (!operation.photos || operation.photos.length === 0) {
              return null;
            }
            
            const photoCount = operation.photos.length;
            
            return (
              <div 
                key={operation.id}
                className="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => handleOpenPhotoModal(operation)}
              >
                {photoCount === 1 ? (
                  // Single photo display
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={operation.photos[0]} 
                      alt={operation.service_name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  // Multiple photos display (2 max)
                  <div className="aspect-square grid grid-cols-2 gap-1">
                    {operation.photos.slice(0, 2).map((photo, photoIndex) => (
                      <div key={photoIndex} className="overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`${operation.service_name} - ${photoIndex + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ))}
                    {/* Show indicator if there are more than 2 photos */}
                    {photoCount > 2 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        +{photoCount - 2}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm line-clamp-1">{operation.service_name}</h4>
                    <span className="text-xs text-gray-500">
                      {format(new Date(operation.tarih), "dd MMM yyyy", { locale: tr })}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <User size={12} className="mr-1" />
                    <span>{operation.personnel_name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <p>Arama kriterlerinize uygun fotoğraf bulunamadı.</p>
        </div>
      )}
      
      {/* Photo Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.service_name || "Fotoğraf Detayı"}</DialogTitle>
            <DialogDescription>
              {selectedPhoto && format(new Date(selectedPhoto.tarih), "dd MMMM yyyy", { locale: tr })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedPhoto?.photos && selectedPhoto.photos.length > 0 && (
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-md border">
                  <img 
                    src={selectedPhoto.photos[currentPhotoIndex]} 
                    alt={`${selectedPhoto.service_name} - ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Photo navigation buttons */}
                {selectedPhoto.photos.length > 1 && (
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        previousPhoto();
                      }}
                      disabled={currentPhotoIndex === 0}
                    >
                      Önceki
                    </Button>
                    
                    <span className="text-sm text-gray-500">
                      {currentPhotoIndex + 1} / {selectedPhoto.photos.length}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextPhoto();
                      }}
                      disabled={currentPhotoIndex === selectedPhoto.photos.length - 1}
                    >
                      Sonraki
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">İşlem</p>
                <p className="font-medium">{selectedPhoto?.service_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Personel</p>
                <p className="font-medium">{selectedPhoto?.personnel_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Tutar</p>
                <p className="font-medium">{selectedPhoto?.amount?.toFixed(2)} ₺</p>
              </div>
              <div>
                <p className="text-gray-500">Puan</p>
                <p className="font-medium">{selectedPhoto?.points || "0"}</p>
              </div>
            </div>
            
            {selectedPhoto?.notlar && (
              <div className="space-y-2">
                <p className="text-gray-500 text-sm">Notlar</p>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {selectedPhoto.notlar}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Kapat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
