// Bağımsız denetim: üreticiden bağımsız, sorulardaki taş sayılarını ve kuralları tahtadan yeniden sayar.
// node araclar/denetle.mjs
import fs from 'fs';
import vm from 'vm';

const bag = { window: {} };
for (const d of ['kulup-etkinlik.js', 'kulup-banka.js']) vm.runInNewContext(fs.readFileSync(new URL('../js/' + d, import.meta.url), 'utf8'), bag);
const { KULUP_ETK: E, KULUP_BANKA: B } = bag.window;

const kes = (S) => [...S.join('')];
const sayi = (S) => { const h = kes(S); return [h.filter((x) => x === 'S').length, h.filter((x) => x === 'B').length]; };
function besler(S) { // çizgileri burada yeniden kurar
  const R = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) for (const [a, b] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const L = [0, 1, 2, 3, 4].map((k) => [r + a * k, c + b * k]); if (L.some(([x, y]) => x > 5 || y < 0 || y > 5)) continue;
    const v = L.map(([x, y]) => S[x][y]); if (v[0] !== '.' && v.every((x) => x === v[0])) R.push(v[0]);
  }
  return R;
}
function dondur(S, q, d) { // q tablasını çevirir
  const T = S.map((s) => [...s]), r0 = q >= 2 ? 3 : 0, c0 = q % 2 ? 3 : 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) T[d === 1 ? r0 + c : r0 + 2 - c][d === 1 ? c0 + 2 - r : c0 + r] = S[r0 + r][c0 + c];
  return T.map((x) => x.join(''));
}
const QN = ['sol üst', 'sağ üst', 'sol alt', 'sağ alt'];
let top = 0; const hata = [];
const yaz = (ad, q, m) => hata.push(`${ad}: ${m} | ${q.metin.slice(0, 50)} | ${(q.tahta.s || []).join('/')}`);

function denetle(i, q, ad) {
  if (!q.tahta || q.tahta.tur !== 'p') return;
  const S = q.tahta.s, [x, y] = sayi(S), F = besler(S); top++;
  const kural = { 1: () => x === 0 && y === 0, 2: () => x === y || x === y + 1, 4: () => x === y, 6: () => x === y, 7: () => x === y, 8: () => x === y + 1, 10: () => x === y };
  if (kural[i] && !kural[i]()) yaz(ad, q, `sayı hatası S=${x} B=${y}`);
  if (i !== 5 && F.length) yaz(ad, q, 'tahtada hazır 5 var');
  if (i === 5) { const k = q.cevap.startsWith('Siyah') ? 'S' : q.cevap.startsWith('Beyaz') ? 'B' : null;
    if (k === 'S' && x !== y + 1) yaz(ad, q, `siyah 5 yaptıysa S=B+1 olmalı: ${x},${y}`);
    if (k === 'B' && x !== y) yaz(ad, q, `beyaz 5 yaptıysa S=B olmalı: ${x},${y}`);
    if (k ? !F.length || F.some((f) => f !== k) : F.length) yaz(ad, q, 'beşli cevapla uyuşmuyor');
    if (!k && x !== y) yaz(ad, q, `sayı: ${x},${y}`); }
  if (i === 9) { const m = q.metin.startsWith('Siyah'); if (m ? x !== y + 1 : x !== y) yaz(ad, q, `oynayan ve sayı uyuşmuyor ${x},${y}`);
    const t = QN.findIndex((a) => q.metin.includes(a + ' tablayı')), d = q.metin.includes('tersine') ? -1 : 1, R = besler(dondur(S, t, d)), s = R.includes('S'), b = R.includes('B');
    const sn = s && b ? 'Berabere.' : s ? 'Siyah kazanır.' : b ? 'Beyaz kazanır.' : 'Oyun sürer.'; if (sn !== q.cevap) yaz(ad, q, `sonuç ${sn} ama cevap ${q.cevap}`); }
  if (i === 7) { const ad2 = q.metin.match(/Siyah ([A-F][1-6])/)[1], T = S.map((s) => [...s]); T[+ad2[1] - 1][ad2.charCodeAt(0) - 65] = 'S'; const f = besler(T.map((a) => a.join(''))).length > 0; if (f !== q.cevap.startsWith('Evet')) yaz(ad, q, '5 oldu mu yanlış'); }
  if (i === 6) { const C = q.do.kare; for (const k of C) { const T = S.map((s) => [...s]), r = +k[1] - 1, c = k.charCodeAt(0) - 65; if (T[r][c] !== '.') yaz(ad, q, 'dolu çukur'); T[r][c] = 'S'; if (!besler(T.map((a) => a.join(''))).length) yaz(ad, q, '5 olmuyor'); } }
  if (i === 8) { const a = q.do.alanlar, t = QN.indexOf(a[0].dogru), d = a[1].dogru.startsWith('↻') ? 1 : -1; if (!besler(dondur(S, t, d)).includes('S')) yaz(ad, q, 'çevirince 5 olmuyor'); }
}
E.Pentago.forEach((e, n) => { for (const q of [...e.sorular, ...e.birlikte]) denetle(n + 1, q, `Kâğıt P${n + 1}`); });
B.Pentago.forEach((L, n) => { if (L.length !== 50) hata.push(`P${n + 1} banka ${L.length}`); L.forEach((q) => denetle(n + 1, q, `Banka P${n + 1}`)); });
B['Küre'].forEach((L, n) => { if (L.length !== 50) hata.push(`K${n + 1} banka ${L.length}`);
  const gor = new Set(); L.forEach((q) => { const k = JSON.stringify([q.tahta, q.metin]); if (gor.has(k)) hata.push(`K${n + 1} tekrar`); gor.add(k);
    if (q.tahta) { const h = q.tahta.s.join(''), m = [...h].filter((x) => x === 'M').length, t = [...h].filter((x) => x === 'T').length; if (m > 7 || t > 7) hata.push(`K${n + 1} taş sayısı ${m},${t}`); } }); });
console.log('denetlenen Pentago tahtası', top, 'hata', hata.length);
console.log(hata.slice(0, 15).join('\n'));
process.exit(hata.length ? 1 : 0);
