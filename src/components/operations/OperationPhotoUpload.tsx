
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Camera, Trash2, Upload } from 'lucide-react';

export interface OperationPhotoUploadProps {
  existingPhotos?: string[];
  onPhotosUpdated: (photos: string[]) => Promise<void>;
}

export const OperationPhotoUpload = ({ existingPhotos = [], onPhotosUpdated }: OperationPhotoUploadProps) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Lütfen bir fotoğraf seçin');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('operation-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('operation-photos')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      
      const updatedPhotos = [...photos, publicUrl];
      setPhotos(updatedPhotos);
      await onPhotosUpdated(updatedPhotos);
      
      toast.success('Fotoğraf başarıyla yüklendi');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
      // Reset the input value so the same file can be uploaded again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [photos, onPhotosUpdated]);

  const removePhoto = useCallback(async (photoUrl: string) => {
    try {
      // Extract file path from URL
      const fileName = photoUrl.split('/').pop();
      if (!fileName) return;

      // Remove from storage
      const { error } = await supabase.storage
        .from('operation-photos')
        .remove([fileName]);

      if (error) {
        throw error;
      }

      // Update state and parent component
      const updatedPhotos = photos.filter(p => p !== photoUrl);
      setPhotos(updatedPhotos);
      await onPhotosUpdated(updatedPhotos);
      
      toast.success('Fotoğraf başarıyla silindi');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Fotoğraf silinirken bir hata oluştu');
    }
  }, [photos, onPhotosUpdated]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-medium">İşlem Fotoğrafları</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="flex items-center space-x-2"
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          {uploading ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Camera className="h-4 w-4" />
          )}
          <span>Fotoğraf Ekle</span>
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={uploadPhoto}
          className="hidden"
        />
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group border rounded-md overflow-hidden">
              <img 
                src={photo} 
                alt={`Operation photo ${index + 1}`} 
                className="w-full h-auto object-cover aspect-square"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePhoto(photo)}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Sil</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-8 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Henüz fotoğraf eklenmemiş</p>
        </div>
      )}
    </div>
  );
};

export default OperationPhotoUpload;
