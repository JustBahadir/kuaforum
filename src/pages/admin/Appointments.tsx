
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Appointments() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Appointments Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Appointment list will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}
