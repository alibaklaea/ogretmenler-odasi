// MEB 2026-2027 Eğitim ve Öğretim Yılı Çalışma Takvimi ve resmî tatiller.
// Hafta sonuna denk gelen tatiller (1 Mayıs Cmt, 15-16 Mayıs Kurban arifesi/1. gün) okul gününü etkilemediği için yazılmadı.
window.TAKVIM = {
  baslangic: "2026-09-14",
  bitis: "2027-06-25",
  isGunu: 180.5,
  tatiller: [
    { bas: "2026-10-28", bit: "2026-10-28", ad: "Cumhuriyet Bayramı arifesi", yarim: true },
    { bas: "2026-10-29", bit: "2026-10-29", ad: "Cumhuriyet Bayramı" },
    { bas: "2026-11-16", bit: "2026-11-20", ad: "1. Dönem Ara Tatili", ara: true },
    { bas: "2027-01-01", bit: "2027-01-01", ad: "Yılbaşı" },
    { bas: "2027-01-22", bit: "2027-01-22", ad: "1. Dönem sonu (karne günü)", bilgi: true },
    { bas: "2027-01-25", bit: "2027-02-05", ad: "Yarıyıl Tatili", ara: true },
    { bas: "2027-03-08", bit: "2027-03-12", ad: "2. Dönem Ara Tatili (Ramazan Bayramı 8 Mart arife, 9-11 Mart)", ara: true },
    { bas: "2027-04-23", bit: "2027-04-23", ad: "Ulusal Egemenlik ve Çocuk Bayramı" },
    { bas: "2027-05-17", bit: "2027-05-19", ad: "Kurban Bayramı (19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı ile)" },
    { bas: "2027-06-25", bit: "2027-06-25", ad: "Ders yılı sonu (karne günü)", bilgi: true }
  ],
  // Haftalık ders programı: gün numarası (2 Salı, 3 Çarşamba, 4 Perşembe) → ders saati
  program: { D1: { 2: 2, 4: 2 }, D3: { 2: 2, 4: 2 }, KOD: { 3: 2 } },
  kaynak: "MEB 2026-2027 Çalışma Takvimi; dinî bayramlar Diyanet takvimine göre"
};
