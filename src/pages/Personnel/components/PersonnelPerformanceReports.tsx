
import React, { useState } from "react";
import { PersonnelPerformanceDetails } from "./PersonnelPerformanceDetails";

export function PersonnelPerformanceReports({ personnelId = null }: { personnelId?: number | null }) {
  return <PersonnelPerformanceDetails personnelId={personnelId} />;
}
