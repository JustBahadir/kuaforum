
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/currencyFormatter";
import { PersonelIslemi } from "@/lib/supabase/types";
import { MoreHorizontal, Search } from "lucide-react";

interface PersonnelOperationsTableProps {
  operations: PersonelIslemi[];
  onViewDetails?: (operation: PersonelIslemi) => void;
  onDelete?: (operation: PersonelIslemi) => void;
}

export function PersonnelOperationsTable({
  operations,
  onViewDetails,
  onDelete
}: PersonnelOperationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PersonelIslemi | 'customerName' | 'serviceName';
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });

  // Handle sorting
  const handleSort = (key: keyof PersonelIslemi | 'customerName' | 'serviceName') => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Apply sorting and filtering
  const filteredOperations = operations
    .filter(op => {
      const customerName = op.musteri_id ? `Müşteri #${op.musteri_id}` : 'Bilinmeyen Müşteri';
      const serviceName = op.aciklama || 'Bilinmeyen İşlem';
      const searchTermLower = searchTerm.toLowerCase();
      
      return (
        customerName.toLowerCase().includes(searchTermLower) ||
        serviceName.toLowerCase().includes(searchTermLower) ||
        (op.notlar && op.notlar.toLowerCase().includes(searchTermLower))
      );
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      
      if (key === 'customerName') {
        const aName = a.musteri_id ? `Müşteri #${a.musteri_id}` : 'Bilinmeyen Müşteri';
        const bName = b.musteri_id ? `Müşteri #${b.musteri_id}` : 'Bilinmeyen Müşteri';
        return direction === 'asc' 
          ? aName.localeCompare(bName) 
          : bName.localeCompare(aName);
      }
      
      if (key === 'serviceName') {
        const aName = a.aciklama || '';
        const bName = b.aciklama || '';
        return direction === 'asc' 
          ? aName.localeCompare(bName) 
          : bName.localeCompare(aName);
      }
      
      if (key === 'created_at') {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue)) 
        : String(bValue).localeCompare(String(aValue));
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="İşlem veya müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button 
                  className="flex items-center text-left font-medium"
                  onClick={() => handleSort('created_at')}
                >
                  Tarih
                  {sortConfig.key === 'created_at' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-left font-medium"
                  onClick={() => handleSort('serviceName')}
                >
                  İşlem
                  {sortConfig.key === 'serviceName' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-left font-medium"
                  onClick={() => handleSort('customerName')}
                >
                  Müşteri
                  {sortConfig.key === 'customerName' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center text-right font-medium ml-auto"
                  onClick={() => handleSort('tutar')}
                >
                  Tutar
                  {sortConfig.key === 'tutar' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center text-right font-medium ml-auto"
                  onClick={() => handleSort('prim_yuzdesi')}
                >
                  Prim
                  {sortConfig.key === 'prim_yuzdesi' && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.length > 0 ? (
              filteredOperations.map((operation) => {
                const customerName = operation.musteri_id 
                  ? `Müşteri #${operation.musteri_id}`
                  : 'Bilinmeyen Müşteri';
                
                const primTutar = (operation.tutar || 0) * (operation.prim_yuzdesi || 0) / 100;
                
                return (
                  <TableRow key={operation.id}>
                    <TableCell className="font-medium">
                      {operation.created_at 
                        ? new Date(operation.created_at).toLocaleDateString('tr-TR') 
                        : 'Bilinmiyor'}
                    </TableCell>
                    <TableCell>{operation.aciklama || 'Bilinmeyen İşlem'}</TableCell>
                    <TableCell>{customerName}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(operation.tutar || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(primTutar)}
                      <div className="text-xs text-gray-500">
                        {operation.prim_yuzdesi || 0}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">İşlemler</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewDetails && (
                            <DropdownMenuItem onClick={() => onViewDetails(operation)}>
                              Detayları Görüntüle
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(operation)}
                              className="text-red-600"
                            >
                              Sil
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? (
                    <div className="text-gray-500">Arama kriterlerinize uygun işlem bulunamadı.</div>
                  ) : (
                    <div className="text-gray-500">Bu personel için kayıtlı işlem bulunmuyor.</div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
