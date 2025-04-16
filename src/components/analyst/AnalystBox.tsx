
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalystBoxProps {
  title?: string;
  insights: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
  hasEnoughData?: boolean;
  className?: string;
}

export function AnalystBox({
  title = "Akıllı Analiz", 
  insights, 
  isLoading = false, 
  onRefresh, 
  hasEnoughData = true,
  className
}: AnalystBoxProps) {
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute right-4 top-4">
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh} 
            disabled={isLoading || !hasEnoughData}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Yenile</span>
          </Button>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
          {title}
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasEnoughData ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Analiz için yeterli veri bulunmuyor.</p>
            <p className="text-sm mt-2">Daha fazla işlem yaparak veya filtreleri değiştirerek tekrar deneyin.</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Gösterilecek öngörü bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedInsight === index && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedInsight(index === selectedInsight ? null : index)}
              >
                <p className="text-sm">{insight}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
