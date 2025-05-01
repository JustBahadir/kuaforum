
import React from 'react';

interface ChartBarProps {
  data: any[];
  xField: string;
  yField: string;
  formatY?: (value: number) => string;
  colors?: string[];
}

export function ChartBar({ 
  data, 
  xField, 
  yField, 
  formatY = (y) => y.toString(),
  colors = ['#3b82f6'] 
}: ChartBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p>Graph placeholder - Bar chart would display here</p>
    </div>
  );
}

interface ChartLineProps {
  data: any[];
  xField: string;
  yField: string;
  formatY?: (value: number) => string;
  color?: string;
}

export function ChartLine({
  data,
  xField,
  yField,
  formatY = (y) => y.toString(),
  color = '#3b82f6'
}: ChartLineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p>Graph placeholder - Line chart would display here</p>
    </div>
  );
}

interface ChartPieProps {
  data: any[];
  valueField: string;
  categoryField: string;
  formatValue?: (value: number) => string;
}

export function ChartPie({
  data,
  valueField,
  categoryField,
  formatValue = (v) => v.toString()
}: ChartPieProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p>Graph placeholder - Pie chart would display here</p>
    </div>
  );
}
