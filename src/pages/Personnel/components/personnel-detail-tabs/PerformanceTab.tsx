
import React from "react";
import { PersonnelPerformanceDetails } from "../PersonnelPerformanceDetails";

interface PerformanceTabProps {
  personnelId: number;
}

export function PerformanceTab({ personnelId }: PerformanceTabProps) {
  return <PersonnelPerformanceDetails personnelId={personnelId} />;
}
