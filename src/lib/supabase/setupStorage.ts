
import { supabase } from "./client";

/**
 * Ensure all necessary storage buckets exist
 */
export async function setupStorageBuckets() {
  try {
    // Check if shop-photos bucket exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      return;
    }
    
    // Check if the buckets we need exist
    const shopPhotosBucketExists = buckets?.some(bucket => bucket.name === 'shop-photos');
    const profilePhotosBucketExists = buckets?.some(bucket => bucket.name === 'profile-photos');
    
    // Create shop-photos bucket if it doesn't exist
    if (!shopPhotosBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket('shop-photos', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
          allowedMimeTypes: ['image/*', 'video/*']
        });
      
      if (createError) {
        console.error("Error creating shop-photos bucket:", createError);
      } else {
        console.log("Successfully created shop-photos bucket");
      }
    }
    
    // Create profile-photos bucket if it doesn't exist
    if (!profilePhotosBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket('profile-photos', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/*']
        });
      
      if (createError) {
        console.error("Error creating profile-photos bucket:", createError);
      } else {
        console.log("Successfully created profile-photos bucket");
      }
    }
  } catch (err) {
    console.error("Error in setupStorageBuckets:", err);
  }
}

// This function is called in main.tsx
export const initializeStorage = async () => {
  try {
    await setupStorageBuckets();
    console.log("Storage buckets initialized");
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};
