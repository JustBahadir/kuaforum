
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateTestData } from "@/utils/testDataGenerator";

export const TestDataButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGenerateTestData = async () => {
    setLoading(true);
    try {
      await generateTestData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Button 
        variant="outline" 
        onClick={handleGenerateTestData} 
        disabled={loading}
      >
        {loading ? "Yükleniyor..." : "Test Verileri Ekle"}
      </Button>
    </div>
  );
};
