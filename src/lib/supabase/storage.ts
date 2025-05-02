
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param folderPath The folder path in storage
 * @param fileName The name of the file (without extension)
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(file: File, folderPath: string, fileName: string): Promise<string> {
  try {
    // Extract file extension
    const fileExt = file.name.split('.').pop();
    const fullFileName = `${fileName}.${fileExt}`;
    const filePath = `${folderPath}/${fullFileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('shop-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('shop-photos')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error('Public URL could not be generated');
    }

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Dosya yüklenirken bir hata oluştu');
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param url The public URL of the file to delete
 * @returns Boolean indicating if the deletion was successful
 */
export async function deleteFromSupabase(url: string): Promise<boolean> {
  try {
    // Extract bucket and path from URL
    const pathname = new URL(url).pathname;
    const pathParts = pathname.split('/');
    
    // The path should be something like /storage/v1/object/public/bucket-name/path/to/file
    // We need to extract the path after the bucket name
    const bucketName = pathParts[4];
    const filePath = pathParts.slice(5).join('/');
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
