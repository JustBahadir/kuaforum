
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800">Salon Management System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600 mb-6">
            Please select your login type:
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Customer Login
            </Button>
            
            <Button 
              onClick={() => navigate("/staff-login")}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              Staff Login
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 mt-4">
        © {new Date().getFullYear()} Salon Management System. All rights reserved.
      </div>
    </div>
  );
}
