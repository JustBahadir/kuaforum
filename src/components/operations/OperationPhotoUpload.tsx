
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Camera, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface OperationPhotoUploadProps {
  personelId: number;
  operationId: number;
  onSuccess?: () => void;
}

export function OperationPhotoUpload({ personelId, operationId, onSuccess }: OperationPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Clean up the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Lütfen bir fotoğraf seçin");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `operation_${operationId}_${Date.now()}.${file.name.split('.').pop()}`;
      
      // First check if a storage bucket exists, create one if not
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.find(bucket => bucket.name === 'operation-photos')) {
        await supabase.storage.createBucket('operation-photos', {
          public: true
        });
      }
      
      const { data, error } = await supabase.storage
        .from('operation-photos')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('operation-photos')
        .getPublicUrl(fileName);

      if (!publicUrlData.publicUrl) {
        throw new Error("Public URL could not be retrieved");
      }

      // Update the operation with the photo URL
      const { data: operationData, error: operationError } = await supabase
        .from('personel_islemleri')
        .select('photos')
        .eq('id', operationId)
        .single();

      if (operationError) {
        throw operationError;
      }

      const currentPhotos = operationData.photos || [];
      
      const { error: updateError } = await supabase
        .from('personel_islemleri')
        .update({
          photos: [...currentPhotos, publicUrlData.publicUrl]
        })
        .eq('id', operationId);

      if (updateError) {
        throw updateError;
      }

      toast.success("Fotoğraf başarıyla yüklendi");
      setFile(null);
      setPreview(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Fotoğraf yükleme hatası: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedImage = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id={`photo-upload-${operationId}`}
          className="hidden"
        />
        <label
          htmlFor={`photo-upload-${operationId}`}
          className="cursor-pointer flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          <Camera className="h-4 w-4" />
          <span>Fotoğraf Seç</span>
        </label>
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Yükleniyor..." : "Yükle"}
        </Button>
      </div>
      
      {preview && (
        <div className="relative">
          <button 
            onClick={clearSelectedImage}
            className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <img 
            src={preview} 
            alt="Preview" 
            className="mt-2 max-h-40 rounded-md" 
          />
        </div>
      )}
    </div>
  );
}
