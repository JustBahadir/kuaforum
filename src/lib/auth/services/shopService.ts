
import { supabase } from "@/lib/supabase/client";
import { CityISOCodes } from "@/utils/cityISOCodes";

/**
 * Service to handle shop-related operations
 */
export const shopService = {
  /**
   * Create a unique shop code based on shop name
   */
  generateShopCode: async (shopName: string, cityCode?: string) => {
    // 1. Convert Turkish characters to Latin
    const turkishToLatin = (text: string) => {
      return text
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ğ/g, 'G')
        .replace(/Ü/g, 'U')
        .replace(/Ş/g, 'S')
        .replace(/İ/g, 'I')
        .replace(/Ö/g, 'O')
        .replace(/Ç/g, 'C');
    };

    // 2. Normalize and get first 5 letters from shop name in uppercase
    const cleanName = turkishToLatin(shopName)
      .toUpperCase()
      .replace(/[^\w]/g, ''); // Remove non-alphanumeric chars
    
    let namePrefix = cleanName.substring(0, 5);
    
    // Pad with 'X' if less than 5 characters
    while (namePrefix.length < 5) {
      namePrefix += 'X';
    }

    // 3. Country code + City code
    const countryCode = "TR"; // Default to Turkey
    
    // Get city code (3 letters) or use provided cityCode or default
    const finalCityCode = cityCode || "XXX";

    // 4. Generate a random number (4 digits)
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // 5. Combine all parts to create the shop code
    const shopCode = `${namePrefix}-${countryCode}${finalCityCode}-${randomNum}`;
    
    return shopCode;
  },
  
  /**
   * Get the next branch number for a shop
   */
  getNextBranchNumber: async (namePrefix: string, locationPrefix: string) => {
    try {
      // Query existing shops with similar codes
      const { data } = await supabase
        .from('dukkanlar')
        .select('kod')
        .ilike('kod', `${namePrefix}%${locationPrefix}%`);
      
      // If no existing shops, return 1
      if (!data || data.length === 0) {
        return 1;
      }
      
      // Extract branch numbers and find the max
      const branchNumbers = data.map(shop => {
        const matches = shop.kod.match(/\d+$/);
        return matches ? parseInt(matches[0], 10) : 0;
      });
      
      const maxBranch = Math.max(...branchNumbers);
      return maxBranch + 1;
    } catch (error) {
      console.error("Failed to get next branch number:", error);
      return 1; // Default to 1 on error
    }
  },

  /**
   * Verify a shop code exists
   */
  verifyShopCode: async (shopCode: string) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('id, ad')
        .eq('kod', shopCode)
        .single();
        
      if (error || !data) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Failed to verify shop code:", error);
      return null;
    }
  }
};
