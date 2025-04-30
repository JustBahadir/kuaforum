
import { supabase } from './client';

/**
 * Sets up necessary storage buckets for the application
 */
export async function setupStorageBuckets() {
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing storage buckets:", listError);
      return false;
    }
    
    const existingBuckets = buckets?.map(b => b.name) || [];
    console.log("Existing buckets:", existingBuckets);
    
    // Create profile-photos bucket if it doesn't exist
    if (!existingBuckets.includes('profile-photos')) {
      try {
        const { error } = await supabase.storage.createBucket('profile-photos', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
        });
        
        if (error) {
          console.error("Error creating profile-photos bucket:", error);
        } else {
          console.log("Created profile-photos bucket");
        }
      } catch (err) {
        console.error("Failed to create profile-photos bucket:", err);
      }
    }
    
    // Create shop-photos bucket if it doesn't exist
    if (!existingBuckets.includes('shop-photos')) {
      try {
        const { error } = await supabase.storage.createBucket('shop-photos', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
        });
        
        if (error) {
          console.error("Error creating shop-photos bucket:", error);
        } else {
          console.log("Created shop-photos bucket");
        }
      } catch (err) {
        console.error("Failed to create shop-photos bucket:", err);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
    return false;
  }
}
