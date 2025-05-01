
import { supabase } from "./client";
import { toast } from "sonner";

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param folderPath The folder path in storage
 * @param fileName Optional custom file name (without extension)
 * @returns The public URL of the uploaded file
 */
export const uploadToSupabase = async (
  file: File,
  folderPath: string,
  fileName?: string
): Promise<string> => {
  try {
    // Get file extension
    const fileExt = file.name.split('.').pop();
    
    // Generate a file name if not provided
    const finalFileName = fileName 
      ? `${fileName}.${fileExt}` 
      : `${Date.now()}.${fileExt}`;
    
    // Create full path with folder
    const filePath = `${folderPath}/${finalFileName}`;
    
    // Try to create the bucket if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.getBucket('shop-photos');
      if (!buckets) {
        try {
          await supabase.storage.createBucket('shop-photos', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
        } catch (bucketError) {
          console.warn("Bucket creation error (may already exist):", bucketError);
          // Continue with the upload anyway
        }
      }
    } catch (bucketCheckError) {
      console.warn("Bucket check failed:", bucketCheckError);
      // Continue with upload attempt
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('shop-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Generate and return public URL
    const { data: publicURL } = supabase.storage
      .from('shop-photos')
      .getPublicUrl(data.path);
    
    return publicURL.publicUrl;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param filePath The full path of the file to delete
 */
export const deleteFromSupabase = async (filePath: string): Promise<void> => {
  try {
    // Extract the path from the URL if it's a public URL
    if (filePath.includes('shop-photos')) {
      const pathMatch = filePath.match(/shop-photos\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        filePath = pathMatch[1];
      }
    }
    
    const { error } = await supabase.storage
      .from('shop-photos')
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("File deletion error:", error);
    throw error;
  }
};
