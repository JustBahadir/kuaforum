
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Sets up necessary storage buckets for the application
 */
export async function setupStorageBuckets() {
  try {
    console.log('Setting up storage buckets...');
    
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
      console.log("Creating profile-photos bucket");
      try {
        const { data, error } = await supabase.storage.createBucket('profile-photos', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
        });
        
        if (error) {
          console.error("Error creating profile-photos bucket:", error);
        } else {
          console.log("Created profile-photos bucket successfully", data);
        }
      } catch (err) {
        console.error("Failed to create profile-photos bucket:", err);
      }
    }
    
    // Create shop-photos bucket if it doesn't exist
    if (!existingBuckets.includes('shop-photos')) {
      console.log("Creating shop-photos bucket");
      try {
        const { data, error } = await supabase.storage.createBucket('shop-photos', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg']
        });
        
        if (error) {
          console.error("Error creating shop-photos bucket:", error);
        } else {
          console.log("Created shop-photos bucket successfully", data);
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

// Export initializeStorage function for main.tsx
export async function initializeStorage() {
  try {
    console.log("Initializing storage buckets...");
    const result = await setupStorageBuckets();
    if (result) {
      console.log("Storage buckets initialized successfully");
    } else {
      console.error("Failed to initialize storage buckets");
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
}
