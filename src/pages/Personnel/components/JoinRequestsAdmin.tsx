
import React from 'react';
import { useJoinRequests } from '@/hooks/useJoinRequests';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";

export function JoinRequestsAdmin() {
  const { joinRequests, isLoading, error, refetch, approveRequest, rejectRequest } = useJoinRequests();

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Katılım İstekleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Katılım İstekleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            İstek yüklenirken bir hata oluştu.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (joinRequests.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Katılım İstekleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            Henüz işletmenize katılmak için bekleyen istek bulunmuyor.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Katılım İstekleri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {joinRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">{request.user_name || request.email || 'İsimsiz Kullanıcı'}</p>
                <p className="text-sm text-gray-600">{new Date(request.tarih || request.created_at).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => approveRequest(request.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Onayla
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => rejectRequest(request.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reddet
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
