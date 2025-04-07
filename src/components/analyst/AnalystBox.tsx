
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, BarChart2, Calendar, Users, ChevronsUp } from "lucide-react";

interface AnalystBoxProps {
  title: string;
  insights: string[];
  onRefresh?: () => void;
  isLoading?: boolean;
  hasEnoughData?: boolean;
}

export function AnalystBox({
  title,
  insights,
  onRefresh,
  isLoading = false,
  hasEnoughData = true,
}: AnalystBoxProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const iconMap: Record<string, React.ReactNode> = {
    revenue: <TrendingUp className="h-4 w-4 text-green-500" />,
    popular: <BarChart2 className="h-4 w-4 text-blue-500" />,
    days: <Calendar className="h-4 w-4 text-purple-500" />,
    spending: <TrendingUp className="h-4 w-4 text-amber-500" />,
    customer: <Users className="h-4 w-4 text-indigo-500" />,
    default: <ChevronsUp className="h-4 w-4 text-gray-500" />,
  };

  // Map insight types to icons based on keywords
  const getIconForInsight = (insight: string): React.ReactNode => {
    if (insight.includes("gelir")) return iconMap.revenue;
    if (insight.includes("randevu")) return iconMap.popular;
    if (insight.includes("gün")) return iconMap.days;
    if (insight.includes("harcama")) return iconMap.spending;
    if (insight.includes("müşteri")) return iconMap.customer;
    return iconMap.default;
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-semibold text-blue-700">
          📊 {title}
        </CardTitle>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="ml-1 text-xs">Yorumu Güncelle</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
          </div>
        ) : !hasEnoughData ? (
          <div className="text-center text-gray-500 my-2">
            Henüz yeterli veri yok, analiz yapılamadı.
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                {getIconForInsight(insight)}
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
