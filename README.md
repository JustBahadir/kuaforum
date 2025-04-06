
# İşlem Geçmişi Sistemi

## Müşteri İşlem Geçmişi

Sisteme eklenen yeni özellikler ile her müşteri için "İşlem Geçmişi" ve "Fotoğraf Galerisi" bölümleri eklenmiştir.

### Müşteri İşlem Geçmişi Özellikleri:

- Her işlem kaydında aşağıdaki bilgiler bulunur:
  - Tarih (otomatik olarak o günün tarihi)
  - İşlem Adı (kullanıcı tarafından seçilen)
  - Yapan Personel Adı
  - İşlem Ücreti (Hizmet Yönetiminden otomatik alınır)
  - İşlem Puanı (Hizmet Yönetiminden otomatik alınır)
  - Not Alanı
  - Fotoğraf Ekleme İmkanı

- Fotoğraf özellikleri:
  - Müşteri geçmişine her işlem için maksimum 2 fotoğraf eklenebilir
  - Fotoğraflar kronolojik olarak sıralanır
  - Fotoğraf galerisi ayrı bir sekmede gösterilir
  - Fotoğraflar isim veya tarih ile aranabilir

## Personel İşlem Geçmişi

Personel işlem geçmişi, personel detay sayfasında "İşlem Geçmişi" sekmesi altında görüntülenebilir.

### Personel İşlem Geçmişi Özellikleri:

- Her işlem kaydında aşağıdaki bilgiler bulunur:
  - Tarih
  - Yapılan İşlem
  - Müşteri Adı
  - İşlem Ücreti
  - Prim Yüzdesi
  - Ödenen Miktar
  - İşlem Puanı

## Senkronizasyon

Müşteri ve personel işlem geçmişleri otomatik olarak senkronize edilmiştir:
- Müşteri geçmişine bir işlem eklendiğinde, ilgili personelin geçmişine de aynı işlem eklenir
- Her iki tarafta da yapılan güncellemeler diğer tarafa yansır

## Kullanım Kılavuzu

### Yeni İşlem Ekleme:

1. Müşteri detay sayfasında "İşlem Geçmişi" sekmesine gidin
2. "Yeni İşlem" butonuna tıklayın
3. İşlem türü, personel, ücret ve diğer bilgileri doldurun
4. İsterseniz not ekleyin ve "Ekle" butonuna tıklayın
5. İsterseniz fotoğraf ekleyebilirsiniz (maksimum 2 adet)

### Fotoğraf Galerisi Görüntüleme:

1. Müşteri detay sayfasında "Fotoğraf Galerisi" sekmesine gidin
2. Fotoğrafları kronolojik sırayla görüntüleyin
3. İstenirse arama kutusu ile fotoğrafları filtreleyebilirsiniz

### Personel İşlem Geçmişi Görüntüleme:

1. Personel menüsünde ilgili personele tıklayın
2. Açılan pencerede "İşlem Geçmişi" sekmesine gidin
3. Personelin tüm işlemlerini görüntüleyin veya "Yeni İşlem" ekleyin

## Not

İşlem geçmişlerinin düzgün çalışabilmesi için tamamlanan randevuların işlem geçmişine aktarılması gerekmektedir. Eksik işlemleri yenilemek için "Yenile" butonunu kullanabilirsiniz.
