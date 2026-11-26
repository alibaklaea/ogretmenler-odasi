// Ders Tekrarı / Ödev: öğrenci haftanın devresini sanal breadboard'a kendisi kurar, hazır kodu yükler,
// sistem devreyi elektriksel olarak çözer: çalışıyorsa LED yanar, değilse hatanın yerini söyler.
// Öğrenci bilgisi hiçbir yere gönderilmez: yalnız bu tarayıcıda durur; bitince öğretmene tamamlama kodu verilir.
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const oku = (k, v) => { try { const x = localStorage.getItem(k); return x == null ? v : JSON.parse(x); } catch (e) { return v; } };
  const yazK = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const toast = (t) => { const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); };

  // ---------- geometri ----------
  const W = 1000, H = 790, P = 28, NC = 30;
  const X = (c) => 92 + (c - 1) * P;
  const SAT = { a: 404, b: 432, c: 460, d: 488, e: 516, f: 572, g: 600, h: 628, i: 656, j: 684 };
  const RAY = { "ust-": 338, "ust+": 364, "alt-": 722, "alt+": 748 }; // üst + hat = 5V, alt − hat = GND (alışkanlık; hepsi kullanılabilir)
  const UST = "abcde", ALT = "fghij";
  // Arduino Uno pinleri (USB solda; dijital üstte, güç ve analog altta)
  const PIN = {};
  [["SCL", "SCL"], ["SDA", "SDA"], ["AREF", "AREF"], ["GND", "GND3"], ["13", "D13"], ["12", "D12"], ["~11", "D11"], ["~10", "D10"], ["~9", "D9"], ["8", "D8"]]
    .forEach(([e, id], i) => { PIN[id] = { x: 172 + i * 22, y: 46, e, ust: true }; });
  [["7", "D7"], ["~6", "D6"], ["~5", "D5"], ["4", "D4"], ["~3", "D3"], ["2", "D2"], ["TX→1", "D1"], ["RX←0", "D0"]]
    .forEach(([e, id], i) => { PIN[id] = { x: 408 + i * 22, y: 46, e, ust: true }; });
  [["IOREF", "IOREF"], ["RESET", "RESET"], ["3.3V", "3V3"], ["5V", "5V"], ["GND", "GND1"], ["GND", "GND2"], ["VIN", "VIN"]]
    .forEach(([e, id], i) => { PIN[id] = { x: 252 + i * 22, y: 274, e, ust: false }; });
  ["A0", "A1", "A2", "A3", "A4", "A5"].forEach((e, i) => { PIN[e] = { x: 420 + i * 22, y: 274, e, ust: false }; });
  const pinAd = (id) => { const p = PIN[id]; if (!p) return id; if (/^GND/.test(id)) return "GND"; if (/^D\d/.test(id)) return id.slice(1) + " numaralı pin"; return p.e; };

  function xy(p) { // nokta kimliği → koordinat
    if (p.startsWith("U:")) { const q = PIN[p.slice(2)]; return [q.x, q.y]; }
    const m = p.match(/^(ust[-+]|alt[-+])(\d+)$/); if (m) return [X(+m[2]), RAY[m[1]]];
    return [X(+p.slice(1)), SAT[p[0]]];
  }
  const delikAd = (p) => p.startsWith("U:") ? "Arduino " + pinAd(p.slice(2)) : /^(ust|alt)/.test(p) ? (p.startsWith("ust") ? "üst " : "alt ") + (p[3] === "+" ? "+ hat" : "− hat") : p;
  const uzak = (a, b) => { const [x1, y1] = xy(a), [x2, y2] = xy(b); return Math.hypot(x1 - x2, y1 - y2) / P; };

  // ---------- haftalar: malzeme, görev, kontrol kuralları ----------
  const TEKRAR = {
    8: {
      ad: "Butonla LED yak", hedef: "Butona basınca LED yansın, bırakınca sönsün.",
      malzeme: { buton: 1, led: 1, r220: 1, r10k: 1 },
      gorev: ["Butonu breadboard'un ortasındaki oluğun ÜSTÜNE tak.", "LED'i ve 220Ω direnci tak; LED'in uzun bacağı (+) dirence, direnç Arduino'nun 12 numaralı pinine gitsin.", "Butonun bir tarafı 5V'a, çapraz bacağı Arduino'nun 2 numaralı pinine gitsin; aynı taraftan 10kΩ direnç GND'ye inşin.", "Arduino 5V'u + hatta, GND'yi − hatta bağla.", "⚡ Kodu yükle'ye bas, sonra butona basarak dene."],
      kontrol: kontrol8,
      calis: (G) => { const d2 = G.oku("D2"); G.yaz("D12", d2); G.seri(d2 === null ? (Math.random() < .5 ? 1 : 0) : d2); }
    }
  };

  // ---------- durum ----------
  // SUNUCU: sayfa Google Apps Script üzerinden açıldıysa sonuçlar öğretmenin Google tablosuna yazılır
  const SUNUCU = !!(window.google && google.script && google.script.run);
  const sunucu = (fn, ...a) => new Promise((ok, red) => { if (!SUNUCU) return red(new Error("sunucu yok")); google.script.run.withSuccessHandler(ok).withFailureHandler(red)[fn](...a); });
  const q = new URLSearchParams(location.search), HN = window.TEKRAR_H || +q.get("h") || 0, HD = TEKRAR[HN];
  const ogr = oku("tekrar.ogrenci", null);
  const KAYIT = "tekrar.devre." + HN + "." + (ogr ? ogr.kod || ogr.ad : "");
  const kayitGonder = (olay, ek = {}) => { if (SUNUCU && ogr && ogr.kod) sunucu("kayit", Object.assign({ kod: ogr.kod, hafta: HN, olay, deneme: S.yuklendi, ipucu: S.ipucu }, ek)).catch(() => {}); };
  let S = { el: oku(KAYIT, []), mod: "kablo", renk: "kirmizi", bekle: null, sec: null, basili: false, calisiyor: false, yuklendi: 0, ipucu: 0, vurgu: [], led: {}, bitti: false };
  const RENKLER = { kirmizi: "#e03131", siyah: "#2b2b2b", turuncu: "#fd7e14", sari: "#fcc419", yesil: "#2f9e44", mavi: "#1c7ed6", mor: "#7048e8", beyaz: "#f1f3f5" };
  const kaydet = () => yazK(KAYIT, S.el);

  // ---------- elektrik: noktaları birleştir (union-find) ----------
  function ag(basili) {
    const ust = {}; const bul = (a) => { while (ust[a] && ust[a] !== a) a = ust[a]; return a; };
    const bir = (a, b) => { a = bul(a); b = bul(b); if (a !== b) ust[a] = b; };
    const dugum = (p) => p.startsWith("U:GND") ? "U:GND" : p;
    for (let c = 1; c <= NC; c++) { for (let i = 1; i < 5; i++) { bir(UST[i] + c, UST[0] + c); bir(ALT[i] + c, ALT[0] + c); }
      Object.keys(RAY).forEach((r) => bir(r + c, r + 1)); }
    S.el.forEach((e) => {
      if (e.t === "kablo") bir(dugum(e.a), dugum(e.b));
      if (e.t === "buton") { bir("d" + e.c, "g" + e.c); bir("d" + (e.c + 2), "g" + (e.c + 2)); if (basili) bir("d" + e.c, "d" + (e.c + 2)); }
    });
    return { kok: (p) => bul(dugum(p)), ayni: (a, b) => bul(dugum(a)) === bul(dugum(b)) };
  }
  const elemanlar = (t) => S.el.filter((e) => e.t === t);
  const direncler = (deg) => S.el.filter((e) => e.t === "r" && (!deg || e.deg === deg));
  // net A ile net B arasında (doğrudan ya da tek bir direnç üzerinden) yol var mı? döner: null | {r: direnç ya da null}
  function yol(N, a, b) {
    if (N.kok(a) === N.kok(b)) return { r: null };
    for (const r of direncler()) { const ka = N.kok(r.a), kb = N.kok(r.b);
      if ((ka === N.kok(a) && kb === N.kok(b)) || (kb === N.kok(a) && ka === N.kok(b))) return { r }; }
    return null;
  }
  // bir netin Arduino'da hangi pinlere dokunduğu
  const pinleri = (N, p) => Object.keys(PIN).filter((id) => N.ayni("U:" + id, p) && !/^GND/.test(id)).map((id) => id);
  const kartaDokunuyor = (N, pin) => { const k = N.kok("U:" + pin); for (let c = 1; c <= NC; c++) { for (const r of [...UST, ...ALT]) if (N.kok(r + c) === k) return true; for (const r of Object.keys(RAY)) if (N.kok(r + c) === k) return true; } return false; };

  // ---------- 8. hafta kontrolü: hata listesi (öncelik sırasıyla) ----------
  function kontrol8() {
    const H_ = [], N = ag(false), Nb = ag(true);
    const ekle = (m, v = []) => H_.push({ m, v });
    if (N.ayni("U:5V", "U:GND")) { ekle("⚠️ KISA DEVRE: 5V ile GND birbirine bağlı! Gerçek devrede Arduino zarar görür. Kırmızı (5V) ve siyah (GND) kablolarını kontrol et.", kabloIdx((e) => N.ayni(e.a, "U:5V"))); return H_; }
    if (Nb.ayni("U:5V", "U:GND")) { ekle("⚠️ Butona basınca KISA DEVRE oluyor: butonun bir tarafı 5V'a, öbür tarafı doğrudan GND'ye bağlı. GND'ye giden yol 10kΩ dirençten geçmeli.", butonIdx()); return H_; }
    if (!kartaDokunuyor(N, "5V")) ekle("Arduino'nun 5V pini breadboard'a bağlı değil. 5V'tan + (kırmızı çizgili) hatta bir kablo tak.", ["U:5V"]);
    if (!kartaDokunuyor(N, "GND1") && !kartaDokunuyor(N, "GND2") && !kartaDokunuyor(N, "GND3")) ekle("Arduino'nun GND pini breadboard'a bağlı değil. GND'den − (mavi çizgili) hatta bir kablo tak.", ["U:GND1"]);
    const B = elemanlar("buton")[0], L = elemanlar("led")[0];
    const eksik = [];
    if (!B) eksik.push("buton"); if (!L) eksik.push("LED"); if (!direncler("220Ω").length) eksik.push("220Ω direnç"); if (!direncler("10kΩ").length) eksik.push("10kΩ direnç");
    if (eksik.length) ekle(`Malzeme kutusunda takılmamış parça var: ${eksik.join(", ")}.`);
    if (B) {
      const s1 = "d" + B.c, s2 = "d" + (B.c + 2);
      const t5 = N.ayni(s1, "U:5V") ? s1 : N.ayni(s2, "U:5V") ? s2 : null, td = N.ayni(s1, "U:D2") ? s1 : N.ayni(s2, "U:D2") ? s2 : null;
      if (t5 && td && t5 === td) ekle("5V ile 2 numaralı pin butonun AYNI tarafında: butona basmasan da pin hep 1 olur. Kabloları butonun ÇAPRAZ bacaklarına bağla (bir taraf 5V, öbür taraf 2. pin).", [s1, s2]);
      else {
        if (!t5) ekle("Butonun hiçbir tarafı 5V'a bağlı değil. Butonun bir bacağının sütunundan + hatta kablo tak.", ["d" + B.c, "d" + (B.c + 2)]);
        if (!td) { const obur = t5 === s1 ? s2 : s1, yanlis = pinleri(N, obur).filter((x) => /^D\d/.test(x) || /^A\d/.test(x));
          ekle(yanlis.length ? `Butonun öbür tarafı Arduino'nun ${pinAd(yanlis[0])}ine gidiyor; 2 numaralı pine gitmeli. (Karttaki pin yazılarına dikkat: 2, "TX→1" ve "RX←0"ın hemen yanında.)` : "Butonun öbür tarafı (5V'un çaprazı) Arduino'nun 2 numaralı pinine bağlı değil.", [obur, "U:D2"]); }
      }
      if (td) { const ac = yol(N, "U:D2", "U:GND");
        if (!ac) ekle("2 numaralı pin boşta kalıyor: butona basılmayınca pin GND'yi görmeli. 2. pinin bağlı olduğu sütundan 10kΩ direnci − hatta tak.", ["U:D2"]);
        else if (ac.r && ac.r.deg !== "10kΩ") ekle("2. pin ile GND arasındaki direnç 10kΩ olmalı (kahverengi-siyah-turuncu). Şu an 220Ω takılı.", [S.el.indexOf(ac.r)]);
        else if (!ac.r) ekle("2 numaralı pin doğrudan GND'ye bağlı: butona basınca kısa devre olur. Arada 10kΩ direnç olmalı.", ["U:D2"]); }
    }
    if (L) {
      const li = S.el.indexOf(L);
      if (N.ayni(L.a, L.k)) ekle("LED'in iki bacağı aynı sütunda (ya da aynı hatta): bacaklar içeriden birleşiyor, LED yanmaz. Bacakları yan yana iki farklı sütuna tak.", [li]);
      else {
        const ileri = yol(N, "U:D12", L.a) && yol(N, L.k, "U:GND"), ters = yol(N, "U:D12", L.k) && yol(N, L.a, "U:GND");
        if (ters && !ileri) ekle("LED ters takılmış: uzun bacak (+) 12. pin tarafına, kısa bacak (−) GND'ye gelmeli. LED'i silip doğru yönde yeniden tak.", [li]);
        else {
          const y1 = yol(N, "U:D12", L.a), y2 = yol(N, L.k, "U:GND");
          if (!y2) ekle("LED'in kısa bacağı (−) GND'ye bağlı değil. Kısa bacağın sütunundan − hatta kablo tak.", [L.k]);
          if (!y1) { const yanlis = pinleri(N, L.a).concat(direncler().filter((r) => N.ayni(r.a, L.a) || N.ayni(r.b, L.a)).flatMap((r) => pinleri(N, N.ayni(r.a, L.a) ? r.b : r.a))).filter((x) => /^D\d|^A\d/.test(x));
            ekle(yanlis.length ? `LED tarafı Arduino'nun ${pinAd(yanlis[0])}ine gidiyor; 12 numaralı pine gitmeli.` : "LED'in uzun bacağı (+) 220Ω direnç üzerinden Arduino'nun 12 numaralı pinine bağlı değil.", [L.a, "U:D12"]); }
          if (y1 && y2 && !y1.r && !y2.r) ekle("LED'e direnç takılmamış! Sanal devrede yanar ama gerçek LED bozulabilir. 220Ω direnci LED ile 12. pin arasına koy.", [li]);
          const rr = (y1 && y1.r) || (y2 && y2.r); if (rr && rr.deg !== "220Ω") ekle("LED'in direnci 220Ω olmalı (kırmızı-kırmızı-kahverengi). 10kΩ ile LED çok sönük yanar.", [S.el.indexOf(rr)]);
        }
      }
    }
    return H_;
  }
  const kabloIdx = (f) => S.el.map((e, i) => e.t === "kablo" && f(e) ? i : -1).filter((i) => i >= 0);
  const butonIdx = () => S.el.map((e, i) => e.t === "buton" ? i : -1).filter((i) => i >= 0);

  // ---------- benzetim: kod çalışır, pin seviyeleri devreden okunur ----------
  function pinOku(pin) { // 1, 0 ya da null (boşta, kararsız)
    const N = ag(S.basili);
    if (N.ayni("U:" + pin, "U:5V")) return 1;
    const g = yol(N, "U:" + pin, "U:GND"); if (g) return 0;
    if (yol(N, "U:" + pin, "U:5V")) return 1;
    return null;
  }
  function ledler(cikis) { // çıkış pinleri: {D12: 1}
    const N = ag(S.basili), yanan = {};
    elemanlar("led").forEach((L) => { const i = S.el.indexOf(L); if (N.ayni(L.a, L.k)) return;
      const yuksek = Object.keys(cikis).filter((p) => cikis[p] === 1).some((p) => yol(N, "U:" + p, L.a)) || yol(N, "U:5V", L.a);
      yanan[i] = !!(yuksek && yol(N, L.k, "U:GND")); });
    return yanan;
  }
  let dongu = null, seriSay = 0;
  function calistir() {
    const cik = {};
    const G = { oku: pinOku, yaz: (p, v) => { cik[p] = v === null ? (Math.random() < .5 ? 1 : 0) : v; }, seri: (v) => { if (++seriSay % 4 === 0) seriYaz(String(v)); } };
    HD.calis(G);
    S.led = ledler(cik); ciz();
    if (S.hatasiz && S.basili && Object.values(S.led).some(Boolean)) S.gordu = true;
    if (S.hatasiz && S.gordu && !S.basili && !Object.values(S.led).some(Boolean) && !S.bitti) { S.bitti = true; bitir(); }
  }
  function seriYaz(t) { const s = $("#seri"); s.textContent = (s.textContent + t + "\n").split("\n").slice(-40).join("\n"); s.scrollTop = 1e9; }

  // ---------- çizim ----------
  function ciz() {
    let s = `<rect width="${W}" height="${H}" fill="#fbfcfd"/>`;
    // Arduino
    s += `<rect x="40" y="20" width="560" height="280" rx="16" fill="#0f8a8d" stroke="#0b6b6d" stroke-width="3"/><rect x="8" y="70" width="70" height="66" rx="5" fill="#ced4da" stroke="#868e96" stroke-width="2"/><text x="43" y="108" text-anchor="middle" font-size="13" font-weight="700" fill="#495057">USB</text>`
      + `<rect x="12" y="200" width="56" height="62" rx="6" fill="#212529"/><text x="330" y="170" text-anchor="middle" font-size="40" font-weight="800" fill="#5fc4c6" opacity=".8">ARDUINO</text><text x="470" y="206" text-anchor="middle" font-size="26" font-weight="800" fill="#5fc4c6" opacity=".8">UNO</text>`
      + `<rect x="160" y="34" width="228" height="24" rx="3" fill="#1b1b1b"/><rect x="396" y="34" width="184" height="24" rx="3" fill="#1b1b1b"/><rect x="240" y="262" width="164" height="24" rx="3" fill="#1b1b1b"/><rect x="408" y="262" width="142" height="24" rx="3" fill="#1b1b1b"/>`;
    Object.entries(PIN).forEach(([id, p]) => { const dolu = S.el.some((e) => e.a === "U:" + id || e.b === "U:" + id);
      s += `<rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" fill="${dolu ? "#fcc419" : "#555"}"/>`
        + `<text transform="translate(${p.x + 4},${p.ust ? 66 : 254}) rotate(-90)" text-anchor="${p.ust ? "end" : "start"}" font-size="${/^D[0-9]$|^D1[0-3]$/.test(id) ? 13 : 11}" font-weight="800" fill="#fff">${esc(p.e)}</text>`; });
    // malzeme kutusu
    s += kutu();
    // breadboard
    s += `<rect x="40" y="316" width="${X(NC) - 40 + 52}" height="456" rx="14" fill="#f1f3f5" stroke="#ced4da" stroke-width="2.5"/><rect x="40" y="${SAT.e + 16}" width="${X(NC) - 40 + 52}" height="24" fill="#dee2e6"/>`;
    [["ust-", "#1c7ed6", "−"], ["ust+", "#e03131", "+"], ["alt-", "#1c7ed6", "−"], ["alt+", "#e03131", "+"]].forEach(([r, c, i]) => { const y = RAY[r], ic = r === "ust+" || r === "alt-";
      s += `<line x1="${X(1) - 10}" y1="${y + (r.startsWith("ust") ? (r === "ust-" ? -13 : 13) : (r === "alt-" ? -13 : 13))}" x2="${X(NC) + 10}" y2="${y + (r.startsWith("ust") ? (r === "ust-" ? -13 : 13) : (r === "alt-" ? -13 : 13))}" stroke="${c}" stroke-width="2.5"/>`
        + `<text x="58" y="${y + 6}" text-anchor="middle" font-size="20" font-weight="800" fill="${c}">${i}</text>`; });
    s += `<text x="${X(NC) + 30}" y="${RAY["ust+"] + 5}" font-size="11" font-weight="700" fill="#e03131" text-anchor="middle">5V</text><text x="${X(NC) + 30}" y="${RAY["alt-"] + 5}" font-size="11" font-weight="700" fill="#1c7ed6" text-anchor="middle">GND</text>`;
    for (let c = 1; c <= NC; c++) { if (c === 1 || c % 5 === 0) s += `<text x="${X(c)}" y="${SAT.a - 14}" text-anchor="middle" font-size="12" font-weight="700" fill="#495057">${c}</text><text x="${X(c)}" y="${SAT.j + 24}" text-anchor="middle" font-size="12" font-weight="700" fill="#495057">${c}</text>`; }
    Object.entries(SAT).forEach(([r, y]) => { s += `<text x="66" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#495057">${r}</text>`; });
    const noktalar = [];
    for (let c = 1; c <= NC; c++) { Object.keys(SAT).forEach((r) => noktalar.push(r + c)); Object.keys(RAY).forEach((r) => noktalar.push(r + c)); }
    noktalar.forEach((p) => { const [x, y] = xy(p); s += `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2" fill="#868e96"/>`; });
    // elemanlar
    S.el.forEach((e, i) => { s += `<g data-e="${i}" class="${S.vurgu.includes(i) ? "vurgu-hata" : ""}">${elemanCiz(e, i)}</g>`; });
    // bekleyen ilk uç
    if (S.bekle) { const [x, y] = xy(S.bekle); s += `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#f08c00" stroke-width="4"/>`; }
    // hata vurguları (nokta)
    S.vurgu.filter((v) => typeof v === "string").forEach((p) => { const [x, y] = xy(p); s += `<circle class="vurgu-hata" cx="${x}" cy="${y}" r="16" fill="none" stroke="#d6336c" stroke-width="5"/>`; });
    // dokunma hedefleri (en üstte, görünmez)
    noktalar.concat(Object.keys(PIN).map((id) => "U:" + id)).forEach((p) => { const [x, y] = xy(p); s += `<circle data-p="${p}" cx="${x}" cy="${y}" r="${p.startsWith("U:") ? 10 : 13}" fill="transparent"/>`; });
    // buton kapağı benzetimde basılabilir: hedeflerin üstünde
    if (S.calisiyor) S.el.forEach((e, i) => { if (e.t === "buton") { const [x1, y1] = xy("d" + e.c), [x2, y2] = xy("g" + (e.c + 2)); s += `<circle data-bas="${i}" cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="34" fill="transparent" style="cursor:pointer"/>`; } });
    $("#sahne").innerHTML = s;
  }
  function kutu() {
    const M = HD.malzeme, kalan = { buton: M.buton - elemanlar("buton").length, led: M.led - elemanlar("led").length, r220: M.r220 - direncler("220Ω").length, r10k: M.r10k - direncler("10kΩ").length };
    let s = `<rect x="630" y="20" width="350" height="280" rx="14" fill="#fff" stroke="#ced4da" stroke-width="2"/><text x="805" y="46" text-anchor="middle" font-size="16" font-weight="800" fill="#212529">Malzeme kutusu · dokun, sonra tak</text>`;
    const kart = (id, x, y, ad, cizim) => { const n = kalan[id], sec = S.mod === id;
      return `<g data-k="${id}" style="cursor:${n > 0 ? "pointer" : "default"}" opacity="${n > 0 ? 1 : .35}"><rect x="${x}" y="${y}" width="160" height="104" rx="10" fill="${sec ? "#e6fcf5" : "#f8f9fa"}" stroke="${sec ? "#0b7a55" : "#dee2e6"}" stroke-width="${sec ? 3 : 1.5}"/>${cizim(x + 80, y + 44)}<text x="${x + 80}" y="${y + 94}" text-anchor="middle" font-size="13" font-weight="700" fill="#212529">${ad} ${n > 0 ? "×" + n : "✓"}</text></g>`; };
    s += kart("buton", 645, 60, "Buton (4 bacak)", (x, y) => `<rect x="${x - 26}" y="${y - 26}" width="52" height="52" rx="5" fill="#343a40"/><circle cx="${x}" cy="${y}" r="15" fill="#212529"/>` + [[-22, -30], [22, -30], [-22, 30], [22, 30]].map(([a, b]) => `<rect x="${x + a - 3}" y="${y + b - 5}" width="6" height="10" fill="#adb5bd"/>`).join(""));
    s += kart("led", 812, 60, "Kırmızı LED", (x, y) => `<path d="M${x - 16} ${y + 6} V${y - 10} a16 16 0 0 1 32 0 V${y + 6} Z" fill="#e03131"/><line x1="${x - 7}" y1="${y + 6}" x2="${x - 7}" y2="${y + 34}" stroke="#adb5bd" stroke-width="3"/><line x1="${x + 7}" y1="${y + 6}" x2="${x + 7}" y2="${y + 24}" stroke="#adb5bd" stroke-width="3"/><text x="${x - 22}" y="${y + 30}" font-size="12" font-weight="800" fill="#c92a2a">+</text>`);
    s += kart("r220", 645, 178, "220Ω direnç", (x, y) => dirSimge(x, y, "220Ω"));
    s += kart("r10k", 812, 178, "10kΩ direnç", (x, y) => dirSimge(x, y, "10kΩ"));
    return s;
  }
  const BANT = { "220Ω": ["#e03131", "#e03131", "#8d5524"], "10kΩ": ["#8d5524", "#212529", "#fd7e14"] };
  const dirSimge = (x, y, d) => `<line x1="${x - 50}" y1="${y}" x2="${x + 50}" y2="${y}" stroke="#adb5bd" stroke-width="3"/><rect x="${x - 24}" y="${y - 10}" width="48" height="20" rx="8" fill="#e9d8a6" stroke="#8a6d3b" stroke-width="1.5"/>` + BANT[d].map((c, i) => `<rect x="${x - 15 + i * 10}" y="${y - 10}" width="5" height="20" fill="${c}"/>`).join("");
  function elemanCiz(e, i) {
    if (e.t === "kablo") { const [x1, y1] = xy(e.a), [x2, y2] = xy(e.b), d = Math.hypot(x2 - x1, y2 - y1), mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.min(60, d * .25);
      const path = `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`, c = RENKLER[e.renk];
      return `<path d="${path}" fill="none" stroke="#1b1b1b" stroke-width="9" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="5" fill="${c}" stroke="#1b1b1b" stroke-width="2"/><circle cx="${x2}" cy="${y2}" r="5" fill="${c}" stroke="#1b1b1b" stroke-width="2"/>`; }
    if (e.t === "r") { const [x1, y1] = xy(e.a), [x2, y2] = xy(e.b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9aa1a8" stroke-width="3.5"/><g transform="translate(${mx},${my}) rotate(${ang})"><rect x="-20" y="-9" width="40" height="18" rx="7" fill="#e9d8a6" stroke="#8a6d3b" stroke-width="1.5"/>${BANT[e.deg].map((c, k) => `<rect x="${-13 + k * 9}" y="-9" width="5" height="18" fill="${c}"/>`).join("")}</g><circle cx="${x1}" cy="${y1}" r="4" fill="#495057"/><circle cx="${x2}" cy="${y2}" r="4" fill="#495057"/><text x="${mx}" y="${my + 24}" text-anchor="middle" font-size="11" font-weight="700" fill="#5c3d0c">${e.deg}</text>`; }
    if (e.t === "led") { const [xa, ya] = xy(e.a), [xk, yk] = xy(e.k), mx = (xa + xk) / 2, ust = Math.min(ya, yk) - 34, yan = S.led[i];
      return (yan ? `<circle cx="${mx}" cy="${ust}" r="46" fill="#ff8787" opacity=".45"/><circle cx="${mx}" cy="${ust}" r="30" fill="#ffc9c9" opacity=".7"/>` : "")
        + `<path d="M${xa} ${ya} L${mx - 6} ${ust + 14}" stroke="#adb5bd" stroke-width="3.5"/><path d="M${xk} ${yk} L${mx + 6} ${ust + 14}" stroke="#adb5bd" stroke-width="3.5"/>`
        + `<circle cx="${mx}" cy="${ust}" r="17" fill="${yan ? "#ff3b3b" : "#c92a2a"}" stroke="rgba(0,0,0,.45)" stroke-width="2"/><circle cx="${mx - 5}" cy="${ust - 6}" r="5" fill="#fff" opacity="${yan ? .95 : .5}"/>`
        + `<circle cx="${xa}" cy="${ya}" r="5" fill="#ced4da" stroke="#212529" stroke-width="2"/><circle cx="${xk}" cy="${yk}" r="5" fill="#ced4da" stroke="#212529" stroke-width="2"/><text x="${xa}" y="${ya + 22}" text-anchor="middle" font-size="13" font-weight="800" fill="#c92a2a">+</text>`; }
    if (e.t === "buton") { const x0 = X(e.c) - 16, x1 = X(e.c + 2) + 16, y0 = SAT.d - 16, y1 = SAT.g + 16, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, b = S.basili && S.calisiyor;
      return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="6" fill="#343a40" stroke="#111" stroke-width="2"/><circle cx="${mx}" cy="${my}" r="${b ? 20 : 24}" fill="${b ? "#000" : "#212529"}" stroke="#000" stroke-width="2"/>`
        + (S.calisiyor ? `<text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">BAS</text>` : "")
        + [["d", e.c], ["d", e.c + 2], ["g", e.c], ["g", e.c + 2]].map(([r, c]) => `<circle cx="${X(c)}" cy="${SAT[r]}" r="5.5" fill="#ced4da" stroke="#212529" stroke-width="2"/>`).join(""); }
    return "";
  }

  // ---------- etkileşim ----------
  const dolu = (p) => S.el.some((e) => e.a === p || e.b === p || e.k === p || (e.t === "buton" && ["d" + e.c, "d" + (e.c + 2), "g" + e.c, "g" + (e.c + 2)].includes(p)));
  const IPUCU = {
    kablo: "Kablo: önce bir uca (delik ya da Arduino pini), sonra öbür uca dokun.",
    buton: "Buton: oluğun üstüne oturur. Butonun sol üst bacağının gireceği sütundaki herhangi bir deliğe dokun.",
    led: "LED: önce UZUN bacağın (+) gireceği deliğe, sonra kısa bacağın (−) gireceği yandaki deliğe dokun.",
    r220: "220Ω direnç: iki bacağının gireceği iki deliğe sırayla dokun.", r10k: "10kΩ direnç: iki bacağının gireceği iki deliğe sırayla dokun.",
    sil: "Silgi: silmek istediğin kabloya ya da parçaya dokun."
  };
  function modSec(m) { if (S.calisiyor) return toast("Önce ⏹ Durdur'a bas, sonra devreyi düzenle."); S.mod = m; S.bekle = null; $("#ipucu").textContent = IPUCU[m] || ""; arac(); ciz(); }
  function ekle(e) { S.el.push(e); S.vurgu = []; kaydet(); S.bekle = null; if (e.t !== "kablo") modSec("kablo"); else ciz(); sonucTemizle(); }
  function nokta(p) {
    if (S.calisiyor) return;
    const m = S.mod;
    if (m === "buton") { const c = +p.replace(/\D/g, ""); if (p.startsWith("U:") || /^(ust|alt)/.test(p)) return toast("Buton breadboard'un ortasına, oluğun üstüne takılır.");
      const cc = Math.min(Math.max(c, 1), NC - 2), bac = ["d" + cc, "d" + (cc + 2), "g" + cc, "g" + (cc + 2)];
      if (bac.some(dolu)) return toast("Bu deliklerden biri dolu; başka bir sütun seç.");
      return ekle({ t: "buton", c: cc }); }
    if (dolu(p)) return toast("Bu delik dolu. Başka bir delik seç ya da Silgi ile oradakini çıkar.");
    if (!S.bekle) { if ((m === "led" || m === "r220" || m === "r10k") && p.startsWith("U:")) return toast("Parçalar breadboard'a takılır; Arduino'ya kabloyla bağlanır.");
      S.bekle = p; $("#ipucu").textContent = m === "led" ? "Şimdi kısa bacağın (−) gireceği deliğe dokun (uzun bacağın hemen yanı)." : "Şimdi öbür uca dokun."; return ciz(); }
    const a = S.bekle; if (a === p) { S.bekle = null; return ciz(); }
    if (m === "kablo") return ekle({ t: "kablo", a, b: p, renk: S.renk });
    if (p.startsWith("U:")) return toast("Parçalar breadboard'a takılır.");
    if (m === "led") { if (uzak(a, p) > 2.2) return toast("LED'in bacakları kısa: iki delik yan yana olmalı."); return ekle({ t: "led", a, k: p }); }
    if (m === "r220" || m === "r10k") { if (uzak(a, p) > 6.5) return toast("Direncin bacakları en fazla 6 delik uzağa yetişir."); return ekle({ t: "r", a, b: p, deg: m === "r220" ? "220Ω" : "10kΩ" }); }
  }
  function sahneTik(ev) {
    const t = ev.target;
    const k = t.closest("[data-k]"); if (k) { const id = k.dataset.k; return modSec(S.mod === id ? "kablo" : id); }
    if (S.mod === "sil" && !S.calisiyor) { const g = t.closest("[data-e]") || (t.dataset.p && eAt(t.dataset.p)); if (g) { const i = typeof g === "number" ? g : +g.dataset.e; S.el.splice(i, 1); S.vurgu = []; kaydet(); ciz(); sonucTemizle(); } return; }
    if (t.dataset.p) return nokta(t.dataset.p);
  }
  const eAt = (p) => { const i = S.el.findIndex((e) => e.a === p || e.b === p || e.k === p || (e.t === "buton" && ["d" + e.c, "d" + (e.c + 2), "g" + e.c, "g" + (e.c + 2)].includes(p))); return i >= 0 ? i : null; };

  function arac() {
    $("#araclar").innerHTML = `<button data-m="kablo" class="${S.mod === "kablo" ? "secili" : ""}">🔌 Kablo</button>`
      + Object.entries(RENKLER).map(([r, c]) => `<button class="renk ${S.renk === r ? "secili" : ""}" data-r="${r}" title="${r}" style="background:${c}"></button>`).join("")
      + `<button data-m="sil" class="${S.mod === "sil" ? "secili" : ""}">🧽 Silgi</button><button data-geri>↶ Geri al</button><button data-temiz>🗑 Hepsini sök</button>`;
  }

  // ---------- kodu yükle / çalıştır ----------
  function yukle() {
    if (S.calisiyor) return durdur();
    S.yuklendi++; yazK("tekrar.deneme." + HN + "." + (ogr.kod || ogr.ad), S.yuklendi);
    const b = $("#btnYukle"); b.disabled = true; const il = $("#yukIl"); let y = 0; $("#seri").textContent = "";
    const t = setInterval(() => { y += 9; il.style.width = Math.min(100, y) + "%"; if (y >= 100) { clearInterval(t); b.disabled = false; basla(); } }, 70);
    $("#sonuc").innerHTML = `<div>Kod Arduino'ya yükleniyor…</div>`;
  }
  function basla() {
    const H_ = HD.kontrol(); S.hatasiz = !H_.length; S.gordu = false;
    S.vurgu = H_.flatMap((h) => h.v);
    kayitGonder("Yükleme", { hata: H_.length, ilk: H_.length ? H_[0].m : "" });
    if (H_.length) $("#sonuc").innerHTML = `<div class="hata"><b>❌ Devre henüz doğru değil.</b> Kod yüklendi ama devrede ${H_.length} sorun var. Yanıp sönen yerlere bak:</div>` + H_.slice(0, 3).map((h, i) => `<div class="hata">${i + 1}) ${esc(h.m)}</div>`).join("") + `<div>Düzeltmek için ⏹ Durdur'a bas.</div>`;
    else $("#sonuc").innerHTML = `<div class="iyi"><b>✓ Kod yüklendi, bağlantılar doğru görünüyor!</b> Şimdi butona (BAS) basılı tut: LED yanıyor mu? Bırakınca sönüyor mu?</div>`;
    S.calisiyor = true; $("#btnYukle").textContent = "⏹ Durdur ve düzenle"; ciz();
    dongu = setInterval(calistir, 60);
  }
  function durdur() { clearInterval(dongu); S.calisiyor = false; S.basili = false; S.led = {}; $("#btnYukle").textContent = "⚡ Kodu yükle"; $("#yukIl").style.width = "0"; ciz(); }
  function sonucTemizle() { if (!S.calisiyor) $("#sonuc").innerHTML = ""; }

  // ---------- tamamlama kodu (öğretmen doğrular) ----------
  function ozet(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-4); }
  const normal = (s) => String(s || "").trim().toLocaleUpperCase("tr").replace(/\s+/g, " ");
  function tamamKod(ad, h, tarih, deneme, ipucu) { return `H${h}-${tarih.replace(/-/g, "").slice(2)}-${deneme}${ipucu ? "i" + ipucu : ""}-${ozet(["BLSM", normal(ad), h, tarih, deneme, ipucu].join("|"))}`; }
  function bitir() {
    const tarih = new Date().toISOString().slice(0, 10), kod = tamamKod(ogr.ad, HN, tarih, S.yuklendi, S.ipucu);
    yazK("tekrar.bitti." + HN + "." + (ogr.kod || ogr.ad), { kod, tarih });
    kayitGonder("TAMAMLADI", { tamamKod: kod });
    $("#sonuc").innerHTML = `<div class="iyi"><b>🎉 Çalıştı! Butona basınca LED yandı, bırakınca söndü.</b></div><div class="belge"><div>Ders tekrarı tamamlandı</div><b>${esc(ogr.ad)} · ${esc(ogr.grup || "")} · ${HN}. hafta: ${esc(HD.ad)}</b><div class="kodu">${kod}</div><div>${S.yuklendi}. yüklemede çalıştı${S.ipucu ? ` · ${S.ipucu} kez şemaya baktı` : ""}</div><small>Bu kodu öğretmenine gönder (ekran görüntüsü de olur).</small></div>`;
  }

  // ---------- sayfalar ----------
  function girisSayfa() {
    if (SUNUCU) {
      $("#kok").innerHTML = `<div class="giris kart"><h2>${HD ? `${HN}. hafta · ${esc(HD.ad)}` : "Ders Tekrarı"}</h2><p>Devreyi sanal breadboard'a kendin kuracaksın. Kod hazır; kurunca <b>Kodu yükle</b>'ye basıp deneyeceksin.</p>
        <label>Öğrenci kodun (öğretmeninin verdiği 4 rakam)<input id="gKod" inputmode="numeric" maxlength="4" autocomplete="off" style="font-size:28px;letter-spacing:8px;text-align:center"></label>
        <button class="ana" id="gBasla">Başla</button><p id="gSon"></p></div>`;
      const git = () => { const k = $("#gKod").value.replace(/\D/g, ""); if (k.length !== 4) return toast("4 rakamlı kodunu yaz.");
        $("#gSon").textContent = "Kontrol ediliyor…";
        sunucu("ogrenciBul", k).then((o) => { if (!o) return ($("#gSon").textContent = "Bu kod bulunamadı. Öğretmeninin verdiği kodu yaz.");
          yazK("tekrar.ogrenci", { ad: o.ad, grup: o.sinif, kod: k }); sunucu("kayit", { kod: k, hafta: HN, olay: "Başladı", deneme: 0, ipucu: 0 }).finally(() => location.reload()); },
          () => ($("#gSon").textContent = "İnternet bağlantısı yok gibi. Biraz sonra tekrar dene.")); };
      $("#gBasla").onclick = git; $("#gKod").addEventListener("keydown", (e) => { if (e.key === "Enter") git(); });
      return;
    }
    $("#kok").innerHTML = `<div class="giris kart"><h2>${HD ? `${HN}. hafta · ${esc(HD.ad)}` : "Ders Tekrarı"}</h2><p>Devreyi sanal breadboard'a kendin kuracaksın. Kod hazır; kurunca <b>Kodu yükle</b>'ye basıp deneyeceksin.</p>
      <label>Adın (yalnız adın)<input id="gAd" maxlength="30" autocomplete="off"></label><label>Grubun / sınıfın<input id="gGrup" maxlength="20" autocomplete="off"></label>
      <button class="ana" id="gBasla">Başla</button><p><small>Adın yalnız bu cihazda durur, hiçbir yere gönderilmez.</small></p></div>`;
    $("#gBasla").onclick = () => { const ad = $("#gAd").value.trim(); if (!ad) return toast("Adını yaz."); yazK("tekrar.ogrenci", { ad, grup: $("#gGrup").value.trim() }); location.reload(); };
  }
  function listeSayfa() {
    $("#kok").innerHTML = `<div class="giris kart"><h2>Ders Tekrarı</h2><p>Öğretmeninin gönderdiği bağlantıyı aç. Hazır olan tekrarlar:</p><div class="liste">${Object.entries(TEKRAR).map(([n, t]) => `<a href="?h=${n}">${n}. hafta · ${esc(t.ad)}</a>`).join("")}</div>
      <details style="margin-top:16px"><summary>Öğretmen: tamamlama kodunu doğrula</summary><label>Öğrencinin adı<input id="kAd"></label><label>Tamamlama kodu<input id="kKod" placeholder="H8-261126-3-ABCD"></label><button id="kBtn">Doğrula</button><p id="kSon"></p></details></div>`;
    $("#kBtn").onclick = () => { const k = $("#kKod").value.trim().toUpperCase(), m = k.match(/^H(\d+)-(\d{6})-(\d+)(?:I(\d+))?-([0-9A-Z]{4})$/);
      if (!m) return ($("#kSon").textContent = "Kod biçimi tanınmadı.");
      const tarih = `20${m[2].slice(0, 2)}-${m[2].slice(2, 4)}-${m[2].slice(4)}`, dogru = tamamKod($("#kAd").value, +m[1], tarih, +m[3], +(m[4] || 0)).toUpperCase() === k;
      $("#kSon").innerHTML = dogru ? `✅ Geçerli: ${m[1]}. hafta, ${tarih}, ${m[3]}. yüklemede çalıştı${m[4] ? `, ${m[4]} kez şemaya baktı` : ""}.` : "❌ Kod bu isimle uyuşmuyor (adı öğrencinin yazdığı gibi yazın)."; };
  }
  function anaSayfa() {
    $("#baslikHafta").textContent = ` · ${HN}. hafta: ${HD.ad}`; $("#ogrAd").innerHTML = `👤 ${esc(ogr.ad)}${ogr.grup ? " · " + esc(ogr.grup) : ""} <a href="#" id="cikis" style="color:#fff;margin-left:6px">ben değilim</a>`;
    $("#cikis").onclick = (e) => { e.preventDefault(); try { localStorage.removeItem("tekrar.ogrenci"); } catch (x) { } location.reload(); };
    const kod = (window.KODLAR && KODLAR[HN] && KODLAR[HN][0] && KODLAR[HN][0].kod) || "";
    S.yuklendi = oku("tekrar.deneme." + HN + "." + (ogr.kod || ogr.ad), 0);
    $("#kok").innerHTML = `<main><section class="kart"><div class="arac" id="araclar"></div><div id="ipucu"></div><svg id="sahne" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif"></svg></section>
      <aside><div class="kart"><h2>🎯 Görev</h2><p><b>${esc(HD.hedef)}</b></p><ol class="gorev">${HD.gorev.map((g) => `<li>${esc(g)}</li>`).join("")}</ol>
        <details id="sema"><summary>📐 Takıldım: bağlantı şemasını göster</summary><div id="semaIc"></div></details></div>
      <div class="kart" style="margin-top:12px"><button class="ana" id="btnYukle" style="width:100%">⚡ Kodu yükle</button><div class="ilerleme"><i id="yukIl"></i></div><div id="sonuc"></div></div>
      <div class="kart" style="margin-top:12px"><h2>Seri Monitör</h2><div id="seri"></div><small>Kod 2. pini okuyup buraya yazar: basılıysa 1, değilse 0.</small></div>
      <div class="kart" style="margin-top:12px"><details><summary>💾 Hazır kod (Arduino'ya yüklenecek)</summary><pre class="kod">${esc(kod)}</pre></details></div></aside></main>`;
    arac(); modSec("kablo");
    $("#sahne").addEventListener("click", sahneTik);
    const bas = (v) => (ev) => { const t = ev.target.closest && ev.target.closest("[data-bas]"); if (v && !t) return; if (!S.calisiyor) return; if (v) ev.preventDefault(); if (S.basili !== v) { S.basili = v; ciz(); } };
    $("#sahne").addEventListener("pointerdown", bas(true)); window.addEventListener("pointerup", bas(false)); window.addEventListener("pointercancel", bas(false));
    $("#araclar").addEventListener("click", (ev) => { const b = ev.target.closest("button"); if (!b) return;
      if (b.dataset.m) modSec(b.dataset.m);
      if (b.dataset.r) { S.renk = b.dataset.r; if (S.mod !== "kablo") modSec("kablo"); else arac(); }
      if (b.dataset.geri !== undefined && !S.calisiyor) { S.el.pop(); S.vurgu = []; kaydet(); ciz(); sonucTemizle(); }
      if (b.dataset.temiz !== undefined && !S.calisiyor && confirm("Bütün parçalar ve kablolar sökülsün mü?")) { S.el = []; S.vurgu = []; kaydet(); ciz(); sonucTemizle(); } });
    $("#btnYukle").onclick = yukle;
    $("#sema").addEventListener("toggle", () => { if ($("#sema").open) { S.ipucu++; if (window.DEVRE && DEVRE.H[HN]) $("#semaIc").innerHTML = DEVRE.svg(DEVRE.H[HN][0]) + DEVRE.tablo(DEVRE.H[HN][0], true); } });
    const b = oku("tekrar.bitti." + HN + "." + (ogr.kod || ogr.ad), null); if (b) $("#sonuc").innerHTML = `<div class="iyi">Bu tekrarı daha önce tamamladın. Kodun: <b>${esc(b.kod)}</b></div>`;
  }

  if (!HD) listeSayfa(); else if (!ogr) girisSayfa(); else anaSayfa();
  window.TEKRAR_TEST = { S, ag, kontrol: () => HD && HD.kontrol(), ekle: (e) => { S.el.push(e); }, temizle: () => { S.el.length = 0; }, pinOku, ledler, tamamKod };
})();
