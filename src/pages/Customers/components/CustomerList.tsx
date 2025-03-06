
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerListProps {
  customers: any[];
  isLoading: boolean;
  error: Error | null;
}

export function CustomerList({ customers, isLoading, error }: CustomerListProps) {
  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <div className="py-8">
            <p className="text-lg mb-2">Müşteri bulunamadı</p>
            <p className="text-sm">Hiç müşteri kaydı mevcut değil veya arama kriterlerinize uygun sonuç yok.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show customer list
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İsim Soyisim</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Doğum Tarihi</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  // Handle customer click - can be implemented later
                  console.log("Müşteri seçildi:", customer);
                }}>
                <TableCell className="font-medium">
                  {customer.first_name} {customer.last_name}
                </TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell>{customer.birthdate ? new Date(customer.birthdate).toLocaleDateString('tr-TR') : "-"}</TableCell>
                <TableCell>{customer.created_at ? new Date(customer.created_at).toLocaleDateString('tr-TR') : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
