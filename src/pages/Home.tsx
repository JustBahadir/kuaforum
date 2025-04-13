
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Kuaför Randevu Sistemi</CardTitle>
          <CardDescription className="text-center">
            Hoş Geldiniz! Giriş tipinizi seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1">
            <Button asChild size="lg" className="h-16 text-lg">
              <Link to="/login">
                Müşteri Girişi
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="h-16 text-lg">
              <Link to="/staff-login">
                Personel Girişi
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Kuaför Randevu Sistemi
        </CardFooter>
      </Card>
    </div>
  );
}
