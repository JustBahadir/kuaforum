
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerOperation, customerOperationsService } from "@/lib/supabase";

interface CustomerOperationsTableProps {
  operations: CustomerOperation[];
  isLoading: boolean;
}

export function CustomerOperationsTable({ operations, isLoading }: CustomerOperationsTableProps) {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const queryClient = useQueryClient();
  
  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => 
      customerOperationsService.updateOperationNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("Not başarıyla güncellendi");
      setEditingNoteId(null);
    },
    onError: (error) => {
      toast.error("Not güncellenirken bir hata oluştu");
      console.error("Note update error:", error);
    }
  });
  
  const handleEditNote = (operation: CustomerOperation) => {
    setEditingNoteId(operation.id);
    setNoteText(operation.notes || "");
  };
  
  const handleSaveNote = (id: number) => {
    updateNotesMutation.mutate({ id, notes: noteText });
  };
  
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("tr-TR");
    } catch (e) {
      return "Geçersiz tarih";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Bu müşteri için henüz işlem kaydı bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hizmet</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notlar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operations.map((operation) => (
            <tr key={operation.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(operation.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.service_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.personnel_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(operation.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.points}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                {editingNoteId === operation.id ? (
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Müşteri hakkında notlar..."
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{operation.notes || "-"}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingNoteId === operation.id ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSaveNote(operation.id)}
                      disabled={updateNotesMutation.isPending}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      İptal
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditNote(operation)}
                  >
                    Notu Düzenle
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
