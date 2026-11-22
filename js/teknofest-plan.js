// 2026-27 TEKNOFEST proje planları: herkese açık kartlar. Her cihazda kendiliğinden eklenir; işaretlenen adımlar korunur.
// Öğrenci adları burada YOK.
window.TEKNOFEST_PLAN = [
 {
  "id": "tf-limit-pusulasi",
  "ad": "LİMİT PUSULASI: Evimizin Enerji Bekçisi",
  "tur": "teknofest",
  "durum": "fikir",
  "kategori": "İnsanlık Yararına Teknolojiler · Ortaokul · Doğa Bilimleri ve Çevresel Farkındalık · Alt tema: Enerji Kaynakları ve Verimli Kullanım",
  "ogrenciler": "Ortaokul takımı, en fazla 6 öğrenci (Kodlama Atölyesi). Gürültüyü Görebilmek takımından ayrı kurulur.",
  "ortaklar": "",
  "baslangic": "2026-12-01",
  "sonTarih": "2027-02-28",
  "aciklama": "2026'dan beri evlerde doğalgaz (her il için aylık), elektrik (yıllık, 2027'de 3.000 kWh) ve su limitleri var. Limit aşılırsa fatura pahalı kademeye geçiyor. Öğrenciler sayaca dışarıdan bantla takılan bir okuyucu yapıyor: elektrik sayacının ışığını ve gaz sayacının mıknatısını sayıyor, sayaç açılmıyor. Ekran, limiti haftalara ve günlere bölüyor, hava tahminine göre uyarı veriyor. Kanıt: doğruluk testi, cihaz ölçüm tablosu ve 8-10 evde A-B deneyi. Plan: Teknofest_Projeleri\\08_Limit_Pusulasi\\Proje_Plani.docx",
  "baglanti": "https://alibaklaea.github.io/ogretmenler-odasi/limit-pusulasi/",
  "adimlar": [
   { "ad": "Kasım sonu: Takımı kur (ortaokul, en fazla 6 öğrenci), mühendislik günlüğünü başlat", "tamam": false },
   { "ad": "1-20 Aralık: Prototip v1, elektrik ışık sayacı (ESP32 + ışık sensörü) ve OLED ekran", "tamam": false },
   { "ad": "20-31 Aralık: Deney 1, cihaz ile sayaç endeksini 1 hafta karşılaştır (hedef hata < %2)", "tamam": false },
   { "ad": "Ocak: Deney 2, ütü, saç kurutma, fırın gibi cihazları tek tek ölç (watt ve bir kullanımın TL'si)", "tamam": false },
   { "ad": "Ocak: Veli izinleri, Deney 3'ün A dönemi (8-10 ev, 4 hafta, uyarısız)", "tamam": false },
   { "ad": "Şubat: Deney 3'ün B dönemi (4 hafta, uyarılarla), HDD ile karşılaştırma grafiği", "tamam": false },
   { "ad": "Şubat: T3KYS'de takım kaydı ve başvuru (son güne bırakma)", "tamam": false },
   { "ad": "Mart: ÖDR'yi öğrenciler yazar, 2 tur iç hakemlik yapılır (hedef 92+)", "tamam": false },
   { "ad": "Nisan-Mayıs: Prototip v2, gövde, gaz okuyucu, öğrencilerin yazdığı telefon ekranı", "tamam": false },
   { "ad": "Haziran: Sunum dosyası (testler önceden bitmiş olmalı) ve provalar", "tamam": false }
  ]
 }
];
