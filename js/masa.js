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
      gl.map((g) => `<span class="rozet ${g.tur}">${esc(g.ad)}</span>`).join("") + bugunDersleri() + projeSerit();
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

  // ---------- projeler: TEKNOFEST ve eTwinning ----------
  const PROJE_TUR = {
    teknofest: { ad: "TEKNOFEST", renk: "milli",
      bilgi: "İlkokul ve ortaokul için en uygun yarışma: İnsanlık Yararına Teknolojiler (TÜBİTAK). 2026 takvimi: başvuru 20 Şubat, Ön Değerlendirme Raporu 25 Mart 17.00, sunum teslimi 30 Haziran, çevrim içi sunum 8-20 Temmuz, final Ağustos-Eylül. Takım en fazla 6 öğrenci ve tek danışmandan oluşur. Rapor ve yarı final ön eleme içindir; nihai puanın tamamı prototip ve final sunumundan gelir. Danışman yol gösterir, işi öğrenciler yapar. 2027 tarihleri şartnamede ilan edilince güncelleyin.",
      linkler: [["TEKNOFEST yarışmaları", "https://www.teknofest.org/tr/yarismalar/"], ["İnsanlık Yararına Teknoloji", "https://teknofest.org/tr/yarismalar/insanlik-yararina-teknoloji-yarismasi/"], ["T3 KYS başvuru", "https://www.t3kys.com"]],
      adimlar: ["Problem avı ve alt tema seçimi", "Takımı (en fazla 6) ve danışmanı belirle", "Veri topla, benzer çözümleri araştır", "T3 KYS'den başvuruyu yap", "Ön Değerlendirme Raporunu yaz ve yükle", "Prototipi üret ve test et", "Proje sunumunu hazırla ve yükle", "Çevrim içi sunum (yarı final)", "Final: prototip, poster ve sunum"] },
    etwinning: { ad: "eTwinning", renk: "ab",
      bilgi: "eTwinning, Avrupa Okul Eğitimi Platformu (ESEP) üzerinden okulların ortak proje yürüttüğü Avrupa Komisyonu ağıdır. Türkiye'de Ulusal Destek Servisi MEB YEĞİTEK bünyesindedir. Öğrencileri TwinSpace'e eklemeden önce veli izinlerini alın.",
      linkler: [["Avrupa Okul Eğitimi Platformu", "https://school-education.ec.europa.eu/tr"], ["eTwinning Türkiye", "https://etwinning.meb.gov.tr"]],
      adimlar: ["ESEP'te proje ortağı bul", "Proje planını ortak okulla yaz", "Projeyi kaydet ve onay al", "Veli izinlerini al, öğrencileri TwinSpace'e ekle", "Ortak etkinlikleri yürüt (aylık plan)", "Yaygınlaştır (okul sitesi, pano, veli)", "Değerlendirme anketi ve proje ürünü", "Ulusal / Avrupa Kalite Etiketi başvurusu"] }
  };
  const DURUM = { fikir: "Fikir", basvuru: "Başvuru aşaması", devam: "Devam ediyor", tamam: "Tamamlandı" };
  let projeler = JSON.parse(localStorage.getItem("masa.projeler") || "null") || JSON.parse(JSON.stringify(window.PROJELER || []));
  const projeKaydet = () => { localStorage.setItem("masa.projeler", JSON.stringify(projeler)); seritCiz(); };

  function kalanGun(t) { return t ? Math.round((iso(t) - bugun) / 864e5) : null; }

  function projelerSayfa(tur) {
    const T = PROJE_TUR[tur] ? tur : "teknofest", B = PROJE_TUR[T];
    const liste = projeler.filter((p) => p.tur === T).sort((a, b) => (a.durum === "tamam") - (b.durum === "tamam") || (a.sonTarih || "9").localeCompare(b.sonTarih || "9"));
    $("#sahne").innerHTML = `<div class="ust-baslik"><div><h1>Projeler</h1><p>TEKNOFEST ve eTwinning projelerinizi buraya ekleyin. Yaklaşan son tarihler üst şeritte görünür.</p></div>
        <div class="dugmeler"><button class="dugme ana" id="pYeni">+ Yeni ${B.ad} projesi</button></div></div>
      <div class="sekmeler" role="tablist">${Object.entries(PROJE_TUR).map(([k, v]) => `<button role="tab" aria-selected="${k === T}" data-t="${k}">${v.ad} (${projeler.filter((p) => p.tur === k).length})</button>`).join("")}</div>
      <div class="iki-sutun"><div>${liste.length ? liste.map(projeKart).join("") : `<div class="kart"><p>Henüz ${B.ad} projesi yok.</p><button class="dugme ana" id="pYeni2">+ İlk projeyi ekle</button></div>`}</div>
        <div><div class="kart" style="margin-bottom:16px"><h3>${B.ad} hakkında</h3><p class="not" style="font-size:.92rem">${esc(B.bilgi)}</p>
          <ol class="akis" style="margin-top:8px">${B.adimlar.map((a) => `<li style="padding:8px 0 8px 48px"><span>${esc(a)}</span></li>`).join("")}</ol>
          <div class="dugmeler" style="margin-top:10px">${B.linkler.map(([ad, u]) => `<a class="dugme kucuk" href="${u}" target="_blank" rel="noopener">${ad} ↗</a>`).join("")}</div></div>
        <div class="kart"><h3>Yedek ve paylaşım</h3><p class="not">Projeler bu cihazda saklanır. Telefon ile bilgisayar arasında taşımak için yedeği indirip öbür cihazda yükleyin. Sitede herkese görünmesi için “yayın dosyası”nı indirip <code>js/projeler.js</code> dosyasının yerine koyun.</p>
          <div class="dugmeler" style="margin-top:10px"><button class="dugme kucuk" id="pYedek">Yedeği indir</button><label class="dugme kucuk" style="cursor:pointer">Yedeği yükle<input type="file" id="pYukle" accept=".json" hidden></label><button class="dugme kucuk" id="pYayin">Yayın dosyasını indir</button></div></div></div></div>`;
    document.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => location.hash = "projeler/" + b.dataset.t);
    [$("#pYeni"), $("#pYeni2")].forEach((b) => b && (b.onclick = () => projeFormu({ tur: T })));
    $("#sahne").querySelectorAll("[data-pd]").forEach((b) => b.onclick = () => projeFormu(projeler.find((p) => p.id === b.dataset.pd)));
    $("#sahne").querySelectorAll("[data-psil]").forEach((b) => b.onclick = () => {
      if (b.dataset.onay !== "1") { b.dataset.onay = "1"; b.textContent = "Emin misin? Tekrar dokun"; return; }
      projeler = projeler.filter((p) => p.id !== b.dataset.psil); projeKaydet(); projelerSayfa(T); });
    $("#sahne").querySelectorAll("[data-padim]").forEach((c) => c.onchange = () => {
      const [id, i] = c.dataset.padim.split(":"), p = projeler.find((x) => x.id === id); p.adimlar[+i].tamam = c.checked; projeKaydet(); projelerSayfa(T); });
    $("#sahne").querySelectorAll("[data-pbas]").forEach((b) => b.onclick = () => bas(projeSayfasi(projeler.find((p) => p.id === b.dataset.pbas))));
    $("#pYedek").onclick = () => indir(`projeler-yedek-${isoYaz(bugun)}.json`, JSON.stringify(projeler, null, 2), "application/json");
    $("#pYayin").onclick = () => indir("projeler.js", "// Sitede herkese görünen projeler (Öğretmenler Odası).\nwindow.PROJELER = " + JSON.stringify(projeler, null, 2) + ";\n", "text/javascript");
    $("#pYukle").onchange = async (e) => { try { const v = JSON.parse(await e.target.files[0].text()); if (Array.isArray(v)) { projeler = v; projeKaydet(); projelerSayfa(T); } } catch (x) { alert("Dosya okunamadı."); } };
  }

  function projeKart(p) {
    const k = kalanGun(p.sonTarih), biten = (p.adimlar || []).filter((a) => a.tamam).length, top = (p.adimlar || []).length;
    return `<div class="kart gun-kart ${PROJE_TUR[p.tur].renk}" style="margin-bottom:14px">
      <div class="gun-tarih"><span class="rozet ${p.durum === "tamam" ? "dunya" : PROJE_TUR[p.tur].renk}">${DURUM[p.durum] || "Fikir"}</span>${p.kategori ? `<b>${esc(p.kategori)}</b>` : ""}
        ${p.sonTarih ? `<span class="rozet ${k !== null && k <= 14 && k >= 0 ? "tatil" : ""}">Son tarih: ${tarihYaz(iso(p.sonTarih))}${k >= 0 ? ` · ${k} gün kaldı` : " · geçti"}</span>` : ""}</div>
      <h2 style="margin:8px 0 4px">${esc(p.ad)}</h2>
      ${p.aciklama ? `<p style="margin:4px 0 8px">${esc(p.aciklama)}</p>` : ""}
      <table class="bilgi-tablo">${p.ogrenciler ? `<tr><th>Öğrenciler</th><td>${esc(p.ogrenciler)}</td></tr>` : ""}${p.ortaklar ? `<tr><th>${p.tur === "etwinning" ? "Ortak okullar / ülkeler" : "Danışman / ekip"}</th><td>${esc(p.ortaklar)}</td></tr>` : ""}${p.baslangic ? `<tr><th>Başlangıç</th><td>${tarihYaz(iso(p.baslangic))}</td></tr>` : ""}${p.baglanti ? `<tr><th>Bağlantı</th><td><a href="${esc(p.baglanti)}" target="_blank" rel="noopener">${esc(p.baglanti.replace(/^https?:\/\//, "").slice(0, 50))}</a></td></tr>` : ""}</table>
      ${top ? `<div style="margin-top:10px"><div class="not">İlerleme: ${biten}/${top}</div><div class="ilerleme" style="margin:6px 0 8px"><i style="width:${top ? biten / top * 100 : 0}%"></i></div>
        ${p.adimlar.map((a, i) => `<label style="display:flex;gap:8px;align-items:center;padding:3px 0;font-size:.93rem"><input type="checkbox" style="width:auto" data-padim="${p.id}:${i}" ${a.tamam ? "checked" : ""}>${a.tamam ? `<s>${esc(a.ad)}</s>` : esc(a.ad)}</label>`).join("")}</div>` : ""}
      <div class="dugmeler" style="margin-top:12px">${p.tur === "teknofest" ? `<a class="dugme kucuk ana" href="#odr/${p.id}">Ön Değerlendirme Raporu${p.odr ? ` · %${Math.round(odrKontrol(p.odr).filter((k) => k.ok).length / odrKontrol(p.odr).length * 100)}` : ""}</a>` : ""}<button class="dugme kucuk" data-pd="${p.id}">Düzenle</button><button class="dugme kucuk" data-pbas="${p.id}">Proje kartını yazdır</button><button class="dugme kucuk" data-psil="${p.id}">Sil</button></div></div>`;
  }

  function projeFormu(p) {
    const yeni = !p.id, T = PROJE_TUR[p.tur];
    const d = $("#projeDlg"), f = d.querySelector("form");
    f.innerHTML = `<h2>${yeni ? "Yeni" : "Düzenle:"} ${T.ad} projesi</h2>
      <label>Proje adı <input name="ad" required value="${esc(p.ad || "")}"></label>
      <label>${p.tur === "teknofest" ? "Yarışma kategorisi" : "Proje konusu / yaş grubu"} <input name="kategori" value="${esc(p.kategori || "")}"></label>
      <label>Durum <select name="durum">${Object.entries(DURUM).map(([k, v]) => `<option value="${k}" ${p.durum === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label>Başlangıç <input type="date" name="baslangic" value="${p.baslangic || ""}"></label><label>Son tarih <input type="date" name="sonTarih" value="${p.sonTarih || ""}"></label></div>
      <label>Öğrenciler <input name="ogrenciler" value="${esc(p.ogrenciler || "")}" placeholder="Takım adı ya da öğrenci adları"></label>
      <label>${p.tur === "etwinning" ? "Ortak okullar / ülkeler" : "Danışman / ekip"} <input name="ortaklar" value="${esc(p.ortaklar || "")}"></label>
      <label>Kısa açıklama <textarea name="aciklama" rows="3">${esc(p.aciklama || "")}</textarea></label>
      <label>Bağlantı (TwinSpace, başvuru sayfası, video…) <input name="baglanti" value="${esc(p.baglanti || "")}"></label>
      <label>Adımlar (her satıra bir adım) <textarea name="adimlar" rows="6">${esc((p.adimlar || T.adimlar.map((a) => ({ ad: a }))).map((a) => a.ad).join("\n"))}</textarea></label>
      <menu><button value="iptal" formnovalidate>Vazgeç</button><button value="kaydet" class="ana">Kaydet</button></menu>`;
    d.onclose = () => {
      if (d.returnValue !== "kaydet") return;
      const v = Object.fromEntries(new FormData(f));
      const eski = Object.fromEntries((p.adimlar || []).map((a) => [a.ad, a.tamam]));
      const kayit = { ...p, ...v, id: p.id || "p" + Date.now().toString(36), adimlar: v.adimlar.split("\n").map((s) => s.trim()).filter(Boolean).map((ad) => ({ ad, tamam: !!eski[ad] })) };
      projeler = yeni ? projeler.concat(kayit) : projeler.map((x) => x.id === p.id ? kayit : x);
      projeKaydet(); projelerSayfa(p.tur);
    };
    d.showModal();
  }

  function projeSayfasi(p) {
    const T = PROJE_TUR[p.tur];
    return `<div class="sayfa"><div class="s-ust"><span>${esc(ayar.okul || "BİLSEM")} · ${T.ad}</span><span>Proje Kartı</span></div>
      <h1>${esc(p.ad)}</h1>
      <table><tr><th>Kategori / konu</th><td>${esc(p.kategori || "")}</td><th>Durum</th><td>${DURUM[p.durum] || ""}</td></tr>
        <tr><th>Başlangıç</th><td>${p.baslangic ? tarihYaz(iso(p.baslangic)) : ""}</td><th>Son tarih</th><td>${p.sonTarih ? tarihYaz(iso(p.sonTarih)) : ""}</td></tr>
        <tr><th>Öğrenciler</th><td colspan="3">${esc(p.ogrenciler || "")}</td></tr>
        <tr><th>${p.tur === "etwinning" ? "Ortaklar" : "Danışman / ekip"}</th><td colspan="3">${esc(p.ortaklar || "")}</td></tr>
        <tr><th>Açıklama</th><td colspan="3" style="height:30mm">${esc(p.aciklama || "")}</td></tr>
        <tr><th>Danışman öğretmen</th><td colspan="3">${esc(ayar.ogretmen || "")}</td></tr></table>
      <table><tr><th style="width:12mm">✓</th><th>Adım</th><th style="width:40mm">Tarih / not</th></tr>${(p.adimlar || []).map((a) => `<tr><td>${a.tamam ? "✓" : ""}</td><td>${esc(a.ad)}</td><td></td></tr>`).join("")}</table>
      <div class="s-alt"><span>${T.ad} proje takibi</span><span>Öğretmenler Odası · 2026-2027</span></div></div>`;
  }

  function indir(ad, icerik, tip) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([icerik], { type: tip + ";charset=utf-8" })); a.download = ad; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- TEKNOFEST Ön Değerlendirme Raporu (ÖDR) sihirbazı ----------
  // Bölüm sırası geçmiş yıl şablonlarındaki ortak akışa göre kuruldu; resmî şablon başvurudan sonra
  // takımlara gönderilir, bu taslak oraya aktarılır. Takvim 2026 İYT-İlkokul şartnamesine göre tahminidir.
  const TF_TAHMINI = { tBasvuru: "2027-02-19", tOdr: "2027-03-24", tSunum: "2027-06-30", tCevrim: "2027-07-08", tFinal: "2027-08-30" };
  const TF_YARISMA = ["İnsanlık Yararına Teknolojiler (İlkokul)", "İnsanlık Yararına Teknolojiler (Ortaokul)", "İnsanlık Yararına Teknolojiler (Lise)",
    "Eğitim Teknolojileri", "Akıllı Ulaşım", "Engelsiz Yaşam Teknolojileri", "Deneyap Kart Robolig", "Diğer"];
  const TF_TEMA = ["Doğa, Çevre ve Sürdürülebilirlik › Atık Yönetimi ve Geri Dönüşüm Teknolojileri", "Doğa, Çevre ve Sürdürülebilirlik › Yeşil Teknolojiler ve Yenilenebilir Enerji",
    "Doğa, Çevre ve Sürdürülebilirlik › Akıllı Şehirler ve Sürdürülebilir Yaşam", "Doğa, Çevre ve Sürdürülebilirlik › Doğal Yaşam, Ekosistem ve Biyoçeşitlilik",
    "Doğa, Çevre ve Sürdürülebilirlik › Afet Teknolojileri ve Güvenli Alanlar", "Astronomi, Uzay Bilimleri ve Havacılık › Gezegenimiz ve Evren",
    "Astronomi, Uzay Bilimleri ve Havacılık › Astronomide Gözlemler ve Teleskoplar", "Astronomi, Uzay Bilimleri ve Havacılık › Uzay Teknolojileri, Uydular ve Roketler",
    "Astronomi, Uzay Bilimleri ve Havacılık › Uzayda Yaşam ve Kolonileşme", "Sağlıklı Yaşam › Fiziksel ve Zihinsel Sağlık", "Sağlıklı Yaşam › Besin (Gıda) Teknolojileri",
    "Sağlıklı Yaşam › Sürdürülebilir Tarım ve Biyoteknoloji", "Diğer (şartnamedeki temayı yazın)"];

  const ODR_BOLUM = [
    { id: "takvim0", ad: "0. Yarışma takvimi", not: "2027 şartnamesi yayımlanınca bu tarihleri güncelleyin. Varsayılanlar 2026 İnsanlık Yararına Teknolojiler takvimine göre tahminidir (2026: başvuru 20 Şubat, ÖDR 25 Mart 17.00, sunum 30 Haziran, çevrim içi sunum 8-20 Temmuz).",
      alanlar: [{ k: "tBasvuru", l: "Son başvuru tarihi", tip: "tarih" }, { k: "tOdr", l: "ÖDR son teslim tarihi", tip: "tarih" }, { k: "tSunum", l: "Proje sunumu son teslim", tip: "tarih" },
        { k: "tCevrim", l: "Çevrim içi sunum (yarı final)", tip: "tarih" }, { k: "tFinal", l: "Final (yaklaşık)", tip: "tarih" }] },
    { id: "bilgi", ad: "1. Takım ve proje bilgileri", alanlar: [
      { k: "projeAdi", l: "Proje adı", ip: "Kısa, akılda kalan ve ne yaptığını söyleyen bir ad. Ör. “Dokunmadan Açılan Akıllı Çöp Kutusu”." },
      { k: "yarisma", l: "Yarışma", tip: "secim", se: TF_YARISMA },
      { k: "tema", l: "Ana tema › alt tema", tip: "secim", se: TF_TEMA, ip: "Proje tek bir alt temaya net biçimde oturmalı. Aynı proje birden fazla kategoriye başvurursa başvurular geçersiz sayılır." },
      { k: "takimAdi", l: "Takım adı" }, { k: "okul", l: "Okul / kurum" }, { k: "danisman", l: "Danışman öğretmen (yalnız bir kişi)" },
      { k: "onceki", l: "Bu proje daha önce bir yarışmaya katıldı mı?", ip: "Şartname gereği: katıldıysa yarışmanın adı, yeri, tarihi, düzenleyeni ve sonucu yazılır; eski proje mutlaka geliştirilmiş olmalı. Katılmadıysa “Hayır”." }],
      tablolar: [{ k: "uyeler", l: "Takım üyeleri (en fazla 6 öğrenci; danışman bu sayıya dâhil değil)", cols: ["Ad Soyad", "Sınıf", "Projedeki görevi"], min: 2 }] },
    { id: "ozet", ad: "2. Proje özeti", alanlar: [{ k: "ozet", l: "Projenizi 3-5 cümleyle anlatın", tip: "uzun", hedef: [40, 130],
      ip: "Sırasıyla: Hangi sorunu fark ettik? Ne tasarladık? Nasıl çalışıyor? Kime ne fayda sağlıyor? Okuyan biri 30 saniyede anlamalı. Bu bölümü en son yazın." }] },
    { id: "problem", ad: "3. Problem (sorun) tanımı", alanlar: [
      { k: "problem", l: "Sorun nedir? Nerede, kimde görülüyor?", tip: "uzun", hedef: [40, 200], ip: "Sorunu önce tek cümleyle yazın, sonra nerede ve kimde ortaya çıktığını anlatın. Genel (“dünyada çevre kirliliği var”) değil, yerel ve somut olsun." },
      { k: "farkettik", l: "Sorunu nasıl fark ettiniz?", tip: "uzun", ip: "Kendi gözleminiz, yaşadığınız bir olay, yaptığınız anket ya da görüşme. Hakemler öğrencinin kendi gözlemini görmek ister." },
      { k: "veri", l: "Sorunu gösteren veri (sayı + kaynak)", tip: "uzun", ip: "En az bir sayı ve kaynağı: TÜİK, bakanlık, belediye, WHO/UNICEF raporu ya da kendi anketiniz (“Okulumuzda 80 öğrenciyle yaptığımız ankette %62'si …”). Kaynağı 11. bölüme ekleyin." }] },
    { id: "hedef", ad: "4. Hedef kitle", alanlar: [{ k: "hedef", l: "Projeden kimler, kaç kişi faydalanacak? Onlara nasıl ulaşılacak?", tip: "uzun",
      ip: "“Herkes” yazmayın. Birincil kullanıcı (ör. okulumuzdaki 450 öğrenci), ikincil kullanıcı (temizlik görevlileri), yaklaşık sayı ve ulaşma yolu." }] },
    { id: "cozum", ad: "5. Çözüm önerisi ve çalışma prensibi", alanlar: [
      { k: "cozum", l: "Çözümünüz nedir?", tip: "uzun", ip: "Ne tasarladığınızı tek paragrafta anlatın: bir cihaz mı, uygulama mı, model mi, oyun mu?" },
      { k: "calisma", l: "Nasıl çalışıyor? (adım adım, her satıra bir adım)", tip: "uzun", ip: "Girdi → işlem → çıktı: “1. Ultrasonik sensör yaklaşan eli algılar. 2. Arduino mesafeyi ölçer. 3. 20 cm'den yakınsa servo motor kapağı açar.” Raporda akış şeması ya da çizim kullanacaksanız not düşün." },
      { k: "teknoloji", l: "Malzemeler ve teknolojiler; neden bunları seçtiniz?", tip: "uzun", ip: "Arduino, sensörler, Tinkercad, Scratch, 3B yazıcı, karton maket… Seçim gerekçesi: ucuz, kolay bulunur, güvenli, okulda var." }] },
    { id: "ozgun", ad: "6. Özgünlük ve yenilikçi yön", alanlar: [{ k: "fark", l: "Çözümünüzü benzerlerinden farklı kılan nedir?", tip: "uzun",
      ip: "En az bir somut fark: daha ucuz, daha kolay kullanılır, yerel bir soruna özel, iki fikrin yeni bir birleşimi. Benzerini hiç bulamadık demek yerine en yakın örnekleri yazın." }],
      tablolar: [{ k: "benzer", l: "Benzer çözümler (en az 2)", cols: ["Benzer ürün / proje", "Ne yapıyor?", "Eksiği", "Bizim farkımız"], min: 2 }] },
    { id: "yontem", ad: "7. Bilimsel yöntem", alanlar: [
      { k: "soru", l: "Araştırma sorusu", ip: "Soru işaretiyle bitsin. Ör. “Kapağın kendiliğinden açılması öğrencilerin atığı kutuya atma oranını artırır mı?”" },
      { k: "hipotez", l: "Hipotez (tahmininiz)", ip: "“Bence … çünkü …”" },
      { k: "test", l: "Nasıl test edeceksiniz?", tip: "uzun", ip: "Neyi ölçeceksiniz, kaç kez, nerede? Önce-sonra karşılaştırması, ölçüm tablosu, kontrol durumu. Ör. “Kapak takılmadan önce ve sonra birer hafta kutu çevresine düşen atık sayılacak.”" },
      { k: "etik", l: "Etik ve güvenlik", tip: "uzun", ip: "Anket/görüşme varsa veli ve okul izni; kişisel veri toplanmaması; elektrik ve kesici alet güvenliği; canlılara zarar verilmemesi; kullanılan görsel ve kodlara kaynak gösterilmesi." }] },
    { id: "uygulama", ad: "8. Uygulanabilirlik: malzeme, bütçe ve riskler",
      tablolar: [{ k: "butce", l: "Malzeme ve tahmini maliyet", cols: ["Malzeme", "Adet", "Birim fiyat (TL)", "Nereden?"], min: 3, toplam: true },
        { k: "riskler", l: "Riskler ve B planı", cols: ["Risk", "Olasılık (az/orta/çok)", "B planımız"], min: 2 }] },
    { id: "etki", ad: "9. Toplumsal fayda ve beklenen etki", alanlar: [{ k: "etki", l: "Proje gerçekleşirse ne değişir? Başkaları nasıl kullanabilir?", tip: "uzun",
      ip: "Çevresel, sosyal ve ekonomik fayda. Ölçülebilir yazın: “Okulumuzda kutu dışına düşen atığı yarıya indirmeyi hedefliyoruz.” Yaygınlaştırma: başka okullar, belediye, açık kaynak paylaşım." }] },
    { id: "plan", ad: "10. Proje takvimi (iş-zaman çizelgesi)", not: "“Hazırlık planından doldur” düğmesi bugünden itibaren önerilen takvimi buraya aktarır; sonra düzenleyebilirsiniz.",
      tablolar: [{ k: "takvim", l: "İş-zaman çizelgesi", cols: ["Aşama", "Tarih aralığı", "Çıktı"], min: 4 }] },
    { id: "kaynak", ad: "11. Kaynakça", alanlar: [{ k: "kaynakca", l: "Kaynaklar (her satıra bir kaynak)", tip: "uzun",
      ip: "Yazar/kurum (yıl). Başlık. Bağlantı (Erişim tarihi). Ör. “TÜİK (2024). Atık İstatistikleri. https://data.tuik.gov.tr (Erişim: 12.12.2026)”. Kullandığınız görseller, kodlar ve geçmiş TEKNOFEST raporları da kaynak gösterilmeli." }] }
  ];

  const HAZIRLIK_ONCE = [
    ["Problem avı", "Okulda, evde ve çevrede gözlem yapılır; 10 sorun listelenir, en önemli 3'ü seçilir.", "Sorun listesi"],
    ["Tema ve sorun seçimi", "Sorun şartnamedeki alt temayla eşleştirilir; sorundan etkilenen kişilerle konuşulur.", "Seçilen sorun + alt tema"],
    ["Veri toplama", "Anket ya da gözlem planı yapılır (veli ve okul izni alınır); resmî istatistik aranır.", "Veri tablosu"],
    ["Benzer çözüm araştırması", "En az 2-3 benzer ürün ya da proje bulunur; eksikleri tabloya yazılır.", "Karşılaştırma tablosu"],
    ["Fikir üretme", "Beyin fırtınası ve SCAMPER ile 5 fikir üretilir, ölçütlerle biri seçilir.", "Seçilen çözüm"],
    ["Çözüm tasarımı", "Eskiz çizilir; çalışma prensibi adım adım ve akış şemasıyla yazılır.", "Eskiz + akış şeması"],
    ["Simülasyon", "Tinkercad, Scratch ya da kâğıt modelle ilk deneme yapılır.", "Çalışan simülasyon"],
    ["Malzeme ve bütçe", "Malzeme listesi çıkarılır, fiyatlar araştırılır; okulda olanlar işaretlenir.", "Bütçe tablosu"],
    ["Test planı ve riskler", "Araştırma sorusu, hipotez ve ölçüm planı yazılır; riskler ve B planı belirlenir.", "Test planı"],
    ["ÖDR yazımı 1", "Öğrenciler problem, hedef kitle ve çözüm bölümlerini kendi cümleleriyle yazar.", "Taslak 1"],
    ["ÖDR yazımı 2", "Özgünlük, yöntem, bütçe, takvim ve kaynakça tamamlanır; görseller eklenir.", "Taslak 2"],
    ["Hakem gözüyle kontrol", "Kontrol listesi uygulanır; metin resmî şablona aktarılır, sayfa sınırı kontrol edilir.", "Son taslak"],
    ["ÖDR teslimi", "Son tarihten en az 3 gün önce KYS'ye yüklenir.", "Teslim edilen rapor"]];
  const HAZIRLIK_SONRA = [
    ["İlk maket", "Karton ya da atık malzemeyle ölçekli maket yapılır.", "Maket"],
    ["Çalışan prototip", "Devre, yazılım ve gövde birleştirilir; temel çalışma prensibi gösterilir.", "Çalışan prototip"],
    ["Test", "Ölçüm tablosuyla en az üç deneme yapılır, sonuçlar kaydedilir.", "Test verisi"],
    ["İyileştirme", "Test sonuçlarına göre prototip geliştirilir.", "Prototip 2"],
    ["Proje sunumu hazırlığı", "Sunum şablonu doldurulur; fotoğraf ve video çekilir.", "Sunum dosyası"],
    ["Sunum teslimi", "Proje sunumu KYS'ye yüklenir.", "Teslim edilen sunum"]];

  function pazartesi(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(12, 0, 0, 0); return x; }
  function tatilHaftasi(m) { return [0, 1, 2, 3, 4].every((i) => { const t = tatilBul(gunEkle(m, i)); return t && t.ara; }); }
  function haftalarArasi(bas, bit) { const L = []; for (let m = pazartesi(bas); m <= bit; m = gunEkle(m, 7)) L.push({ m, tatil: tatilHaftasi(m) }); return L; }
  function dagitHaftalara(gorevler, haftalarL) {
    const okul = haftalarL.filter((h) => !h.tatil), n = Math.max(okul.length, 1), T = gorevler.length;
    okul.forEach((h, i) => { h.gorevler = []; });
    gorevler.forEach((g, i) => { const h = okul[Math.min(n - 1, Math.floor(i * n / T))]; if (h) h.gorevler.push(g); });
    let son = null; okul.forEach((h) => { if (h.gorevler.length) son = h.gorevler[h.gorevler.length - 1]; else if (son) h.gorevler.push([son[0] + " (devam)", son[1], son[2]]); });
    return haftalarL;
  }
  function hazirlikPlani(O) {
    const t = (k) => iso(O[k] || TF_TAHMINI[k]);
    const odr = t("tOdr"), bas = bugun > odr ? gunEkle(odr, -21) : bugun;
    const once = dagitHaftalara(HAZIRLIK_ONCE, haftalarArasi(bas, gunEkle(odr, -1)));
    const basv = t("tBasvuru"), hb = once.filter((h) => !h.tatil && h.m <= gunEkle(basv, -7)).pop() || once.find((h) => !h.tatil);
    if (hb) hb.gorevler.unshift(["Başvuru", `Danışman T3 KYS'de takımı oluşturur ve başvuruyu yapar (son gün ${tarihYaz(basv)}).`, "Başvuru tamam"]);
    const sonra = dagitHaftalara(HAZIRLIK_SONRA, haftalarArasi(gunEkle(odr, 1), gunEkle(t("tSunum"), -1)));
    sonra.push({ m: pazartesi(t("tCevrim")), gorevler: [["Çevrim içi sunum (yarı final)", "Sunumu öğrenciler yapar; danışman jüriye sunum yapamaz.", "Yarı final"]] });
    sonra.push({ m: pazartesi(t("tFinal")), gorevler: [["Final", "Prototip, poster ve final sunumu (nihai puanın tamamı bu aşamadan gelir).", "Final"]] });
    return once.concat(sonra);
  }
  function planOzeti(P) { // ardışık aynı görevleri tek satırda birleştirir
    const R = [];
    P.forEach((h) => (h.gorevler || []).forEach((g) => {
      const ad = g[0].replace(" (devam)", ""), son = R[R.length - 1];
      if (son && son.ad === ad) son.bit = gunEkle(h.m, 4); else R.push({ ad, bas: h.m, bit: gunEkle(h.m, 4), cikti: g[2] });
    }));
    return R.map((r) => [r.ad, kisaTarih(r.bas, r.bit), r.cikti]);
  }

  const kelime = (s) => (String(s || "").trim().match(/\S+/g) || []).length;
  const doluSatir = (T) => (T || []).filter((r) => r.some((c) => String(c || "").trim()));
  function butceToplam(O) { return doluSatir(O.butce).reduce((s, r) => s + (parseFloat(String(r[1]).replace(",", ".")) || 0) * (parseFloat(String(r[2]).replace(",", ".")) || 0), 0); }

  function odrKontrol(O) {
    const ilk = String(O.yarisma || "").includes("İlkokul");
    const kaynaklar = String(O.kaynakca || "").split("\n").filter((s) => s.trim()).length;
    const uyeler = doluSatir(O.uyeler).length, oz = kelime(O.ozet), adim = String(O.calisma || "").split("\n").filter((s) => s.trim()).length;
    return [
      ["Proje adı, yarışma ve alt tema seçildi", O.projeAdi && O.yarisma && O.tema],
      ["Takımda 1-6 öğrenci var, danışman yazıldı", uyeler >= 1 && uyeler <= 6 && O.danisman],
      ["Önceki yarışma bilgisi yazıldı (yoksa “Hayır”)", String(O.onceki || "").trim()],
      [`Özet 40-130 kelime (şu an ${oz})`, oz >= 40 && oz <= 130],
      ["Problem somut ve yerel anlatıldı", kelime(O.problem) >= 25],
      ["Sorunu gösteren en az bir sayı var", /\d/.test(O.veri || "")],
      [`Veri için kaynak gösterildi (kaynak sayısı ${kaynaklar}, öneri ${ilk ? "2+" : "3+"})`, kaynaklar >= (ilk ? 2 : 3)],
      ["Hedef kitle “herkes” değil, sayı içeriyor", O.hedef && !/herkes/i.test(O.hedef) && /\d/.test(O.hedef)],
      [`Çalışma prensibi en az 3 adım (şu an ${adim})`, adim >= 3],
      ["Malzeme/teknoloji seçimi gerekçeli", kelime(O.teknoloji) >= 12],
      [`En az 2 benzer çözümle karşılaştırma (şu an ${doluSatir(O.benzer).length})`, doluSatir(O.benzer).length >= 2],
      ["Araştırma sorusu soru işaretiyle bitiyor", /\?\s*$/.test(O.soru || "")],
      ["Hipotez ve test planı yazıldı", O.hipotez && kelime(O.test) >= 15],
      ["Etik/güvenlik ele alındı (anket varsa izin)", O.etik && (!/anket|görüşme/i.test((O.veri || "") + (O.test || "")) || /izin/i.test(O.etik))],
      [`Bütçe en az 3 kalem (toplam ${butceToplam(O).toLocaleString("tr-TR")} TL)`, doluSatir(O.butce).length >= 3],
      ["En az 2 risk ve B planı", doluSatir(O.riskler).length >= 2],
      ["Toplumsal fayda ölçülebilir yazıldı", /\d|%/.test(O.etki || "") && kelime(O.etki) >= 20],
      ["İş-zaman çizelgesi en az 4 aşama", doluSatir(O.takvim).length >= 4]
    ].map(([m, ok]) => ({ m, ok: !!ok }));
  }

  function odrSayfa(id) {
    const p = projeler.find((x) => x.id === id);
    if (!p) { location.hash = "projeler/teknofest"; return; }
    const O = p.odr = p.odr || {};
    O.projeAdi ??= p.ad; O.danisman ??= ayar.ogretmen || ""; O.okul ??= ayar.okul || "";
    for (const k in TF_TAHMINI) O[k] ??= TF_TAHMINI[k];
    const alanHTML = (a) => {
      const v = O[a.k] ?? "";
      const inp = a.tip === "uzun" ? `<textarea data-k="${a.k}" rows="${a.k === "calisma" || a.k === "kaynakca" ? 5 : 4}">${esc(v)}</textarea>`
        : a.tip === "secim" ? `<select data-k="${a.k}"><option value=""></option>${a.se.map((o) => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`
        : `<input data-k="${a.k}" ${a.tip === "tarih" ? 'type="date"' : ""} value="${esc(v)}">`;
      return `<label class="odr-alan"><b>${esc(a.l)}</b>${a.ip ? `<span class="not">${esc(a.ip)}</span>` : ""}${inp}${a.hedef ? `<span class="not" data-kelime="${a.k}"></span>` : ""}</label>`;
    };
    const tabloHTML = (t) => {
      O[t.k] = O[t.k] || []; while (O[t.k].length < t.min) O[t.k].push(t.cols.map(() => ""));
      return `<div class="odr-alan"><b>${esc(t.l)}</b><div style="overflow-x:auto"><table class="odr-tablo"><tr>${t.cols.map((c) => `<th>${esc(c)}</th>`).join("")}<th></th></tr>
        ${O[t.k].map((r, ri) => `<tr>${t.cols.map((_, ci) => `<td><input data-t="${t.k}" data-r="${ri}" data-c="${ci}" value="${esc(r[ci] || "")}"></td>`).join("")}<td><button class="kopya" data-satirsil="${t.k}:${ri}" title="Satırı sil">×</button></td></tr>`).join("")}</table></div>
        <div class="dugmeler" style="margin-top:6px"><button class="dugme kucuk" data-satirekle="${t.k}">+ Satır</button>${t.k === "takvim" ? '<button class="dugme kucuk" id="takvimDoldur">Hazırlık planından doldur</button>' : ""}${t.toplam ? `<span class="not" id="butceT"></span>` : ""}</div></div>`;
    };
    const bolumDolu = (b) => { const A = (b.alanlar || []).map((a) => String(O[a.k] || "").trim()).concat((b.tablolar || []).map((t) => doluSatir(O[t.k]).length ? "x" : ""));
      return [A.filter(Boolean).length, A.length]; };
    $("#sahne").innerHTML = `<div class="ust-baslik"><div><a href="#projeler/teknofest">‹ Projeler</a><h1 style="margin-top:6px">Ön Değerlendirme Raporu</h1>
        <p>${esc(p.ad)} · Öğrenciler soruları kendi cümleleriyle cevaplar; sistem cevapları rapor taslağına, prototip planına ve hazırlık takvimine dönüştürür.</p></div>
        <div class="dugmeler"><button class="dugme" id="odrOrnek">Örnek proje ile doldur</button></div></div>
      <div class="uyari">Şartname gereği proje fikri, tasarım, yazılım ve rapor öğrencilerin emeğiyle üretilmelidir; danışman yalnızca soru sorarak yol gösterir. Jüri, metinle öğrencinin yaşı arasında tutarsızlık görürse ayrıntılı teknik sorular sorabilir. Bu yüzden cevapları öğrencilerin ağzından, onların kelimeleriyle yazın.</div>
      <div class="iki-sutun"><div id="odrForm">${ODR_BOLUM.map((b) => { const [d, t] = bolumDolu(b);
        return `<details class="kart odr-bolum" ${d < t ? "open" : ""}><summary><b>${esc(b.ad)}</b><span class="rozet ${d === t ? "dunya" : ""}" data-bolum="${b.id}">${d}/${t}</span></summary>
          ${b.not ? `<p class="not">${esc(b.not)}</p>` : ""}${(b.alanlar || []).map(alanHTML).join("")}${(b.tablolar || []).map(tabloHTML).join("")}</details>`; }).join("")}</div>
        <div><div class="kart odr-yan"><h3>Hakem gözüyle kontrol</h3><div id="odrKontrol"></div>
          <div class="dugmeler" style="margin-top:14px;flex-direction:column;align-items:stretch">
            <button class="dugme ana" id="odrBas">Rapor taslağını yazdır / PDF</button>
            <button class="dugme" id="odrWord">Word olarak indir (.doc)</button>
            <button class="dugme" id="odrProto">Prototip planını yazdır</button>
            <button class="dugme" id="odrTakvim">Haftalık hazırlık takvimini yazdır</button></div>
          <p class="not" style="margin-top:12px">Resmî ÖDR şablonu başvurudan sonra takımlara gönderilir. Taslağı Word'e indirip başlıkları şablondaki sıraya göre aktarın; sayfa sınırına uyun ve son tarihten en az 3 gün önce yükleyin.</p></div></div></div>`;
    const kontrolCiz = () => {
      const K = odrKontrol(O), ok = K.filter((k) => k.ok).length;
      $("#odrKontrol").innerHTML = `<div class="sayac" style="font-size:3rem;margin:4px 0">${Math.round(ok / K.length * 100)}%</div><div class="ilerleme"><i style="width:${ok / K.length * 100}%"></i></div>
        <ul class="odr-kontrol">${K.map((k) => `<li class="${k.ok ? "ok" : ""}">${k.ok ? "✓" : "○"} ${esc(k.m)}</li>`).join("")}</ul>`;
      document.querySelectorAll("[data-kelime]").forEach((s) => s.textContent = `${kelime(O[s.dataset.kelime])} kelime`);
      const bt = $("#butceT"); if (bt) bt.textContent = `Toplam: ${butceToplam(O).toLocaleString("tr-TR")} TL`;
      ODR_BOLUM.forEach((b) => { const [d, t] = bolumDolu(b), r = document.querySelector(`[data-bolum="${b.id}"]`); if (r) { r.textContent = `${d}/${t}`; r.classList.toggle("dunya", d === t); } });
    };
    let zaman = null;
    const kaydet = () => { clearTimeout(zaman); zaman = setTimeout(() => { p.ad = O.projeAdi || p.ad; if (!p.sonTarih && O.tOdr) p.sonTarih = O.tOdr; projeKaydet(); }, 400); kontrolCiz(); };
    $("#odrForm").addEventListener("input", (e) => {
      const el = e.target;
      if (el.dataset.k) O[el.dataset.k] = el.value;
      if (el.dataset.t) O[el.dataset.t][+el.dataset.r][+el.dataset.c] = el.value;
      kaydet();
    });
    $("#odrForm").addEventListener("change", (e) => { if (e.target.dataset.k) { O[e.target.dataset.k] = e.target.value; kaydet(); } });
    $("#odrForm").addEventListener("click", (e) => {
      const ek = e.target.closest("[data-satirekle]"), sil = e.target.closest("[data-satirsil]");
      if (ek) { const t = ODR_BOLUM.flatMap((b) => b.tablolar || []).find((x) => x.k === ek.dataset.satirekle); O[t.k].push(t.cols.map(() => "")); projeKaydet(); odrSayfa(id); }
      if (sil) { const [k, r] = sil.dataset.satirsil.split(":"); O[k].splice(+r, 1); projeKaydet(); odrSayfa(id); }
      if (e.target.id === "takvimDoldur") { O.takvim = planOzeti(hazirlikPlani(O)); projeKaydet(); odrSayfa(id); }
    });
    $("#odrOrnek").onclick = () => {
      if ($("#odrOrnek").dataset.onay !== "1") { $("#odrOrnek").dataset.onay = "1"; $("#odrOrnek").textContent = "Mevcut cevaplar silinecek. Emin misin?"; return; }
      p.odr = Object.assign({}, TF_TAHMINI, odrOrnek(), { takvim: null }); p.odr.takvim = planOzeti(hazirlikPlani(p.odr)); projeKaydet(); odrSayfa(id);
    };
    $("#odrBas").onclick = () => bas(odrRaporHTML(p));
    $("#odrWord").onclick = () => indir(`ODR-${(O.projeAdi || "proje").replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, "-")}.doc`,
      `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #444;padding:4px;vertical-align:top;text-align:left}th{background:#eee}h1{font-size:16pt}h2{font-size:13pt;margin-top:14pt}</style></head><body>${odrGovde(p)}</body></html>`, "application/msword");
    $("#odrProto").onclick = () => bas(prototipHTML(p));
    $("#odrTakvim").onclick = () => bas(hazirlikHTML(p));
    kontrolCiz();
  }

  function odrGovde(p) {
    const O = p.odr || {}, P = (s) => esc(s || "—").replace(/\n/g, "<br>");
    const tablo = (cols, rows) => `<table><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${doluSatir(rows).map((r) => `<tr>${cols.map((_, i) => `<td>${esc(r[i] || "")}</td>`).join("")}</tr>`).join("")}</table>`;
    const adimlar = String(O.calisma || "").split("\n").filter((s) => s.trim());
    return `<h1>${esc(O.projeAdi || p.ad)}</h1>
      <table><tr><th>Yarışma</th><td>${esc(O.yarisma || "")}</td></tr><tr><th>Ana tema › alt tema</th><td>${esc(O.tema || "")}</td></tr>
        <tr><th>Takım adı</th><td>${esc(O.takimAdi || "")}</td></tr><tr><th>Okul / kurum</th><td>${esc(O.okul || "")}</td></tr>
        <tr><th>Danışman</th><td>${esc(O.danisman || "")}</td></tr><tr><th>Daha önce katıldığı yarışma</th><td>${esc(O.onceki || "")}</td></tr></table>
      <h2>Takım üyeleri</h2>${tablo(["Ad Soyad", "Sınıf", "Projedeki görevi"], O.uyeler)}
      <h2>1. Proje Özeti</h2><p>${P(O.ozet)}</p>
      <h2>2. Problem (Sorun) Tanımı</h2><p>${P(O.problem)}</p><p><b>Sorunu nasıl fark ettik?</b> ${P(O.farkettik)}</p><p><b>Sorunu gösteren veriler:</b> ${P(O.veri)}</p>
      <h2>3. Hedef Kitle</h2><p>${P(O.hedef)}</p>
      <h2>4. Çözüm Önerisi ve Çalışma Prensibi</h2><p>${P(O.cozum)}</p>
      ${adimlar.length ? `<p><b>Çalışma adımları:</b></p><ol>${adimlar.map((a) => `<li>${esc(a.replace(/^\d+[.)-]\s*/, ""))}</li>`).join("")}</ol>` : ""}
      <p><b>Kullanılan malzeme ve teknolojiler:</b> ${P(O.teknoloji)}</p>
      <h2>5. Özgünlük ve Yenilikçi Yön</h2><p>${P(O.fark)}</p>${tablo(["Benzer ürün / proje", "Ne yapıyor?", "Eksiği", "Bizim farkımız"], O.benzer)}
      <h2>6. Bilimsel Yöntem</h2><p><b>Araştırma sorusu:</b> ${P(O.soru)}</p><p><b>Hipotez:</b> ${P(O.hipotez)}</p><p><b>Test planı:</b> ${P(O.test)}</p><p><b>Etik ve güvenlik:</b> ${P(O.etik)}</p>
      <h2>7. Uygulanabilirlik</h2>${tablo(["Malzeme", "Adet", "Birim fiyat (TL)", "Nereden?"], O.butce)}<p><b>Tahmini toplam maliyet:</b> ${butceToplam(O).toLocaleString("tr-TR")} TL</p>
      <p><b>Riskler ve B planı</b></p>${tablo(["Risk", "Olasılık", "B planımız"], O.riskler)}
      <h2>8. Toplumsal Fayda ve Beklenen Etki</h2><p>${P(O.etki)}</p>
      <h2>9. Proje Takvimi</h2>${tablo(["Aşama", "Tarih aralığı", "Çıktı"], O.takvim)}
      <h2>10. Kaynakça</h2><ol>${String(O.kaynakca || "").split("\n").filter((s) => s.trim()).map((k) => `<li>${esc(k)}</li>`).join("")}</ol>`;
  }
  function odrRaporHTML(p) {
    return `<div class="sayfa odr-sayfa"><div class="s-ust"><span>TEKNOFEST · ${esc((p.odr || {}).yarisma || "")}</span><span>Proje Ön Değerlendirme Raporu · TASLAK</span></div>${odrGovde(p)}
      <p class="not" style="margin-top:6mm">Bu taslak resmî ÖDR şablonuna aktarılmak üzere hazırlanmıştır.</p></div>`;
  }

  function prototipHTML(p) {
    const O = p.odr || {}, plan = hazirlikPlani(O), ilk = (ad) => { const h = plan.find((x) => (x.gorevler || []).some((g) => g[0] === ad)); return h ? tarihYaz(h.m) : ""; };
    const asamalar = [
      ["1. Eskiz", "Kâğıtta çizim; ölçüler, parçalar ve hareket yönleri. Çalışma adımları oklarla gösterilir.", "Çözüm tasarımı"],
      ["2. Simülasyon", "Tinkercad / Scratch / kâğıt model ile çalışma mantığı denenir.", "Simülasyon"],
      ["3. İlk maket", "Karton, ahşap ya da yapı bloklarıyla ölçekli model (gerçek boyut şart değil).", "İlk maket"],
      ["4. Çalışan prototip", "Devre, yazılım ve gövde birleşir; temel çalışma prensibi gösterilir.", "Çalışan prototip"],
      ["5. Test", O.test || "Ölçüm tablosuyla en az üç deneme.", "Test"],
      ["6. İyileştirme", "Test sonuçlarına göre değişiklik; önce-sonra fotoğrafı çekilir.", "İyileştirme"],
      ["7. Sunum ve poster", "Prototip görselleri ve açıklamalarla sunum; finalde poster (öğrenciler sunar).", "Proje sunumu hazırlığı"]];
    return `<div class="sayfa"><div class="s-ust"><span>TEKNOFEST · ${esc(O.yarisma || "")}</span><span>Prototip Planı</span></div>
      <h1>${esc(O.projeAdi || p.ad)} · Prototip Planı</h1>
      <div class="s-yonerge">Prototip; fikrin uygulanabilir olduğunu gösteren işlevsel bir modeldir. Görsel estetikten çok, düzeneğin problemi nasıl çözdüğünün gösterilmesi önemlidir. Büyük yapılarda küçültülmüş maket kabul edilir. Danışman yalnızca güvenlik gereken işlerde (kesici alet, sıcak silikon, yüksek voltaj) yardım eder; tasarımı değiştirmez.</div>
      <table><tr><th>Aşama</th><th>Ne yapılacak?</th><th>Başlangıç</th><th>Sorumlu</th><th>✓</th></tr>${asamalar.map((a) => `<tr><td><b>${a[0]}</b></td><td>${esc(a[1])}</td><td>${ilk(a[2])}</td><td></td><td></td></tr>`).join("")}</table>
      <h1 style="font-size:12pt">Çalışma prensibi</h1><ol>${String(O.calisma || "").split("\n").filter((s) => s.trim()).map((a) => `<li>${esc(a.replace(/^\d+[.)-]\s*/, ""))}</li>`).join("") || "<li></li><li></li><li></li>"}</ol>
      <h1 style="font-size:12pt">Malzeme listesi</h1><table><tr><th>Malzeme</th><th>Adet</th><th>Birim fiyat</th><th>Nereden?</th><th>Hazır ✓</th></tr>${doluSatir(O.butce).map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td></td></tr>`).join("") || "<tr><td></td><td></td><td></td><td></td><td></td></tr>".repeat(4)}</table>
      <h1 style="font-size:12pt">Test tablosu</h1><p class="not">${esc(O.soru || "")}</p><table><tr><th>Deneme</th><th>Koşul</th><th>Beklenen</th><th>Ölçülen</th><th>Not</th></tr>${[1, 2, 3, 4, 5].map((i) => `<tr><td>${i}</td><td></td><td></td><td></td><td></td></tr>`).join("")}</table>
      <h1 style="font-size:12pt">Görev dağılımı</h1><table><tr><th>Öğrenci</th><th>Görevi</th></tr>${doluSatir(O.uyeler).map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[2])}</td></tr>`).join("") || "<tr><td></td><td></td></tr>".repeat(3)}</table>
      <div class="s-alt"><span>${esc(O.projeAdi || "")}</span><span>Öğretmenler Odası · TEKNOFEST</span></div></div>`;
  }

  function hazirlikHTML(p) {
    const O = p.odr || {}, P = hazirlikPlani(O);
    return `<div class="sayfa"><div class="s-ust"><span>TEKNOFEST · ${esc(O.yarisma || "")}</span><span>Haftalık Hazırlık Takvimi</span></div>
      <h1>${esc(O.projeAdi || p.ad)} · Haftalık Hazırlık Takvimi</h1>
      <div class="s-yonerge">Başvuru: ${tarihYaz(iso(O.tBasvuru))} · ÖDR teslimi: ${tarihYaz(iso(O.tOdr))} · Sunum teslimi: ${tarihYaz(iso(O.tSunum))} · Final: ${tarihYaz(iso(O.tFinal))}. Tarihler 2027 şartnamesi yayımlanınca güncellenmelidir.</div>
      <table style="font-size:9pt"><tr><th style="width:26mm">Hafta</th><th>Görev</th><th>Ne yapılacak?</th><th style="width:28mm">Çıktı</th><th style="width:8mm">✓</th></tr>
      ${P.map((h) => h.tatil ? `<tr><td>${kisaTarih(h.m, gunEkle(h.m, 4))}</td><td colspan="4"><i>Tatil haftası: evde gözlem ve okuma</i></td></tr>`
        : (h.gorevler || []).map((g, i) => `<tr><td>${i ? "" : kisaTarih(h.m, gunEkle(h.m, 4))}</td><td><b>${esc(g[0])}</b></td><td>${esc(g[1])}</td><td>${esc(g[2])}</td><td></td></tr>`).join("")).join("")}</table>
      <div class="s-alt"><span>${esc(O.projeAdi || "")}</span><span>Öğretmenler Odası · TEKNOFEST</span></div></div>`;
  }

  function odrOrnek() { // ilkokul düzeyinde, kodlama atölyesindeki “Akıllı Kapak” projesinden örnek
    return {
      projeAdi: "Dokunmadan Açılan Akıllı Çöp Kutusu", yarisma: "İnsanlık Yararına Teknolojiler (İlkokul)", tema: TF_TEMA[0], takimAdi: "Temiz Adımlar", okul: ayar.okul || "Bilim ve Sanat Merkezi",
      danisman: ayar.ogretmen || "", onceki: "Hayır",
      uyeler: [["Öğrenci 1", "4. sınıf", "Kodlama ve devre"], ["Öğrenci 2", "4. sınıf", "Anket ve veri"], ["Öğrenci 3", "3. sınıf", "Maket ve tasarım"]],
      ozet: "Okulumuzda öğrencilerin çöp kutusunun kapağına dokunmak istemediği için atıkları kutunun yanına bıraktığını fark ettik. Elimizi yaklaştırınca kapağı kendiliğinden açan bir çöp kutusu tasarladık. Kutunun üstündeki mesafe sensörü eli algılıyor, Arduino kartı servo motora komut veriyor ve kapak açılıyor. Projemiz okulumuzu daha temiz yapmayı ve kapağa dokunarak mikrop bulaşmasını azaltmayı amaçlıyor.",
      problem: "Okulumuzun koridorlarındaki çöp kutularının kapağı elle açılıyor. Öğrenciler kapağa dokunmak istemediği için kâğıt ve ambalajları kutunun üstüne ya da yanına bırakıyor. Bu durum koridorların kirlenmesine ve temizlik görevlilerinin işinin artmasına yol açıyor.",
      farkettik: "Teneffüslerde iki hafta boyunca 3. kat koridorundaki çöp kutusunu gözlemledik ve kutunun yanına bırakılan atıkları saydık. Ayrıca temizlik görevlimizle görüştük.",
      veri: "Gözlemimizde iki haftada kutunun yanına 74 atık bırakıldığını saydık. Okulumuzda 80 öğrenciyle yaptığımız ankette öğrencilerin %61'i kapağa dokunmak istemediğini söyledi.",
      hedef: "Birincil kullanıcı okulumuzdaki yaklaşık 450 öğrenci ve 35 öğretmen. İkincil kullanıcı 4 temizlik görevlisi. Projeyi önce bir koridorda deneyip okul idaresine ve diğer okullara tanıtacağız.",
      cozum: "Ultrasonik mesafe sensörü ve servo motorla çalışan, el yaklaşınca kapağı kendiliğinden açıp birkaç saniye sonra kapatan bir çöp kutusu kapağı tasarladık. Kapak, okuldaki mevcut kutuların üstüne takılabiliyor.",
      calisma: "1. Ultrasonik sensör kutunun önüne yaklaşan eli algılar.\n2. Arduino kartı mesafeyi ölçer.\n3. Mesafe 20 cm'den kısaysa servo motor kapağı açar.\n4. 3 saniye sonra kapak kendiliğinden kapanır.\n5. Kapağın kaç kez açıldığı sayılır ve kaydedilir.",
      teknoloji: "Arduino Uno, HC-SR04 ultrasonik sensör, SG90 servo motor, pil yuvası ve karton gövde kullandık. Bu malzemeleri seçtik çünkü ucuz, kolay bulunuyor ve BİLSEM'deki kodlama atölyesinde kullanmayı öğrendik. Devreyi önce Tinkercad'de denedik.",
      fark: "Piyasadaki sensörlü çöp kutuları pahalı ve okuldaki kutuların değiştirilmesini gerektiriyor. Bizim kapağımız var olan kutuların üstüne takılıyor ve kapağın kaç kez açıldığını sayarak hangi koridorun daha çok kullanıldığını gösteriyor.",
      benzer: [["Sensörlü ev tipi çöp kutusu", "El yaklaşınca açılıyor", "Pahalı; okuldaki kutuya takılamıyor", "Mevcut kutuya takılan ucuz kapak"], ["Pedallı çöp kutusu", "Ayakla açılıyor", "Pedal kırılabiliyor, küçük çocuklar zorlanıyor", "Dokunmadan açılıyor, kullanım sayısını ölçüyor"]],
      soru: "Kapağın kendiliğinden açılması, kutunun yanına bırakılan atık sayısını azaltır mı?",
      hipotez: "Bence azaltır, çünkü öğrenciler kapağa dokunmak zorunda kalmayınca atığı kutuya atmayı tercih eder.",
      test: "Kapağı takmadan önce bir hafta ve taktıktan sonra bir hafta, her gün okul çıkışında kutunun yanına bırakılan atıkları sayacağız. İki haftanın toplamlarını tabloda karşılaştıracağız. Kapağın günde kaç kez açıldığını da Arduino ile kaydedeceğiz.",
      etik: "Anket için okul idaresinden ve velilerden izin aldık; ankette isim sormadık. Devrede düşük gerilimli pil kullanıyoruz. Kesici alet ve sıcak silikon kullanırken danışman öğretmenimiz güvenlik için yanımızda oldu. Kullandığımız görsellere kaynak gösterdik.",
      butce: [["Arduino Uno", "1", "450", "Okulda var"], ["HC-SR04 ultrasonik sensör", "1", "60", "Elektronik malzeme mağazası"], ["SG90 servo motor", "1", "75", "Elektronik malzeme mağazası"], ["Pil yuvası ve kablolar", "1", "50", "Okulda var"]],
      riskler: [["Servo motor kapağı kaldıramaz", "orta", "Kapağı hafif kartondan yaparız ya da daha güçlü servo kullanırız"], ["Sensör koridordan geçenleri algılayıp kapağı gereksiz açar", "çok", "Mesafe eşiğini 20 cm'den 10 cm'ye indiririz"], ["Pil çabuk biter", "orta", "Adaptörle prizden besleriz"]],
      etki: "Okulumuzda kutunun yanına bırakılan atığı en az %50 azaltmayı hedefliyoruz. Kapağa dokunulmadığı için mikrop bulaşması azalacak. Kapağın planlarını ve kodunu ücretsiz paylaşarak başka okulların da yapmasını sağlayacağız.",
      kaynakca: "Arduino (2026). Servo Library Reference. https://docs.arduino.cc (Erişim: 05.12.2026)\nTinkercad (2026). Circuits. https://www.tinkercad.com (Erişim: 05.12.2026)\nOkulumuzda yapılan öğrenci anketi ve koridor gözlem tablosu (Kasım 2026)"
    };
  }

  function projeSerit() {
    return projeler.filter((p) => p.durum !== "tamam" && p.sonTarih && kalanGun(p.sonTarih) >= 0 && kalanGun(p.sonTarih) <= 30)
      .map((p) => `<a class="rozet ${PROJE_TUR[p.tur].renk}" href="#projeler/${p.tur}" style="text-decoration:none">${PROJE_TUR[p.tur].ad}: ${esc(p.ad.slice(0, 28))} · ${kalanGun(p.sonTarih)} gün</a>`).join("");
  }

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
    else if (yol === "projeler") projelerSayfa(a1 || "teknofest");
    else if (yol === "odr") odrSayfa(a1);
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
