// Kodlama Atölyesi bağlantı şemaları.
// Gerçek Arduino Uno pin dizilişi, breadboard güç hatları (+ kırmızı = 5V, − mavi = GND), her parçanın kendi pinleri,
// numaralı ve renkli kablolar. Aynı veriden: SVG şema, kablo tablosu, adım adım takma metni, sesli anlatım, kontrol listesi,
// Tinkercad adımları ve kodda aranacak pin numaraları üretilir.
window.DEVRE = (function () {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const RENK = { kirmizi: ["#e03131", "kırmızı"], siyah: ["#2b2b2b", "siyah"], turuncu: ["#fd7e14", "turuncu"], sari: ["#fcc419", "sarı"], yesil: ["#2f9e44", "yeşil"],
    mavi: ["#1c7ed6", "mavi"], mor: ["#9c36b5", "mor"], beyaz: ["#f8f9fa", "beyaz"], kahve: ["#8d5524", "kahverengi"], pembe: ["#f06595", "pembe"], gri: ["#868e96", "gri"], turkuaz: ["#15aabf", "turkuaz"] };
  const ACIK = new Set(["sari", "beyaz"]);
  const SINYAL = ["turuncu", "sari", "yesil", "mavi", "mor", "pembe", "turkuaz", "beyaz", "gri"];
  const PIN_Y = 250, LEG = 36, LEG_R = 88, UNO_W = 480, UNO_H = 340, UX = 30;

  // ---------- Arduino Uno pinleri (USB solda, dijital pinler üstte, güç ve analog pinler altta) ----------
  const UST = ["SCL", "SDA", "AREF", "GND", "13", "12", "~11", "~10", "~9", "8", "7", "~6", "~5", "4", "~3", "2", "TX 1", "RX 0"];
  const UST_K = ["SCL", "SDA", "AREF", "GND3", "D13", "D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "D1", "D0"];
  const ALT = ["", "IOREF", "RESET", "3.3V", "5V", "GND", "GND", "VIN", "A0", "A1", "A2", "A3", "A4", "A5"];
  const ALT_K = ["NC", "IOREF", "RESET", "3V3", "5V", "GND", "GND2", "VIN", "A0", "A1", "A2", "A3", "A4", "A5"];
  function unoPin(k) {
    let i = UST_K.indexOf(k); if (i >= 0) return { x: 130 + i * 18 + (i >= 10 ? 14 : 0), y: 20, ust: true, ad: k };
    i = ALT_K.indexOf(k); if (i >= 0) return { x: 170 + i * 18 + (i >= 8 ? 14 : 0), y: UNO_H - 20, ust: false, ad: k === "GND2" ? "GND" : k };
    return null;
  }
  const pinSoz = (k) => /^D\d+$/.test(k) ? `dijital ${k.slice(1)} numaralı` : /^A\d$/.test(k) ? `analog ${k}` : k;

  // ---------- çizim yardımcıları ----------
  const R_BANT = { "220Ω": ["#e03131", "#e03131", "#8d5524"], "10kΩ": ["#8d5524", "#212529", "#fd7e14"], "1kΩ": ["#8d5524", "#212529", "#e03131"] };
  function direnc(x, y1, y2, deger) {
    const m = (y1 + y2 - 24) / 2, b = R_BANT[deger] || R_BANT["220Ω"];
    return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#9aa1a8" stroke-width="3"/><rect x="${x - 7}" y="${m - 19}" width="14" height="38" rx="6" fill="#e9d8a6" stroke="#8a6d3b" stroke-width="1.5"/>`
      + b.map((c, i) => `<rect x="${x - 7}" y="${m - 13 + i * 8}" width="14" height="4" fill="${c}"/>`).join("") + `<rect x="${x - 7}" y="${m + 11}" width="14" height="3" fill="#c9a227"/>`
      + `<text x="${x + 10}" y="${m + 4}" font-size="12" font-weight="700" fill="#5c3d0c">${deger}</text>`;
  }
  const pcb = (w, h, c, y0 = 2) => `<rect x="2" y="${y0}" width="${w - 4}" height="${h - y0 - 2}" rx="7" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="12" cy="${y0 + 10}" r="4" fill="#f1f3f5"/><circle cx="${w - 12}" cy="${y0 + 10}" r="4" fill="#f1f3f5"/>`;
  const baslik = (px, h) => `<rect x="${px[0] - 11}" y="${h - 12}" width="${px[px.length - 1] - px[0] + 22}" height="12" rx="2" fill="#212529"/>`;
  const yazi = (x, y, t, o = "") => `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" ${o}>${t}</text>`;

  // ---------- parça kütüphanesi ----------
  // pins: k anahtar, e şemadaki kısa ad, u uzun ad (metinde), r seri direnç, kol: direnç bu pinin bacağından dallanır
  const PARCA = {
    servo: { ad: "Servo motor (SG90)", kisa: "servo", iy: "servonun", tinker: "Micro Servo (Mikro Servo)", h: 112, pitch: 40, minW: 150, kablo: "EE",
      pins: [{ k: "N", e: "−", u: "kahverengi kablosunu (−)" }, { k: "P", e: "+", u: "kırmızı kablosunu (+)" }, { k: "S", e: "S", u: "turuncu sinyal kablosunu" }],
      renk: { N: "kahve", P: "kirmizi", S: "turuncu" }, bacak: { N: "#8d5524", P: "#e03131", S: "#fd7e14" },
      nasil: "Servo, turuncu sinyal kablosundan gelen kısa elektrik darbelerinin uzunluğuna bakarak milini 0° ile 180° arasındaki istenen açıya çevirir ve orada tutar.",
      kontrol: "Servonun kahverengi kablosu − hatta (GND), kırmızısı + hatta (5V), turuncusu sinyal pininde.",
      ciz: (w, h, px) => { const c = w / 2;
        return `<rect x="${c - 52}" y="40" width="104" height="22" rx="5" fill="#1c63b7" stroke="#0b3d78" stroke-width="2"/><rect x="${c - 38}" y="20" width="76" height="62" rx="6" fill="#1c63b7" stroke="#0b3d78" stroke-width="2"/>`
          + `<path d="M${c - 50} 14 h48 a7 7 0 0 1 0 14 h-48 a7 7 0 0 1 0 -14z" fill="#fff" stroke="#868e96" stroke-width="2"/><circle cx="${c - 20}" cy="21" r="9" fill="#e9ecef" stroke="#868e96" stroke-width="2"/><circle cx="${c - 20}" cy="21" r="3" fill="#868e96"/>`
          + yazi(c + 14, 58, "SG90") + px.map((x, i) => `<path d="M${c - 6 + i * 6} 82 C ${c - 6 + i * 6} 100, ${x} 96, ${x} ${h - 12}" stroke="${["#8d5524", "#e03131", "#fd7e14"][i]}" stroke-width="4" fill="none"/>`).join("") + baslik(px, h); } },
    hcsr04: { ad: "Ultrasonik mesafe sensörü (HC-SR04)", kisa: "ultrasonik sensör", iy: "ultrasonik sensörün", tinker: "Ultrasonic Distance Sensor (4 pimli)", h: 100, pitch: 40, minW: 172, kablo: "ED", modul: true,
      pins: [{ k: "VCC", e: "VCC", u: "VCC pinini" }, { k: "Trig", e: "Trig", u: "Trig pinini" }, { k: "Echo", e: "Echo", u: "Echo pinini" }, { k: "GND", e: "GND", u: "GND pinini" }],
      nasil: "HC-SR04 bir hoparlör gibi insan kulağının duyamadığı bir ses yollar (Trig), sesin bir engele çarpıp geri dönmesini dinler (Echo). Ses ne kadar geç dönerse engel o kadar uzaktadır: geçen süre (mikrosaniye) ÷ 58 = mesafe (cm).",
      kontrol: "Ultrasonik sensörde VCC ile GND yer değiştirmedi (ters takılırsa sensör ısınır). Trig ve Echo kabloları karışmadı.",
      ciz: (w, h, px) => pcb(w, h, "#1c7ed6", 6) + [0.27, 0.73].map((f, i) => `<circle cx="${w * f}" cy="46" r="31" fill="#ced4da" stroke="#868e96" stroke-width="3"/><circle cx="${w * f}" cy="46" r="23" fill="#495057"/><circle cx="${w * f}" cy="46" r="23" fill="none" stroke="#6c757d" stroke-width="1" stroke-dasharray="2 3"/>${yazi(w * f, 51, i ? "R" : "T")}`).join("")
        + `<rect x="${w / 2 - 8}" y="22" width="16" height="26" rx="3" fill="#dee2e6"/>` + yazi(w / 2, 86, "HC-SR04", 'font-size="11"') + baslik(px, h) },
    led: { ad: "LED", kisa: "LED", iy: "LED'in", tinker: "LED + Resistor (Direnç, 220 Ω)", h: 60, pitch: 48, minW: 96, kablo: "EE",
      pins: [{ k: "A", e: "+", u: "uzun bacağını (+)", r: "220Ω" }, { k: "K", e: "−", u: "kısa bacağını (−)" }],
      nasil: "LED, uzun bacağından (+) kısa bacağına (−) akım geçince ışık verir. Ters takılırsa yanmaz. Önüne 220Ω direnç konur; direnç olmazsa LED'den fazla akım geçer ve bozulur.",
      kontrol: "LED'in uzun bacağı (+) dirençli tarafta, kısa bacağı (−) − hatta. 220Ω direnç takılı (renkleri: kırmızı-kırmızı-kahverengi).",
      yerlestir: "LED'i breadboard'a tak. 220Ω direncin bir ucunu LED'in uzun bacağıyla aynı dikey sıraya koy; kablo direncin öbür ucundan çıkar.",
      ciz: (w, h, px, p) => { const c = (px[0] + px[1]) / 2, col = (RENK[(p && p.led) || "kirmizi"] || RENK.kirmizi)[0];
        return `<path d="M${c - 17} ${h - 8} V24 a17 17 0 0 1 34 0 V${h - 8} Z" fill="${col}" fill-opacity=".88" stroke="rgba(0,0,0,.4)" stroke-width="2"/><rect x="${c - 21}" y="${h - 10}" width="42" height="9" rx="2" fill="${col}" stroke="rgba(0,0,0,.4)" stroke-width="2"/><path d="M${c - 8} 16 q-4 8 -2 22" stroke="#fff" stroke-opacity=".7" stroke-width="4" fill="none" stroke-linecap="round"/>`
          + `<line x1="${px[0]}" y1="${h - 1}" x2="${c - 6}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/><line x1="${px[1]}" y1="${h - 1}" x2="${c + 6}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/>`; } },
    buton: { ad: "Buton", kisa: "buton", iy: "butonun", tinker: "Pushbutton (Buton) + Resistor (10 kΩ)", h: 60, pitch: 50, minW: 150, kablo: "EE",
      pins: [{ k: "B1", e: "1", u: "1. bacağını" }, { k: "B2", e: "2", u: "2. bacağını (1. bacağın çaprazındaki)" }, { k: "R", e: "10kΩ", u: "10kΩ direncin boştaki ucunu", r: "10kΩ", kol: "B2" }],
      nasil: "Butona basılınca içindeki iki metal birbirine değer ve devre tamamlanır: pin 5V'u görür (1). Bırakınca 10kΩ direnç pini GND'ye çeker (0). Bu dirence 'aşağı çekme direnci' denir; o olmazsa pin kararsız kalır.",
      kontrol: "Buton breadboard'un ortasındaki oluğun üstünde. Kablolar butonun çapraz bacaklarında. 10kΩ direnç (kahverengi-siyah-turuncu) 2. bacak ile − hat arasında.",
      yerlestir: "Butonu breadboard'un ortasındaki oluğun üstüne bastırarak tak. 10kΩ direncin bir ucunu butonun 2. bacağıyla aynı dikey sıraya koy.",
      ciz: (w, h, px) => { const c = (px[0] + px[1]) / 2;
        return `<rect x="${c - 26}" y="6" width="52" height="${h - 10}" rx="5" fill="#343a40" stroke="#111" stroke-width="2"/><circle cx="${c}" cy="${6 + (h - 10) / 2}" r="15" fill="#868e96" stroke="#212529" stroke-width="2"/><circle cx="${c}" cy="${6 + (h - 10) / 2}" r="9" fill="#adb5bd"/>`
          + `<line x1="${px[0]}" y1="${h - 1}" x2="${c - 20}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/><line x1="${px[1]}" y1="${h - 1}" x2="${c + 20}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/>`; } },
    ldr: { ad: "LDR (ışık sensörü)", kisa: "LDR", iy: "LDR'nin", tinker: "Photoresistor (Fotodirenç) + Resistor (10 kΩ)", h: 52, pitch: 50, minW: 150, kablo: "EE",
      pins: [{ k: "L1", e: "1", u: "1. bacağını" }, { k: "L2", e: "2", u: "2. bacağını" }, { k: "R", e: "10kΩ", u: "10kΩ direncin boştaki ucunu", r: "10kΩ", kol: "L2" }],
      nasil: "LDR'nin direnci ışık arttıkça azalır. 10kΩ dirençle birlikte 'gerilim bölücü' kurulur: aradaki noktanın gerilimi ışığa göre değişir, Arduino bunu analog pinden 0 ile 1023 arası bir sayı olarak okur. Aydınlıkta sayı büyür, karanlıkta küçülür.",
      kontrol: "LDR'nin 2. bacağı ile 10kΩ direncin bir ucu aynı dikey sırada; o sıradan analog pine kablo gidiyor. Direncin öbür ucu − hatta.",
      yerlestir: "LDR'yi breadboard'a tak (bacaklarının yönü fark etmez). 10kΩ direncin bir ucunu LDR'nin 2. bacağıyla aynı dikey sıraya koy.",
      ciz: (w, h, px) => { const c = (px[0] + px[1]) / 2;
        return `<circle cx="${c}" cy="24" r="21" fill="#e8b04b" stroke="#8a6d3b" stroke-width="2"/><path d="M${c - 13} 14 h26 M${c + 13} 14 v5 h-26 v5 h26 v5 h-26 v5 h26" stroke="#c0392b" stroke-width="3" fill="none"/>`
          + `<line x1="${px[0]}" y1="${h - 1}" x2="${c - 8}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/><line x1="${c - 8}" y1="${h - 1}" x2="${c - 8}" y2="42" stroke="#9aa1a8" stroke-width="3"/><line x1="${px[1]}" y1="${h - 1}" x2="${c + 8}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/><line x1="${c + 8}" y1="${h - 1}" x2="${c + 8}" y2="42" stroke="#9aa1a8" stroke-width="3"/>`; } },
    pot: { ad: "Potansiyometre (10kΩ)", kisa: "potansiyometre", iy: "potansiyometrenin", tinker: "Potentiometer (Potansiyometre)", h: 84, pitch: 42, minW: 126, kablo: "EE",
      pins: [{ k: "L", e: "sol", u: "sol bacağını" }, { k: "W", e: "orta", u: "orta bacağını" }, { k: "R", e: "sağ", u: "sağ bacağını" }],
      nasil: "Potansiyometre çevrilebilen bir dirençtir. Sol bacağa 5V, sağ bacağa GND verilir; orta bacak düğme çevrildikçe 0V ile 5V arasında bir gerilim verir. Arduino bunu 0-1023 arası sayı olarak okur.",
      kontrol: "Potansiyometrenin orta bacağı analog pinde; sol bacak + hatta, sağ bacak − hatta.",
      yerlestir: "Potansiyometreyi breadboard'a tak; üç bacağı üç ayrı dikey sırada olsun.",
      ciz: (w, h, px) => `<rect x="${px[0] - 18}" y="8" width="${px[2] - px[0] + 36}" height="${h - 14}" rx="6" fill="#1c7ed6" stroke="#0b3d78" stroke-width="2"/><circle cx="${px[1]}" cy="${8 + (h - 14) / 2}" r="24" fill="#dee2e6" stroke="#495057" stroke-width="2"/><line x1="${px[1]}" y1="${8 + (h - 14) / 2}" x2="${px[1] + 12}" y2="${8 + (h - 14) / 2 - 18}" stroke="#212529" stroke-width="4" stroke-linecap="round"/>` },
    buzzer: { ad: "Buzzer (aktif)", kisa: "buzzer", iy: "buzzer'ın", tinker: "Piezo", h: 66, pitch: 48, minW: 96, kablo: "EE",
      pins: [{ k: "P", e: "+", u: "+ (uzun) bacağını" }, { k: "N", e: "−", u: "− (kısa) bacağını" }],
      nasil: "Buzzer'ın içindeki ince bir plaka elektrik gelince çok hızlı titreşir ve ses çıkar. tone() komutu titreşimin sıklığını (frekansını) değiştirir; sıklık arttıkça ses incelir.",
      kontrol: "Buzzer'ın + bacağı (üstünde + işareti, uzun bacak) sinyal pininde, − bacağı − hatta.",
      yerlestir: "Buzzer'ı breadboard'a tak; üstündeki + işaretli bacak sinyal tarafında olsun.",
      ciz: (w, h, px) => { const c = (px[0] + px[1]) / 2;
        return `<ellipse cx="${c}" cy="${h - 12}" rx="30" ry="9" fill="#111"/><rect x="${c - 30}" y="18" width="60" height="${h - 30}" fill="#212529"/><ellipse cx="${c}" cy="18" rx="30" ry="10" fill="#343a40" stroke="#111" stroke-width="2"/><circle cx="${c}" cy="18" r="4" fill="#111"/>${yazi(c - 16, 42, "+", 'font-size="16"')}`; } },
    dht: { ad: "Sıcaklık-nem sensörü (DHT11 modülü)", kisa: "DHT11", iy: "DHT11'in", tinker: "", tinkerYok: true, h: 112, pitch: 42, minW: 130, kablo: "ED", modul: true,
      pins: [{ k: "V", e: "+", u: "+ (VCC) pinini" }, { k: "D", e: "DATA", u: "DATA (S, OUT) pinini" }, { k: "G", e: "−", u: "− (GND) pinini" }],
      nasil: "DHT11'in içinde sıcaklıkla direnci değişen bir parça ve nemi ölçen bir katman vardır. Küçük çipi ölçümü sayıya çevirip tek kablodan (DATA) Arduino'ya gönderir. Bu yüzden kütüphane gerekir: DHT sensor library (Adafruit).",
      kontrol: "DHT11 modülünün üstündeki yazılara bakıldı (+ / − / S ya da VCC / DATA / GND). Sıra farklıysa yazıya göre takıldı.",
      ciz: (w, h, px) => pcb(w, h, "#2f9e44", 70) + `<rect x="${w / 2 - 32}" y="4" width="64" height="76" rx="4" fill="#74c0fc" stroke="#1971c2" stroke-width="2"/>`
        + [0, 1, 2, 3, 4].map((i) => `<line x1="${w / 2 - 26}" y1="${14 + i * 12}" x2="${w / 2 + 26}" y2="${14 + i * 12}" stroke="#1971c2" stroke-width="2"/>`).join("") + yazi(w / 2, 98, "DHT11", 'font-size="11"') + baslik(px, h) },
    tmp36: { ad: "Sıcaklık sensörü (TMP36)", kisa: "TMP36", iy: "TMP36'nın", tinker: "Temperature Sensor [TMP36] (Sıcaklık Sensörü)", h: 62, pitch: 42, minW: 126, kablo: "EE",
      pins: [{ k: "V", e: "+Vs", u: "sol bacağını (+Vs)" }, { k: "O", e: "Vout", u: "orta bacağını (Vout)" }, { k: "G", e: "GND", u: "sağ bacağını (GND)" }],
      nasil: "TMP36 sıcaklık arttıkça orta bacağından daha yüksek gerilim verir: 0,5V = 0°C, her 1°C için 0,01V artar. Arduino analog değeri okur; kod bunu °C'ye çevirir.",
      kontrol: "TMP36'nın düz yüzü sana bakarken: sol bacak + hatta, orta bacak analog pinde, sağ bacak − hatta. Ters takılırsa çok ısınır, dokunma!",
      ciz: (w, h, px) => `<path d="M${px[0] - 16} ${h - 4} V22 a${(px[2] - px[0]) / 2 + 16} 18 0 0 1 ${px[2] - px[0] + 32} 0 V${h - 4} Z" fill="#212529" stroke="#000" stroke-width="2"/>${yazi(w / 2, 42, "TMP36", 'font-size="11"')}` },
    pir: { ad: "PIR hareket sensörü (HC-SR501)", kisa: "PIR sensörü", iy: "PIR sensörünün", tinker: "PIR Sensor (PIR Sensörü)", h: 108, pitch: 42, minW: 130, kablo: "ED", modul: true,
      pins: [{ k: "V", e: "VCC", u: "VCC pinini" }, { k: "O", e: "OUT", u: "OUT pinini" }, { k: "G", e: "GND", u: "GND pinini" }],
      nasil: "PIR sensörü insan ve hayvan vücudunun yaydığı ısıyı (kızılötesi ışınım) görür. Önünde sıcak bir şey hareket edince OUT pini 1 olur. Beyaz kubbe, görüş alanını genişleten bir mercektir.",
      kontrol: "PIR'ın kubbesini çıkarıp pin yazılarına bakıldı (VCC / OUT / GND). Açıldıktan sonra 30-60 saniye ısınması beklendi.",
      ciz: (w, h, px) => pcb(w, h, "#2f9e44", 40) + `<path d="M${w / 2 - 40} 62 a40 40 0 0 1 80 0 Z" fill="#f8f9fa" stroke="#adb5bd" stroke-width="2"/>` + [-24, -8, 8, 24].map((d) => `<line x1="${w / 2 + d}" y1="62" x2="${w / 2 + d * 0.5}" y2="26" stroke="#dee2e6" stroke-width="2"/>`).join("") + yazi(w / 2, 90, "HC-SR501", 'font-size="11"') + baslik(px, h) },
    nem: { ad: "Toprak nem sensörü", kisa: "toprak nem sensörü", iy: "toprak nem sensörünün", tinker: "Soil Moisture Sensor (Toprak Nem Sensörü)", h: 150, pitch: 38, minW: 150, kablo: "ED", modul: true,
      pins: [{ k: "V", e: "VCC", u: "VCC pinini" }, { k: "G", e: "GND", u: "GND pinini" }, { k: "D", e: "DO", u: "DO pinini" }, { k: "AO", e: "AO", u: "AO pinini" }],
      nasil: "Sensörün iki ayağı toprağa girer. Su elektriği iletir: toprak ıslaksa ayaklar arasından daha çok akım geçer ve AO pinindeki değer değişir. Kuru ve ıslak toprakta değeri ölçüp eşiği biz belirleriz (kalibrasyon).",
      kontrol: "Nem sensörünün AO (analog) pini kullanılıyor, DO boş. Ayaklar yalnız toprağa giriyor; modül ve kablolar kuru.",
      ciz: (w, h, px) => `<path d="M${w / 2 - 34} 4 h22 v70 h-22 z M${w / 2 + 12} 4 h22 v70 h-22 z" fill="#d4a017" stroke="#8a6d3b" stroke-width="2"/><rect x="${w / 2 - 40}" y="70" width="80" height="16" rx="3" fill="#1c7ed6"/>`
        + `<line x1="${w / 2 - 20}" y1="86" x2="${w / 2 - 20}" y2="98" stroke="#adb5bd" stroke-width="3"/><line x1="${w / 2 + 20}" y1="86" x2="${w / 2 + 20}" y2="98" stroke="#adb5bd" stroke-width="3"/>`
        + `<rect x="4" y="98" width="${w - 8}" height="50" rx="5" fill="#1c7ed6" stroke="#0b3d78" stroke-width="2"/><rect x="${w - 40}" y="106" width="20" height="16" rx="2" fill="#4dabf7" stroke="#fff"/>` + baslik(px, h) },
    su: { ad: "Su seviye sensörü", kisa: "su seviye sensörü", iy: "su seviye sensörünün", tinker: "", tinkerYok: true, h: 136, pitch: 42, minW: 130, kablo: "ED", modul: true,
      pins: [{ k: "S", e: "S", u: "S (sinyal) pinini" }, { k: "P", e: "+", u: "+ pinini" }, { k: "N", e: "−", u: "− pinini" }],
      nasil: "Sensörün üstündeki çizgilerin yarısı 5V'a, yarısı sinyale bağlıdır. Su yükseldikçe daha çok çizgiyi birbirine bağlar ve S pinindeki değer artar.",
      kontrol: "Su seviye sensörü yalnız çizgili kısmından suya giriyor; pinler ve kablolar kesinlikle kuru. Arduino bardaktan uzakta.",
      ciz: (w, h, px) => pcb(w, h, "#c92a2a", 4) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<line x1="${w / 2 - 30 + (i % 2) * 6}" y1="${12 + i * 8}" x2="${w / 2 + 30 + (i % 2) * 6}" y2="${12 + i * 8}" stroke="#fab005" stroke-width="3"/>`).join("") + baslik(px, h) },
    ses: { ad: "Ses sensörü (KY-038)", kisa: "ses sensörü", iy: "ses sensörünün", tinker: "", tinkerYok: true, h: 96, pitch: 36, minW: 150, kablo: "ED", modul: true,
      pins: [{ k: "AO", e: "AO", u: "AO pinini" }, { k: "G", e: "G", u: "G (GND) pinini" }, { k: "P", e: "+", u: "+ pinini" }, { k: "DO", e: "DO", u: "DO (dijital çıkış) pinini" }],
      nasil: "Mikrofon sesin titreşimini elektriğe çevirir. Mavi kutudaki vida (eşik ayarı) ne kadar yüksek sesin '1' sayılacağını belirler: ses eşiği geçince DO pini 1 olur.",
      kontrol: "Ses sensörünün DO pini dijital pinde, AO boş. Mavi vida küçük tornavidayla ayarlandı: sessizken DO ışığı sönük, alkışta yanıyor.",
      ciz: (w, h, px) => pcb(w, h, "#1c7ed6", 4) + `<circle cx="34" cy="40" r="22" fill="#ced4da" stroke="#868e96" stroke-width="3"/><circle cx="34" cy="40" r="14" fill="#212529"/><rect x="${w - 62}" y="20" width="34" height="34" rx="3" fill="#4dabf7" stroke="#fff" stroke-width="2"/><circle cx="${w - 45}" cy="37" r="7" fill="#e9ecef" stroke="#868e96"/>` + baslik(px, h) },
    ir: { ad: "Kızılötesi alıcı (VS1838B)", kisa: "IR alıcı", iy: "IR alıcının", tinker: "IR Sensor (IR Alıcı) + IR Remote (Kumanda)", h: 64, pitch: 42, minW: 126, kablo: "EE",
      pins: [{ k: "O", e: "OUT", u: "OUT (sol) bacağını" }, { k: "G", e: "GND", u: "GND (orta) bacağını" }, { k: "V", e: "VCC", u: "VCC (sağ) bacağını" }],
      nasil: "Kumanda gözle göremediğimiz kızılötesi ışıkla, çok hızlı yanıp sönerek bir sayı (tuş kodu) gönderir. IR alıcı bu yanıp sönmeleri yakalar; IRremote kütüphanesi kodu çözer.",
      kontrol: "IR alıcının çıkıntılı (göz) yüzü sana bakarken: sol bacak OUT, orta GND, sağ VCC. Modül kullanıyorsan üstündeki yazılara göre tak.",
      ciz: (w, h, px) => `<rect x="${px[0] - 16}" y="10" width="${px[2] - px[0] + 32}" height="${h - 14}" rx="5" fill="#212529"/><ellipse cx="${w / 2}" cy="${10 + (h - 14) / 2}" rx="16" ry="14" fill="#343a40" stroke="#495057" stroke-width="2"/>` },
    lcd: { ad: "16×2 LCD ekran (I2C modüllü)", kisa: "LCD ekran", iy: "LCD ekranın", tinker: "LCD 16 x 2 (I2C)", h: 120, pitch: 46, minW: 280, kablo: "ED", modul: true,
      pins: [{ k: "G", e: "GND", u: "GND pinini" }, { k: "V", e: "VCC", u: "VCC pinini" }, { k: "SDA", e: "SDA", u: "SDA pinini" }, { k: "SCL", e: "SCL", u: "SCL pinini" }],
      nasil: "Ekranın arkasındaki I2C modülü sayesinde 16 karakter × 2 satırlık ekran yalnız 2 veri kablosuyla (SDA veri, SCL saat) çalışır. Arduino Uno'da I2C pinleri A4 (SDA) ve A5 (SCL)'tir. Kütüphane: LiquidCrystal I2C.",
      kontrol: "LCD'nin SDA kablosu A4'te, SCL kablosu A5'te. Yazı görünmüyorsa modülün arkasındaki mavi vidayla kontrast ayarlandı; adres 0x27 ya da 0x3F denendi.",
      ciz: (w, h, px) => pcb(w, h, "#2b8a3e", 4) + `<rect x="14" y="14" width="${w - 28}" height="68" rx="4" fill="#212529"/><rect x="24" y="24" width="${w - 48}" height="48" fill="#94d82d"/><text x="34" y="44" font-family="Consolas, monospace" font-size="16" font-weight="700" fill="#1b4d1b">Merhaba</text><text x="34" y="66" font-family="Consolas, monospace" font-size="16" font-weight="700" fill="#1b4d1b">BILSEM</text>` + baslik(px, h) },
    rgb: { ad: "RGB LED (ortak katot)", kisa: "RGB LED", iy: "RGB LED'in", tinker: "LED RGB + 3 Resistor (220 Ω)", h: 66, pitch: 46, minW: 184, kablo: "EE",
      pins: [{ k: "R", e: "R", u: "kırmızı bacağını", r: "220Ω" }, { k: "K", e: "−", u: "en uzun (−) bacağını" }, { k: "G", e: "G", u: "yeşil bacağını", r: "220Ω" }, { k: "B", e: "B", u: "mavi bacağını", r: "220Ω" }],
      nasil: "RGB LED'in içinde kırmızı, yeşil ve mavi üç küçük LED vardır; en uzun bacak ortak − ucudur. analogWrite ile her rengin parlaklığı 0-255 arası ayarlanır; renkler karışarak yeni renkler oluşur.",
      kontrol: "RGB LED'in en uzun bacağı − hatta. Üç renk bacağının her birinde ayrı 220Ω direnç var. R, G, B pinleri ~ işaretli PWM pinlerinde (9, 10, 11).",
      yerlestir: "RGB LED'i breadboard'a tak (en uzun bacak soldan 2.). R, G ve B bacaklarının her birinin sırasına birer 220Ω direnç koy.",
      ciz: (w, h, px) => { const c = (px[0] + px[3]) / 2;
        return `<defs><linearGradient id="rgbG" x1="0" x2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".5" stop-color="#69db7c"/><stop offset="1" stop-color="#4dabf7"/></linearGradient></defs><path d="M${c - 19} ${h - 8} V24 a19 19 0 0 1 38 0 V${h - 8} Z" fill="url(#rgbG)" fill-opacity=".8" stroke="rgba(0,0,0,.4)" stroke-width="2"/><rect x="${c - 23}" y="${h - 10}" width="46" height="9" rx="2" fill="#e9ecef" stroke="rgba(0,0,0,.4)" stroke-width="2"/>`
          + px.map((x, i) => `<line x1="${x}" y1="${h - 1}" x2="${c - 12 + i * 8}" y2="${h - 1}" stroke="#9aa1a8" stroke-width="3"/>`).join(""); } },
    tip120: { ad: "Transistör (TIP120)", kisa: "transistör", iy: "transistörün", tinker: "NPN Transistor (BJT) + Resistor (1 kΩ)", h: 96, pitch: 46, minW: 140, kablo: "EE",
      pins: [{ k: "B", e: "B", u: "B (sol) bacağını", r: "1kΩ" }, { k: "C", e: "C", u: "C (orta) bacağını" }, { k: "E", e: "E", u: "E (sağ) bacağını" }],
      nasil: "Arduino pini fanı döndürecek kadar akım veremez. Transistör bir elektronik anahtardır: B bacağına küçük bir akım gelince C ile E arası açılır ve fanın büyük akımı geçer.",
      kontrol: "TIP120'nin yazılı yüzü sana bakarken: sol B (1kΩ dirençle D10'a), orta C (fanın − ucu), sağ E (− hat).",
      yerlestir: "TIP120'yi breadboard'a yazılı yüzü sana bakacak şekilde tak. 1kΩ direncin bir ucunu B (sol) bacağıyla aynı sıraya koy.",
      ciz: (w, h, px) => `<rect x="${px[0] - 20}" y="4" width="${px[2] - px[0] + 40}" height="22" rx="3" fill="#ced4da" stroke="#868e96" stroke-width="2"/><circle cx="${px[1]}" cy="15" r="6" fill="#fff" stroke="#868e96"/><rect x="${px[0] - 20}" y="26" width="${px[2] - px[0] + 40}" height="${h - 30}" rx="3" fill="#212529"/>${yazi(px[1], 62, "TIP120", 'font-size="12"')}` },
    fan: { ad: "Küçük DC fan / motor", kisa: "fan", iy: "fanın", tinker: "DC Motor", h: 96, pitch: 46, minW: 120, kablo: "EE",
      pins: [{ k: "P", e: "+", u: "+ (kırmızı) ucunu" }, { k: "N", e: "−", u: "− (siyah) ucunu" }], bacak: { P: "#e03131", N: "#2b2b2b" },
      nasil: "DC motorun içinde mıknatıs ve bobin vardır; akım geçince bobin döner. Motor durunca kısa bir an ters yönde gerilim üretir; diyot bu gerilimi yutarak Arduino'yu korur.",
      kontrol: "Fanın + ucu + hatta, − ucu transistörün C bacağında. Diyotun çizgili ucu fanın + ucunda.",
      ciz: (w, h, px) => { const c = w / 2; return `<circle cx="${c}" cy="40" r="36" fill="#dee2e6" stroke="#495057" stroke-width="3"/>` + [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${c}" cy="20" rx="8" ry="16" fill="#74c0fc" stroke="#1971c2" transform="rotate(${a} ${c} 40)"/>`).join("") + `<circle cx="${c}" cy="40" r="8" fill="#495057"/>` + px.map((x) => `<path d="M${c} 76 C ${c} 88, ${x} 84, ${x} ${h}" stroke="${x === px[0] ? "#e03131" : "#2b2b2b"}" stroke-width="4" fill="none"/>`).join(""); } },
    diyot: { ad: "Diyot (1N4007)", kisa: "diyot", iy: "diyotun", tinker: "Diode (Diyot)", h: 40, pitch: 46, minW: 100, kablo: "EE",
      pins: [{ k: "K", e: "çizgili", u: "gümüş çizgili ucunu (katot)" }, { k: "A", e: "düz", u: "çizgisiz ucunu (anot)" }],
      nasil: "Diyot akımı yalnız tek yönde geçirir. Motora ters bağlanınca motorun durduğu anda ürettiği ters gerilimi kısa devre ederek transistörü ve Arduino'yu korur.",
      kontrol: "Diyotun gümüş çizgili ucu fanın + ucunda, çizgisiz ucu fanın − ucunda (ters takılırsa kısa devre olur!).",
      yerlestir: "Diyotu fanın iki ucunun arasına koy: gümüş çizgili uç + tarafa.",
      ciz: (w, h, px) => `<line x1="${px[0]}" y1="${h - 1}" x2="${px[0]}" y2="20" stroke="#9aa1a8" stroke-width="3"/><line x1="${px[1]}" y1="${h - 1}" x2="${px[1]}" y2="20" stroke="#9aa1a8" stroke-width="3"/><line x1="${px[0]}" y1="20" x2="${px[1]}" y2="20" stroke="#9aa1a8" stroke-width="3"/><rect x="${(px[0] + px[1]) / 2 - 18}" y="11" width="36" height="18" rx="4" fill="#212529"/><rect x="${(px[0] + px[1]) / 2 - 16}" y="11" width="6" height="18" fill="#ced4da"/>` },
    l298n: { ad: "Motor sürücü (L298N)", kisa: "motor sürücü", iy: "motor sürücünün", tinker: "H-bridge Motor Driver (L293D)", h: 150, pitch: 36, minW: 0, kablo: "ED", modul: true,
      pins: [{ k: "O1", e: "OUT1", u: "OUT1 vidasını" }, { k: "O2", e: "OUT2", u: "OUT2 vidasını" }, { k: "V12", e: "12V", u: "12V (+) vidasını" }, { k: "GND", e: "GND", u: "GND vidasını" }, { k: "V5", e: "5V", u: "5V vidasını" },
        { k: "ENA", e: "ENA", u: "ENA pinini" }, { k: "IN1", e: "IN1", u: "IN1 pinini" }, { k: "IN2", e: "IN2", u: "IN2 pinini" }, { k: "IN3", e: "IN3", u: "IN3 pinini" }, { k: "IN4", e: "IN4", u: "IN4 pinini" }, { k: "ENB", e: "ENB", u: "ENB pinini" },
        { k: "O3", e: "OUT3", u: "OUT3 vidasını" }, { k: "O4", e: "OUT4", u: "OUT4 vidasını" }],
      nasil: "Arduino pini motoru çevirecek akımı veremez. L298N pilin gücünü motora aktaran bir anahtar kutusudur: IN1-IN2 motorun yönünü (1-0 ileri, 0-1 geri, 0-0 dur), ENA ise analogWrite ile hızını belirler. İkinci motor IN3-IN4 ve ENB ile yönetilir.",
      kontrol: "L298N'nin ENA ve ENB pinlerindeki siyah atlama kapakları çıkarıldı (yoksa hız ayarı çalışmaz). Pil kutusunun − ucu ile Arduino GND aynı GND vidasında (ortak toprak). Pil en son takıldı.",
      ciz: (w, h, px) => { const v = (a, b) => `<rect x="${px[a] - 15}" y="${h - 40}" width="${px[b] - px[a] + 30}" height="28" rx="3" fill="#1c7ed6" stroke="#0b3d78" stroke-width="2"/>` + px.slice(a, b + 1).map((x) => `<circle cx="${x}" cy="${h - 26}" r="7" fill="#ced4da" stroke="#495057"/><line x1="${x - 4}" y1="${h - 26}" x2="${x + 4}" y2="${h - 26}" stroke="#495057" stroke-width="2"/>`).join("");
        return pcb(w, h, "#c92a2a", 4) + `<rect x="${w / 2 - 60}" y="10" width="120" height="60" fill="#212529"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${w / 2 - 56 + i * 15}" y="10" width="8" height="60" fill="#495057"/>`).join("")
          + v(0, 1) + v(2, 4) + v(11, 12) + `<rect x="${px[5] - 12}" y="${h - 34}" width="${px[10] - px[5] + 24}" height="22" rx="2" fill="#212529"/>` + yazi(w / 2, 92, "L298N", 'font-size="16"') + `<line x1="${px[0]}" y1="${h - 12}" x2="${px[0]}" y2="${h}" stroke="#9aa1a8" stroke-width="3"/>`; } },
    motor: { ad: "DC motor + tekerlek", kisa: "motor", iy: "motorun", tinker: "DC Motor", h: 96, pitch: 44, minW: 112, kablo: "EE",
      pins: [{ k: "1", e: "uç 1", u: "1. ucunu" }, { k: "2", e: "uç 2", u: "2. ucunu" }], bacak: { "1": "#e03131", "2": "#2b2b2b" },
      nasil: "Motorun iki ucuna verilen gerilimin yönü değişince motor ters döner.", kontrol: "Motor uçları vidalara sıkıca bağlandı; tekerlek ters dönerse iki ucun yeri değiştirilir.",
      ciz: (w, h, px) => `<rect x="${w / 2 - 44}" y="10" width="62" height="46" rx="6" fill="#fcc419" stroke="#b8860b" stroke-width="2"/><circle cx="${w / 2 + 24}" cy="34" r="32" fill="#343a40" stroke="#111" stroke-width="3"/><circle cx="${w / 2 + 24}" cy="34" r="12" fill="#adb5bd"/>` + px.map((x, i) => `<path d="M${w / 2 - 30 + i * 12} 56 C ${w / 2 - 30 + i * 12} 74, ${x} 70, ${x} ${h}" stroke="${i ? "#2b2b2b" : "#e03131"}" stroke-width="4" fill="none"/>`).join("") },
    pil: { ad: "Pil kutusu (4 × AA, 6V)", kisa: "pil kutusu", iy: "pil kutusunun", tinker: "Battery 4 AA (Pil)", h: 80, pitch: 46, minW: 140, kablo: "EE",
      pins: [{ k: "P", e: "+", u: "kırmızı (+) kablosunu" }, { k: "N", e: "−", u: "siyah (−) kablosunu" }], renk: { P: "kirmizi", N: "siyah" }, bacak: { P: "#e03131", N: "#2b2b2b" },
      nasil: "Motorlar çok akım çeker; bu yüzden Arduino'nun USB gücü yetmez, ayrı pil kullanılır.", kontrol: "Pil kutusunun düğmesi KAPALI iken bağlandı; + ucu 12V vidasında, − ucu GND vidasında.",
      ciz: (w, h, px) => `<rect x="6" y="6" width="${w - 12}" height="54" rx="5" fill="#212529"/>` + [0, 1, 2, 3].map((i) => `<rect x="${14 + i * (w - 28) / 4}" y="14" width="${(w - 28) / 4 - 6}" height="38" rx="4" fill="#495057"/><rect x="${14 + i * (w - 28) / 4}" y="14" width="${(w - 28) / 4 - 6}" height="8" fill="#fab005"/>`).join("") + px.map((x, i) => `<path d="M${w / 2 - 6 + i * 12} 60 C ${w / 2 - 6 + i * 12} 74, ${x} 70, ${x} ${h}" stroke="${i ? "#2b2b2b" : "#e03131"}" stroke-width="4" fill="none"/>`).join("") },
    tcrt: { ad: "Çizgi sensörü (TCRT5000)", kisa: "çizgi sensörü", iy: "çizgi sensörünün", tinker: "", tinkerYok: true, h: 96, pitch: 36, minW: 140, kablo: "ED", modul: true,
      pins: [{ k: "V", e: "VCC", u: "VCC pinini" }, { k: "G", e: "GND", u: "GND pinini" }, { k: "D", e: "DO", u: "DO pinini" }, { k: "AO", e: "AO", u: "AO pinini" }],
      nasil: "Sensörün bir gözü kızılötesi ışık yollar, öbür gözü yansıyan ışığı ölçer. Beyaz zemin ışığı çok yansıtır, siyah bant yutar. AO pinindeki değer farkından arabanın çizgiyi gördüğü anlaşılır.",
      kontrol: "Çizgi sensörleri yere 1 cm kadar yakın ve aşağı bakıyor. AO pinleri A0 (sol) ve A1 (sağ) pinlerinde.",
      ciz: (w, h, px) => pcb(w, h, "#1c7ed6", 4) + `<rect x="${w / 2 - 26}" y="14" width="52" height="30" rx="3" fill="#212529"/><circle cx="${w / 2 - 12}" cy="29" r="9" fill="#4dabf7"/><circle cx="${w / 2 + 12}" cy="29" r="9" fill="#111" stroke="#495057"/>` + baslik(px, h) }
  };

  // ---------- haftaların devreleri (kodlama.js'deki pin planıyla aynı) ----------
  const p = (id, tip, bag, ek) => Object.assign({ id, tip, bag }, ek || {});
  const SERVO = (s = "D9", ek) => p("sv", "servo", { N: "GND", P: "5V", S: s }, ek);
  const HC = () => p("hc", "hcsr04", { VCC: "5V", Trig: "D7", Echo: "D8", GND: "GND" });
  const LED = (pin = "D12", ek) => p("led", "led", { A: pin, K: "GND" }, ek);
  const BUZ = (pin = "D6") => p("bz", "buzzer", { P: pin, N: "GND" });
  const BUTON = (pin = "D2", ek) => p("bt", "buton", { B1: "5V", B2: pin, R: "GND" }, ek);
  const DHT = () => p("dht", "dht", { V: "5V", D: "D3", G: "GND" });
  const TMP = () => p("tmp", "tmp36", { V: "5V", O: "A2", G: "GND" });
  const LCD = () => p("lcd", "lcd", { G: "GND", V: "5V", SDA: "A4", SCL: "A5" });
  const FAN = () => [p("tr", "tip120", { B: "D10", E: "GND" }), p("fan", "fan", { P: "5V", N: "p:tr.C" }), p("dy", "diyot", { K: "p:fan.P", A: "p:fan.N" })];
  const MOTORLU = () => [p("drv", "l298n", { ENA: "D10", IN1: "D2", IN2: "D3", IN3: "D4", IN4: "D5", ENB: "D11", GND: "GND" }),
    p("mA", "motor", { "1": "p:drv.O1", "2": "p:drv.O2" }, { ad: "Sol motor + tekerlek", kisa: "sol motor", iy: "sol motorun" }),
    p("mB", "motor", { "1": "p:drv.O3", "2": "p:drv.O4" }, { ad: "Sağ motor + tekerlek", kisa: "sağ motor", iy: "sağ motorun" }),
    p("pil", "pil", { P: "p:drv.V12", N: "p:drv.GND" })];
  const ROBOT_NOT = "Pil kutusu en son, düğmesi kapalıyken bağlanır. Arduino'yu bilgisayardan USB ile besle; L298N'nin 5V vidası boş kalır.";
  const H = {
    4: [{ ad: "Servo devresi", parcalar: [SERVO()] }],
    5: [{ ad: "Akıllı kapak devresi", parcalar: [HC(), SERVO()] }],
    6: [{ ad: "Akıllı kapak devresi", parcalar: [HC(), SERVO()] }],
    7: [{ ad: "Servo devresi", parcalar: [SERVO()] }],
    8: [{ ad: "Buton + LED devresi", parcalar: [BUTON(), LED()] }],
    9: [{ ad: "Gece lambası devresi", parcalar: [p("ldr", "ldr", { L1: "5V", L2: "A0", R: "GND" }), LED()] }],
    10: [{ ad: "Güneş takip devresi", parcalar: [p("ldrS", "ldr", { L1: "5V", L2: "A0", R: "GND" }, { ad: "Sol LDR", kisa: "sol LDR", iy: "sol LDR'nin" }), p("ldrG", "ldr", { L1: "5V", L2: "A1", R: "GND" }, { ad: "Sağ LDR", kisa: "sağ LDR", iy: "sağ LDR'nin" }), SERVO()] }],
    11: [{ ad: "Potansiyometre + servo devresi", parcalar: [p("pot", "pot", { L: "5V", W: "A1", R: "GND" }), SERVO()] }],
    12: [{ ad: "Işık ve ses gösterisi devresi", parcalar: [LED(), BUZ()] }],
    13: [{ ad: "Park sensörü devresi", parcalar: [HC(), BUZ(), LED()] }],
    14: [{ ad: "Gerçek devre (DHT11)", parcalar: [DHT(), LED()] }, { ad: "Tinkercad devresi (TMP36)", tinker: true, parcalar: [TMP(), LED()] }],
    15: [{ ad: "Gerçek devre (DHT11 + fan)", parcalar: [DHT(), ...FAN(), LED()], not: "Küçük 5V fan kullan. Büyük motor için ayrı pil gerekir." }, { ad: "Tinkercad devresi (TMP36 + motor)", tinker: true, parcalar: [TMP(), ...FAN(), LED()] }],
    16: [{ ad: "Hareket alarmı devresi", parcalar: [p("pir", "pir", { V: "5V", O: "D4", G: "GND" }), BUZ(), BUTON("D2", { ad: "Susturma butonu", kisa: "susturma butonu", iy: "susturma butonunun" }), LED()] }],
    17: [{ ad: "Bitkim susadı devresi", parcalar: [p("nem", "nem", { V: "5V", G: "GND", AO: "A3" }), LED(), BUZ()] }],
    19: [{ ad: "Ruh hâli lambası devresi", parcalar: [p("rgb", "rgb", { R: "D9", K: "GND", G: "D10", B: "D11" }), p("pot", "pot", { L: "5V", W: "A1", R: "GND" })] }],
    20: [{ ad: "Gerçek devre (ses sensörü)", parcalar: [p("ses", "ses", { G: "GND", P: "5V", DO: "D3" }), LED()] }, { ad: "Tinkercad devresi (buton = alkış)", tinker: true, parcalar: [BUTON("D3", { ad: "Alkış butonu", kisa: "alkış butonu", iy: "alkış butonunun" }), LED()] }],
    21: [{ ad: "Kumandalı kapı devresi", parcalar: [p("ir", "ir", { O: "D11", G: "GND", V: "5V" }), SERVO()] }],
    22: [{ ad: "LCD tabela devresi", parcalar: [LCD()] }],
    23: [{ ad: "Gerçek devre (DHT11 + LCD)", parcalar: [DHT(), LCD(), LED()] }, { ad: "Tinkercad devresi (TMP36 + LCD)", tinker: true, parcalar: [TMP(), LCD(), LED()] }],
    24: [{ ad: "Taşma alarmı devresi", parcalar: [p("su", "su", { S: "A3", P: "5V", N: "GND" }), BUZ(), LED()] }, { ad: "Tinkercad devresi (potansiyometre = su seviyesi)", tinker: true, parcalar: [p("pot", "pot", { L: "5V", W: "A3", R: "GND" }), BUZ(), LED()] }],
    25: [{ ad: "Motor sürücü devresi", parcalar: MOTORLU(), not: ROBOT_NOT }],
    26: [{ ad: "Robot araba devresi", parcalar: MOTORLU(), not: ROBOT_NOT }],
    27: [{ ad: "Engelden kaçan araba devresi", parcalar: [HC(), SERVO("D9", { ad: "Servo (sensör kafası)", kisa: "servo", iy: "servonun" }), ...MOTORLU()], not: "Motor bağlantıları 25. haftadakiyle aynı; önce onları kur, sonra sensörü ve servoyu ekle. " + ROBOT_NOT }],
    28: [{ ad: "Çizgi izleyen araba devresi", parcalar: [p("cS", "tcrt", { V: "5V", G: "GND", AO: "A0" }, { ad: "Sol çizgi sensörü", kisa: "sol çizgi sensörü", iy: "sol çizgi sensörünün" }), p("cG", "tcrt", { V: "5V", G: "GND", AO: "A1" }, { ad: "Sağ çizgi sensörü", kisa: "sağ çizgi sensörü", iy: "sağ çizgi sensörünün" }), ...MOTORLU()], not: "Motor bağlantıları 25. haftadakiyle aynı. " + ROBOT_NOT }]
  };

  // ---------- yerleşim ve kablo yolları ----------
  const cache = new Map();
  function yerlesim(dv) {
    if (cache.has(dv)) return cache.get(dv);
    const P = dv.parcalar.map((q) => { const T = PARCA[q.tip], n = T.pins.length, pitch = T.pitch || 44;
      return Object.assign({}, q, { T, n, pitch, w: Math.max(T.minW || 0, n * pitch), uzun: T.pins.some((z) => z.r), ad: q.ad || T.ad, kisa: q.kisa || T.kisa, iy: q.iy || T.iy }); });
    let x = 572;
    P.forEach((q) => { q.x = x; q.px = q.T.pins.map((_, i) => x + (q.w - (q.n - 1) * q.pitch) / 2 + i * q.pitch); q.alt = PIN_Y - (q.uzun ? LEG_R : LEG); q.ust = q.alt - q.T.h; x += q.w + 30; });
    const W = Math.max(1180, x + 10), id = {}; P.forEach((q) => { id[q.id] = q; });
    const K = [], kul = {};
    if (P.some((q) => Object.values(q.bag || {}).some((h) => h === "5V" || h === "GND"))) {
      K.push({ tur: "ur", uk: "5V", ray: "+", renk: "kirmizi" }, { tur: "ur", uk: "GND", ray: "-", renk: "siyah" });
    }
    let si = 0;
    P.forEach((q) => q.T.pins.forEach((z, i) => {
      const h = (q.bag || {})[z.k]; if (!h) return;
      const k = { p: q, q: z, i, hedef: h };
      k.renk = (q.renk || {})[z.k] || (q.T.renk || {})[z.k] || (h === "5V" ? "kirmizi" : h === "GND" ? "siyah" : SINYAL[si++ % SINYAL.length]);
      if (h === "5V" || h === "GND") { k.tur = "r"; k.ray = h === "5V" ? "+" : "-"; }
      else if (h.startsWith("p:")) { const [pid, pk] = h.slice(2).split("."); k.tur = "p"; k.p2 = id[pid]; k.i2 = k.p2 ? k.p2.T.pins.findIndex((y) => y.k === pk) : -1; if (k.i2 < 0) { console.warn("devre: parça pini yok", h); return; } k.q2 = k.p2.T.pins[k.i2]; }
      else { const u = unoPin(h); if (!u) { console.warn("devre: Arduino pini yok", h); return; } k.tur = u.ust ? "d" : "a"; k.uk = h; }
      K.push(k);
    }));
    const D = K.filter((k) => k.tur === "d"), A = K.filter((k) => k.tur === "a"), PP = K.filter((k) => k.tur === "p");
    K.forEach((k) => { if (k.uk) { const u = unoPin(k.uk); k.ux = UX + u.x; k.u = u; } if (k.p) k.x1 = k.p.px[k.i]; if (k.p2) k.x2 = k.p2.px[k.i2]; });
    D.sort((a, b) => a.ux - b.ux).forEach((k, j) => { k.yl = PIN_Y + 34 + j * 13; });
    const oy = Math.max(300, PIN_Y + 34 + D.length * 13 + 14);
    K.forEach((k) => { if (k.u) k.uy = oy + k.u.y; });
    PP.sort((a, b) => Math.abs(a.x1 - a.x2) - Math.abs(b.x1 - b.x2)).forEach((k, j) => { k.yl = oy + 40 + j * 15; });
    const yA0 = oy + UNO_H + 24;
    A.sort((a, b) => a.ux - b.ux).forEach((k, j) => { k.yl = yA0 + (A.length - 1 - j) * 13; });
    const R0 = Math.max(yA0 + A.length * 13 + 10, oy + 40 + PP.length * 15 + 24, oy + UNO_H + 34);
    const yRay = { "+": R0 + 22, "-": R0 + 48 };
    // aynı uca ikinci kablo gelirse yanından girer
    const ofs = (key) => { kul[key] = (kul[key] || 0) + 1; return (kul[key] - 1) * 8; };
    K.forEach((k) => {
      if (k.tur === "ur") { k.pts = [[k.ux, k.uy], [k.ux, yRay[k.ray]]]; return; }
      const o1 = ofs(k.p.id + "." + k.q.k), xa = k.x1 + o1, bas = o1 ? [[k.x1, PIN_Y], [xa, PIN_Y + 10]] : [[k.x1, PIN_Y]];
      k.o1 = o1;
      if (k.tur === "r") k.pts = [...bas, [xa, yRay[k.ray]]];
      if (k.tur === "d" || k.tur === "a") k.pts = [...bas, [xa, k.yl], [k.ux, k.yl], [k.ux, k.uy]];
      if (k.tur === "p") { const o2 = ofs(k.p2.id + "." + k.q2.k), xb = k.x2 + o2; k.o2 = o2;
        k.pts = [...bas, [xa, k.yl], [xb, k.yl], ...(o2 ? [[xb, PIN_Y + 10], [k.x2, PIN_Y]] : [[k.x2, PIN_Y]])]; }
    });
    K.forEach((k, j) => { k.no = j + 1; });
    const L = { P, K, W, H: R0 + 100, oy, R0, yRay };
    cache.set(dv, L); return L;
  }

  // ---------- SVG ----------
  function unoCiz(L, used) {
    const oy = L.oy;
    let s = `<g transform="translate(${UX},${oy})">`;
    s += `<path d="M0 12 Q0 0 12 0 H${UNO_W - 30} L${UNO_W} 30 V${UNO_H - 12} Q${UNO_W} ${UNO_H} ${UNO_W - 12} ${UNO_H} H12 Q0 ${UNO_H} 0 ${UNO_H - 12}Z" fill="#00878f" stroke="#005c63" stroke-width="3"/>`;
    s += `<rect x="-22" y="46" width="78" height="64" rx="4" fill="#ced4da" stroke="#868e96" stroke-width="2"/><text x="17" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#495057">USB</text>`;
    s += `<rect x="-14" y="${UNO_H - 118}" width="64" height="58" rx="4" fill="#212529"/><circle cx="18" cy="${UNO_H - 89}" r="11" fill="#495057"/>`;
    s += `<circle cx="80" cy="140" r="10" fill="#e9ecef" stroke="#495057" stroke-width="2"/><circle cx="80" cy="140" r="5" fill="#c92a2a"/><text x="80" y="164" text-anchor="middle" font-size="9" fill="#e6fcf5">RESET</text>`;
    s += `<text x="${UNO_W - 30}" y="${UNO_H / 2 + 6}" text-anchor="end" font-size="30" font-weight="800" fill="#fff" fill-opacity=".22" letter-spacing="2">ARDUINO</text><text x="${UNO_W - 30}" y="${UNO_H / 2 + 34}" text-anchor="end" font-size="22" font-weight="800" fill="#fff" fill-opacity=".22">UNO</text>`;
    const grup = (keys, ust) => {
      const xs = keys.map((k) => unoPin(k).x), y = ust ? 10 : UNO_H - 30;
      return `<rect x="${xs[0] - 10}" y="${y}" width="${xs[xs.length - 1] - xs[0] + 20}" height="20" fill="#1b1b1b"/>`;
    };
    s += grup(UST_K.slice(0, 10), true) + grup(UST_K.slice(10), true) + grup(ALT_K.slice(0, 8), false) + grup(ALT_K.slice(8), false);
    UST_K.forEach((k, i) => { const u = unoPin(k), on = used[k];
      s += `<rect x="${u.x - 4}" y="${u.y - 4}" width="8" height="8" fill="${on ? "#fff" : "#5c5f62"}"/>`;
      s += `<text transform="translate(${u.x + 4},34) rotate(90)" font-size="11" font-weight="${on ? 800 : 600}" fill="${on ? "#fff" : "#c3fae8"}">${UST[i]}</text>`; });
    ALT_K.forEach((k, i) => { const u = unoPin(k), on = used[k] || (k === "GND" && used.GND);
      s += `<rect x="${u.x - 4}" y="${u.y - 4}" width="8" height="8" fill="${on ? "#fff" : "#5c5f62"}"/>`;
      if (ALT[i]) s += `<text transform="translate(${u.x + 4},${UNO_H - 34}) rotate(90)" text-anchor="end" font-size="11" font-weight="${on ? 800 : 600}" fill="${on ? "#fff" : "#c3fae8"}">${ALT[i]}</text>`; });
    return s + "</g>";
  }
  function rayCiz(L) {
    const y = L.R0, W = L.W;
    let s = `<rect x="12" y="${y}" width="${W - 24}" height="70" rx="8" fill="#f1f3f5" stroke="#ced4da" stroke-width="2"/><line x1="44" y1="${y + 9}" x2="${W - 44}" y2="${y + 9}" stroke="#e03131" stroke-width="3"/><line x1="44" y1="${y + 61}" x2="${W - 44}" y2="${y + 61}" stroke="#1c7ed6" stroke-width="3"/>`;
    for (let x = 52, i = 0; x < W - 48; x += 16, i++) if (i % 6 !== 5) s += `<rect x="${x - 3}" y="${y + 19}" width="6" height="6" fill="#adb5bd"/><rect x="${x - 3}" y="${y + 45}" width="6" height="6" fill="#adb5bd"/>`;
    [24, W - 24].forEach((x) => { s += `<text x="${x}" y="${y + 30}" text-anchor="middle" font-size="22" font-weight="800" fill="#e03131">+</text><text x="${x}" y="${y + 56}" text-anchor="middle" font-size="22" font-weight="800" fill="#1c7ed6">−</text>`; });
    s += `<text x="${W / 2}" y="${y + 90}" text-anchor="middle" font-size="14" font-weight="700" fill="#495057">BREADBOARD GÜÇ HATTI · üstteki + (kırmızı çizgi) = 5V · alttaki − (mavi çizgi) = GND · aynı hattaki bütün delikler birbirine bağlıdır</text>`;
    return s;
  }
  function parcaCiz(q, used) {
    let s = `<g transform="translate(${q.x},${q.ust})">${q.T.ciz(q.w, q.T.h, q.px.map((x) => x - q.x), q)}</g>`;
    let ad = [q.ad];
    if (q.ad.length * 7.6 > q.w + 26) { const i = q.ad.indexOf(" ("), j = q.ad.indexOf(" + "); ad = i > 0 ? [q.ad.slice(0, i), q.ad.slice(i + 1)] : j > 0 ? [q.ad.slice(0, j), q.ad.slice(j + 1)] : ad; }
    ad.forEach((t, i) => { s += `<text x="${q.x + q.w / 2}" y="${q.ust - 10 - (ad.length - 1 - i) * 16}" text-anchor="middle" font-size="${i ? 12 : 14}" font-weight="${i ? 600 : 800}" fill="#212529">${esc(t)}</text>`; });
    q.T.pins.forEach((z, i) => {
      const x = q.px[i], y0 = q.alt, col = (q.T.bacak || {})[z.k] || "#9aa1a8", on = used[q.id + "." + z.k];
      if (z.kol) { const xk = q.px[q.T.pins.findIndex((y) => y.k === z.kol)], yj = y0 + 12;
        s += `<line x1="${xk}" y1="${yj}" x2="${x}" y2="${yj}" stroke="#9aa1a8" stroke-width="3"/><circle cx="${xk}" cy="${yj}" r="4.5" fill="#495057"/>` + direnc(x, yj, PIN_Y, z.r); }
      else if (z.r) s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 12}" stroke="${col}" stroke-width="3.5"/>` + direnc(x, y0 + 12, PIN_Y, z.r);
      else s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${PIN_Y}" stroke="${col}" stroke-width="${q.T.bacak ? 4 : 3.5}"/>`;
      const tw = Math.max(22, z.e.length * 7.4 + 10);
      s += `<rect x="${x - tw / 2}" y="${PIN_Y - 22}" width="${tw}" height="16" rx="8" fill="${on ? "#fff" : "#f8f9fa"}" stroke="${on ? "#212529" : "#adb5bd"}" stroke-width="${on ? 1.6 : 1}"/><text x="${x}" y="${PIN_Y - 10}" text-anchor="middle" font-size="11" font-weight="800" fill="${on ? "#212529" : "#868e96"}">${esc(z.e)}</text>`;
      s += `<circle cx="${x}" cy="${PIN_Y}" r="3.5" fill="#495057"/>`;
    });
    return s;
  }
  const yolD = (pts) => "M" + pts.map((p) => p.join(" ")).join(" L");
  const rozet = (x, y, n, renk, cls = "") => { const c = RENK[renk][0];
    return `<g class="${cls}"><circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${c === "#f8f9fa" ? "#495057" : c}" stroke-width="3.5"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#212529">${n}</text></g>`; };
  function kabloCiz(k, yeni, soluk) {
    const d = yolD(k.pts), c = RENK[k.renk][0], pl = yeni ? ' pathLength="1"' : "";
    let s = `<g class="dv-k${yeni ? " dv-yeni" : ""}"${soluk ? ' opacity=".42"' : ""}><path d="${d}"${pl} class="dv-c" fill="none" stroke="#1b1b1b" stroke-width="8.5" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}"${pl} class="dv-c" fill="none" stroke="${c}" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    const [a, b] = [k.pts[0], k.pts[k.pts.length - 1]];
    s += `<circle class="dv-uc" cx="${b[0]}" cy="${b[1]}" r="5" fill="${c}" stroke="#1b1b1b" stroke-width="2"/><circle cx="${a[0]}" cy="${a[1]}" r="5" fill="${c}" stroke="#1b1b1b" stroke-width="2"/>`;
    if (yeni) s += `<circle r="8" fill="${c}" stroke="#1b1b1b" stroke-width="2.5"><animateMotion dur="1.7s" fill="freeze" path="${d}"/></circle>`
      + [a, b].map((p) => `<circle class="dv-nabiz" cx="${p[0]}" cy="${p[1]}" r="15" fill="none" stroke="${c === "#f8f9fa" ? "#495057" : c}" stroke-width="4"/>`).join("");
    return s + "</g>";
  }
  function cagri(L, kablolar, yeniNo) { // Arduino üstünde pin etiketleri (kablo no + pin adı)
    let s = "";
    [true, false].forEach((ust) => {
      const Z = kablolar.filter((k) => k.u && k.u.ust === ust).sort((a, b) => a.ux - b.ux), son = [];
      Z.forEach((k) => {
        const t = `${k.u.ad}`, w = 36 + t.length * 10.5, x0 = Math.min(UX + UNO_W - 10 - w / 2, Math.max(UX + 40 + w / 2, k.ux));
        let r = 0, x = x0;
        for (; r < 6; r++) { x = Math.max(x0, son[r] === undefined ? -1e9 : son[r] + 8 + w / 2); if (x - x0 <= 46) break; }
        son[r] = x + w / 2;
        const y = ust ? L.oy + 100 + r * 27 : L.oy + UNO_H - 100 - r * 27, c = RENK[k.renk][0], koyu = ACIK.has(k.renk);
        s += `<g class="${k.no === yeniNo ? "dv-sonra" : ""}"><line x1="${k.ux}" y1="${ust ? L.oy + 64 : L.oy + UNO_H - 64}" x2="${x}" y2="${ust ? y - 11 : y + 11}" stroke="${koyu ? "#495057" : c}" stroke-width="2"/>`
          + `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${c}" stroke="#1b1b1b" stroke-width="1.5"/><circle cx="${x - w / 2 + 12}" cy="${y}" r="9" fill="#fff"/><text x="${x - w / 2 + 12}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#212529">${k.no}</text>`
          + `<text x="${x - w / 2 + 24}" y="${y + 5}" font-size="14" font-weight="800" fill="${koyu ? "#212529" : "#fff"}">${t}</text></g>`;
      });
    });
    return s;
  }
  // o: { adim: kaç kablo görünsün, vurgu: son kablo animasyonlu, cls }
  function svg(dv, o = {}) {
    const L = yerlesim(dv), n = o.adim == null ? L.K.length : o.adim, G = L.K.slice(0, n), yeni = o.vurgu && n ? G[n - 1] : null;
    const used = {}; G.forEach((k) => { if (k.uk) used[k.uk] = 1; if (k.p) used[k.p.id + "." + k.q.k] = 1; if (k.p2) used[k.p2.id + "." + k.q2.k] = 1; });
    let vb = [0, 0, L.W, L.H];
    if (o.yakin && yeni) { // kamera: yeni kablonun iki ucunu ve parçasını içine alan bölge
      const X = [], Y = [], ek = (x, y) => { X.push(x); Y.push(y); };
      yeni.pts.forEach(([x, y]) => ek(x, y));
      [yeni.p, yeni.p2].filter(Boolean).forEach((q) => { ek(q.x - 10, q.ust - 46); ek(q.x + q.w + 10, PIN_Y + 40); });
      if (yeni.u) { ek(yeni.ux - 70, yeni.u.ust ? L.oy - 10 : L.oy + UNO_H - 150); ek(yeni.ux + 70, yeni.u.ust ? L.oy + 150 : L.oy + UNO_H + 12); }
      if (yeni.ray) ek(Math.min(...X), L.R0 + 72);
      let x0 = Math.min(...X) - 30, x1 = Math.max(...X) + 30, y0 = Math.min(...Y) - 20, y1 = Math.max(...Y) + 20;
      const oran = 16 / 8.2; if ((x1 - x0) / (y1 - y0) < oran) { const g = (y1 - y0) * oran, m = (x0 + x1) / 2; x0 = m - g / 2; x1 = m + g / 2; } else { const g = (x1 - x0) / oran, m = (y0 + y1) / 2; y0 = m - g / 2; y1 = m + g / 2; }
      if (x1 - x0 > L.W) { x0 = 0; x1 = L.W; } if (x0 < 0) { x1 -= x0; x0 = 0; } if (x1 > L.W) { x0 -= x1 - L.W; x1 = L.W; }
      if (y1 - y0 > L.H) { y0 = 0; y1 = L.H; } if (y0 < 0) { y1 -= y0; y0 = 0; } if (y1 > L.H) { y0 -= y1 - L.H; y1 = L.H; }
      vb = [x0, y0, x1 - x0, y1 - y0].map((v) => Math.round(v));
    }
    let s = `<svg class="dv${o.cls ? " " + o.cls : ""}" viewBox="${vb.join(" ")}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif" role="img" aria-label="${esc(dv.ad || "Bağlantı şeması")}"><rect width="${L.W}" height="${L.H}" fill="#fbfcfd"/>`;
    s += rayCiz(L) + unoCiz(L, used) + L.P.map((q) => parcaCiz(q, used)).join("");
    G.forEach((k) => { s += kabloCiz(k, k === yeni, yeni && k !== yeni); });
    s += cagri(L, G, yeni && yeni.no);
    G.forEach((k) => { const cls = k === yeni ? "dv-sonra" : "";
      if (k.tur === "ur") { s += rozet(k.ux + 18, L.yRay[k.ray] - 16, k.no, k.renk, cls); return; }
      s += rozet(k.x1 + k.o1, PIN_Y + 18 + (k.o1 ? 18 : 0), k.no, k.renk, cls);
      if (k.tur === "r") s += rozet(k.x1 + k.o1, L.yRay[k.ray] - 16, k.no, k.renk, cls);
      if (k.tur === "p") s += rozet(k.x2 + k.o2, PIN_Y + 18 + (k.o2 ? 18 : 0), k.no, k.renk, cls);
    });
    return s + "</svg>";
  }

  // ---------- gerçek breadboard görünümü (delik delik) ----------
  // Parçalar breadboard'a takılı çizilir; üst + hat = 5V, alt − hat = GND. Modüller (servo, sensör kartları) breadboard'a takılmaz.
  const BS = 24, BX = 170, SATIR = { a: 124, b: 148, c: 172, d: 196, e: 220, f: 268, g: 292, h: 316, i: 340, j: 364 };
  const RAY = { ustEksi: 58, ustArti: 82, altEksi: 406, altArti: 430 };
  const BB_UST = ["a", "b", "c", "d", "e"], BB_ALT = ["f", "g", "h", "i", "j"];
  // bacak: [pin, satır, sütun farkı]; uc: pin → [sütun farkı, "u"(üst yarı) | "a"(alt yarı)]; seri: [satır, sütun1, sütun2, değer]
  const BB = {
    buton: { w: 3, bacak: [["B1", "d", 0], ["", "d", 2], ["", "g", 0], ["B2", "g", 2]], uc: { B1: [0, "u"], B2: [2, "a"], R: [2, "a"] },
      not: "Buton breadboard'un ortasındaki oluğun ÜSTÜNE oturur: 2 bacak oluğun üst yanında, 2 bacak alt yanında. Bacaklar kıvrıksa pense ile düzelt. Tek doğru yönde rahatça oturur; zorlanıyorsa 90° çevir.",
      ciz: (X, Y, c) => { const x0 = X(c) - 15, x1 = X(c + 2) + 15, y0 = Y("d") - 15, y1 = Y("g") + 15, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="6" fill="#343a40" stroke="#111" stroke-width="2" opacity=".93"/><circle cx="${mx}" cy="${my}" r="24" fill="#212529" stroke="#000" stroke-width="2"/><circle cx="${mx - 6}" cy="${my - 6}" r="8" fill="#495057"/>`; } },
    led: { w: 4, bacak: [["A", "f", 2], ["K", "f", 3]], uc: { A: [0, "a"], K: [3, "a"] }, seri: [["h", 0, 2, "220Ω"]],
      not: "LED'in uzun bacağı (+) direncin olduğu sütunda, kısa bacağı (−) yanındaki sütunda. 220Ω direnç aynı yarıda yatay durur.",
      ciz: (X, Y, c, q) => { const col = (RENK[(q && q.led) || "kirmizi"] || RENK.kirmizi)[0], mx = (X(c + 2) + X(c + 3)) / 2;
        return `<circle cx="${mx}" cy="${Y("f") - 20}" r="17" fill="${col}" fill-opacity=".9" stroke="rgba(0,0,0,.45)" stroke-width="2"/><circle cx="${mx - 5}" cy="${Y("f") - 26}" r="5" fill="#fff" opacity=".7"/>`
          + `<text x="${X(c + 2)}" y="${Y("f") + 26}" text-anchor="middle" font-size="10" font-weight="800" fill="#c92a2a">uzun+</text>`; } },
    ldr: { w: 1, bacak: [["L1", "e", 0], ["L2", "f", 0]], uc: { L1: [0, "u"], L2: [0, "a"], R: [0, "a"] },
      not: "LDR'nin bir bacağı oluğun üst yanında, öbürü alt yanında (aynı sütun, oluk ikisini ayırır). Yönü fark etmez.",
      ciz: (X, Y, c) => `<ellipse cx="${X(c)}" cy="${(Y("e") + Y("f")) / 2}" rx="15" ry="13" fill="#f4d58d" stroke="#8a6d3b" stroke-width="2"/><path d="M${X(c) - 9} ${(Y("e") + Y("f")) / 2 - 5} h6 v10 h6 v-10 h6" stroke="#c0392b" stroke-width="2" fill="none"/>` },
    pot: { w: 5, bacak: [["L", "f", 0], ["W", "f", 2], ["R", "f", 4]], uc: { L: [0, "a"], W: [2, "a"], R: [4, "a"] },
      not: "Potansiyometrenin 3 bacağı aynı satırda, aralarında birer delik boşluk.",
      ciz: (X, Y, c) => `<rect x="${X(c) - 12}" y="${Y("e") - 22}" width="${X(c + 4) - X(c) + 24}" height="44" rx="6" fill="#1c63b7" stroke="#0b3d78" stroke-width="2"/><circle cx="${X(c + 2)}" cy="${Y("e")}" r="17" fill="#dee2e6" stroke="#495057" stroke-width="2"/><rect x="${X(c + 2) - 2}" y="${Y("e") - 15}" width="4" height="14" fill="#495057"/>` },
    buzzer: { w: 4, bacak: [["P", "f", 0], ["N", "f", 3]], uc: { P: [0, "a"], N: [3, "a"] },
      not: "Buzzer'ın uzun bacağı (+) solda, kısa bacağı (−) sağda; aynı satırda.",
      ciz: (X, Y, c) => { const mx = (X(c) + X(c + 3)) / 2; return `<circle cx="${mx}" cy="${Y("e") + 6}" r="30" fill="#212529" stroke="#000" stroke-width="2"/><circle cx="${mx}" cy="${Y("e") + 6}" r="5" fill="#495057"/><text x="${X(c)}" y="${Y("e") - 14}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">+</text>`; } },
    tmp36: { w: 3, bacak: [["V", "f", 0], ["O", "f", 1], ["G", "f", 2]], uc: { V: [0, "a"], O: [1, "a"], G: [2, "a"] },
      not: "TMP36'nın düz yüzü sana bakarken: sol bacak +Vs, orta Vout, sağ GND.",
      ciz: (X, Y, c) => `<path d="M${X(c) - 12} ${Y("f") - 8} V${Y("e") - 6} H${X(c + 2) + 12} V${Y("f") - 8} Z" fill="#343a40"/><text x="${X(c + 1)}" y="${Y("e") + 4}" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">TMP36</text>` }
  };
  const bbVar = (dv) => dv.parcalar.some((q) => BB[q.tip]);
  function tahtaYerlesim(dv) {
    const L = yerlesim(dv); if (L.bb) return L.bb;
    let c = 4; const P = [], dolu = new Set(), uclar = {};
    L.P.forEach((q) => { const F = BB[q.tip]; if (!F) return; P.push({ q, F, c }); F.bacak.forEach(([, r, d]) => dolu.add(r + (c + d)));
      (F.seri || []).forEach(([r, a, b]) => { dolu.add(r + (c + a)); dolu.add(r + (c + b)); }); c += F.w + 3; });
    const N = Math.max(18, c), X = (k) => BX + (k - 1) * BS, Y = (r) => SATIR[r];
    const delik = (sut, yari, yukari) => { const s = yari === "u" ? BB_UST : BB_ALT, sira = yukari ? s : s.slice().reverse();
      const r = sira.find((x) => !dolu.has(x + sut)) || sira[0]; dolu.add(r + sut); return r; };
    const W = [], sag = { "+": 0, "-": 0 };
    // önce dirençler (alt deliklere), sonra kablolar
    const sirali = L.K.slice().sort((a, b) => (b.q && b.q.kol ? 1 : 0) - (a.q && a.q.kol ? 1 : 0));
    sirali.forEach((k) => {
      if (k.tur === "ur") { W.push({ k, tur: "ur" }); return; }
      const B = P.find((b) => b.q === k.p);
      if (!B) { if (k.tur === "r") W.push({ k, tur: "mod", ray: k.ray, s: sag[k.ray]++ }); else W.push({ k, tur: "modsin" }); return; }
      const u = B.F.uc[k.q.k]; if (!u) return;
      const sut = B.c + u[0], yari = u[1], yukari = k.tur === "r" && k.ray === "+";
      const r = delik(sut, yari, k.q.kol ? false : yukari);
      W.push({ k, tur: k.q.kol ? "dir" : k.tur === "r" ? "ray" : "ard", sut, r, yari });
    });
    W.sort((a, b) => a.k.no - b.k.no);
    const ard = W.filter((w) => w.tur === "ard").sort((a, b) => a.sut - b.sut); ard.forEach((w, i) => { w.kat = i % 2; });
    return (L.bb = { P, W, N, X, Y, Wd: X(N) + 300, H: 590 });
  }
  function tahta(dv) {
    const T = tahtaYerlesim(dv), { P, W, N, X, Y } = T, xR = X(N) + 16;
    let s = `<svg class="dv dv-tahta" viewBox="0 0 ${T.Wd} ${T.H}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif" role="img" aria-label="Breadboard yerleşimi"><rect width="${T.Wd}" height="${T.H}" fill="#fbfcfd"/>`;
    s += `<rect x="${BX - 34}" y="40" width="${X(N) - BX + 68}" height="410" rx="12" fill="#f8f9fa" stroke="#ced4da" stroke-width="2.5"/>`;
    s += `<rect x="${BX - 34}" y="${SATIR.e + 14}" width="${X(N) - BX + 68}" height="20" fill="#e9ecef"/><text x="${X(N) + 26}" y="${SATIR.e + 29}" font-size="11" font-weight="700" fill="#868e96">oluk</text>`;
    const rayCizgi = (y, renk, isaret, kul) => `<rect x="${BX - 12}" y="${y - 10}" width="${X(N) - BX + 24}" height="20" rx="4" fill="${renk}" opacity="${kul ? .16 : .05}"/><line x1="${BX - 12}" y1="${y + (y < 200 ? -11 : 11)}" x2="${X(N) + 12}" y2="${y + (y < 200 ? -11 : 11)}" stroke="${renk}" stroke-width="2.5" opacity="${kul ? 1 : .3}"/>`
      + `<text x="${BX - 22}" y="${y + 6}" text-anchor="middle" font-size="18" font-weight="800" fill="${renk}" opacity="${kul ? 1 : .35}">${isaret}</text>`;
    s += rayCizgi(RAY.ustEksi, "#1c7ed6", "−", false) + rayCizgi(RAY.ustArti, "#e03131", "+", true) + rayCizgi(RAY.altEksi, "#1c7ed6", "−", true) + rayCizgi(RAY.altArti, "#e03131", "+", false);
    for (let k = 1; k <= N; k++) {
      const x = X(k);
      [RAY.ustEksi, RAY.ustArti, RAY.altEksi, RAY.altArti].forEach((y) => { s += `<rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" rx="1.5" fill="#adb5bd"/>`; });
      Object.values(SATIR).forEach((y) => { s += `<rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" rx="1.5" fill="#868e96"/>`; });
      if (k === 1 || k % 5 === 0) s += `<text x="${x}" y="${SATIR.a - 14}" text-anchor="middle" font-size="11" font-weight="700" fill="#495057">${k}</text><text x="${x}" y="${SATIR.j + 22}" text-anchor="middle" font-size="11" font-weight="700" fill="#495057">${k}</text>`;
    }
    Object.entries(SATIR).forEach(([r, y]) => { s += `<text x="${BX - 22}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#495057">${r}</text><text x="${X(N) + 22}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#495057">${r}</text>`; });
    s += `<text x="12" y="${RAY.ustArti - 26}" font-size="13" font-weight="800" fill="#e03131">üstteki + hat = 5V</text><text x="12" y="${RAY.altEksi + 38}" font-size="13" font-weight="800" fill="#1c7ed6">alttaki − hat = GND</text>`;
    // parçalar
    P.forEach(({ q, F, c }) => {
      (F.seri || []).forEach(([r, a, b, deg]) => { const y = Y(r), x1 = X(c + a), x2 = X(c + b), m = (x1 + x2) / 2, bant = R_BANT[deg] || R_BANT["220Ω"];
        s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#9aa1a8" stroke-width="3"/><rect x="${m - 16}" y="${y - 7}" width="32" height="14" rx="6" fill="#e9d8a6" stroke="#8a6d3b" stroke-width="1.5"/>`
          + bant.map((cl, i) => `<rect x="${m - 11 + i * 7}" y="${y - 7}" width="4" height="14" fill="${cl}"/>`).join("") + `<circle cx="${x1}" cy="${y}" r="4" fill="#495057"/><circle cx="${x2}" cy="${y}" r="4" fill="#495057"/>`
          + `<text x="${m}" y="${y + 20}" text-anchor="middle" font-size="10" font-weight="700" fill="#5c3d0c">${deg}</text>`; });
      s += F.ciz(X, Y, c, q);
      F.bacak.forEach(([, r, d]) => { s += `<circle cx="${X(c + d)}" cy="${Y(r)}" r="5.5" fill="#ced4da" stroke="#212529" stroke-width="2"/>`; });
      const xs = F.bacak.map(([, , d]) => X(c + d)), mx = (Math.min(...xs) + Math.max(...xs)) / 2;
      s += `<text x="${mx}" y="30" text-anchor="middle" font-size="14" font-weight="800" fill="#212529">${esc(q.kisa.charAt(0).toLocaleUpperCase("tr") + q.kisa.slice(1))}</text>`;
    });
    // kablolar
    const kablo = (d, renk) => { const c = RENK[renk][0]; return `<path d="${d}" fill="none" stroke="#1b1b1b" stroke-width="8" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`; };
    const uc = (x, y, renk) => `<circle cx="${x}" cy="${y}" r="5" fill="${RENK[renk][0]}" stroke="#1b1b1b" stroke-width="2"/>`;
    const etiket = (x, y, t, renk, no) => { const c = RENK[renk][0], w = 34 + t.length * 8.2, koyu = ACIK.has(renk);
      return `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${c}" stroke="#1b1b1b" stroke-width="1.5"/><circle cx="${x - w / 2 + 12}" cy="${y}" r="9" fill="#fff"/><text x="${x - w / 2 + 12}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#212529">${no}</text><text x="${x - w / 2 + 25}" y="${y + 5}" font-size="13" font-weight="800" fill="${koyu ? "#212529" : "#fff"}">${esc(t)}</text>`; };
    W.forEach((w) => {
      const k = w.k; if (w.tur === "modsin") return;
      if (w.tur === "ur") { const y = k.ray === "+" ? RAY.ustArti : RAY.altEksi, x = X(1);
        s += kablo(`M${x} ${y} H${BX - 40} L${BX - 60} ${y}`, k.renk) + uc(x, y, k.renk) + etiket(BX - 112, y, `Arduino ${k.uk}`, k.renk, k.no); return; }
      if (w.tur === "mod") { const y0 = w.ray === "+" ? RAY.ustArti : RAY.altEksi, x = X(N - w.s), et = `${k.p.kisa} ${k.q.e}`;
        const ex = X(N) + 206, ey = w.ray === "+" ? 130 + w.s * 30 : y0 - 70 - w.s * 30, xs = ex - (34 + et.length * 8.2) / 2;
        const d = w.ray === "+" ? `M${x} ${y0} C ${x} ${y0 - 34}, ${xs - 20} ${y0 - 30}, ${xs} ${ey}` : `M${x} ${y0} C ${x} ${y0 + 40}, ${xs - 20} ${y0 + 30}, ${xs} ${ey}`;
        s += kablo(d, k.renk) + uc(x, y0, k.renk) + etiket(ex, ey, et, k.renk, k.no); return; }
      const x = X(w.sut), y = Y(w.r);
      if (w.tur === "dir") { const yr = k.ray === "+" ? RAY.ustArti : RAY.altEksi, x2 = X(w.sut + 1), bant = R_BANT[k.q.r] || R_BANT["10kΩ"], mx = (x + x2) / 2, my = (y + yr) / 2;
        const ang = Math.atan2(yr - y, x2 - x) * 180 / Math.PI;
        s += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${yr}" stroke="#9aa1a8" stroke-width="3"/><g transform="translate(${mx},${my}) rotate(${ang})"><rect x="-16" y="-7" width="32" height="14" rx="6" fill="#e9d8a6" stroke="#8a6d3b" stroke-width="1.5"/>${bant.map((cl, i) => `<rect x="${-11 + i * 7}" y="-7" width="4" height="14" fill="${cl}"/>`).join("")}</g>`
          + `<circle cx="${x}" cy="${y}" r="4" fill="#495057"/><circle cx="${x2}" cy="${yr}" r="4" fill="#495057"/><text x="${x2 + 10}" y="${my + 4}" font-size="10" font-weight="700" fill="#5c3d0c">${k.q.r}</text>`
          + rozet(x2 + 14, yr + 18, k.no, k.renk); return; }
      if (w.tur === "ray") { const yr = k.ray === "+" ? RAY.ustArti : RAY.altEksi, karsi = (k.ray === "+") !== (w.yari === "u");
        const d = karsi ? `M${x} ${yr} C ${x - 34} ${yr + (k.ray === "+" ? 60 : -60)}, ${x - 34} ${y + (k.ray === "+" ? -40 : 40)}, ${x} ${y}` : `M${x} ${yr} L${x} ${y}`;
        s += kablo(d, k.renk) + uc(x, yr, k.renk) + uc(x, y, k.renk) + rozet(x + 15, (yr + y) / 2, k.no, k.renk); return; }
      // Arduino pinine giden kablo: üst yarıdan yukarı, alt yarıdan aşağı çıkar
      const asagi = w.yari === "a", ye = asagi ? 482 + w.kat * 34 : 14, xe = x - 16;
      const d = asagi ? `M${x} ${y} C ${x - 18} ${y + 20}, ${xe} ${y + 30}, ${xe} ${RAY.altArti + 20} L${xe} ${ye - 12}` : `M${x} ${y} L${x} ${ye + 12}`;
      s += kablo(d, k.renk) + uc(x, y, k.renk) + etiket(xe, ye, `Arduino ${k.uk}`, k.renk, k.no);
    });
    s += `<text x="${BX - 34}" y="${T.H - 24}" font-size="13" fill="#495057">Aynı sütundaki 5 delik (a-e ya da f-j) içeriden birbirine bağlıdır; oluk iki yarıyı ayırır.</text><text x="${BX - 34}" y="${T.H - 6}" font-size="13" fill="#495057">Kenardaki uzun + ve − hatlar boydan boya bağlıdır. Kablo numaraları yukarıdaki şemayla aynıdır.</text>`;
    return s + "</svg>";
  }
  function tahtaListe(dv) {
    const T = tahtaYerlesim(dv), Z = [];
    T.P.forEach(({ q, F, c }) => {
      const b = F.bacak.map(([, r, d]) => r + (c + d)).join(", ");
      Z.push(`<b>${esc(q.ad)}</b>: bacaklar <b>${b}</b> deliklerine. ${esc(F.not)}`);
      (F.seri || []).forEach(([r, a, bb, deg]) => Z.push(`${deg} direnç: <b>${r}${c + a}</b> ile <b>${r}${c + bb}</b> arasına (yatay).`));
    });
    T.W.forEach((w) => { const k = w.k, rn = RENK[k.renk][1];
      if (w.tur === "ur") Z.push(`${k.no}. kablo (${rn}): Arduino <b>${k.uk}</b> → ${k.ray === "+" ? "üstteki + (kırmızı) hat" : "alttaki − (mavi) hat"}.`);
      else if (w.tur === "mod") Z.push(`${k.no}. kablo (${rn}): ${esc(k.p.iy)} ${esc(k.q.u.replace(/\s*\([^)]*\)/g, ""))} → ${k.ray === "+" ? "üstteki + hat" : "alttaki − hat"} (herhangi bir delik).`);
      else if (w.tur === "modsin") Z.push(`${k.no}. kablo (${rn}): ${esc(k.p.iy)} ${esc(k.q.u.replace(/\s*\([^)]*\)/g, ""))} → ${k.tur === "p" ? esc(hedefMetin(k)) : `Arduino <b>${k.uk}</b>`} (breadboard'a uğramaz).`);
      else if (w.tur === "dir") Z.push(`${k.no}. ${k.q.r} direnç: <b>${w.r}${w.sut}</b> deliğinden ${k.ray === "+" ? "üstteki + hatta" : "alttaki − hatta"}.`);
      else if (w.tur === "ray") Z.push(`${k.no}. kablo (${rn}): <b>${w.r}${w.sut}</b> → ${k.ray === "+" ? "üstteki + hat" : "alttaki − hat"}.`);
      else Z.push(`${k.no}. kablo (${rn}): <b>${w.r}${w.sut}</b> → Arduino <b>${k.uk}</b>.`); });
    return Z;
  }

  // ---------- metinler ----------
  const SIRA1 = ["", "birinci", "ikinci", "üçüncü", "dördüncü", "beşinci", "altıncı", "yedinci", "sekizinci", "dokuzuncu"];
  const sira = (n) => { const t = Math.floor(n / 10), b = n % 10; const s = n === 10 ? "onuncu" : n === 20 ? "yirminci" : n === 30 ? "otuzuncu" : [["", "on ", "yirmi "][t] || ""] + SIRA1[b]; return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1); };
  const renkAd = (r) => RENK[r][1];
  function hedefMetin(k) {
    if (k.tur === "r" || k.tur === "ur") return k.ray === "+" ? "breadboard'un + (kırmızı çizgili) hattına" : "breadboard'un − (mavi çizgili) hattına";
    if (k.tur === "p") return `${k.p2.iy} ${k.q2.u.replace(/ını$|ini$|unu$|ünü$|sını$|sini$/, (m) => ({ "ını": "ına", "ini": "ine", "unu": "una", "ünü": "üne", "sını": "sına", "sini": "sine" }[m]))}`;
    return `Arduino'nun ${k.uk} pinine`;
  }
  function kisaHedef(k) { return k.tur === "r" || k.tur === "ur" ? (k.ray === "+" ? "+ hat (5V)" : "− hat (GND)") : k.tur === "p" ? `${k.p2.kisa} · ${k.q2.e}` : k.uk; }
  function adimlar(dv) {
    const L = yerlesim(dv);
    return L.K.map((k) => {
      let metin, anlat, kaynak, pin;
      if (k.tur === "ur") {
        kaynak = "Arduino"; pin = k.uk;
        metin = `Arduino'nun ${k.uk} pinini ${hedefMetin(k)} bağla.`;
        anlat = `${sira(k.no)} kablo, ${renkAd(k.renk)}. Arduino'nun ${k.uk === "5V" ? "5 volt" : "GND"} pinini breadboard'un ${k.ray === "+" ? "artı" : "eksi"} hattına tak.`;
      } else {
        kaynak = k.p.ad; pin = k.q.e;
        const Iy = k.p.iy.charAt(0).toLocaleUpperCase("tr") + k.p.iy.slice(1);
        const kolU = k.q.kol ? k.p.T.pins.find((y) => y.k === k.q.kol).u.replace(/\s*\([^)]*\)/g, "").replace(/nı$/, "yla") : "";
        metin = k.q.kol ? `${k.q.r} direncin boştaki ucunu ${hedefMetin(k)} bağla. (Direncin öbür ucu ${k.p.iy} ${kolU} aynı dikey sırada.)` : `${Iy} ${k.q.u} ${hedefMetin(k)} bağla.`;
        if (k.q.kol) {}
        else if (k.q.r) metin += ` (Arada ${k.q.r} direnç var: kablo direncin boştaki ucundan çıkar.)`;
        const h = k.tur === "d" || k.tur === "a" ? `Arduino'nun ${pinSoz(k.uk)} pinine` : k.tur === "r" ? `breadboard'un ${k.ray === "+" ? "artı" : "eksi"} hattına` : hedefMetin(k);
        anlat = k.q.kol ? `${sira(k.no)} kablo, ${renkAd(k.renk)}. ${k.q.r.replace("Ω", " ohm").replace("k ", " kilo ")} direncin boştaki ucunu ${h} tak.` : `${sira(k.no)} kablo, ${renkAd(k.renk)}. ${Iy} ${k.q.u.replace(/\s*\([^)]*\)/g, "")} ${h} tak.${k.q.r ? ` Kablo ${k.q.r.replace("Ω", " ohm").replace("k ", " kilo ")} direncin ucundan çıkar.` : ""}`;
      }
      return { no: k.no, renk: k.renk, renkKod: RENK[k.renk][0], renkAd: renkAd(k.renk), kaynak, kaynakKisa: k.p ? k.p.kisa.charAt(0).toLocaleUpperCase("tr") + k.p.kisa.slice(1) : "Arduino", pin, hedef: kisaHedef(k), metin, anlat, tur: k.tur };
    });
  }
  function tablo(dv, kucuk) {
    const A = adimlar(dv);
    return `<table class="dv-tablo${kucuk ? " kucuk" : ""}"><tr><th>No</th><th>Kablo</th><th>Nereden</th><th>Nereye</th></tr>${A.map((a) => `<tr><td><b>${a.no}</b></td><td><span class="dv-renk" style="background:${a.renkKod}"></span>${esc(a.renkAd)}</td><td>${esc(a.kaynak)} · <b>${esc(a.pin)}</b></td><td><b>${esc(a.hedef)}</b></td></tr>`).join("")}</table>`;
  }
  function kontrol(dv) {
    const L = yerlesim(dv), tip = [...new Set(L.P.map((q) => q.tip))];
    const K = ["USB kablosu çıkarıldı; bütün kablolar Arduino elektriksizken takıldı.", "Arduino'nun 5V kablosu + (kırmızı) hatta, GND kablosu − (mavi) hatta. 5V ile GND hiçbir yerde birbirine değmiyor (kısa devre yok)."];
    tip.forEach((t) => { if (PARCA[t].kontrol) K.push(PARCA[t].kontrol); });
    const kod = kodPinleri(dv); if (kod.length) K.push("Koddaki pin numaraları şemayla aynı: " + kod.join(", ") + ".");
    if (dv.not) K.push(dv.not);
    K.push("Her şey tamamsa USB'yi tak. Bir parça ısınırsa ya da yanık kokusu gelirse USB'yi hemen çıkar ve bağlantıları baştan kontrol et.");
    return K;
  }
  function kodPinleri(dv) {
    return yerlesim(dv).K.filter((k) => k.tur === "d" || k.tur === "a").map((k) => `${k.p.kisa} ${k.q.e === "+" ? "" : k.q.e + " "}→ ${k.uk.startsWith("D") ? k.uk.slice(1) : k.uk}`.replace(/\s+/g, " "));
  }
  function yerlestirme(dv) {
    const L = yerlesim(dv), Y = [];
    if (L.K.some((k) => k.tur === "r")) Y.push("Breadboard'u Arduino'nun yanına koy. Kenardaki uzun + (kırmızı) ve − (mavi) hatlar güç hatlarıdır: aynı hattaki bütün delikler birbirine bağlıdır.");
    const gor = new Set();
    L.P.forEach((q) => { const say = L.P.filter((z) => z.tip === q.tip).length, on = say > 1 ? `${q.ad}: ` : "";
      if (q.T.yerlestir) Y.push(on + q.T.yerlestir); else if (q.T.modul && !gor.has(q.tip)) Y.push(`${say > 1 ? q.T.ad + " (" + say + " tane)" : q.ad}: modül olduğu için erkek-dişi jumper kabloyla doğrudan bağlanır; önce üstündeki pin yazılarını oku.`); gor.add(q.tip); });
    return Y;
  }
  function tinkerAdimlar(dv) {
    const L = yerlesim(dv), P = [...new Set(L.P.filter((q) => !q.T.tinkerYok).map((q) => q.T.tinker))];
    const yok = L.P.filter((q) => q.T.tinkerYok).map((q) => q.ad);
    return [
      "tinkercad.com'a gir → Devreler (Circuits) → Yeni Devre oluştur.",
      `Sağdaki Bileşenler panelinde 'Tümü'nü seç, arama kutusuna yazarak şunları sahneye sürükle: Arduino Uno R3, Breadboard Small (küçük breadboard), ${P.join(", ")}.${yok.length ? ` (${yok.join(", ")} Tinkercad'de yok; haftanın Tinkercad devresini kullan.)` : ""}`,
      "Direnç kullandıysan direnci seç, sağ üstteki kutudan değerini yaz (220 Ω, 10 kΩ ya da 1 kΩ).",
      `Kablo çekmek için bir pinin ucuna tıkla, gideceği deliğe ya da pine tıkla. Kabloyu seçip rengini şemadakiyle aynı yap. ${L.K.length} kabloyu şemadaki numara sırasıyla çek.`,
      "Kod → açılan menüden Metin'i seç (uyarıya Devam de). Yapay zekânın yazdığı kodu yapıştır; pin numaralarını şemayla karşılaştır.",
      "Simülasyonu Başlat. Sensörün üstüne tıklayınca çıkan kaydırıcıyla değeri değiştir; alttaki Seri Monitör düğmesiyle değerleri izle."
    ];
  }
  function kablolar(dv) { // ders öncesi hazırlık: kablo sayısı ve renkleri
    const L = yerlesim(dv), ee = {}, ed = {};
    L.K.forEach((k) => { const tur = k.p && k.p.T.kablo === "ED" && (k.tur === "d" || k.tur === "a" || k.tur === "r") ? ed : ee; tur[k.renk] = (tur[k.renk] || 0) + 1; });
    const yaz = (o) => Object.entries(o).map(([r, n]) => `${n} ${renkAd(r)}`).join(", "), say = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    return [say(ee) ? `${say(ee)} erkek-erkek jumper kablo (${yaz(ee)})` : "", say(ed) ? `${say(ed)} erkek-dişi jumper kablo (${yaz(ed)})` : ""].filter(Boolean).join(" + ");
  }
  function nasil(dv) { return [...new Set(yerlesim(dv).P.map((q) => q.tip))].map((t) => ({ ad: PARCA[t].ad, metin: PARCA[t].nasil })).filter((x) => x.metin); }
  function parcaListesi(dv) { return yerlesim(dv).P.map((q) => q.ad + (q.T.pins.some((z) => z.r) ? ` + ${[...new Set(q.T.pins.filter((z) => z.r).map((z) => z.r))].join(", ")} direnç` : "")); }

  // ---------- slaytlar (öğrenci sunumu / video) ----------
  // bolum: "nasil" (parçaları tanı) | "baglanti" (kablo kablo) | boş: ikisi; vi: yalnız bu devre
  function slaytlar(no, sl, bolum, vi_) {
    const V = H[no]; if (!V) return [];
    const S = [];
    if (bolum !== "baglanti") nasil(V[0]).forEach((x) => S.push(sl("bilgi", `<div class="etiket">Parçayı tanı · Nasıl çalışır?</div><h2>${esc(x.ad)}</h2><p>${esc(x.metin)}</p>`, `${x.ad}. ${x.metin}`)));
    if (bolum === "nasil") return S;
    V.forEach((dv, vi) => {
      if (vi_ != null && vi !== vi_) return;
      const L = yerlesim(dv), A = adimlar(dv), ust = V.length > 1 ? dv.ad : "Bağlantı";
      S.push(sl("devre", `<div class="etiket">${esc(ust)} · Bütün devre</div><div class="dv-sahne">${svg(dv)}</div><p class="dv-alt">${L.K.length} kablo · Her kablonun iki ucunda aynı numara var. Şimdi kabloları tek tek takacağız.</p>`,
        `${dv.ad}. Bu devrede ${L.K.length} kablo var. Her kablonun iki ucunda aynı numara yazıyor. Önce USB kablosunu çıkar, sonra kabloları sırayla tak.`));
      const Y = yerlestirme(dv);
      if (Y.length) S.push(sl("liste", `<div class="etiket">${esc(ust)} · Önce parçaları yerleştir</div><ul>${Y.map((y) => `<li>${esc(y)}</li>`).join("")}</ul>`, "Önce parçaları yerleştir. " + Y.join(" ")));
      A.forEach((a, i) => S.push(sl("devre", `<div class="dv-ust"><span class="dv-no" style="--k:${a.renkKod}">${a.no}<small>/${A.length}</small></span><div><div class="etiket">${esc(ust)} · ${a.no}. kablo · ${esc(a.renkAd)}</div>
          <h2 class="dv-baslik"><span>${esc(a.kaynak)} <b>${esc(a.pin)}</b></span><i>→</i><span><b>${esc(a.hedef)}</b></span></h2></div></div>
        <div class="dv-sahne">${svg(dv, { adim: i + 1, vurgu: true, yakin: true })}</div><p class="dv-alt">${esc(a.metin)}</p>`, a.anlat)));
      const KL = kontrol(dv);
      S.push(sl("liste", `<div class="etiket">${esc(ust)} · USB'yi takmadan önce kontrol et</div><ul class="dv-kontrol">${KL.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`, "USB'yi takmadan önce kontrol et. " + KL.join(" ")));
    });
    return S;
  }

  // ---------- ders akışı (Kazanım ve Etkinlik / günlük plan) ----------
  function ders(k) {
    const V = H[k.no]; if (!V) return null;
    const dv = V[0], tv = V.find((x) => x.tinker) || dv, A = adimlar(dv), kod = kodPinleri(dv), N = nasil(dv);
    return [
      { baslik: "1. ders · Giriş: büyük soru ve parçayı tanıma (10 dk)", kisa: `Büyük soruyu tartış. Sonra bu haftanın parçalarını tanı: ${N.map((x) => x.ad).join(", ")}.`,
        metin: `Büyük soru tartışılır (1 dk sessiz düşünme, sonra eşle paylaşma). Parçalar elden ele dolaştırılır ve tahtada “Nasıl çalışır?” slaytlarıyla anlatılır: ${N.map((x) => `${x.ad}: ${x.metin}`).join(" ")}` },
      { baslik: "1. ders · Kâğıt aşaması (15 dk)", kisa: `${k.kagit} Bağlantı Şeması kâğıdındaki pin tablosunu doldur.`,
        metin: `${k.kagit} Bağlantı Şeması kâğıdında ${A.length} kablonun tablosu doldurulur: öğrenci her parçanın hangi pinden hangi Arduino pinine gittiğini kendi yazar (${kod.join(", ")}; güç kabloları + ve − hatlara). Sonra öğretmenle şemadan kontrol edilir.` },
      { baslik: "1. ders · Tinkercad (15 dk)", kisa: `${k.tinker} Kabloları şemadaki numara sırasıyla çek.`,
        metin: `${k.tinker}${tv !== dv ? ` Tinkercad'de “${tv.ad}” kurulur.` : ""} Adımlar: ${tinkerAdimlar(tv).map((x, i) => `${i + 1}) ${x}`).join(" ")}` },
      { baslik: "2. ders · Yapay zekâ ile kod (10 dk)", kisa: k.prompt === "—" ? "Bu hafta prompt yazımı yok." : `Prompt'unu yaz: pinler, koşullar ve süreler açık olsun. Gelen kodda pinleri kontrol et: ${kod.join(", ")}.`,
        metin: k.prompt === "—" ? "Bu hafta prompt yazımı yok; sunum ve paylaşım yapılır." : `Örnek prompt: “${k.prompt}” Öğrenciler kendi prompt'unu yazar. Gelen kodda önce pin satırları bulunur (const int / #define) ve şemayla karşılaştırılır: ${kod.join(", ")}. Sonra kod satır satır sesli okunur; anlaşılmayan satır yapay zekâya “bu satır ne yapıyor?” diye sorulur.` },
      { baslik: `2. ders · Gerçek devre: ${A.length} kabloyu sırayla tak (20 dk)`, kisa: `USB çıkarken kabloları numara sırasıyla tak, kontrol listesini işaretle, sonra USB'yi tak. ${k.gercek}`,
        metin: `USB kablosu çıkarken kablolar şemadaki sırayla takılır (sunumdaki kablo slaytları her kabloyu tek tek gösterir): ${A.map((a) => `${a.no}) ${a.renkAd}: ${a.kaynak} ${a.pin} → ${a.hedef}`).join("; ")}. Takmadan önce: ${yerlestirme(dv).join(" ")} Bitince kontrol listesi işaretlenir, öğretmen onayından sonra USB takılır. ${k.gercek}` },
      { baslik: "2. ders · Test, hata ayıklama ve paylaşım (10 dk)", kisa: `Test tablosunu doldur. Çalışmazsa önce kabloları numara numara kontrol et. Geliştir: ${k.gelistir}`,
        metin: `Test tablosu doldurulur (${(Array.isArray(k.test.rows) ? k.test.rows.map((r) => r[0]) : []).join(", ")}). Çalışmayan devrede sıra: 1) kablolar numara numara şemayla karşılaştırılır, 2) koddaki pin numaraları kontrol edilir, 3) Seri Monitörde sensör değeri okunur. Hızlı bitirenler: ${k.gelistir} Çıkış bileti yazılır.` }
    ];
  }

  // ---------- çalışma kâğıdı: bağlantı şeması sayfası ----------
  function kagit(no) {
    const V = H[no]; if (!V) return [];
    return V.map((dv) => ({ baslik: `${dv.ad.toLocaleUpperCase("tr")} · BAĞLANTI ŞEMASI`, yonerge: `■ Kablolar USB çıkarken, numara sırasıyla takılır. Her kablonun iki ucunda aynı numara var. Taktığın kablonun kutusunu işaretle.`,
      bloklar: [{ t: "html", x: `<div class="dv-kagit">${svg(dv, { cls: "baski" })}</div>${tabloIsaretli(dv)}<b class="dv-kk-b">USB'yi takmadan önce kontrol et:</b><ul class="dv-kk">${kontrol(dv).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` }] }));
  }
  function tabloIsaretli(dv) {
    const A = adimlar(dv), iki = A.length > 5, satir = (a) => `<tr><td><b>${a.no}</b></td><td><span class="dv-renk" style="background:${a.renkKod}"></span>${esc(a.renkAd)}</td><td>${esc(a.kaynakKisa)} · <b>${esc(a.pin)}</b></td><td><b>${esc(a.hedef)}</b></td><td class="dv-kutu">☐</td></tr>`;
    const bas_ = `<tr><th>No</th><th>Kablo</th><th>Nereden</th><th>Nereye</th><th>✓</th></tr>`;
    if (!iki) return `<table class="dv-tablo kucuk">${bas_}${A.map(satir).join("")}</table>`;
    const y = Math.ceil(A.length / 2);
    return `<div class="dv-iki"><table class="dv-tablo kucuk">${bas_}${A.slice(0, y).map(satir).join("")}</table><table class="dv-tablo kucuk">${bas_}${A.slice(y).map(satir).join("")}</table></div>`;
  }

  return { PARCA, H, RENK, unoPin, yerlesim, svg, adimlar, tablo, kontrol, kodPinleri, yerlestirme, tinkerAdimlar, kablolar, nasil, parcaListesi, slaytlar, ders, kagit, tahta, tahtaListe, bbVar, var: (no) => !!H[no] };
})();
