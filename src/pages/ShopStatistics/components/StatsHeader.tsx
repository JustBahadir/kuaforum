
import { ReactNode } from "react";

interface StatsHeaderProps {
  title: string;
  children?: ReactNode;
}

export function StatsHeader({ title, children }: StatsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children && <div className="mt-2 sm:mt-0">{children}</div>}
    </div>
  );
}
