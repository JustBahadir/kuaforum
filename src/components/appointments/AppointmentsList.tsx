
// Only updating the specific part related to status filters
  <Select 
    value={statusFilter} 
    onValueChange={setStatusFilter}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Durum Filtrele" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tüm Durumlar</SelectItem>
      <SelectItem value="beklemede">Beklemede</SelectItem>
      <SelectItem value="iptal">İptal Edildi</SelectItem>
      <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
      {/* Removed "onaylandi" status as requested */}
    </SelectContent>
  </Select>
