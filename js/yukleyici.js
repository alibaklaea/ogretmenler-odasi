// Arduino Uno'ya tarayıcıdan (Chrome / Edge, Web Serial) program yükleme: STK500v1 (Optiboot) protokolü.
// Arduino IDE gerekmez. Derlenmiş .hex dosyaları hex/ klasöründe (h<hafta>_<sıra>.hex).
window.ARDUINO = (function () {
  const destek = () => "serial" in navigator;
  const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

  function hexCoz(metin) { // Intel HEX → bayt dizisi (adres 0'dan)
    const bel = new Uint8Array(32768); let son = 0, taban = 0;
    for (const satir of metin.split(/\r?\n/)) {
      if (!satir.startsWith(":")) continue;
      const b = satir.slice(1).match(/../g).map((x) => parseInt(x, 16));
      const n = b[0], adr = (b[1] << 8) | b[2], tur = b[3];
      if (b.reduce((a, x) => a + x, 0) & 0xff) throw new Error("HEX dosyası bozuk (sağlama hatası).");
      if (tur === 0) { for (let i = 0; i < n; i++) bel[taban + adr + i] = b[4 + i]; son = Math.max(son, taban + adr + n); }
      else if (tur === 2) taban = ((b[4] << 8) | b[5]) * 16;
      else if (tur === 4) taban = ((b[4] << 8) | b[5]) * 65536;
      else if (tur === 1) break;
    }
    if (son > 32256) throw new Error("Program Arduino Uno'ya sığmıyor.");
    return bel.slice(0, son);
  }

  // seri port okuyucu: gelen baytları kuyrukta biriktirir
  let kayit = [], t0 = 0; // tanı kaydı: kartla konuşulan baytlar
  const hx = (b) => { const a = Array.from(b); return a.slice(0, 10).map((x) => x.toString(16).padStart(2, "0")).join(" ") + (a.length > 10 ? ` …(${a.length} bayt)` : ""); };
  const kaydet = (t) => { if (kayit.length < 400) kayit.push(`${String(Date.now() - t0).padStart(5)} ms  ${t}`); };
  function okuyucu(port) {
    const kuyruk = []; let bekleyen = null, dur = false;
    const r = port.readable.getReader();
    (async () => { try { while (!dur) { const { value, done } = await r.read(); if (done) break; if (value && value.length) { kaydet("← " + hx(value)); kuyruk.push(...value); if (bekleyen) bekleyen(); } } } catch (e) { kaydet("okuma durdu: " + e.message); } })();
    return {
      async al(n, ms = 600) {
        const bitis = Date.now() + ms;
        while (kuyruk.length < n) { const kalan = bitis - Date.now(); if (kalan <= 0) throw new Error("zaman aşımı"); await new Promise((ok) => { bekleyen = ok; setTimeout(ok, kalan); }); bekleyen = null; }
        return kuyruk.splice(0, n);
      },
      temizle() { kuyruk.length = 0; },
      async kapat() { dur = true; try { await r.cancel(); } catch (e) { } r.releaseLock(); }
    };
  }

  async function portSec() {
    const izinli = await navigator.serial.getPorts();
    return izinli.length === 1 ? izinli[0] : navigator.serial.requestPort();
  }

  // hexMetin: .hex içeriği; o.baud: 115200 (Uno) / 57600 (eski Nano); o.durum(metin, yüzde)
  async function yukle(hexMetin, o = {}) {
    const durum = o.durum || (() => {}), baud = o.baud || 115200;
    const veri = o.veri || hexCoz(hexMetin);
    const port = o.port || await portSec();
    if (!o.kayitDevam) { kayit = []; t0 = Date.now(); } kaydet(`port açılıyor, hız ${baud}`);
    await port.open({ baudRate: baud });
    const w = port.writable.getWriter(), R = okuyucu(port);
    const yaz = (b) => { kaydet("→ " + hx(b)); return w.write(new Uint8Array(b)); };
    const sinyal = async (v) => { kaydet(`DTR/RTS ${v ? 1 : 0}`); await port.setSignals({ dataTerminalReady: v, requestToSend: v }); };
    let adim = "";
    const komut = async (b, cevap = 0, ms = 1000) => { await yaz([...b, 0x20]); let x;
      try { x = await R.al(cevap + 2, ms); } catch (e) { throw new Error(`Arduino cevap vermedi (${adim}).`); }
      if (x[0] !== 0x14 || x[x.length - 1] !== 0x10) throw new Error(`Arduino beklenmeyen cevap verdi (${adim}).`); return x.slice(1, 1 + cevap); };
    // Gerçek CH340 Uno klonuyla ölçüldü: resetten sonra ~300 ms dolmadan bayt gönderilirse önyükleyici şaşırıp
    // eski programa geçiyor. Bu yüzden önce bekle, sonra tek tek (cevabı bekleyerek) senkron gönder.
    async function bagla() {
      for (const bek of [300, 450, 200, 650]) {
        await sinyal(false); await bekle(250);
        await sinyal(true); await bekle(bek);
        R.temizle();
        for (let i = 0; i < 3; i++) {
          await yaz([0x30, 0x20]);
          let x = []; try { x = await R.al(2, 300); } catch (e) { R.temizle(); continue; }
          if (x[0] === 0x14 && x[1] === 0x10) { kaydet(`eşleşti (bekleme ${bek} ms)`); return; }
          R.temizle(); break; // çöp geldi: önyükleyici çıktı, yeniden başlat
        }
      }
      throw new Error("Arduino'ya bağlanılamadı. Kart türü (Uno / eski Nano) doğru mu? Seri Monitör ya da Arduino IDE açıksa kapatın.");
    }
    try {
      let son = null;
      for (let tur = 1; tur <= 3; tur++) {
        try {
          durum(tur === 1 ? "Arduino yeniden başlatılıyor…" : `Tekrar deneniyor (${tur}/3)…`, 0);
          await bagla();
          adim = "kart kimliği okuma";
          const imza = await komut([0x75], 3);
          if (imza[0] !== 0x1e || imza[1] !== 0x95 || imza[2] !== 0x0f) throw Object.assign(new Error(`Kart ATmega328P değil (imza ${imza.map((x) => x.toString(16)).join(" ")}).`), { kesin: true });
          adim = "programlama modu"; await komut([0x50]);
          const SAYFA = 128, n = Math.ceil(veri.length / SAYFA);
          for (let s = 0; s < n; s++) {
            const adr = (s * SAYFA) >> 1, parca = Array.from(veri.slice(s * SAYFA, (s + 1) * SAYFA));
            while (parca.length < SAYFA) parca.push(0xff);
            adim = `yazma, sayfa ${s + 1}/${n}`;
            await komut([0x55, adr & 0xff, adr >> 8]);
            await komut([0x64, 0, SAYFA, 0x46, ...parca], 0, 2000);
            durum(`Yükleniyor… ${s + 1}/${n} sayfa`, Math.round((s + 1) / n * 80));
          }
          for (let s = 0; s < n; s++) { // doğrulama: yazılanı geri oku
            const adr = (s * SAYFA) >> 1; adim = `doğrulama, sayfa ${s + 1}/${n}`;
            await komut([0x55, adr & 0xff, adr >> 8]);
            const oku = await komut([0x74, 0, SAYFA, 0x46], SAYFA, 2000);
            const bek = veri.slice(s * SAYFA, (s + 1) * SAYFA);
            for (let i = 0; i < bek.length; i++) if (oku[i] !== bek[i]) throw new Error(`Doğrulama hatası (sayfa ${s + 1}).`);
            durum(`Doğrulanıyor… ${s + 1}/${n}`, 80 + Math.round((s + 1) / n * 20));
          }
          adim = "bitiş"; await komut([0x51]).catch(() => {});
          durum(`Yükleme tamamlandı ✓ (${veri.length} bayt). Program çalışıyor.`, 100);
          return port;
        } catch (e) { son = e; kaydet("HATA: " + e.message); if (e.kesin || /bağlanılamadı/.test(e.message)) throw e; }
      }
      throw son;
    } finally {
      try { w.releaseLock(); } catch (e) { }
      await R.kapat();
      await port.close().catch(() => {});
    }
  }

  // Seri Monitör: 9600 baud satır satır okur; durdur() ile kapanır
  async function monitor(port, satir) {
    port = port || await portSec();
    await port.open({ baudRate: 9600 });
    const r = port.readable.getReader(), dc = new TextDecoder(); let tampon = "", dur = false;
    (async () => { try { while (!dur) { const { value, done } = await r.read(); if (done) break; tampon += dc.decode(value, { stream: true }); const p = tampon.split(/\r?\n/); tampon = p.pop(); p.forEach(satir); } } catch (e) { } })();
    return async () => { dur = true; try { await r.cancel(); } catch (e) { } r.releaseLock(); await port.close().catch(() => {}); };
  }

  return { destek, hexCoz, yukle, monitor, portSec, kayit: () => kayit.join(String.fromCharCode(10)) };
})();
