
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PersonnelHistoryTable() {
  const { data: islemGecmisi = [] } = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: () => personelIslemleriServisi.hepsiniGetir()
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Personel</TableHead>
            <TableHead>İşlem</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Prim %</TableHead>
            <TableHead>Ödenen</TableHead>
            <TableHead>Puan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {islemGecmisi.map((islem) => (
            <TableRow key={islem.id}>
              <TableCell>
                {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
              </TableCell>
              <TableCell>
                {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad}
              </TableCell>
              <TableCell>{islem.aciklama}</TableCell>
              <TableCell>{islem.tutar} TL</TableCell>
              <TableCell>%{islem.prim_yuzdesi}</TableCell>
              <TableCell>{islem.odenen} TL</TableCell>
              <TableCell>{islem.puan}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
