
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage and view all upcoming appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Personnel</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage staff and personnel information</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Review and update available services</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
