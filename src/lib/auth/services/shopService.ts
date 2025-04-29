
import { supabase } from "@/lib/supabase/client";
import { CityISOCodes } from "@/utils/cityISOCodes";

/**
 * Service to handle shop-related operations
 */
export const shopService = {
  /**
   * Create a unique shop code based on shop name and location
   * Format: [İşletmeAdıKısaltması]-[ÜlkeKodu+ŞehirKodu]-[ŞubeNumarası]-[RandomKısaKod]
   */
  generateShopCode: async (shopName: string, cityCode?: string) => {
    // 1. Convert Turkish characters to Latin for the name part and get first 5 letters
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

    // 3. Country code (always TR) + City code (3 chars)
    const countryCode = "TR";
    
    // Get city code (3 letters) or use provided cityCode or default "XXX"
    const finalCityCode = cityCode || "XXX";

    // 4. Get the next branch number
    const branchNumber = await shopService.getNextBranchNumber();
    const formattedBranchNumber = branchNumber.toString().padStart(3, '0');
    
    // 5. Generate a random 3-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 3; i++) {
      randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // 6. Combine all parts to create the shop code
    const shopCode = `${namePrefix}-${countryCode}${finalCityCode}-${formattedBranchNumber}-${randomCode}`;
    
    return shopCode;
  },
  
  /**
   * Get the next branch number for shops
   */
  getNextBranchNumber: async () => {
    try {
      // Query existing shops
      const { data } = await supabase
        .from('dukkanlar')
        .select('kod')
        .not('kod', 'is', null);
      
      // If no existing shops, return 1
      if (!data || data.length === 0) {
        return 1;
      }
      
      // Extract branch numbers and find the max
      const branchNumbers = data.map(shop => {
        if (!shop.kod) return 0;
        
        // Extract the branch number part (after second dash, before third dash)
        const matches = shop.kod.split('-');
        if (matches.length >= 3) {
          return parseInt(matches[2], 10) || 0;
        }
        return 0;
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
