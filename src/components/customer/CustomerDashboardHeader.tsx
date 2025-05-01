
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CustomerDashboardHeader() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Hoş geldiniz!</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Randevu Al
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
