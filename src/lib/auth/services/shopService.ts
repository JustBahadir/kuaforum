
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

    // 4. Get current branch number for this shop name
    const branchNumber = await shopService.getNextBranchNumber(namePrefix, countryCode + finalCityCode);

    // 5. Generate a random alphanumeric code (3 characters)
    const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like 0/O, 1/I
    let randomCode = "";
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * randomChars.length);
      randomCode += randomChars[randomIndex];
    }

    // 6. Combine all parts
    const shopCode = `${namePrefix}-${countryCode}${finalCityCode}-${branchNumber}-${randomCode}`;
    
    // 7. Verify that code is unique (recursive check)
    const isUnique = await shopService.isShopCodeUnique(shopCode);
    if (!isUnique) {
      // If not unique, try again with different random code
      return shopService.generateShopCode(shopName, cityCode);
    }
    
    return shopCode;
  },

  /**
   * Get the next branch number for this shop name prefix
   */
  getNextBranchNumber: async (namePrefix: string, regionCode: string) => {
    try {
      // Find all shops with the same name prefix and region
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('kod')
        .like('kod', `${namePrefix}-${regionCode}-%`);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return '001'; // First branch
      }
      
      // Extract branch numbers from existing codes
      const branchNumbers = data
        .map(shop => {
          const match = shop.kod.match(/-(\d{3})-/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => !isNaN(num));
      
      // Get the highest branch number and increment
      const highestBranch = Math.max(...branchNumbers, 0);
      const nextBranch = highestBranch + 1;
      
      // Format with leading zeros
      return nextBranch.toString().padStart(3, '0');
    } catch (error) {
      console.error("Error getting next branch number:", error);
      return '001'; // Fallback to 001 if there's an error
    }
  },

  /**
   * Check if a shop code is already in use
   */
  isShopCodeUnique: async (shopCode: string) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('id')
      .eq('kod', shopCode)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking shop code uniqueness:", error);
      return false;
    }
    
    return data === null; // If no data found, code is unique
  },

  /**
   * Verify if a shop code exists
   */
  verifyShopCode: async (shopCode: string) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('id, ad')
      .eq('kod', shopCode)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  },
};
