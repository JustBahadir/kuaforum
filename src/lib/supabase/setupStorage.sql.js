
import { supabase } from './client';

// This script will run on initialization to ensure storage buckets are properly set up
export async function setupStorageBuckets() {
  try {
    console.log("Setting up storage buckets...");
    
    // Check if buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      return false;
    }
    
    // Look for our required buckets
    const shopPhotosBucket = buckets.find(b => b.name === 'shop-photos');
    const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos');
    
    // Create shop-photos bucket if it doesn't exist
    if (!shopPhotosBucket) {
      console.log("Creating shop-photos bucket...");
      
      const { error: createError } = await supabase
        .rpc('create_storage_bucket', { 
          bucket_id: 'shop-photos',
          bucket_public: true,
          file_size_limit: 20971520 // 20MB
        });
      
      if (createError) {
        console.error("Failed to create shop-photos bucket:", createError);
      } else {
        console.log("Successfully created shop-photos bucket");
      }
    }
    
    // Create profile-photos bucket if it doesn't exist
    if (!profilePhotosBucket) {
      console.log("Creating profile-photos bucket...");
      
      const { error: createError } = await supabase
        .rpc('create_storage_bucket', { 
          bucket_id: 'profile-photos',
          bucket_public: true,
          file_size_limit: 10485760 // 10MB
        });
      
      if (createError) {
        console.error("Failed to create profile-photos bucket:", createError);
      } else {
        console.log("Successfully created profile-photos bucket");
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
    return false;
  }
}

// Auto-initialize on module import
setupStorageBuckets();
