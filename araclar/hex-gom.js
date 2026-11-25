// hex/*.hex dosyalarını js/hexler.js içine gömer (okul ağında github.io engelliyken de yükleme çalışsın).
const fs = require("fs"), path = require("path"), K = path.join(__dirname, ".."), D = path.join(K, "hex");
function coz(t) { const bel = Buffer.alloc(32768, 0xff); let son = 0, taban = 0;
  for (const s of t.split(/\r?\n/)) { if (!s.startsWith(":")) continue; const b = Buffer.from(s.slice(1), "hex"), n = b[0], adr = (b[1] << 8) | b[2], tur = b[3];
    if (tur === 0) { b.copy(bel, taban + adr, 4, 4 + n); son = Math.max(son, taban + adr + n); } else if (tur === 2) taban = b.readUInt16BE(4) * 16; else if (tur === 1) break; }
  return bel.subarray(0, son); }
const H = {}; fs.readdirSync(D).filter((f) => f.endsWith(".hex")).sort().forEach((f) => { H[f.replace(/^h|\.hex$/g, "")] = coz(fs.readFileSync(path.join(D, f), "utf8")).toString("base64"); });
fs.writeFileSync(path.join(K, "js", "hexler.js"), "// Otomatik üretildi: node araclar/hex-gom.js — derlenmiş Arduino programları (base64, adres 0'dan)\nwindow.HEXLER = " + JSON.stringify(H, null, 0).replace(/","/g, '",\n"') + ";\n");
console.log(Object.keys(H).length, "program gömüldü");
