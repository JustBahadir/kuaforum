
import React from 'react';

interface ChartAreaProps {
  data: Array<{ date: string; value: number }>;
  xField: string;
  yField: string;
  formatX?: (value: string) => string;
  formatY?: (value: number) => string;
}

export function ChartArea({ 
  data, 
  xField, 
  yField, 
  formatX = (x) => x,
  formatY = (y) => y.toString()
}: ChartAreaProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p>Graph placeholder - Area chart would display here</p>
    </div>
  );
}
