
import React from "react";
import { PersonnelPerformanceReports } from "../../PersonnelPerformanceReports";

interface PerformanceTabProps {
  personnelId: number;
}

export function PerformanceTab({ personnelId }: PerformanceTabProps) {
  return <PersonnelPerformanceReports personnelId={personnelId} />;
}
