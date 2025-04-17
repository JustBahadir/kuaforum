
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface AnalystBoxProps {
  title: string;
  insights: (string | null)[];
  isLoading?: boolean;
  onRefresh?: () => void;
  hasEnoughData?: boolean;
  className?: string;
}

export function AnalystBox({ 
  title, 
  insights, 
  isLoading = false, 
  onRefresh,
  hasEnoughData = true,
  className = ""
}: AnalystBoxProps) {
  const filteredInsights = insights.filter(Boolean);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading} className="h-8 w-8 p-0">
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Yenile</span>
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pb-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-[120px]">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        ) : !hasEnoughData || filteredInsights.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            <p>Yeterli veri bulunmuyor</p>
            <p className="text-sm mt-1">Analiz için daha fazla işlem verisi gerekiyor.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredInsights.slice(0, 4).map((insight, index) => (
              <li key={index} className="py-1 pl-2 border-l-2 border-purple-400">
                <p className="text-sm">{insight}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
