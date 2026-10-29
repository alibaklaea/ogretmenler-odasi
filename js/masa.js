/* Öğretmenler Odası — yıllık plan, haftalık etkinlik, günlük plan, öğrenci sunumu, çalışma kâğıdı ve tahta araçları */
(function () {
  "use strict";

  const PD = window.PLAN_DATA, TK = window.TAKVIM, OZ = window.OZGUN, GN = window.GUNLER;
  const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const GUN_AD = ["Pzt", "Sal", "Çar", "Per", "Cum"];
  const GUN_TAM = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const $ = (s, k = document) => k.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- durum ----------
  const ayar = JSON.parse(localStorage.getItem("masa.ayar") || "{}");
  let plan = localStorage.getItem("masa.plan") || "D1";
  const bugun = sorguTarihi() || new Date();
  bugun.setHours(12, 0, 0, 0);

  function sorguTarihi() { // ?tarih=2026-11-03 ile test edilebilir
    const m = location.search.match(/tarih=(\d{4}-\d{2}-\d{2})/);
    return m ? iso(m[1]) : null;
  }

  // ---------- tarih yardımcıları ----------
  function iso(s) { const [y, a, g] = s.split("-").map(Number); return new Date(y, a - 1, g, 12); }
  function isoYaz(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  function gunEkle(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function tarihYaz(d) { return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`; }
  function kisaTarih(a, b) {
    if (isoYaz(a) === isoYaz(b)) return `${a.getDate()} ${AYLAR[a.getMonth()]}`;
    return a.getMonth() === b.getMonth() ? `${a.getDate()}-${b.getDate()} ${AYLAR[a.getMonth()]}` : `${a.getDate()} ${AYLAR[a.getMonth()]} - ${b.getDate()} ${AYLAR[b.getMonth()]}`;
  }

  // "28 Eylül-2 Ekim 2026", "5-9 Ekim 2026", "28 Aralık 2026-1 Ocak 2027"
  function haftaAraligi(metin) {
    const t = metin.replace(/\s+/g, " ").trim();
    const m = t.match(/^(\d+)(?: ([A-Za-zÇĞİÖŞÜçğıöşü]+))?(?: (\d{4}))?-(\d+) ([A-Za-zÇĞİÖŞÜçğıöşü]+) (\d{4})$/);
    if (!m) return null;
    const ayNo = (ad) => AYLAR.findIndex((x) => x.toLocaleLowerCase("tr") === ad.toLocaleLowerCase("tr"));
    const bitAy = ayNo(m[5]), bitYil = +m[6];
    const basAy = m[2] ? ayNo(m[2]) : bitAy, basYil = m[3] ? +m[3] : (m[2] && basAy > bitAy ? bitYil - 1 : bitYil);
    return { bas: new Date(basYil, basAy, +m[1], 12), bit: new Date(bitYil, bitAy, +m[4], 12) };
  }

  // Çarşamba kodlama atölyesi, Destek planlarıyla aynı hafta numaralarına oturtulur
  const KD = window.KODLAMA;
  PD.planlar.KOD = { ad: KD.ad, aralar: PD.planlar.D1.aralar, haftalar: KD.haftalar.map((k) => {
    const d = PD.planlar.D1.haftalar.find((w) => w.no === k.no);
    const temaNo = k.yok ? 0 : k.no <= 7 ? 1 : k.no <= 24 ? 2 : k.no <= 28 ? 3 : 4;
    const tema = ["TATİL", "SERVO MOTOR", "SENSÖRLER", "ROBOTİK", "PROJE VE PAYLAŞIM"][temaNo];
    return { no: k.no, tarih: d.tarih, ay: d.ay, saat: k.yok ? "0" : String(KD.saat), temaNo, tema, icerik: k.kavram || "", temaHam: `${temaNo}. Tema: ${tema}`,
      etkinlik: k.ad, kazanimlar: k.yok ? [] : [`${k.proje} tasarlar ve çalıştırır.`, `Kavramlar: ${k.kavram}.`, "Kâğıt → Tinkercad → gerçek devre aşamalarını sırayla uygular.", "Yapay zekâya açık, ayrıntılı ve kişisel bilgi içermeyen prompt yazar."],
      yontem: "Kâğıt üzerinde tasarım, Tinkercad simülasyonu, gerçek devre kurma, yapay zekâ destekli kodlama, akran öğretimi",
      olcme: "Test tablosu, çalışan prototip, prompt değerlendirmesi, çıkış bileti", disiplin: "Bilişim Teknolojileri, Fen Bilimleri, Matematik, Teknoloji ve Tasarım",
      materyal: (k.malzeme || []).join(", "), gunler: d.gunler, meb: [], kod: k };
  }) };

  for (const k of Object.keys(PD.planlar)) for (const w of PD.planlar[k].haftalar) {
    const r = haftaAraligi(w.tarih); w.bas = r.bas; w.bit = r.bit;
  }

  function tatilBul(d) {
    const s = isoYaz(d);
    return TK.tatiller.find((t) => !t.bilgi && s >= t.bas && s <= t.bit);
  }
  function haftaGunleri(w) { // Pazartesi-Cuma, tatil durumuyla
    return GUN_AD.map((ad, i) => { const d = gunEkle(w.bas, i), t = tatilBul(d); return { ad, d, t, kapali: t && !t.yarim, yarim: t && t.yarim }; });
  }
  function isGunuSay(w) { return haftaGunleri(w).reduce((s, g) => s + (g.kapali ? 0 : g.yarim ? 0.5 : 1), 0); }

  function haftalar() { return PD.planlar[plan].haftalar; }
  function simdikiHafta() {
    const hs = haftalar();
    const icinde = hs.find((w) => bugun >= w.bas && bugun <= gunEkle(w.bit, 2));
    if (icinde) return icinde;
    return hs.find((w) => w.bas > bugun) || hs[hs.length - 1];
  }

  // ---------- haftanın etkinlik parçaları (kitap / MEB / özgün) ----------
  function parcalar(w) {
    if (plan === "KOD") {
      const k = w.kod;
      if (k.yok) return [{ kaynak: "Ders programı", ad: k.ad, soru: "", giris: k.not, dersler: [], ekler: [] }];
      if (k.tamam) return [{ kaynak: "Kodlama Atölyesi (tamamlandı)", ad: k.ad, soru: "", giris: `Tamamlandı: ${k.proje}. Kavramlar: ${k.kavram}. Pinler: ${k.pinler.map((x) => x.join(" → ")).join(", ")}.${k.not ? " " + k.not : ""} Materyaller: ${KD.klasor}`, dersler: [], ekler: [] }];
      return [{ kaynak: "Kodlama Atölyesi planı (kâğıt → Tinkercad → gerçek Arduino)", ad: k.ad, saat: String(KD.saat), soru: k.soru,
        giris: `Proje: ${k.proje}. Kavramlar: ${k.kavram}.${k.ozel ? " Bu hafta: " + k.ozel + "." : ""}`,
        dersler: [{ baslik: "1. ders · Kâğıt aşaması", metin: k.kagit }, { baslik: "1. ders · Tinkercad", metin: k.tinker },
          { baslik: "2. ders · Yapay zekâ ile kod", metin: k.prompt === "—" ? "Bu hafta prompt yazımı yok; sunum ve paylaşım yapılır." : "Örnek prompt: “" + k.prompt + "” Öğrenciler kendi prompt'unu yazar, üretilen kodu okuyup satır satır açıklar." },
          { baslik: "2. ders · Gerçek Arduino ve test", metin: k.gercek }],
        olcme: "Test tablosu, çalışan devre, prompt değerlendirmesi ve çıkış bileti.", zengin: k.gelistir,
        destek: "Hazır devre fotoğrafı ve pin tablosu verilir; prompt cümle başlatıcılarla yazılır; eşli çalışma yapılır.",
        ozgun: true, urun: k.proje, ekler: kodKagitlari(k) }];
    }
    if (plan === "D3") {
      const k = w.kitap;
      return [{ kaynak: "Destek 3 Etkinlik Kitabı", ad: w.etkinlik, soru: k.buyukSoru, giris: k.giris, dersler: k.dersler, olcme: k.olcme,
        zengin: k.zengin, destek: k.destek, ekler: k.ekler.map((e) => ({ ...e, pdf: w.pdfEk })), pdf: w.pdf, pdfEk: w.pdfEk, sayfalar: k.sayfalar }];
    }
    const adlar = w.etkinlik.split(/\s*\/\s*/);
    return adlar.map((hamAd, i) => {
      const ad = hamAd.replace(/\(.*?\)/g, "").trim();
      const saat = (hamAd.match(/\((\d) saat\)/) || [])[1];
      const norm = (s) => s.toLocaleUpperCase("tr").replace(/[^A-ZÇĞİÖŞÜ0-9]/g, "");
      const meb = w.meb.find((m) => norm(m.ad).startsWith(norm(ad).slice(0, 10)) || norm(ad).startsWith(norm(m.ad).slice(0, 10)));
      if (meb) {
        const p = meb.paragraflar;
        return { kaynak: "MEB Destek Eğitim Programı yardımcı materyali", ad, saat, soru: meb.sorular[0] || "", sorular: meb.sorular,
          giris: p[0] || "", dersler: p.slice(1).map((m, j) => ({ baslik: `Adım ${j + 1}`, metin: m })), olcme: "Etkinliğe ait dereceli puanlama anahtarı / öz değerlendirme formu (MEB materyalindeki karekod).",
          ekler: meb.ekler.map((e) => ({ ...e, pdf: meb.pdf })), pdf: meb.pdf, sure: meb.sure, sayfalar: meb.sayfalar };
      }
      const oz = OZ[w.no + "ab"[i]] || OZ[String(w.no)];
      if (oz) return { kaynak: "Öğretmen Masası özgün etkinliği (plana göre hazırlandı)", ozgun: true, ad, saat, soru: oz.soru, giris: oz.giris,
        dersler: oz.dersler, olcme: w.olcme + " • Ürün: " + oz.urun, zengin: oz.zengin, destek: oz.destek, ekler: oz.ekler, urun: oz.urun };
      return { kaynak: "—", ad, saat, soru: "", giris: "", dersler: [], ekler: [] };
    });
  }

  function haftaninGunleri(w) {
    const bas = isoYaz(w.bas), bit = isoYaz(gunEkle(w.bit, 2));
    return GN.filter((g) => (g.bas <= bit && g.bit >= bas) || (g.anahtar && w.gunler.includes(g.anahtar)));
  }

  // ---------- üst çubuk / şerit ----------
  function planSec(p) {
    plan = p; localStorage.setItem("masa.plan", p);
    document.body.dataset.plan = p;
    document.querySelectorAll(".plan-sec button").forEach((b) => b.setAttribute("aria-selected", b.dataset.plan === p));
    seritCiz(); yonlendir();
  }
  document.querySelectorAll(".plan-sec button").forEach((b) => b.onclick = () => planSec(b.dataset.plan));

  function seritCiz() {
    const w = simdikiHafta(), t = tatilBul(bugun), dersVar = bugun >= iso(TK.baslangic) && bugun <= iso(TK.bitis);
    const gl = GN.filter((g) => isoYaz(bugun) >= g.bas && isoYaz(bugun) <= g.bit);
    $("#bugun").innerHTML = `<span>Bugün <b>${tarihYaz(bugun)}</b></span>` +
      (t ? `<span class="rozet tatil">Tatil: ${esc(t.ad)}</span>` : "") +
      (dersVar ? `<span>${esc(PD.planlar[plan].ad)} · <a href="#hafta/${w.no}"><b>${w.no}. hafta</b> — ${esc(w.etkinlik)}</a> · ${isGunuSay(w)} iş günü</span>` : "<span>Ders yılı dışında</span>") +
      gl.map((g) => `<span class="rozet ${g.tur}">${esc(g.ad)}</span>`).join("") + bugunDersleri();
  }

  function bugunDersleri() {
    if (tatilBul(bugun)) return "";
    const g = bugun.getDay(), D = Object.entries(TK.program).filter(([, p]) => p[g]);
    const linkler = D.map(([k, p]) => { const w = PD.planlar[k].haftalar.find((x) => bugun >= x.bas && bugun <= x.bit);
      return w ? `<a href="#" data-git="${k}/${w.no}">${esc(PD.planlar[k].ad)} (${p[g]} saat)</a>` : ""; }).filter(Boolean);
    return linkler.length ? `<span>· Bugünkü derslerim: ${linkler.join(", ")}</span>` : "";
  }
  document.addEventListener("click", (e) => { const a = e.target.closest("[data-git]"); if (!a) return; e.preventDefault();
    const [k, n] = a.dataset.git.split("/"); planSec(k); location.hash = `hafta/${n}/gunluk`; });

  // ---------- yönlendirme ----------
  window.addEventListener("hashchange", yonlendir);
  function yonlendir() {
    const h = location.hash.slice(1) || "plan";
    document.querySelectorAll(".menu a").forEach((a) => a.classList.toggle("aktif", a.getAttribute("href") === "#" + h.split("/")[0]));
    const [yol, a1, a2] = h.split("/");
    if (yol === "bu-hafta") { location.replace("#hafta/" + simdikiHafta().no); return; }
    if (yol === "hafta") haftaSayfa(+a1, a2 || "etkinlik");
    else if (yol === "gunler") gunlerSayfa(a1 || "hepsi");
    else if (yol === "araclar") araclarSayfa();
    else if (yol === "nasil") nasilSayfa();
    else planSayfa();
    window.scrollTo(0, 0);
  }

  // ---------- yıllık plan ----------
  function planSayfa() {
    const P = PD.planlar[plan], simdi = simdikiHafta();
    let html = `<div class="ust-baslik"><div><h1>${esc(P.ad)} Yıllık Planı</h1><p>2026-2027 · ${P.haftalar.length} hafta · ${TK.isGunu} iş günü · Haftaya tıklayın: kazanım, etkinlik, günlük plan, sunum ve çalışma kâğıtları açılır.</p></div>
      <div class="dugmeler"><a class="dugme ana" href="#hafta/${simdi.no}">Bu haftaya git →</a><button class="dugme" id="yillikBas">Yıllık planı yazdır</button></div></div>`;
    let ay = "";
    P.haftalar.forEach((w, i) => {
      const ayAd = AYLAR[w.bas.getMonth()];
      if (ayAd !== ay) { if (ay) html += "</div></section>"; ay = ayAd; html += `<section class="ay-blok"><h2>${ayAd} ${w.bas.getFullYear()}</h2><div class="haftalar">`; }
      const gunler = haftaninGunleri(w), ig = isGunuSay(w);
      const cls = w === simdi ? "simdi" : w.bit < bugun || (w.kod && (w.kod.tamam || w.kod.yok)) ? "gecti" : "";
      html += `<a class="hafta-kart ${cls}" href="#hafta/${w.no}">
        ${w === simdi ? '<span class="simdi-etiket">BU HAFTA</span>' : ""}
        <div class="hk-ust"><span class="hk-no">${w.no}. HAFTA</span><span>${kisaTarih(w.bas, w.bit)} · ${w.saat} ders saati</span></div>
        <div class="hk-ad">${esc(w.etkinlik.replace(/\s*\(2 saat\)/g, ""))}</div>
        <div class="hk-tema">${w.temaNo}. Tema: ${esc(w.tema)}</div>
        <div class="hk-rozetler">${ig < 5 ? `<span class="rozet tatil">${ig} iş günü</span>` : ""}${gunler.slice(0, 4).map((g) => `<span class="rozet ${g.tur}">${esc(g.ad.split("(")[0].slice(0, 30))}</span>`).join("")}</div></a>`;
      const ara = P.aralar.find((a) => a.after === w.no);
      if (ara) html += `<div class="ara-serit">☀ ${esc(ara.text)}</div>`;
    });
    html += "</div></section>";
    $("#sahne").innerHTML = html;
    $("#yillikBas").onclick = () => bas(yillikPlanSayfalari());
  }

  // ---------- hafta sayfası ----------
  const SEKMELER = [["etkinlik", "Kazanım ve Etkinlik"], ["gunluk", "Günlük Plan"], ["sunum", "Öğrenci Sunumu"], ["kagit", "Çalışma Kâğıtları"], ["gunler", "Belirli Gün & AB"]];

  function haftaSayfa(no, sekme) {
    const hs = haftalar(), w = hs.find((x) => x.no === no) || simdikiHafta();
    const P = parcalar(w), gunler = haftaninGunleri(w);
    const once = hs.find((x) => x.no === w.no - 1), sonra = hs.find((x) => x.no === w.no + 1);
    let html = `<div class="hafta-bas"><div>
        <div class="ust-satir"><b style="color:var(--vurgu)">${w.no}. HAFTA</b><span>${tarihYaz(w.bas)} – ${tarihYaz(w.bit)}</span><span>${w.saat} ders saati</span><span>${w.temaNo}. Tema: ${esc(w.temaHam.replace(w.icerik, "").replace(/^\d+\. Tema: /, ""))}</span></div>
        <h1>${esc(w.etkinlik.replace(/\s*\(2 saat\)/g, ""))}</h1>
        <div class="gun-satir">${haftaGunleri(w).map((g) => `<span class="gun-kutu ${g.kapali ? "kapali" : g.yarim ? "yarim" : ""}" title="${esc(g.t ? g.t.ad : "Ders günü")}">${g.ad} ${g.d.getDate()}</span>`).join("")}</div>
      </div>
      <div class="gezgin">${once ? `<a class="dugme" href="#hafta/${once.no}/${sekme}">‹ ${once.no}. hafta</a>` : ""}${sonra ? `<a class="dugme" href="#hafta/${sonra.no}/${sekme}">${sonra.no}. hafta ›</a>` : ""}</div></div>
      <div class="sekmeler" role="tablist">${SEKMELER.map(([k, ad]) => `<button role="tab" aria-selected="${k === sekme}" data-k="${k}">${ad}${k === "gunler" && gunler.length ? ` (${gunler.length})` : ""}</button>`).join("")}</div>
      <div id="sekmeIcerik"></div>`;
    $("#sahne").innerHTML = html;
    document.querySelectorAll(".sekmeler button").forEach((b) => b.onclick = () => location.hash = `hafta/${w.no}/${b.dataset.k}`);
    const ic = $("#sekmeIcerik");
    const ig = isGunuSay(w);
    const tatilUyari = ig < 5 ? `<div class="uyari">Bu hafta ${5 - ig} gün tatil: ${[...new Set(haftaGunleri(w).filter((g) => g.t).map((g) => g.t.ad))].join(", ")}. Yıllık planda bu hafta ${w.saat} ders saati olarak planlanmış.</div>` : "";
    if (sekme === "etkinlik") ic.innerHTML = tatilUyari + etkinlikSekme(w, P);
    if (sekme === "gunluk") gunlukSekme(ic, w, P, tatilUyari);
    if (sekme === "sunum") sunumSekme(ic, w, P, gunler);
    if (sekme === "kagit") kagitSekme(ic, w, P);
    if (sekme === "gunler") ic.innerHTML = gunler.length ? `<div class="gun-grid">${gunler.map(gunKart).join("")}</div>` : '<p class="not">Bu hafta belirli gün ya da uluslararası etkinlik yok.</p>';
    kopyaBagla(ic); gunKartBagla(ic);
  }

  function etkinlikSekme(w, P) {
    const kaz = w.kazanimlar.map((k) => { const m = k.match(/^(DEP\.\d+\.\d+)\s*(.*)$/) || [null, "", k];
      return `<div class="kazanim">${m[1] ? `<code>${m[1]}</code>` : ""}<span>${esc(m[2])}</span><button class="kopya" data-kopya="${esc(k)}">Kopyala</button></div>`; }).join("");
    let sol = "";
    P.forEach((p) => {
      sol += `<div class="parca-baslik"><h2 style="margin:0">${esc(p.ad)}</h2>${p.saat ? `<span class="rozet">${p.saat} ders saati</span>` : ""}</div>`;
      if (p.soru) sol += `<div class="kart" style="margin-bottom:12px"><div class="not">BÜYÜK SORU</div><p class="buyuk-soru">${esc(p.soru)}</p></div>`;
      sol += `<div class="kart">`;
      if (p.giris) sol += `<p><b>Etkinliğe giriş:</b> ${esc(p.giris)}</p>`;
      if (p.dersler.length) sol += `<ol class="akis">${p.dersler.map((d) => `<li><b>${esc(d.baslik)}</b>${esc(d.metin)}</li>`).join("")}</ol>`;
      if (p.olcme) sol += `<p><b>Ölçme ve değerlendirme:</b> ${esc(p.olcme)}</p>`;
      if (p.zengin) sol += `<p><b>Zenginleştirme:</b> ${esc(p.zengin)}</p>`;
      if (p.destek) sol += `<p><b>Destekleme:</b> ${esc(p.destek)}</p>`;
      sol += `<div class="kaynak-not">Kaynak: ${esc(p.kaynak)}${p.sayfalar ? ` · PDF s. ${p.sayfalar[0]}-${p.sayfalar[1]}` : ""}${p.pdf ? ` · <a href="${p.pdf}" target="_blank">Etkinliği PDF olarak aç</a>` : ""}</div></div>`;
    });
    const sag = `<div class="kart" style="margin-bottom:16px"><h3>Öğrenme çıktıları</h3>${kaz}
        <div class="dugmeler" style="margin-top:10px"><button class="dugme kucuk" data-kopya="${esc(w.kazanimlar.join("\n"))}">Hepsini kopyala</button></div></div>
      <div class="kart"><table class="bilgi-tablo">
        <tr><th>Tema içeriği</th><td>${esc(w.icerik)}</td></tr>
        <tr><th>Yöntem ve teknikler</th><td>${esc(w.yontem)}</td></tr>
        <tr><th>Ölçme-değerlendirme</th><td>${esc(w.olcme)}</td></tr>
        <tr><th>Disiplinler arası</th><td>${esc(w.disiplin)}</td></tr>
        <tr><th>Materyaller</th><td>${esc(w.materyal)}</td></tr>
        <tr><th>Belirli gün ve haftalar</th><td>${esc(w.gunler || "—")}</td></tr></table>
        <div class="dugmeler" style="margin-top:14px"><a class="dugme ana" href="#hafta/${w.no}/sunum">Tahtada sun</a><a class="dugme" href="#hafta/${w.no}/gunluk">Günlük plan</a><a class="dugme" href="#hafta/${w.no}/kagit">Çalışma kâğıtları</a></div></div>`;
    return `<div class="iki-sutun"><div>${sol}</div><div>${sag}</div></div>`;
  }

  // ---------- günlük plan ----------
  function gunlukSekme(ic, w, P, tatilUyari) {
    const prog = TK.program[plan] || {};
    const dersGunleri = haftaGunleri(w).filter((g) => !g.kapali && prog[g.d.getDay()]);
    if (!dersGunleri.length || !P.some((p) => p.dersler.length)) { ic.innerHTML = tatilUyari + `<div class="uyari">Bu hafta ${esc(PD.planlar[plan].ad)} için işlenecek ders yok (ders günleri tatile denk geliyor ya da hafta tamamlandı).</div>`; return; }
    ic.innerHTML = tatilUyari + `<div class="ust-baslik"><p>MEB günlük plan düzenine göre hazırlanır. Haftanın ders akışı ders programınızdaki günlere (${Object.keys(prog).map((d) => GUN_TAM[d] + " " + prog[d] + " saat").join(", ")}) sırayla bölünür. Ders gününü seçin, bilgileri <a href="#" id="ayarAc">Ayarlar</a>'dan girin.</p>
      <div class="dugmeler"><select id="gpGun" style="width:auto">${dersGunleri.map((g) => `<option value="${isoYaz(g.d)}">${g.ad} ${tarihYaz(g.d)}${g.yarim ? " (yarım gün)" : ""}</option>`).join("")}</select>
      <button class="dugme ana" id="gpBas">Yazdır / PDF</button><button class="dugme" id="gpHepsi">Haftanın tüm günleri</button></div></div><div class="ekran-onizleme" id="gpOn"></div>`;
    const gunP = () => gunePay(P, dersGunleri.length, dersGunleri.findIndex((g) => isoYaz(g.d) === $("#gpGun").value));
    const ciz = () => { $("#gpOn").innerHTML = gunlukPlanHTML(w, gunP(), iso($("#gpGun").value)); };
    $("#gpGun").onchange = ciz; ciz();
    $("#gpBas").onclick = () => bas(gunlukPlanHTML(w, gunP(), iso($("#gpGun").value)));
    $("#gpHepsi").onclick = () => bas(dersGunleri.map((g, i) => gunlukPlanHTML(w, gunePay(P, dersGunleri.length, i), g.d)).join(""));
    $("#ayarAc").onclick = (e) => { e.preventDefault(); ayarAc(); };
  }

  // Haftanın ders akışını ders günlerine sırayla böler (ör. Salı 1-2. adım, Perşembe 3-5. adım)
  function gunePay(P, gunSay, i) {
    if (gunSay <= 1) return P;
    const hepsi = P.flatMap((p, pi) => p.dersler.map((d, di) => ({ pi, di, d })));
    const pay = Math.ceil(hepsi.length / gunSay), dilim = hepsi.slice(i * pay, (i + 1) * pay);
    return P.map((p, pi) => {
      const benim = dilim.filter((x) => x.pi === pi);
      return { ...p, dersler: benim.map((x) => x.d), giris: benim.length && benim[0].di === 0 ? p.giris : "", soru: benim.length && benim[0].di === 0 ? p.soru : "" };
    }).filter((p) => p.dersler.length);
  }

  function gunlukPlanHTML(w, P, gun) {
    const gl = haftaninGunleri(w).map((g) => g.ad).join(", ") || w.gunler || "—";
    const sure = `${(TK.program[plan] || {})[gun.getDay()] || w.saat} × 40' (${GUN_TAM[gun.getDay()]})`;
    const surec = P.map((p) => `<tr><th>${esc(p.ad)}</th><td>${p.giris ? `<b>Giriş:</b> ${esc(p.giris)}<br>` : ""}${p.soru ? `<b>Büyük soru:</b> “${esc(p.soru)}”<br>` : ""}${p.dersler.map((d) => `<b>${esc(d.baslik)}:</b> ${esc(d.metin)}`).join("<br>")}</td></tr>`).join("");
    const fark = P.filter((p) => p.zengin || p.destek).map((p) => `${p.zengin ? `<b>Zenginleştirme:</b> ${esc(p.zengin)} ` : ""}${p.destek ? `<b>Destekleme:</b> ${esc(p.destek)}` : ""}`).join("<br>") || "Öğrenci ihtiyacına göre görev basamakları sadeleştirilir ya da derinleştirilir.";
    const ekler = P.flatMap((p) => p.ekler.map((e) => `${e.ad || "Ek"}: ${e.baslik}`)).join(" • ") || "—";
    return `<div class="sayfa gp">
      <div class="s-ust"><span>${esc(ayar.okul || "BİLİM VE SANAT MERKEZİ")}</span><span>2026-2027 Eğitim Öğretim Yılı</span></div>
      <h1 style="text-align:center">${esc(PD.planlar[plan].ad.toLocaleUpperCase("tr"))} GÜNLÜK DERS PLANI</h1>
      <table>
        <tr><th>Tarih</th><td>${tarihYaz(gun)} (${w.no}. hafta: ${kisaTarih(w.bas, w.bit)})</td><th>Grup</th><td>${esc(ayar.grup || "")}</td></tr>
        <tr><th>Tema</th><td colspan="3">${w.temaNo}. Tema: ${esc(w.tema)} — ${esc(w.icerik)}</td></tr>
        <tr><th>Etkinlik</th><td colspan="3">${esc(w.etkinlik)}</td></tr>
        <tr><th>Süre</th><td colspan="3">${sure}</td></tr>
        <tr><th>Öğrenme çıktıları</th><td colspan="3">${w.kazanimlar.map(esc).join("<br>")}</td></tr>
        <tr><th>Yöntem ve teknikler</th><td colspan="3">${esc(w.yontem)}</td></tr>
        <tr><th>Araç-gereç</th><td colspan="3">${esc(w.materyal)}</td></tr>
        <tr><th>Disiplinler arası</th><td colspan="3">${esc(w.disiplin)}</td></tr>
        <tr><th>Belirli gün/hafta</th><td colspan="3">${esc(gl)}</td></tr>
      </table>
      <h1 style="font-size:12pt">Öğrenme-Öğretme Süreci</h1>
      <table class="gp-surec">${surec}</table>
      <table><tr><th>Ölçme ve değerlendirme</th><td>${esc(w.olcme)}</td></tr>
        <tr><th>Farklılaştırma</th><td>${fark}</td></tr>
        <tr><th>Çalışma kâğıtları</th><td>${esc(ekler)}</td></tr></table>
      <div class="gp-imza"><div><br><br><i></i>${ayar.ogretmen ? esc(ayar.ogretmen) + "<br>" : ""}Öğretmen</div><div>UYGUNDUR<br>${tarihYaz(gun)}<i></i>${ayar.mudur ? esc(ayar.mudur) + "<br>" : ""}Okul Müdürü</div></div>
    </div>`;
  }

  // ---------- öğrenci sunumu ----------
  function slaytlar(w, P, gunler) {
    const S = [];
    const temaAd = `${w.temaNo}. Tema · ${w.tema}`;
    S.push(`<div class="etiket">${w.no}. Hafta · ${kisaTarih(w.bas, w.bit)}</div><h1>${esc(w.etkinlik.replace(/\s*\(2 saat\)/g, ""))}</h1><div class="kapak-alt"><span>${esc(temaAd)}</span><span>${esc(PD.planlar[plan].ad)}</span></div>`);
    gunler.filter((g) => g.tur === "milli" && g.anahtar).slice(0, 2).forEach((g) => S.push(`<div class="etiket">Bu hafta</div><h2>${esc(g.ad)}</h2><p>${esc(g.amac)}</p>`));
    P.forEach((p) => {
      if (p.soru) S.push(`<div class="etiket">Büyük soru · Önce düşün, sonra konuş</div><div class="soru-buyuk">${esc(p.soru)}</div>`);
      (p.sorular || []).slice(1, 4).forEach((q) => S.push(`<div class="etiket">Tartışalım</div><div class="soru-buyuk">${esc(q)}</div>`));
    });
    S.push(`<div class="etiket">Bu hafta neler yapacağız?</div><ul>${w.kazanimlar.map((k) => `<li>${esc(k.replace(/^DEP\.\d+\.\d+\s*/, ""))}</li>`).join("")}</ul>`);
    P.forEach((p) => {
      if (!p.ozgun && !p.sorular) p.dersler.forEach((d, i) => S.push(`<div class="etiket">${esc(p.ad)}</div><h2><span class="ders-no">${i + 1}</span>${esc(d.baslik)}</h2><p>${esc(ilkCumleler(d.metin, 2))}</p>`));
      if (p.ozgun) p.dersler.forEach((d, i) => S.push(`<div class="etiket">${esc(p.ad)} · Görev ${i + 1}</div><h2>${esc(d.baslik)}</h2><div class="gorev-kutu"><p>${esc(d.metin)}</p></div>`));
      p.ekler.forEach((e) => S.push(`<div class="etiket">Çalışma kâğıdı</div><h2>${esc((e.ad || "Ek") + " · " + e.baslik)}</h2>${e.yonerge ? `<div class="gorev-kutu"><p>${esc(e.yonerge)}</p></div>` : `<p>Çalışma kâğıdını al, yönergeyi oku ve grubunla başla.</p>`}`));
      if (p.urun) S.push(`<div class="etiket">Ürünümüz</div><h1>${esc(p.urun)}</h1>`);
    });
    gunler.filter((g) => g.tur !== "milli").slice(0, 2).forEach((g) => S.push(`<div class="etiket">${g.tur === "ab" ? "Avrupa'da bu hafta" : "Dünyada bu hafta"}</div><h2>${esc(g.ad)}</h2><p>${esc(g.amac)}</p>`));
    S.push(`<div class="etiket">Çıkış bileti</div><div class="bilet"><div><b>3</b><p>Bugün öğrendiğim üç şey</p></div><div><b>2</b><p>İlginç bulduğum iki şey</p></div><div><b>1</b><p>Hâlâ merak ettiğim bir soru</p></div></div>`);
    return S;
  }
  function ilkCumleler(t, n) { const c = t.match(/[^.!?]+[.!?]+/g) || [t]; return c.slice(0, n).join(" ").trim(); }

  function sunumSekme(ic, w, P, gunler) {
    const S = slaytlar(w, P, gunler);
    ic.innerHTML = `<div class="ust-baslik"><p>${S.length} slayt. Ok tuşları / tıklama ile ilerleyin. Sunumda zamanlayıcı, rastgele öğrenci ve tahtaya yazma araçları var.</p>
      <div class="dugmeler"><button class="dugme ana" id="sunBasla">▶ Tahtada sunumu başlat</button></div></div>
      <div class="haftalar">${S.map((s, i) => `<button class="hafta-kart" data-i="${i}" style="min-height:150px;font-size:.6rem;overflow:hidden"><div class="hk-ust"><span class="hk-no">${i + 1}</span></div><div class="onizleme-slayt">${s.replace(/<h1/g, "<h3").replace(/<\/h1>/g, "</h3>").replace(/<h2/g, "<h3").replace(/<\/h2>/g, "</h3>")}</div></button>`).join("")}</div>`;
    $("#sunBasla").onclick = () => sunumAc(S, 0, `${w.no}. Hafta · ${w.etkinlik}`);
    ic.querySelectorAll("[data-i]").forEach((b) => b.onclick = () => sunumAc(S, +b.dataset.i, `${w.no}. Hafta · ${w.etkinlik}`));
  }

  let sun = { S: [], i: 0 };
  function sunumAc(S, i, baslik) {
    sun = { S, i }; $("#sunum").hidden = false; $("#sunumBaslik").textContent = baslik;
    tuvalHazirla(); slaytGoster();
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  }
  function slaytGoster() { $("#slayt").innerHTML = sun.S[sun.i]; $("#sSayac").textContent = `${sun.i + 1} / ${sun.S.length}`; tuvalSil(); }
  function slaytGit(d) { const n = sun.i + d; if (n >= 0 && n < sun.S.length) { sun.i = n; slaytGoster(); } }
  function sunumKapat() { $("#sunum").hidden = true; miniDur(); if (document.fullscreenElement) document.exitFullscreen(); }
  $("#sOnce").onclick = () => slaytGit(-1);
  $("#sSonra").onclick = () => slaytGit(1);
  $("#slayt").onclick = () => slaytGit(1);
  let dokunX = null; // telefonda/tahtada parmakla kaydırma
  $("#slayt").addEventListener("touchstart", (e) => dokunX = e.touches[0].clientX, { passive: true });
  $("#slayt").addEventListener("touchend", (e) => { if (dokunX === null) return; const d = e.changedTouches[0].clientX - dokunX; dokunX = null; if (Math.abs(d) > 50) slaytGit(d < 0 ? 1 : -1); });
  document.addEventListener("keydown", (e) => {
    if ($("#sunum").hidden) return;
    if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); slaytGit(1); }
    if (["ArrowLeft", "PageUp"].includes(e.key)) slaytGit(-1);
    if (e.key === "Escape") sunumKapat();
  });
  document.querySelectorAll("[data-s]").forEach((b) => b.onclick = () => {
    const s = b.dataset.s;
    if (s === "kapat") sunumKapat();
    if (s === "kalem") { b.classList.toggle("acik"); $("#kalemTuval").classList.toggle("acik"); }
    if (s === "sil") tuvalSil();
    if (s === "zaman") miniZaman();
    if (s === "kura") miniKura();
  });

  // tahtaya yazma
  let ctx, ciziyor = false;
  function tuvalHazirla() {
    const c = $("#kalemTuval"); c.width = c.clientWidth; c.height = c.clientHeight; ctx = c.getContext("2d");
    ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--vurgu");
    c.onpointerdown = (e) => { ciziyor = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); };
    c.onpointermove = (e) => { if (ciziyor) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } };
    c.onpointerup = c.onpointerleave = () => ciziyor = false;
  }
  function tuvalSil() { if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); }

  // sunum içi mini zamanlayıcı / kura
  let miniT = null;
  function miniDur() { clearInterval(miniT); miniT = null; $("#sunumMini").hidden = true; }
  function miniZaman() {
    if (miniT) { miniDur(); return; }
    const secenek = [1, 2, 3, 5, 10]; let idx = 2, kalan = secenek[idx] * 60, calis = false;
    const m = $("#sunumMini"); m.hidden = false;
    const yaz = () => m.innerHTML = `${zamanYaz(kalan)}<small>${calis ? "dokun: duraklat" : "dokun: başlat · çift dokun: süre değiştir"}</small>`;
    m.onclick = () => { calis = !calis; yaz(); };
    m.ondblclick = () => { idx = (idx + 1) % secenek.length; kalan = secenek[idx] * 60; calis = false; yaz(); };
    miniT = setInterval(() => { if (calis && kalan > 0) { kalan--; if (!kalan) zil(); yaz(); } }, 1000); yaz();
  }
  function miniKura() {
    const liste = ogrenciler(); const m = $("#sunumMini"); m.hidden = false; clearInterval(miniT); miniT = null;
    if (!liste.length) { m.innerHTML = `Liste yok<small>Ayarlar ⚙ → öğrenci listesi</small>`; m.onclick = miniDur; return; }
    let n = 0; const t = setInterval(() => { m.innerHTML = esc(liste[Math.floor(Math.random() * liste.length)]) + "<small>seçiliyor…</small>"; if (++n > 14) { clearInterval(t); m.innerHTML = esc(kuraCek()) + "<small>dokun: kapat</small>"; } }, 80);
    m.onclick = miniDur; m.ondblclick = null;
  }

  // ---------- çalışma kâğıtları ----------
  function kagitSekme(ic, w, P) {
    let html = "";
    P.forEach((p, pi) => {
      html += `<div class="parca-baslik"><h2 style="margin:0">${esc(p.ad)}</h2><span class="rozet">${esc(p.kaynak)}</span></div>`;
      if (p.ozgun) {
        html += `<div class="dugmeler" style="margin-bottom:12px"><button class="dugme ana" data-bas-hepsi="${pi}">Tüm kâğıtları yazdır (${p.ekler.length} sayfa)</button></div><div class="ekran-onizleme">${p.ekler.map((e, i) => kagitHTML(e, w, `Ek ${i + 1}`)).join("")}</div>`;
      } else if (p.pdf) {
        html += `<div class="dugmeler" style="margin-bottom:12px">${p.pdfEk ? `<a class="dugme ana" href="${p.pdfEk}" target="_blank">Yalnız ekleri aç / yazdır</a>` : ""}<a class="dugme ${p.pdfEk ? "" : "ana"}" href="${p.pdf}" target="_blank">Etkinliğin tamamını aç (PDF)</a></div>
          <div class="ek-liste">${p.ekler.map((e) => `<div class="ek-kart"><span class="ek-ad">${esc(e.ad)}</span><b>${esc(e.baslik || "Çalışma kâğıdı")}</b><span class="not">Kitap PDF sayfası ${e.sayfa}</span><a class="dugme kucuk" href="${e.pdf}#page=${e.sayfa - (p.sayfalar ? p.sayfalar[0] - 1 : 0)}" target="_blank">Aç</a></div>`).join("") || '<p class="not">Bu etkinlikte ayrı çalışma kâğıdı yok.</p>'}</div>`;
      }
    });
    html += `<div class="parca-baslik"><h2 style="margin:0">Her hafta kullanılabilir</h2></div><div class="dugmeler"><button class="dugme" id="biletBas">Çıkış bileti (6'lı, kes-dağıt)</button><button class="dugme" id="ozBas">Öz değerlendirme formu</button></div>`;
    ic.innerHTML = html;
    ic.querySelectorAll("[data-bas-hepsi]").forEach((b) => b.onclick = () => bas(P[+b.dataset.basHepsi].ekler.map((e, i) => kagitHTML(e, w, `Ek ${i + 1}`)).join("")));
    $("#biletBas").onclick = () => bas(biletSayfasi(w));
    $("#ozBas").onclick = () => bas(kagitHTML({ baslik: "ÖZ DEĞERLENDİRME FORMU", yonerge: `${w.etkinlik} etkinliğinde kendini değerlendir.`, bloklar: [{ t: "scale", items: w.kazanimlar.map((k) => k.replace(/^DEP\.\d+\.\d+\s*/, "")).concat(["Grubumla iş birliği yaptım.", "Fikirlerimi gerekçeleriyle açıkladım."]) }, { t: "lines", label: "Bu etkinlikte en çok zorlandığım:", n: 2 }, { t: "ticket" }] }, w, "Form"));
  }

  function kagitHTML(e, w, ekAd) {
    const ust = w ? `${w.no}. HAFTA · ${ekAd}` : ekAd;
    return `<div class="sayfa"><div class="s-ust"><span>${esc(ayar.okul || "BİLSEM")} · ${esc(PD.planlar[plan].ad)}</span><span>${esc(ust)}</span></div>
      <h1>${esc(e.baslik)}</h1>
      <div class="s-kimlik"><span>Adı Soyadı:</span><span>Grup:</span><span>Tarih:</span></div>
      ${e.yonerge ? `<div class="s-yonerge">${esc(e.yonerge)}</div>` : ""}
      ${(e.bloklar || []).map(blok).join("")}
      <div class="s-alt"><span>Öğrenci Çalışma Materyali</span><span>Öğretmenler Odası · 2026-2027</span></div></div>`;
  }

  function blok(b) {
    if (b.t === "p") return `<p>${esc(b.x)}</p>`;
    if (b.t === "boxes") return `<div class="s-kutular" style="grid-template-columns:repeat(${b.cols || 2},1fr)">${b.items.map((x) => `<div style="min-height:${b.h || 30}mm">${esc(x)}</div>`).join("")}</div>`;
    if (b.t === "lines") return `<div class="s-cizgi">${b.label ? `<b>${esc(b.label)}</b>` : ""}${"<i></i>".repeat(b.n || 3)}</div>`;
    if (b.t === "cards") return `<div class="s-kartlar ${b.blank ? "bos" : ""}">${b.items.map((x) => `<div>${esc(x)}</div>`).join("")}</div>`;
    if (b.t === "check") return `<ul class="s-kontrol">${b.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    if (b.t === "ticket") return `<div class="s-bilet"><div><b>3</b>Bugün öğrendiğim üç şey</div><div><b>2</b>İlginç bulduğum iki şey</div><div><b>1</b>Hâlâ merak ettiğim soru</div></div>`;
    if (b.t === "scale") return `<table class="s-olcek"><tr><th>İfade</th><th>😊 Evet</th><th>😐 Kısmen</th><th>🙁 Henüz değil</th></tr>${b.items.map((x) => `<tr><td>${esc(x)}</td><td></td><td></td><td></td></tr>`).join("")}</table>`;
    if (b.t === "grid") { let h = ""; for (let r = 0; r < b.n; r++) for (let c = 0; c < b.n; c++) h += `<span>${esc((b.marks || {})[r + "," + c] || "")}</span>`;
      return `<div class="s-izgara" style="grid-template-columns:repeat(${b.n},1fr);width:${b.n * 17}mm">${h}</div>`; }
    if (b.t === "table") {
      const rows = Array.isArray(b.rows) ? b.rows : Array.from({ length: b.rows || 4 }, () => []);
      return `<table><tr>${b.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${b.cols.map((_, i) => `<td>${esc(r[i] || "")}</td>`).join("")}</tr>`).join("")}</table>`;
    }
    return "";
  }

  function kodKagitlari(k) {
    const asama = (a) => ["1 KÂĞIT", "2 TINKERCAD", "3 GERÇEK ARDUINO"].map((x, i) => (i <= a ? "■ " : "□ ") + x).join("   ");
    return [
      { baslik: `${k.ad} · KÂĞIT AŞAMASI`, yonerge: `${asama(0)} — ${k.kagit}`, bloklar: [
        { t: "table", cols: ["Malzeme", "Var mı?"], rows: k.malzeme.map((m) => [m]) },
        { t: "table", cols: ["Parça", "Arduino pini", "Kontrol"], rows: k.pinler },
        { t: "boxes", cols: 2, h: 62, items: ["Devre çizimim", "Algoritmam (akış şeması)"] },
        { t: "lines", label: `Büyük soru: ${k.soru}`, n: 2 }] },
      { baslik: `${k.ad} · TINKERCAD VE GERÇEK DEVRE`, yonerge: `${asama(2)} — ${k.tinker} Sonra: ${k.gercek}`, bloklar: [
        { t: "boxes", cols: 1, h: 34, items: ["Yapay zekâya yazdığım prompt (pinler, koşullar ve süreler açık olsun; kişisel bilgi yazma):"] },
        { t: "table", cols: k.test.cols, rows: k.test.rows },
        { t: "lines", label: "Karşılaştığım hata ve çözümüm:", n: 2 },
        { t: "lines", label: `Geliştir: ${k.gelistir}`, n: 2 },
        { t: "ticket" }] }
    ];
  }

  function biletSayfasi(w) {
    const bir = `<div style="border:1pt dashed #555;padding:4mm;height:88mm"><b>${w.no}. hafta · ${esc(w.etkinlik.slice(0, 44))}</b><div class="s-kimlik" style="grid-template-columns:1fr"><span>Adı:</span></div>${blok({ t: "ticket" })}</div>`;
    return `<div class="sayfa"><div style="display:grid;grid-template-columns:1fr 1fr;gap:0">${bir.repeat(6)}</div></div>`;
  }

  // ---------- belirli gün ve haftalar ----------
  function gunKart(g) {
    const bas = iso(g.bas), bit = iso(g.bit), gecti = bit < bugun;
    const hafta = haftalar().find((w) => bas <= gunEkle(w.bit, 2) && bit >= w.bas);
    const etiket = { milli: "MEB belirli gün", ab: "Avrupa Birliği", dunya: "Uluslararası" }[g.tur];
    return `<div class="kart gun-kart ${g.tur} ${gecti ? "gecmis" : ""}">
      <div class="gun-tarih"><span class="rozet ${g.tur}">${etiket}</span><b>${kisaTarih(bas, bit)}</b>${g.islenis ? `<span>· İşleniş: ${esc(g.islenis)}</span>` : ""}${hafta ? `<a href="#hafta/${hafta.no}">${hafta.no}. hafta</a>` : ""}${g.teyit === false ? '<span class="rozet tatil" title="Tarih resmî olarak duyurulduğunda kontrol edin">tarih teyit edilecek</span>' : ""}</div>
      <h3>${esc(g.ad)}</h3><p class="not">${esc(g.amac)} · ${esc(g.sure)}</p>
      <ol>${g.akis.map((a) => `<li>${esc(a)}</li>`).join("")}</ol>
      <div class="dugmeler"><button class="dugme kucuk ana" data-gun-bas="${g.id}">Çalışma kâğıdını yazdır</button><button class="dugme kucuk" data-gun-sun="${g.id}">Tahtada sun</button>${g.link ? `<a class="dugme kucuk" href="${g.link}" target="_blank" rel="noopener">Resmî sayfa ↗</a>` : ""}</div></div>`;
  }
  function gunKartBagla(k) {
    k.querySelectorAll("[data-gun-bas]").forEach((b) => b.onclick = () => { const g = GN.find((x) => x.id === b.dataset.gunBas); bas(kagitHTML(g.ek, null, g.ad)); });
    k.querySelectorAll("[data-gun-sun]").forEach((b) => b.onclick = () => {
      const g = GN.find((x) => x.id === b.dataset.gunSun);
      const S = [`<div class="etiket">${kisaTarih(iso(g.bas), iso(g.bit))}</div><h1>${esc(g.ad)}</h1><p>${esc(g.amac)}</p>`]
        .concat(g.akis.map((a, i) => `<div class="etiket">Adım ${i + 1}</div><h2>${esc(a)}</h2>`))
        .concat([`<div class="etiket">Çalışma kâğıdı</div><h2>${esc(g.ek.baslik)}</h2><div class="gorev-kutu"><p>${esc(g.ek.yonerge)}</p></div>`]);
      sunumAc(S, 0, g.ad);
    });
  }

  function gunlerSayfa(filtre) {
    const F = [["hepsi", "Tümü"], ["yaklasan", "Yaklaşanlar"], ["milli", "MEB belirli gün ve haftalar"], ["ab", "Avrupa Birliği"], ["dunya", "Uluslararası (BM, UNESCO…)"]];
    let liste = [...GN].sort((a, b) => a.bas.localeCompare(b.bas));
    if (filtre === "yaklasan") liste = liste.filter((g) => iso(g.bit) >= bugun).slice(0, 9);
    else if (filtre !== "hepsi") liste = liste.filter((g) => g.tur === filtre);
    let html = `<div class="ust-baslik"><div><h1>Belirli Gün ve Haftalar · Avrupa ve Dünya Takvimi</h1>
      <p>MEB belirli gün ve haftaları, AB Kod Haftası, Güvenli İnternet Günü, Avrupa Robotik Haftası, Erasmus Günleri ve BM/UNESCO günleri. Her biri için 20-40 dakikalık etkinlik ve basılabilir çalışma kâğıdı var.</p></div></div>
      <div class="filtre">${F.map(([k, ad]) => `<button aria-pressed="${k === filtre}" data-f="${k}">${ad}</button>`).join("")}</div><div class="gun-grid">`;
    let ay = "";
    liste.forEach((g) => { const a = AYLAR[iso(g.bas).getMonth()] + " " + iso(g.bas).getFullYear(); if (a !== ay) { ay = a; html += `<div class="ay-ayrac">${a}</div>`; } html += gunKart(g); });
    $("#sahne").innerHTML = html + "</div>";
    document.querySelectorAll("[data-f]").forEach((b) => b.onclick = () => location.hash = "gunler/" + b.dataset.f);
    gunKartBagla($("#sahne"));
  }

  // ---------- tahta araçları ----------
  function araclarSayfa() {
    $("#sahne").innerHTML = `<div class="ust-baslik"><div><h1>Tahta Araçları</h1><p>Akıllı tahtada tam ekran kullanın (⛶). Öğrenci listesini Ayarlar'dan girin.</p></div></div>
    <div class="araclar">
      <div class="kart"><h2>Zamanlayıcı</h2><div class="sayac" id="zS">05:00</div><div class="ilerleme"><i id="zI"></i></div>
        <div class="dugmeler">${[1, 3, 5, 10, 15, 40].map((d) => `<button class="dugme kucuk" data-dk="${d}">${d} dk</button>`).join("")}</div>
        <div class="dugmeler" style="margin-top:10px"><button class="dugme ana" id="zB">Başlat</button><button class="dugme" id="zR">Sıfırla</button></div></div>
      <div class="kart"><h2>Düşün · Eşleş · Paylaş</h2><div class="secilen" id="dAsama">Hazır</div><div class="sayac" id="dS" style="font-size:4rem">00:00</div>
        <p class="not">1 dk tek başına düşün → 2 dk eşinle konuş → 3 dk sınıfla paylaş</p><div class="dugmeler"><button class="dugme ana" id="dB">Başlat</button></div></div>
      <div class="kart"><h2>Rastgele Öğrenci</h2><div class="secilen" id="kS">—</div>
        <div class="dugmeler"><button class="dugme ana" id="kB">Kura çek</button><button class="dugme" id="kR">Listeyi yenile</button><button class="dugme" id="kL">Listeyi düzenle</button></div>
        <p class="not" id="kN"></p></div>
      <div class="kart"><h2>Grup Oluştur</h2><div class="dugmeler"><label style="display:flex;gap:8px;align-items:center">Grup sayısı <input id="gN" type="number" min="2" max="10" value="4" style="width:80px"></label><button class="dugme ana" id="gB">Grupları oluştur</button></div><div class="gruplar-cikti" id="gC"></div></div>
      <div class="kart"><h2>Grup Puan Tablosu</h2><div class="puanlar" id="pT"></div><div class="dugmeler" style="margin-top:10px"><button class="dugme" id="pS">Sıfırla</button></div></div>
      <div class="kart"><h2>Boş Tahta</h2><p class="not">Tam ekran yazı tahtası: beyin fırtınası, kelime bulutu, çizim.</p><button class="dugme ana" id="bT">Boş tahtayı aç</button></div>
    </div>`;
    // zamanlayıcı
    let top = 300, kalan = 300, t = null;
    const yaz = () => { $("#zS").textContent = zamanYaz(kalan); $("#zI").style.width = (kalan / top * 100) + "%"; $("#zS").classList.toggle("bitti", kalan === 0); };
    document.querySelectorAll("[data-dk]").forEach((b) => b.onclick = () => { clearInterval(t); t = null; top = kalan = b.dataset.dk * 60; $("#zB").textContent = "Başlat"; yaz(); });
    $("#zB").onclick = () => { if (t) { clearInterval(t); t = null; $("#zB").textContent = "Devam"; return; }
      $("#zB").textContent = "Duraklat"; t = setInterval(() => { if (kalan > 0) { kalan--; yaz(); if (!kalan) { zil(); clearInterval(t); t = null; $("#zB").textContent = "Başlat"; } } }, 1000); };
    $("#zR").onclick = () => { clearInterval(t); t = null; kalan = top; $("#zB").textContent = "Başlat"; yaz(); };
    yaz();
    // düşün eşleş paylaş
    $("#dB").onclick = () => { const A = [["Düşün", 60], ["Eşleş", 120], ["Paylaş", 180]]; let a = 0, k = A[0][1];
      const d = () => { $("#dAsama").textContent = A[a][0]; $("#dS").textContent = zamanYaz(k); };
      d(); const it = setInterval(() => { k--; if (k < 0) { zil(); a++; if (a >= A.length) { clearInterval(it); $("#dAsama").textContent = "Bitti"; return; } k = A[a][1]; } d(); }, 1000); };
    // kura
    const kNot = () => $("#kN").textContent = ogrenciler().length ? `Kalan: ${kuraKalan().length} / ${ogrenciler().length} öğrenci (seçilen tekrar çıkmaz)` : "Öğrenci listesi boş — ⚙ Ayarlar'dan ekleyin.";
    $("#kB").onclick = () => { const L = ogrenciler(); if (!L.length) return kNot(); let n = 0;
      const it = setInterval(() => { $("#kS").textContent = L[Math.floor(Math.random() * L.length)]; if (++n > 16) { clearInterval(it); $("#kS").textContent = kuraCek(); kNot(); } }, 70); };
    $("#kR").onclick = () => { kuraHavuz = null; kNot(); $("#kS").textContent = "—"; };
    $("#kL").onclick = ayarAc; kNot();
    // gruplar
    $("#gB").onclick = () => { const L = karistir(ogrenciler()), n = +$("#gN").value; if (!L.length) { $("#gC").innerHTML = '<p class="not">Önce öğrenci listesini girin.</p>'; return; }
      const G = Array.from({ length: n }, () => []); L.forEach((o, i) => G[i % n].push(o));
      $("#gC").innerHTML = G.map((g, i) => `<div><b>${i + 1}. Grup</b>${g.map(esc).join("<br>")}</div>`).join(""); puanGruplar(n); };
    // puan
    puanCiz();
    $("#pS").onclick = () => { localStorage.removeItem("masa.puan"); puanCiz(); };
    $("#bT").onclick = () => sunumAc([`<div class="etiket">Boş tahta · ✎ ile yazın</div>`], 0, "Boş tahta");
  }
  function puanGruplar(n) { localStorage.setItem("masa.puan", JSON.stringify(Array.from({ length: n }, (_, i) => ({ ad: `${i + 1}. Grup`, p: 0 })))); puanCiz(); }
  function puanCiz() {
    const P = JSON.parse(localStorage.getItem("masa.puan") || "null") || [1, 2, 3, 4].map((i) => ({ ad: `${i}. Grup`, p: 0 }));
    $("#pT").innerHTML = P.map((g, i) => `<div class="puan-satir"><span>${esc(g.ad)}</span><button data-p="${i}" data-d="-1">−</button><strong>${g.p}</strong><button data-p="${i}" data-d="1">+</button></div>`).join("");
    $("#pT").querySelectorAll("button").forEach((b) => b.onclick = () => { P[b.dataset.p].p += +b.dataset.d; localStorage.setItem("masa.puan", JSON.stringify(P)); puanCiz(); });
  }

  function zamanYaz(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
  function zil() {
    try { const a = new (window.AudioContext || window.webkitAudioContext)();
      [0, .35, .7].forEach((d) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(.0001, a.currentTime + d); g.gain.exponentialRampToValueAtTime(.4, a.currentTime + d + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d + .3);
        o.start(a.currentTime + d); o.stop(a.currentTime + d + .32); }); } catch (e) { /* ses kapalı olabilir */ }
  }
  function ogrenciler() { return (ayar.ogrenciler || "").split("\n").map((s) => s.trim()).filter(Boolean); }
  function karistir(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  let kuraHavuz = null;
  function kuraKalan() { if (!kuraHavuz || !kuraHavuz.length) kuraHavuz = karistir(ogrenciler()); return kuraHavuz; }
  function kuraCek() { return kuraKalan().pop() || "—"; }

  // ---------- nasıl kullanılır ----------
  function nasilSayfa() {
    $("#sahne").innerHTML = `<div class="nasil"><h1>Nasıl Kullanılır?</h1>
      <div class="kart"><h2>1. Programı seçin</h2><p>Üst çubuktan <b>Destek 1</b>, <b>Destek 3</b> ya da <b>Kodlama</b>'yı seçin. Ders programınız (Salı ve Perşembe Destek 1 ve Destek 3, Çarşamba Kodlama) günlük planlarda kullanılır. Seçim bu bilgisayarda hatırlanır. Bugünün tarihine göre içinde bulunulan hafta otomatik açılır (<b>Bu Hafta</b>).</p></div>
      <div class="kart"><h2>2. Haftayı açın</h2><ol>
        <li><b>Kazanım ve Etkinlik:</b> Öğrenme çıktılarını tek dokunuşla kopyalayın (deftere, e-Okul'a). Büyük soru, giriş, ders ders akış, ölçme ve farklılaştırma burada.</li>
        <li><b>Günlük Plan:</b> Ders gününü seçin, yazdırın ya da “PDF olarak kaydet” deyin. Öğretmen, okul ve müdür adı Ayarlar'dan gelir. Tatil günleri listede çıkmaz.</li>
        <li><b>Öğrenci Sunumu:</b> Tahtada tam ekran açılır. Ok tuşları ya da dokunma ile ilerlenir; ⏱ zamanlayıcı, 🎲 rastgele öğrenci ve ✎ tahtaya yazma sunumun içinde.</li>
        <li><b>Çalışma Kâğıtları:</b> Destek 3 için etkinlik kitabınızın ilgili hafta ekleri ayrı PDF olarak açılır. Destek 1'de MEB materyalindeki etkinlik sayfaları, materyali olmayan haftalarda ise plana göre hazırlanmış A4 çalışma kâğıtları basılır.</li>
        <li><b>Belirli Gün & AB:</b> O haftaya denk gelen MEB belirli günleri ile Avrupa ve dünya etkinlikleri.</li></ol></div>
      <div class="kart"><h2>3. Yazdırma ipucu</h2><p>Yazdır penceresinde <b>Kenar boşlukları: Yok</b> ve <b>Arka plan grafikleri: Açık</b> seçin; sayfa A4 dikey ayarlıdır.</p></div>
      <div class="kart"><h2>Kaynaklar</h2><p>Yıllık planlar: 2026-2027 Destek 1 ve Destek 3 yıllık planları. Etkinlikler: Destek Eğitimi 3 Birleşik Etkinlik Kitabı; MEB BİLSEM Destek Eğitim Programı 1-2 yardımcı ders materyali. Takvim: ${esc(TK.kaynak)}. Tarihi henüz kesinleşmemiş uluslararası etkinlikler “tarih teyit edilecek” etiketiyle gösterilir.</p>
      <div class="dugmeler"><a class="dugme" href="pdf/Destek3-Etkinlik-Kitabi.pdf" target="_blank">Destek 3 etkinlik kitabının tamamı (PDF)</a></div></div></div>`;
  }

  // ---------- yazdırma ----------
  function bas(html) {
    $("#baski").innerHTML = html; document.body.classList.add("basiliyor");
    setTimeout(() => { window.print(); }, 60);
  }
  window.addEventListener("afterprint", () => { document.body.classList.remove("basiliyor"); $("#baski").innerHTML = ""; });

  function yillikPlanSayfalari() {
    const P = PD.planlar[plan];
    const satir = (w) => `<tr><td>${w.no}</td><td>${kisaTarih(w.bas, w.bit)}</td><td>${w.saat}</td><td>${esc(w.tema)}</td><td>${esc(w.etkinlik)}</td><td>${w.kazanimlar.map((k) => esc(k.split(" ")[0])).join(", ")}</td><td>${esc(w.gunler)}</td></tr>`;
    const tablo = (ws) => `<table style="font-size:8.5pt"><tr><th>H</th><th>Tarih</th><th>Saat</th><th>Tema</th><th>Etkinlik</th><th>Kazanım</th><th>Belirli gün/hafta</th></tr>${ws.map(satir).join("")}</table>`;
    const sayfa = (ws, i) => `<div class="sayfa"><div class="s-ust"><span>${esc(ayar.okul || "BİLSEM")}</span><span>${esc(P.ad)} Yıllık Plan Özeti · ${i}</span></div>${tablo(ws)}</div>`;
    return [sayfa(P.haftalar.slice(0, 19), 1), sayfa(P.haftalar.slice(19), 2)].join("");
  }

  // ---------- kopyalama ----------
  function kopyaBagla(k) {
    k.querySelectorAll("[data-kopya]").forEach((b) => b.onclick = async () => {
      const t = b.dataset.kopya;
      try { await navigator.clipboard.writeText(t); } catch (e) { const ta = document.createElement("textarea"); ta.value = t; document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      const eski = b.textContent; b.textContent = "Kopyalandı ✓"; b.classList.add("ok"); setTimeout(() => { b.textContent = eski; b.classList.remove("ok"); }, 1400);
    });
  }

  // ---------- ayarlar / tam ekran ----------
  function ayarAc() {
    const f = $("#ayarlar form"); for (const k of ["ogretmen", "okul", "mudur", "grup", "ogrenciler"]) f.elements[k].value = ayar[k] || "";
    $("#ayarlar").showModal();
  }
  $("#ayarlar").addEventListener("close", () => {
    if ($("#ayarlar").returnValue !== "kaydet") return;
    const f = $("#ayarlar form"); for (const k of ["ogretmen", "okul", "mudur", "grup", "ogrenciler"]) ayar[k] = f.elements[k].value;
    localStorage.setItem("masa.ayar", JSON.stringify(ayar)); kuraHavuz = null; yonlendir();
  });
  $("#btnAyar").onclick = ayarAc;
  $("#btnTam").onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();

  planSec(plan);
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
