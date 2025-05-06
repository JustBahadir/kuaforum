
import { FormGroup, FormLabel, FormMessage } from "@/components/ui/form-elements";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ShopCodeInputProps {
  isLoadingShopCode: boolean;
  userShopCode: string | null;
  shopCode: string;
  setShopCode: (value: string) => void;
  errorMessage?: string;
}

export function ShopCodeInput({ 
  isLoadingShopCode, 
  userShopCode, 
  shopCode, 
  setShopCode,
  errorMessage
}: ShopCodeInputProps) {
  return (
    <FormGroup>
      <FormLabel>İşletme Kodu</FormLabel>
      {isLoadingShopCode ? (
        <div className="flex items-center space-x-2 h-10 px-3 rounded-md border border-input">
          <span className="text-sm text-muted-foreground">Yükleniyor...</span>
          <Loader2 className="h-4 w-4 animate-spin ml-auto" />
        </div>
      ) : userShopCode ? (
        <div className="flex items-center space-x-2 h-10 px-3 rounded-md border border-input">
          <span>{userShopCode}</span>
        </div>
      ) : (
        <Input 
          value={shopCode} 
          onChange={(e) => setShopCode(e.target.value)} 
          placeholder="İşletme Kodu"
        />
      )}
      {errorMessage && <FormMessage>{errorMessage}</FormMessage>}
    </FormGroup>
  );
}
