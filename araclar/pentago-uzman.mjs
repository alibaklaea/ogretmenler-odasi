// Pentago uzmanı: konumun oyunda oluşup oluşamayacağını, tehditleri ve zorla kazancı inceler; soruları denetler.
//   node araclar/pentago-uzman.mjs analiz "SS..../....../....../BB..../....../......"
//   node araclar/pentago-uzman.mjs denetle        site verisindeki bütün Pentago tahtalarını denetler
//   node araclar/pentago-uzman.mjs cozum [adet]   usta sorularını perfect-pentago.net kesin çözümüyle karşılaştırır
// Kurallar TAZOF 03.10.2026: koyunca 5 → çevirme yok; ikisi birden 5 → berabere; yalnız rakip 5 → rakip kazanır.
import fs from 'fs';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { rotate, has5, moves, winIn1, forcesWin, cellName, QNAME } from './pentago-motor.mjs';

export const coz = (rows) => rows.join('').split('').map((c) => ({ '.': 0, S: 1, B: 2 }[c] ?? 0));
export const sayim = (b) => [b.filter((x) => x === 1).length, b.filter((x) => x === 2).length];
const ROT = []; for (let q = 0; q < 4; q++) for (const d of [1, -1]) ROT.push([q, d]);

// Geriye doğru arama: tahta boş tahtadan kurallı hamlelerle gelinebilir mi?
function ara(b, gor, butce) {
  const k = b.join(''); if (gor.has(k)) return gor.get(k);
  const [s, y] = sayim(b); if (s + y === 0) return true;
  if (butce.n-- <= 0) return null;
  gor.set(k, false);
  const p = s === y + 1 ? 1 : s === y ? 2 : 0; if (!p) return false;
  let belirsiz = false;
  for (const [q, d] of ROT) {
    const r = rotate(b, q, -d); if (has5(r, 1) || has5(r, 2)) continue;
    for (let c = 0; c < 36; c++) {
      if (r[c] !== p) continue; const o = r.slice(); o[c] = 0;
      const v = ara(o, gor, butce); if (v) { gor.set(k, true); return true; } if (v === null) belirsiz = true;
    }
  }
  if (belirsiz) { gor.delete(k); return null; }
  return false;
}
// tur: 'normal' sıra başı, 'orta' bilye kondu tabla çevrilmedi, 'son' oyun bitmiş
export function ulasilir(b, tur = 'normal') {
  const [s, y] = sayim(b), butce = { n: 300000 }, gor = new Map();
  const p = s === y + 1 ? 1 : s === y ? 2 : 0; if (!p) return false;
  if (tur === 'normal') return !has5(b, 1) && !has5(b, 2) ? ara(b, gor, butce) : false;
  const kaldir = (t) => { for (let c = 0; c < 36; c++) { if (t[c] !== p) continue; const o = t.slice(); o[c] = 0; if (has5(o, 1) || has5(o, 2)) continue; const v = ara(o, gor, butce); if (v) return true; } return false; };
  if (tur === 'orta') return !has5(b, 1) && !has5(b, 2) ? kaldir(b) : false;
  if (kaldir(b)) return true; // koyunca 5
  for (const [q, d] of ROT) { const r = rotate(b, q, -d); if (has5(r, p)) continue; if (kaldir(r)) return true; }
  return false;
}
const hamleAd = (m) => m.q < 0 ? `${cellName(m.cell)} (çevirme yok)` : `${cellName(m.cell)} + ${QNAME[m.q]} ${m.d === 1 ? '↻' : '↺'}`;
export const kazananlar = (b, p) => moves(b, p).filter((m) => m.res === 'WIN');
export const savunmalar = (b, p) => moves(b, p).filter((m) => m.res === 'GO' && !winIn1(m.board, 3 - p));
export const zorla = (b, p) => moves(b, p).filter((m) => m.res === 'GO' && !winIn1(m.board, 3 - p) && forcesWin(m.board, p));
export function analiz(b) {
  const [s, y] = sayim(b), p = s === y ? 1 : 2, W = kazananlar(b, p), R = winIn1(b, 3 - p);
  return { siyah: s, beyaz: y, sira: p === 1 ? 'Siyah' : 'Beyaz', dengeli: s === y || s === y + 1, ulasilir: ulasilir(b), birHamle: W.map(hamleAd), rakipTehdit: R,
    savunma: R && !W.length ? savunmalar(b, p).length : null, zorla: W.length ? [] : zorla(b, p).map(hamleAd) };
}
// perfect-pentago.net tahta adı: 6×6 ızgara, her tabla 3 tabanında
export function ad(b) {
  let t = 0n; for (let x = 0n; x < 6n; x++) for (let y = 0n; y < 6n; y++) { const q = 65536n ** (x / 3n * 2n + y / 3n), p = 3n ** (x % 3n * 3n + y % 3n); t += BigInt(b[Number(6n * x + y)]) * p * q; }
  return t.toString();
}
const API = 'https://us-central1-naml-148801.cloudfunctions.net/pentago/';
export async function deger(b) { const n = ad(b), r = await fetch(API + n); if (!r.ok) throw new Error('sorgu ' + r.status); const j = await r.json(); return j[n]; }

function veri() {
  const bag = { window: {} }; for (const d of ['kulup-etkinlik.js', 'kulup-banka.js']) vm.runInNewContext(fs.readFileSync(new URL('../js/' + d, import.meta.url), 'utf8'), bag);
  const { KULUP_ETK: E, KULUP_BANKA: B } = bag.window; return E.Pentago.map((e, i) => ({ no: i + 1, ad: e.ad, L: [...e.sorular, ...e.birlikte, ...B.Pentago[i]] }));
}
const MOD = { 2: null, 4: 'normal', 5: 'son', 6: 'normal', 7: 'normal', 8: 'orta', 9: 'orta', 10: 'normal', 11: 'normal', 12: 'normal' };
function bol(q) { return { b: coz(q.tahta.s), m: q.do.alanlar.find((a) => a.ad === 'Hamle') }; }
const adla = (s) => { const r = s.match(/^([A-F][1-6])/); return r && r[1]; };
function denetle() {
  let top = 0, bil = 0; const H = [];
  for (const { no, ad: isim, L } of veri()) { const tur = MOD[no]; if (!tur) continue;
    for (const q of L) { if (!q.tahta || q.tahta.tur !== 'p') continue; top++;
      const b = coz(q.tahta.s), m = tur === 'son' && !q.cevap.startsWith('Yok') ? 'son' : tur === 'son' ? 'normal' : tur, v = ulasilir(b, m);
      if (v === null) bil++; else if (!v) H.push(`P${no} ${isim}: oyunda oluşamaz | ${q.tahta.s.join('/')}`);
      if (no === 11 || no === 12) { const { m: a } = bol(q), S = no === 11 ? savunmalar(b, 1) : zorla(b, 1), ok = new Set(S.map(hamleAd));
        if (kazananlar(b, 1).length) H.push(`P${no}: siyah zaten tek hamlede kazanıyor`);
        for (const s of a.secenek) if (ok.has(s) !== (s === a.dogru)) H.push(`P${no}: seçenek yanlış ${s} | ${q.tahta.s.join('/')}`); } } }
  console.log(`denetlenen ${top}, belirsiz ${bil}, hata ${H.length}`); console.log(H.slice(0, 15).join('\n')); return H.length ? 1 : 0;
}
async function cozum(adet) {
  let top = 0; const H = []; const bek = () => new Promise((r) => setTimeout(r, 350));
  for (const { no, L } of veri()) { if (no !== 11 && no !== 12 && no !== 10) continue;
    for (const q of L.slice(0, adet)) { const b = coz(q.tahta.s), [s, y] = sayim(b); if (s + y > 17) continue;
      if (no === 10) { const v = await deger(b); await bek(); top++; if (v !== 1) H.push(`P10 kazanç yok ${v} ${q.tahta.s.join('/')}`); continue; }
      const a = q.do.alanlar[0]; const m = moves(b, 1).find((x) => hamleAd(x) === a.dogru); const v = await deger(m.board); await bek(); top++; // beyaz sırada: -1 beyaz kaybeder
      if (no === 12 && v !== -1) H.push(`P12 kesin çözüm kazanç demiyor: ${v} | ${q.tahta.s.join('/')} ${a.dogru}`);
      if (no === 11 && typeof v !== 'number') H.push('P11 yanıt yok'); } }
  console.log(`kesin çözümle karşılaştırılan ${top}, uyuşmayan ${H.length}`); console.log(H.slice(0, 10).join('\n')); return H.length ? 1 : 0;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [, , k, a] = process.argv;
  if (k === 'analiz') console.log(analiz(coz(a.split('/'))));
  else if (k === 'denetle') process.exitCode = denetle();
  else if (k === 'cozum') process.exitCode = await cozum(+a || 12);
  else console.log('analiz | denetle | cozum');
}
