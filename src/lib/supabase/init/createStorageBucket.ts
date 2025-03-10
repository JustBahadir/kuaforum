
import { supabase } from '../client';

export async function createOperationPhotosBucket() {
  try {
    // Check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(bucket => bucket.name === 'operation-photos')) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket('operation-photos', {
        public: true
      });
      
      if (error) {
        console.error('Error creating operation-photos bucket:', error);
      } else {
        console.log('Successfully created operation-photos bucket');
        
        // Set bucket policy to allow public access
        const { error: policyError } = await supabase.storage.from('operation-photos').createSignedUrl(
          'init.txt', 
          60, 
          { 
            download: true 
          }
        );
        
        if (policyError) {
          console.error('Error setting bucket policy:', policyError);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing storage bucket:', error);
  }
}
