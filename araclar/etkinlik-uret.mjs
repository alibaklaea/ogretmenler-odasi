// Kural etkinliklerini üretir: node araclar/etkinlik-uret.mjs → js/kulup-etkinlik.js
// Cevaplar kural motorlarından hesaplanır; birden çok doğru cevap ya da kuralı belirsiz kalan soru üretimi durdurur.
import fs from 'fs';
import { rotate, has5, moves, winIn1, LINES, cellName, QNAME } from './pentago-motor.mjs';
import { savunmalar, zorla, ulasilir } from './pentago-uzman.mjs';

let tohum = 20261030;
const rnd = (n) => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return Math.floor((tohum / 4294967296) * n); };
const yon = (d) => (d === 1 ? 'saat yönünde ↻' : 'saat yönünün tersine ↺');
const karistir = (L) => { const a = L.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const birak = (kosul, not) => { if (!kosul) throw new Error('SORU REDDEDİLDİ: ' + not); };

// dokunmatik cevap: do = { kare: [...], alanlar: [{ ad, secenek, dogru }], cizim: [...] }
const alan = (ad, secenek, dogru) => { birak(secenek.includes(dogru), `alan ${ad}: ${dogru}`); return { ad, secenek, dogru }; };
const EH = (d) => alan('Cevap', ['Evet', 'Hayır'], d ? 'Evet' : 'Hayır');
const adSec = (i) => { const c = i % 6, r = Math.floor(i / 6), Y = [i, r * 6 + (c + 1) % 6, ((r + 1) % 6) * 6 + c, ((r + 2) % 6) * 6 + (c + 3) % 6]; return Y.map(cellName).sort(); };
const tablaAlan = (d) => alan('Tabla', QNAME, d);
const yonAlan = (d) => alan('Yön', ['↻ saat yönünde', '↺ tersine'], d === 1 ? '↻ saat yönünde' : '↺ tersine');

// ---------- Pentago ----------
const PH = { 0: '.', 1: 'S', 2: 'B' };
const satirlar = (b) => [0, 1, 2, 3, 4, 5].map((r) => b.slice(r * 6, r * 6 + 6).map((x) => PH[x]).join(''));
const coz = (rows) => rows.join('').split('').map((c) => ({ '.': 0, S: 1, B: 2 }[c]));
const hucre = (i) => [Math.floor(i / 6), i % 6];
const pt = (b, m) => ({ tur: 'p', s: satirlar(b), m: (m || []).map(([i, k]) => [...hucre(i), k]) });
const hucreNo = (ad) => (ad.charCodeAt(0) - 65) + (+ad[1] - 1) * 6;
const tablaAd = (i) => { const [r, c] = hucre(i); return QNAME[(r >= 3 ? 2 : 0) + (c >= 3 ? 1 : 0)]; };

function yonBul(L) { const f = L[1] - L[0]; return f === 1 ? 'yatay' : f === 6 ? 'dikey' : 'çapraz'; }
function besli(b) {
  const r = [];
  for (const p of [1, 2]) LINES.filter((L) => L.every((i) => b[i] === p)).forEach((L) => r.push({ p, L }));
  return r;
}
function dolgu(b, n, yasak) { // dengeyi bozmadan rastgele taş serper
  let k = 0;
  while (k < n) { const i = rnd(36); if (b[i] || yasak.has(i)) continue; b[i] = k % 2 ? 1 : 2; k++; }
}

function p1(L = ['B2', 'E2', 'B5', 'F6']) {
  const sorular = [{ metin: 'Tahtayı say: Kaç çukur var? Kaç tabla var?', tahta: pt(Array(36).fill(0)), alt: 'Çukur: ........  Tabla: ........', cevap: '36 çukur, 4 tabla.', do: { alanlar: [alan('Çukur', ['16', '25', '36', '64'], '36'), alan('Tabla', ['2', '4', '6', '9'], '4')] } }];
  for (const ad of L) {
    const i = hucreNo(ad);
    sorular.push({ metin: 'Yıldızlı çukurun adı ne? Hangi tablada?', tahta: pt(Array(36).fill(0), [[i, '*']]), alt: 'Adı: ......  Tabla: ....................', cevap: `${ad}, ${tablaAd(i)} tabla.`, do: { alanlar: [alan('Adı', adSec(i), ad), tablaAlan(tablaAd(i))] } });
  }
  const i = hucreNo('C4');
  sorular.push({ metin: 'C4 çukuruna halka çiz. Hangi tablada?', tahta: pt(Array(36).fill(0)), tahtaC: pt(Array(36).fill(0), [[i, 'o']]), alt: 'Tabla: ....................', cevap: `C4, ${tablaAd(i)} tabla.`, do: { kare: ['C4'], alanlar: [tablaAlan(tablaAd(i))] } });
  return { ad: 'Tablalar ve çukurlar', kurallar: [1], yonerge: 'Tahta 6 × 6 ve dört 3 × 3 tabladan oluşur. Çukurun adı önce harf, sonra sayı ile okunur: C4 gibi.', sorular };
}
function p2(L = [[3, 3], [4, 3], [5, 4], [6, 6], [2, 1], [7, 7]]) {
  const sorular = [];
  for (const [s, b] of L) {
    const t = Array(36).fill(0);
    let k = 0; while (k < s + b) { const i = rnd(36); if (t[i]) continue; t[i] = k < s ? 1 : 2; k++; }
    birak(!has5(t, 1) && !has5(t, 2), 'p2 beşli');
    sorular.push({ metin: 'Siyah ve beyaz bilyeleri say. Sıra kimde?', tahta: pt(t), alt: 'Siyah: ....  Beyaz: ....  Sıra: ............', cevap: `Siyah ${s}, beyaz ${b}. Sıra ${s === b ? 'siyahta: sayılar eşit, siyah başlar' : 'beyazda: siyah bir bilye önde'}.`, do: { alanlar: [alan('Sıra kimde?', ['Siyah', 'Beyaz'], s === b ? 'Siyah' : 'Beyaz')] } });
  }
  return { ad: 'Sıra kimde?', kurallar: [2, 3], yonerge: 'Siyah başlar, sonra sırayla oynanır. Bilye sayılarına bakarak sıranın kimde olduğunu bulabilirsin.', sorular };
}
const tablaDon = (s, d) => { const r = [[], [], []]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (d === 1) r[j][2 - i] = s[i][j]; else r[2 - j][i] = s[i][j]; } return r.map((x) => x.join('')); };
function p3(L = [[['SS.', '..B', 'S..'], 1], [['S..', 'S..', 'B.B'], 1], [['.B.', 'S.S', '...'], -1], [['SSB', '...', '...'], -1], [['S.B', '.B.', '..S'], 1], [['BS.', 'S..', '..B'], -1]]) {
  const sorular = L.map(([s, d]) => ({
    metin: `Tablayı ${yon(d)} 90° çevir. Bilyeleri sağdaki boş tablaya çiz.`, tahta: { tur: 'p3', s }, tahta2: { tur: 'p3', s: ['...', '...', '...'] }, tahta2C: { tur: 'p3', s: tablaDon(s, d) }, cevap: 'Doğru çizim yanda.', do: { cizim: tablaDon(s, d) } }));
  return { ad: 'Tablayı çevir', kurallar: [3], yonerge: 'Bir tabla 90° döner: saat yönünde ↻ ya da tersine ↺. Köşedeki bilye köşede, kenardaki kenarda kalır; ortadaki yerinden oynamaz.', sorular };
}
function p4(L = [['A1', 0, 1], ['C1', 0, -1], ['B3', 0, 1], ['D2', 1, 1], ['F4', 3, -1], ['B6', 2, -1]]) {
  const sorular = [];
  for (const [ad, q, d] of L) {
    const i = hucreNo(ad), t = Array(36).fill(0);
    t[i] = 1; dolgu(t, 5, new Set([i]));
    const iz = t.map((_, k) => k === i ? 9 : 0), son = rotate(iz, q, d).indexOf(9);
    birak(son !== i, 'p4 oynamadı ' + ad); birak(tablaAd(i) === QNAME[q], `p4 başka tabla ${ad}`);
    sorular.push({ metin: `${ad}'deki yıldızlı bilye ${QNAME[q]} tablada. Tablayı ${yon(d)} çevirince nereye gelir?`, tahta: pt(t, [[i, 'y']]), alt: 'Yeni yeri: ........', tahtaC: pt(rotate(t, q, d), [[son, 'y']]), cevap: `${cellName(son)}.`, do: { kare: [cellName(son)] } });
  }
  return { ad: 'Çevirince nereye gider?', kurallar: [3], yonerge: 'Bilyeler tablayla birlikte döner. Tablayı kafanda çevir ya da parmağınla izle.', sorular };
}
// bilye sayısı kuralı: sıra siyahtaysa S = B; siyah koyduysa S = B + 1; beyaz koyduysa S = B
const say = (b) => [b.filter((x) => x === 1).length, b.filter((x) => x === 2).length];
const temiz = (b) => !has5(b, 1) && !has5(b, 2);
function serp(b, p, n, yasak = new Set()) { let k = 0, d = 0; while (k < n) { birak(++d < 5000, 'serp'); const i = rnd(36); if (b[i] || yasak.has(i)) continue; b[i] = p; k++; } return b; }
function dengele(b, sHedef, bHedef, yasak) { const [x, y] = say(b); if (x > sHedef || y > bHedef) return false; serp(b, 1, sHedef - x, yasak); serp(b, 2, bHedef - y, yasak); return true; }
function tekCukur(b, p) { const r = []; for (let i = 0; i < 36; i++) { if (b[i]) continue; const c = b.slice(); c[i] = p; if (has5(c, p)) r.push(i); } return r; }
function sonuc(R) { const s = has5(R, 1), b = has5(R, 2); return s && b ? 'Berabere' : s ? 'Siyah kazanır' : b ? 'Beyaz kazanır' : 'Oyun sürer'; }
function uret(n, f) { const R = [], gor = new Set(); let d = 0; while (R.length < n) { birak(++d < 3000000, 'üretim bitti ' + f.name + ' ' + R.length); const q = f(R.length); if (!q) continue; const k = JSON.stringify([q.tahta, q.metin]); if (gor.has(k)) continue; gor.add(k); R.push(q); } return R; }

function g5(i) {
  const tur = 'SBSYBY'[i % 6], L = LINES[rnd(32)], b = Array(36).fill(0), e = rnd(3);
  if (tur === 'Y') { const bosluk = L[1 + rnd(3)], p = 1 + rnd(2); L.forEach((x) => { if (x !== bosluk) b[x] = p; }); if (rnd(2)) b[bosluk] = 3 - p; const y = new Set([bosluk]); if (!dengele(b, 5 + e, 5 + e, y)) return null; }
  else if (tur === 'S') { L.forEach((x) => { b[x] = 1; }); if (!dengele(b, 5 + e, 4 + e, new Set())) return null; }
  else { L.forEach((x) => { b[x] = 2; }); if (!dengele(b, 5 + e, 5 + e, new Set())) return null; }
  const F = besli(b); if (F.length !== (tur === 'Y' ? 0 : 1)) return null;
  const a = F[0];
  return { metin: 'Burada 5 var mı? Varsa kimin, hangi yönde? Beşliyi çiz.', tahta: pt(b), alt: 'Kim: ............  Yön: ............', tahtaC: pt(b, a ? a.L.map((x) => [x, 'o']) : []), cevap: a ? `${a.p === 1 ? 'Siyah' : 'Beyaz'}, ${yonBul(a.L)}.` : 'Yok: araya boşluk ya da rakip bilye girince 5 sayılmaz.', do: { alanlar: [alan('Kim?', ['Siyah', 'Beyaz', 'Yok'], a ? (a.p === 1 ? 'Siyah' : 'Beyaz') : 'Yok'), alan('Yön', ['yatay', 'dikey', 'çapraz', 'yok'], a ? yonBul(a.L) : 'yok')] } };
}
function g6() {
  const L = LINES[rnd(32)], m = L[rnd(5)], b = Array(36).fill(0), e = rnd(3); L.forEach((x) => { if (x !== m) b[x] = 1; });
  dengele(b, 4 + e, 4 + e, new Set([m])); if (!temiz(b) || tekCukur(b, 2).length) return null;
  const C = tekCukur(b, 1); if (C.length < 1 || C.length > 2) return null;
  return { metin: C.length > 1 ? 'Sıra siyahta. Bilyeyi nereye koyarsa hemen 5 olur? İki yer bul.' : 'Sıra siyahta. Bilyeyi nereye koyarsa hemen 5 olur?', tahta: pt(b), tahtaC: pt(b, C.map((x) => [x, 'o'])), alt: 'Çukur: ............', cevap: `${C.map(cellName).join(' ya da ')}. Oyun biter, tabla çevrilmez.`, do: { kare: C.map(cellName) } };
}
function g7(i) {
  const evet = i % 2 === 0, L = LINES[rnd(32)], o = L.slice().sort(() => rnd(2) - .5), hed = o[0], b = Array(36).fill(0), e = rnd(3);
  o.slice(evet ? 1 : 2).forEach((x) => { b[x] = 1; }); const n = (evet ? 4 : 3) + e;
  dengele(b, n, n, new Set(evet ? [hed] : [hed, o[1]])); if (!temiz(b) || tekCukur(b, 2).length) return null;
  const c = b.slice(); c[hed] = 1; const f = has5(c, 1); if (f !== evet) return null; const ad = cellName(hed);
  return { metin: `Siyah ${ad}'ye koyuyor. 5 oldu mu? Tablayı çevirmesi gerekir mi?`, tahta: pt(b, [[hed, '*']]), tahtaC: pt(c), alt: '5 oldu mu: ......  Çevirir mi: ......', cevap: f ? 'Evet 5 oldu. Hayır, çevirmez: oyun biter.' : 'Hayır, 5 olmadı. Evet, bir tablayı çevirmek zorunda.', do: { alanlar: [alan('5 oldu mu?', ['Evet', 'Hayır'], f ? 'Evet' : 'Hayır'), alan('Çevirir mi?', ['Evet', 'Hayır'], f ? 'Hayır' : 'Evet')] } };
}
const QD = [[0, 1], [1, -1], [2, 1], [3, -1], [0, -1], [3, 1], [1, 1], [2, -1]];
function g8(i) {
  const [q, d] = QD[i % 8], L = LINES[rnd(32)], iz = Array(36).fill(0), e = rnd(3); L.forEach((x) => { iz[x] = 1; });
  const b = rotate(iz, q, -d); if (has5(b, 1)) return null; dengele(b, 5 + e, 4 + e, new Set());
  if (!temiz(b)) return null;
  const K = []; for (let a = 0; a < 4; a++) for (const y of [1, -1]) { const R = rotate(b, a, y); if (has5(R, 1) || has5(R, 2)) K.push([a, y]); }
  if (K.length !== 1 || K[0][0] !== q || K[0][1] !== d) return null;
  const son = rotate(b, q, d); if (has5(son, 2)) return null;
  return { metin: 'Siyah bilyesini koydu. Hangi tablayı, hangi yöne çevirirse 5 olur?', tahta: pt(b), tahtaC: pt(son, besli(son)[0].L.map((x) => [x, 'o'])), alt: 'Tabla: ..............  Yön: ↻  ↺', cevap: `${QNAME[q]} tabla, ${yon(d)}.`, do: { alanlar: [tablaAlan(QNAME[q]), yonAlan(d)] } };
}
function g9(i) {
  const bek = ['Berabere', 'Siyah kazanır', 'Beyaz kazanır', 'Oyun sürer'][i % 4], [q, d] = QD[rnd(8)], yatay = LINES.filter((L) => L[1] - L[0] === 1), L1 = yatay[rnd(yatay.length)], L2 = yatay[rnd(yatay.length)];
  if (L1.some((x) => L2.includes(x))) return null;
  const R = Array(36).fill(0); L1.forEach((x) => { R[x] = 1; }); L2.forEach((x) => { R[x] = 2; });
  if (bek === 'Siyah kazanır' || bek === 'Oyun sürer') R[L2[1 + rnd(3)]] = 0;
  if (bek === 'Beyaz kazanır' || bek === 'Oyun sürer') R[L1[1 + rnd(3)]] = 0;
  const b = rotate(R, q, -d); if (!temiz(b)) return null;
  const siyah = rnd(2) === 1, e = rnd(2), [x, y] = say(b), taban = Math.max(x, y + (siyah ? 1 : 0)) + e, mevcut = new Set();
  if (!dengele(b, taban, siyah ? taban - 1 : taban, mevcut) || !temiz(b)) return null;
  const son = rotate(b, q, d), S = sonuc(son); if (S !== bek) return null;
  return { metin: `${siyah ? 'Siyah' : 'Beyaz'} bilyesini koydu, şimdi ${QNAME[q]} tablayı ${yon(d)} çeviriyor. Sonuç ne olur?`, tahta: pt(b), tahtaC: pt(son, besli(son).flatMap((f) => f.L.map((c) => [c, 'o']))), alt: 'Siyah  /  Beyaz  /  Berabere  /  Oyun sürer', cevap: `${S}.`, do: { alanlar: [alan('Sonuç', ['Siyah kazanır', 'Beyaz kazanır', 'Berabere', 'Oyun sürer'], S)] } };
}
function g10(i) {
  const erken = i % 3 === 0, L = LINES[rnd(32)], e = rnd(2); let b;
  if (erken) { b = Array(36).fill(0); L.forEach((x) => { b[x] = 1; }); b[L[rnd(5)]] = 0; }
  else { const [q, d] = QD[rnd(8)], iz = Array(36).fill(0); L.forEach((x) => { iz[x] = 1; }); b = rotate(iz, q, -d); const S = b.map((v, k) => (v ? k : -1)).filter((k) => k >= 0); b[S[rnd(5)]] = 0; }
  dengele(b, 4 + e, 4 + e, new Set()); if (!temiz(b)) return null;
  const W = moves(b, 1).filter((m) => m.res === 'WIN'); if (W.length !== 1 || !!W[0].early !== erken) return null;
  const m = W[0];
  return { metin: 'Sıra siyahta. Tek hamlede kazanmanın yolu bir tane. Bul!', tahta: pt(b), tahtaC: pt(m.board, besli(m.board)[0].L.map((x) => [x, 'o'])), alt: 'Çukur: ......  Tabla: ..........  Yön: ↻  ↺', cevap: erken ? `${cellName(m.cell)}'ye koy; 5 oldu, çevirme yok.` : `${cellName(m.cell)}'ye koy, ${QNAME[m.q]} tabla ${yon(m.d)}.`, do: { kare: [cellName(m.cell)], alanlar: [alan('Tabla çevrilir mi?', [...QNAME, 'Çevrilmez'], erken ? 'Çevrilmez' : QNAME[m.q]), ...(erken ? [] : [yonAlan(m.d)])] } };
}
const hamleAd = (m) => `${cellName(m.cell)} + ${QNAME[m.q]} ${m.d === 1 ? '↻' : '↺'}`;
function secimli(b, metin, dogru, yanlis, neden) {
  const Y = karistir(yanlis).filter((m) => hamleAd(m) !== hamleAd(dogru)).slice(0, 3); if (Y.length < 3) return null;
  const O = karistir([dogru, ...Y]).map(hamleAd);
  return { metin, tahta: pt(b), tahtaC: pt(dogru.board), alt: O.join('   /   '), cevap: `${hamleAd(dogru)}. ${neden}`, do: { alanlar: [alan('Hamle', O, hamleAd(dogru))] } };
}
function g11() { // beyaz tek hamlede kazanacak, tek doğru savunmayı seç
  const L = LINES[rnd(32)], m = L[rnd(5)], b = Array(36).fill(0), e = 1 + rnd(3); L.forEach((x) => { if (x !== m) b[x] = 2; });
  dengele(b, 4 + e, 4 + e, new Set([m])); if (!temiz(b) || !winIn1(b, 2) || winIn1(b, 1)) return null;
  if (ulasilir(b) !== true) return null;
  const S = savunmalar(b, 1); if (!S.length) return null; const A = new Set(S.map(hamleAd));
  const yak = moves(b, 1).filter((x) => x.res === 'GO' && !A.has(hamleAd(x))); if (yak.length < 3) return null;
  return secimli(b, 'Beyaz bir sonraki hamlede kazanmak üzere. Hangi hamle beyazı durdurur?', S[rnd(S.length)], yak, 'Bu hamleden sonra beyaz tek hamlede 5 yapamaz.');
}
function g12() { // siyah zorla kazanır: rakip ne yaparsa yapsın sonraki hamlede 5
  const b = Array(36).fill(0), L = LINES[rnd(32)], e = 1 + rnd(2); karistir(L).slice(0, 3).forEach((x) => { b[x] = 1; }); const L2 = LINES[rnd(32)]; karistir(L2).slice(0, 2).forEach((x) => { if (!b[x]) b[x] = 1; });
  const [x] = say(b); if (x < 4) return null; dengele(b, x + e, x + e, new Set()); if (!temiz(b) || winIn1(b, 1) || winIn1(b, 2)) return null;
  const Z = zorla(b, 1); if (!Z.length) return null; if (ulasilir(b) !== true) return null;
  const A = new Set(Z.map(hamleAd)), Y = moves(b, 1).filter((m) => m.res === 'GO' && !A.has(hamleAd(m)));
  return secimli(b, 'Sıra siyahta. Hangi hamleyle beyaz ne yaparsa yapsın bir sonraki hamlede kazanırsın?', Z[rnd(Z.length)], Y, 'Çift tehdit: beyaz ikisini birden durduramaz.');
}
const G = {}; for (const [n, f] of [[5, g5], [6, g6], [7, g7], [8, g8], [9, g9], [10, g10], [11, g11], [12, g12]]) { G[n] = uret(58, f); console.error('hazır', n); }
const p5 = () => ({ ad: 'Beşli avı', kurallar: [4], yonerge: 'Yatay, dikey ya da çapraz, arada boşluk olmadan 5 bilye yan yana olmalı.', sorular: G[5].slice(0, 6) });
const p6 = () => ({ ad: 'Tek bilye kaldı', kurallar: [4, 5], yonerge: 'Sıra siyahta olduğu için siyah ve beyaz bilye sayısı eşittir. Bilyeyi koyunca 5 olduysa oyun biter; tablayı çevirmeye gerek yoktur.', sorular: G[6].slice(0, 6) });
const p7 = () => ({ ad: 'Çevirmeli miyim?', kurallar: [3, 5], yonerge: 'Bilyeni koy. 5 olduysa kazandın, oyun biter. 5 olmadıysa bir tablayı çevirmek zorundasın.', sorular: G[7].slice(0, 6) });
const p8 = () => ({ ad: 'Çevirerek kazan', kurallar: [3, 4], yonerge: 'Siyah bilyesini koydu, bu yüzden siyahın bir bilyesi fazla. Bir çevirme bilyeleri aynı çizgiye getirebilir. Her tahtada tam bir doğru çevirme var.', sorular: G[8].slice(0, 6) });
const p9 = () => ({ ad: 'Berabere mi, kazandım mı?', kurallar: [4, 6], yonerge: "Çevirme sonunda 5'lere bakılır. İki oyuncunun da 5'i varsa oyun berabere biter. Önce çevir, sonra karar ver.", sorular: G[9].slice(0, 6) });
const p11 = () => ({ ad: 'Tehlikeyi durdur', kurallar: [3, 4], yonerge: 'Rakibin 4 bilyesi dizildiyse sırayı kaçırma. Bilye koymak ya da tabla çevirmek diziyi bozabilir; ama kendi çevirmenin diziyi 5 yapmamasına dikkat et.', sorular: G[11].slice(0, 6) });
const p12 = () => ({ ad: 'İki hamlede kazan', kurallar: [3, 4, 5], yonerge: 'Çift tehdit kur: bir hamleyle iki ayrı yerden 5 yapma hazırla. Rakip birini durdurursa ötekiyle kazanırsın.', sorular: G[12].slice(0, 6) });
const p10 = () => ({ ad: 'Şampiyon hamlesi', kurallar: [3, 4, 5], yonerge: 'Bazı tahtalarda koymak yeter, bazılarında çevirmek de gerekir.', sorular: G[10].slice(0, 6) });

// ---------- Küre ----------
const N = 7;
const kc = (rows) => rows.map((s) => [...s]);
const adi = (r, c) => 'ABCDEFG'[c] + (r + 1);
const yer = (a) => [+a[1] - 1, a.charCodeAt(0) - 65];
const rakip = (k) => (k === 'M' ? 'T' : 'M');
const ev = (k) => (k === 'M' ? 6 : 0), ileri = (k) => (k === 'M' ? -1 : 1);
const bos = () => Array(N).fill('.'.repeat(N));
function tk(metin) { // 'M:B4,E5 T:C4' → satırlar
  const b = Array.from({ length: N }, () => Array(N).fill('.'));
  metin.split(' ').filter(Boolean).forEach((p) => { const [k, L] = p.split(':'); L.split(',').forEach((a) => { const [r, c] = yer(a); b[r][c] = k; }); });
  return b.map((s) => s.join(''));
}
function dorDortlu(b, k, r, c) { // taşın geçtiği çizgiler (başlangıç sıraları sayılmaz)
  const say = (dr, dc) => { let n = 0; for (let i = -6; i <= 6; i++) { const a = r + i * dr, e = c + i * dc; if (a < 1 || a > 5 || e < 0 || e > 6) continue; if (b[a][e] === k) n++; } return n; };
  return { yatay: say(0, 1), dikey: say(1, 0), 'çapraz': Math.max(say(1, 1), say(1, -1)) };
}
function gidis(rows, r, c) { // boş hedefler, hareket kuralları (kural 4, 5)
  const b = kc(rows), k = b[r][c], f = ileri(k), R = [];
  const adim = r === ev(k) ? [[f, 0], [f, -1], [f, 1]] : [[f, 0], [-f, 0], [f, -1], [f, 1], [-f, -1], [-f, 1]];
  for (const [dr, dc] of adim) {
    const a = r + dr, e = c + dc;
    if (a < 0 || a >= N || e < 0 || e >= N || b[a][e] !== '.') continue;
    if (a === ev(k)) continue;
    if (a === ev(rakip(k)) && r !== a && [...rows[a]].includes(k)) continue;
    R.push([a, e]);
  }
  return R;
}
function yakala(rows, r0, c0, r, c) { // r0,c0 → r,c hamlesinde alınan taşlar
  const b = kc(rows), k = b[r0][c0], o = rakip(k); b[r0][c0] = '.'; b[r][c] = k;
  const D = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const al = [];
  for (const [dr, dc] of D) {
    const ara = []; let a = r + dr, e = c + dc;
    while (a >= 0 && a < N && e >= 0 && e < N && b[a][e] === o) { ara.push([a, e]); a += dr; e += dc; }
    if (ara.length && a >= 0 && a < N && e >= 0 && e < N && b[a][e] === k) al.push(...ara);
  }
  return al;
}
function netYakala(rows, m, h) { // hamle kurala uygun olmalı
  const [r0, c0] = yer(m), [r, c] = yer(h);
  birak(gidis(rows, r0, c0).some(([a, e]) => a === r && e === c), `gidiş kuralsız ${m}-${h}`);
  return yakala(rows, r0, c0, r, c);
}
const kt = (rows, m) => ({ tur: 'k', s: rows, m: (m || []).map(([r, c, k]) => [r, c, k]) });
const adK = (k) => (k === 'M' ? 'Mor' : 'Turuncu');
const hamle = (rows, m, h) => { const b = kc(rows), [r0, c0] = yer(m), [r, c] = yer(h); b[r][c] = b[r0][c0]; b[r0][c0] = '.'; return b; };
const sonRows = (b) => b.map((s) => s.join(''));

function k1() {
  const A = [['A', ['TTTTTTM', ...Array(5).fill('.......'), 'TMMMMMM']], ['B', ['TTTTTTT', ...Array(5).fill('.......'), 'MMMMMMM']], ['C', ['MTTTTTT', ...Array(5).fill('.......'), 'MMMMMMT']], ['D', ['TTTMTTT', ...Array(5).fill('.......'), 'MMMTMMM']]];
  return { ad: 'Diziliş ve ajan taş', kurallar: [1, 2], yonerge: 'Her oyuncunun 7 taşı vardır. Morun soluna ve turuncunun sağına birer rakip taş gelir: bunlara ajan taş denir.',
    sorular: A.map(([ad, s]) => ({ metin: `Diziliş ${ad}: Doğru mu? Yanlışsa nedenini yaz.`, tahta: kt(s), alt: 'Doğru  /  Yanlış: ............................', cevap: { A: 'Doğru.', B: 'Yanlış: ajan taş yok.', C: 'Yanlış: ajanlar ters köşede.', D: 'Yanlış: ajanlar ortada olmaz.' }[ad], do: { alanlar: [alan('Bu diziliş', ['Doğru', 'Yanlış'], ad === 'A' ? 'Doğru' : 'Yanlış')] } })),
    dy: [['Her oyuncunun 7 taşı vardır.', 1], ['Tahta 8 × 8 karedir.', 0], ['Üst sırada 6 turuncu ve 1 mor taş vardır.', 1], ['Alt sırada 7 mor taş vardır.', 0]] };
}
function k2() {
  const sorular = [3, 6, 9, 12].map((n) => ({ metin: `Oyunda ${n} hamle oynandı. ${n + 1}. hamle kimin?`, alt: 'Mor  /  Turuncu', cevap: (n + 1) % 2 ? 'Mor: tek numaralı hamleler morun.' : 'Turuncu: çift numaralı hamleler turuncunun.', do: { alanlar: [alan('Kimin?', ['Mor', 'Turuncu'], (n + 1) % 2 ? 'Mor' : 'Turuncu')] } }));
  return { ad: 'İlk hamle ve dokunma', kurallar: [3, 11], yonerge: 'Oyuna mor başlar, sonra sırayla oynanır. Bir taşa dokunduysan o taşı oynamak zorundasın.', sorular,
    dy: [['Oyuna turuncu başlar.', 0], ['Ece bir taşa dokundu, vazgeçip başka taş oynayabilir.', 0], ['Can taşına dokundu; o taşı oynamak zorunda.', 1], ['Mor ilk hamleyi yaptıktan sonra sıra turuncuya geçer.', 1], ['İki kez üst üste oynayabilirim.', 0], ['Dokunmadığım taşları düşünerek seçebilirim.', 1]] };
}
function hareketSoru(s, a) {
  const [r, c] = yer(a), k = s[r][c], G = gidis(s, r, c);
  return { metin: `${a}'deki ${adK(k).toLocaleLowerCase('tr')} taş nerelere gidebilir? Halka çiz.`, tahta: kt(s, [[r, c, 'n']]), tahtaC: kt(s, [[r, c, 'n'], ...G.map(([x, y]) => [x, y, 'o'])]), alt: 'Kaç kare? ........', cevap: `${G.length} kare: ${G.map(([x, y]) => adi(x, y)).join(', ')}.`, do: { kare: G.map(([x, y]) => adi(x, y)) } };
}
function k3(D = [['M:D7', 'D7'], ['M:A7', 'A7'], ['M:D7 T:D6', 'D7'], ['M:C7,B6 T:D6', 'C7'], ['T:D1', 'D1'], ['M:G1 T:F1,E1', 'G1']]) {
  return { ad: 'Başlangıç sırası', kurallar: [4], yonerge: 'Başlangıç sırasındaki taş yalnızca ileri ya da çapraz ileri 1 kare gider. Morlar yukarı, turuncular aşağı ilerler. Gri sıralar başlangıç sıralarıdır. Ajan taş da aynı kuralla oynar: rakibin sırasından tahtanın içine doğru gider.', sorular: D.map(([p, a]) => hareketSoru(tk(p), a)) };
}
function k4(D = [['M:D4', 'D4'], ['M:A4', 'A4'], ['T:D4 M:D5', 'D4'], ['M:C3,B4 T:D2', 'C3'], ['T:E4,E3 M:F5', 'E4'], ['M:G4,G3 T:F5', 'G4']]) {
  return { ad: 'Ortadaki taş', kurallar: [5], yonerge: 'Başlangıç sırasından çıkan taş ileri, geri ya da çapraz 1 kare gider. Yana gidemez, başka taşın üstüne çıkamaz.', sorular: D.map(([p, a]) => hareketSoru(tk(p), a)) };
}
function k5(D = [['M:D6', 'D6'], ['M:A6', 'A6'], ['T:D2', 'D2'], ['M:D5', 'D5'], ['M:D6 T:D5', 'D6'], ['T:C2,B3 M:C3', 'C2']]) {
  return { ad: 'Geri dönüş yok', kurallar: [4, 5], yonerge: 'Sıradan çıkan taş bir daha kendi başlangıç sırasına dönemez. Gri sıraya bitişik taşlara dikkat et!', sorular: D.map(([p, a]) => hareketSoru(tk(p), a)) };
}
function k6(D = [['M:A3,B3,C3,D4', 'D4', 'D3'], ['M:A3,C3,F3,E4', 'E4', 'E3'], ['M:A4,B4,D4,F5 T:C4', 'F5', 'F4'], ['M:A3,B3,D4', 'D4', 'D3'], ['M:D2,D3,D5,C5', 'C5', 'D4'], ['M:B6,C5,E3,D5', 'D5', 'D4']]) {
  const sorular = D.map(([p, m, h]) => {
    const s = tk(p), [r0, c0] = yer(m), [r, c] = yer(h);
    birak(gidis(s, r0, c0).some(([a, e]) => a === r && e === c), 'k6 gidiş ' + m);
    const son = hamle(s, m, h), L = dorDortlu(son, 'M', r, c), Y = Object.entries(L).find(([, v]) => v >= 4);
    return { metin: `${m}'deki mor taş yıldızlı ${h} karesine gidebilir mi? Neden?`, tahta: kt(s, [[r, c, '*'], [r0, c0, 'n']]), alt: 'Evet  /  Hayır: ..........................', cevap: Y ? `Hayır: ${Y[0]} dörtlü olur (boşluk ya da rakip taş fark etmez).` : 'Evet: dörtlü olmaz.', do: { alanlar: [EH(!Y)] } };
  });
  
  return { ad: 'Dörtlü yasağı', kurallar: [6], yonerge: 'Taşların yatay, dikey ya da çapraz doğrultuda dörtlü olamaz. Arada boşluk ya da rakip taş olsa bile dörtlü yapmak hatalı hamledir.', sorular };
}
function yakalaSoru(p, m, h, ek) {
  const s = tk(p), [r0, c0] = yer(m), [r, c] = yer(h), A = netYakala(s, m, h), son = hamle(s, m, h), k = s[r0][c0];
  return { metin: `${m}'deki ${adK(k).toLocaleLowerCase('tr')} taş ${h}'e gidiyor. Hangi taşlar alınır? Çarpı koy.`, tahta: kt(s, [[r0, c0, 'n'], [r, c, '*']]), tahtaC: kt(sonRows(son), A.map(([x, y]) => [x, y, 'x'])), alt: 'Alınanlar: ......................', cevap: A.length ? `${A.map(([x, y]) => adi(x, y)).join(', ')} alınır.` : `Hiçbiri: ${ek || 'sıkıştırma yok'}.`, do: { kare: A.map(([x, y]) => adi(x, y)) } };
}
function k7(D = [['M:D3,D6 T:D4', 'D6', 'D5'], ['M:B4,D5 T:C4', 'D5', 'D4'], ['M:B3,E6 T:C4', 'E6', 'D5'], ['T:C3,E4 M:D4', 'E4', 'E5'], ['M:A4,D5 T:C4', 'D5', 'D4', 'arada boşluk var'], ['M:D2,D5 T:D4', 'D2', 'D3']]) {
  return { ad: 'Sıkıştır ve al', kurallar: [7], yonerge: 'Rakip taşı kendi iki taşının arasına alan, hamlesiyle onu yakalar. Taş yatay, dikey ya da çapraz sıkışabilir. Hamle ileri de olabilir, geri de.', sorular: D.map((d) => yakalaSoru(...d)) };
}
function k8(D = [['M:B4,E5 T:C4,D4', 'E5', 'E4'], ['M:B4,F5 T:C4,D4,E4', 'F5', 'F4'], ['M:B2,F6 T:C3,D4', 'F6', 'E5'], ['M:B4,D2,D5 T:C4,D3', 'D5', 'D4'], ['M:B4,E5 T:C4', 'E5', 'E4', 'C4 ile E4 arasında boşluk var'], ['T:B4,E3 M:C4,D4', 'E3', 'E4']]) {
  return { ad: 'Çoklu yakalama', kurallar: [7], yonerge: 'Arada kalan rakip taşların hepsi alınmak zorundadır. Birini seçip bırakamazsın. Bir hamle iki yönde birden de sıkıştırabilir.', sorular: D.map((d) => yakalaSoru(...d)) };
}
function k9() {
  const a = yakalaSoru('M:D5 T:C4,E4', 'D5', 'D4'); a.cevap = 'Hiçbiri. Mor kendi isteğiyle araya girdi, rakip onu alamaz.'; a.metin = "D5'teki mor taş iki turuncunun arasına giriyor. Bir taş alınır mı?";
  const b = yakalaSoru('M:B4,D5 T:C4,E4', 'D5', 'D4'); b.cevap = 'C4 alınır. Hamleyi yapan oyuncu alır; araya giren D4 alınmaz.'; b.metin = "D5'teki mor taş D4'e giriyor. Ne olur? Çarpı koy.";
  const c = yakalaSoru('T:D2,D5,C4,E4 M:D4', 'D2', 'D3'); birak(c.cevap.startsWith('Hiçbiri') === false, 'k9c');
  const sira = (p, m, h, izin) => {
    const s = tk(p), [r0, c0] = yer(m), [r, c] = yer(h), k = s[r0][c0], o = ev(rakip(k));
    birak(r === o, 'k9 sıra'); birak(gidis(s, r0, c0).some(([x, y]) => x === r && y === c) === izin, 'k9 gidiş');
    const var_ = [...s[o]].filter((x) => x === k).length; birak((var_ === 0) === izin, 'k9 izin');
    return { metin: `${m}'deki ${adK(k).toLocaleLowerCase('tr')} taş rakibin başlangıç sırasındaki ${h}'e gidebilir mi?`, tahta: kt(s, [[r0, c0, 'n'], [r, c, '*']]), alt: 'Evet  /  Hayır', cevap: izin ? 'Evet: orada hiç taşı yok.' : 'Hayır: o sırada zaten bir taşı var.', do: { alanlar: [EH(izin)] } };
  };
  return { ad: 'Araya gir, sıraya gir', kurallar: [8, 9], yonerge: 'Kendi isteğinle iki rakip taşın arasına girersen rakip o taşı alamaz. Rakibin başlangıç sırasında aynı anda yalnızca bir taşın olabilir.',
    sorular: [a, b, c, sira('M:A1,D2 T:F1', 'D2', 'D1', false), sira('M:D2 T:F1,B1', 'D2', 'D1', true), sira('T:A7,C6 M:F7', 'C6', 'C7', false)] };
}
function k10() {
  const skor = (p, m, h, once) => {
    const s = tk(p), [r0, c0] = yer(m), A = netYakala(s, m, h), k = s[r0][c0], top = once + A.length;
    const b = yakalaSoru(p, m, h);
    b.metin = `${adK(k)} daha önce ${once} taş aldı. ${m}'deki taş ${h}'e gidiyor. Şimdi kaç taşı oldu? Kazandı mı?`;
    b.alt = 'Toplam: ......  Kazandı mı: ......'; b.cevap = `${top} taş. ${top >= 4 ? 'Kazandı!' : 'Henüz kazanmadı.'}`;
    b.do = { alanlar: [alan('Toplam', ['2', '3', '4', '5'], String(top)), alan('Kazandı mı?', ['Evet', 'Hayır'], top >= 4 ? 'Evet' : 'Hayır')] };
    return b;
  };
  const enIyi = (p, k) => {
    const s = tk(p), T = [];
    s.forEach((sat, r) => [...sat].forEach((ch, c) => { if (ch === k) gidis(s, r, c).forEach(([a, e]) => {
      const al = yakala(s, r, c, a, e);
      T.push({ m: adi(r, c), h: adi(a, e), n: al.length, al, r, c }); }); }));
    T.sort((x, y) => y.n - x.n); birak(T[0].n > T[1].n && T[0].n >= 2, 'k10 en iyi tek değil');
    const e = T[0];
    return { metin: `Sıra ${adK(k).toLocaleLowerCase('tr')}da. En çok taş alan hamleyi bul. Hangi taş, nereye?`, tahta: kt(s), tahtaC: kt(sonRows(hamle(s, e.m, e.h)), e.al.map(([x, y]) => [x, y, 'x'])), alt: 'Hamle: ...... → ......  Alınan: ......', cevap: `${e.m} → ${e.h}: ${e.n} taş alır.`, do: { kare: [e.m, e.h] } };
  };
  return { ad: 'Dört taşa giden yol', kurallar: [7, 10], yonerge: 'Rakibin dört taşını oyundan çıkaran oyunu kazanır. Önce kaç taş aldığını say, sonra en iyi hamleni seç.',
    sorular: [skor('M:D3,D6 T:D4', 'D6', 'D5', 3), skor('M:B4,D5 T:C4', 'D5', 'D4', 2), skor('M:D5 T:C4', 'D5', 'D4', 3), skor('T:B4,E3 M:C4,D4', 'E3', 'E4', 2),
      enIyi('M:B4,E5,G3,E2 T:C4,D4,F3', 'M'), enIyi('M:A4,D2,D5 T:B4,C4,D3', 'M')] };
}

const KULUP_ETK = {
  Pentago: [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12].map((f) => f()),
  'Küre': [k1, k2, k3, k4, k5, k6, k7, k8, k9, k10].map((f) => f()),
};
// slaytta birlikte çözülen sorular: kâğıttakilerle aynı tür, farklı konum
const ayni = (q, e) => e.sorular.some((x) => JSON.stringify([x.metin, x.tahta]) === JSON.stringify([q.metin, q.tahta]));
const BIRLIKTE = {
  Pentago: [p1(['D5', 'A3']).sorular.slice(1, 3), p2([[4, 4], [3, 2]]).sorular, p3([[['S.S', '...', 'B..'], 1], [['.S.', 'B..', '..S'], -1]]).sorular, p4([['A3', 0, 1], ['E1', 1, -1]]).sorular,
    G[5].slice(6, 8), G[6].slice(6, 8), G[7].slice(6, 8), G[8].slice(6, 8), G[9].slice(6, 8), G[10].slice(6, 8), G[11].slice(6, 8), G[12].slice(6, 8)],
  'Küre': [[{ metin: 'Mor ajan taş nerede? Bul ve söyle.', tahta: kt(['TTTTTTM', ...Array(5).fill('.......'), 'TMMMMMM']), cevap: "G1: turuncunun sağında." }, { metin: 'Turuncu ajan taş nerede? Bul ve söyle.', tahta: kt(['TTTTTTM', ...Array(5).fill('.......'), 'TMMMMMM']), cevap: "A7: morun solunda." }],
    [{ metin: 'Oyunda 4 hamle oynandı. 5. hamle kimin?', cevap: 'Mor: tek numaralı hamleler morun.' }, { metin: 'Ada bir taşa dokundu, ama başka taş oynamak istiyor. Olur mu?', cevap: 'Hayır. Kurallı hamlesi varsa dokunduğu taşı oynamak zorunda.' }],
    k3([['M:F7', 'F7'], ['T:B1 M:B2', 'B1']]).sorular, k4([['M:E4', 'E4'], ['T:C3 M:C2', 'C3']]).sorular, k5([['M:F6', 'F6'], ['T:E2,E3', 'E2']]).sorular,
    k6([['M:B4,C4,D4,E5', 'E5', 'E4'], ['M:B4,C4,E5', 'E5', 'E4']]).sorular, k7([['M:C3,C6 T:C4', 'C6', 'C5'], ['M:E3,E5 T:D4,F2', 'E5', 'E4', 'hiçbir taş iki morun arasında değil']]).sorular,
    k8([['M:C3,F4 T:D3,E3', 'F4', 'F3'], ['M:B3,F4 T:C3,D3,E3', 'F4', 'F3']]).sorular,
    (() => { const a = k9().sorular[0]; const s = tk('T:F3 M:E4,G4'); return [
      { metin: "F3'teki turuncu taş iki morun arasına giriyor. Mor taşlar onu alabilir mi?", tahta: kt(s, [[2, 5, 'n'], [3, 5, '*']]), cevap: 'Hayır. Kendi isteğiyle araya giren taşı rakip alamaz.' },
      { metin: "B2'deki mor taş rakibin sırasındaki B1'e gidebilir mi?", tahta: kt(tk('M:B2 T:D1,E1'), [[1, 1, 'n'], [0, 1, '*']]), cevap: 'Evet: orada hiç mor taş yok.' }]; })(),
    (() => { const a = k10().sorular; return [a[0].metin ? (() => { const q = k7([['M:E3,E6 T:E4', 'E6', 'E5']]).sorular[0]; q.metin = "Mor daha önce 3 taş aldı. E6'daki taş E5'e gidiyor. Kazandı mı?"; q.cevap = '4 taş oldu, kazandı!'; return q; })() : a[0]]; })()],
};
for (const [o, L] of Object.entries(BIRLIKTE)) L.forEach((b, i) => { birak(b.length >= 1, 'birlikte boş'); b.forEach((q) => birak(!ayni(q, KULUP_ETK[o][i]), `kâğıtla aynı: ${o} ${i} ${q.metin}`)); KULUP_ETK[o][i].birlikte = b; });
const yol = new URL('../js/kulup-etkinlik.js', import.meta.url);
// ---------- bankalar: her konu için 50 dokunmatik soru ----------
const tum = Array.from({ length: 36 }, (_, i) => i);
const merkez = new Set([7, 10, 25, 28]);
const pBanka = [
  [...p1(karistir(tum).map(cellName)).sorular, ...karistir(tum).slice(0, 12).map((i) => ({ metin: `${cellName(i)} çukuruna dokun.`, tahta: pt(Array(36).fill(0)), cevap: cellName(i), do: { kare: [cellName(i)] } }))],
  p2(Array.from({ length: 50 }, (_, i) => { const s = 1 + (i % 8), bey = i % 2 ? s : s - 1; return [s, bey]; })).sorular,
  p3(Array.from({ length: 50 }, (_, i) => { for (;;) { const h = Array.from({ length: 9 }, () => '...SB'[rnd(5)]), t = [0, 3, 6].map((k) => h.slice(k, k + 3).join('')), d = i % 2 ? 1 : -1; if (h.filter((x) => x !== '.').length >= 2 && tablaDon(t, d).join('') !== t.join('')) return [t, d]; } })).sorular,
  p4(karistir(tum.filter((x) => !merkez.has(x))).slice(0, 25).flatMap((x) => { const q = (x % 6 >= 3 ? 1 : 0) + (x >= 18 ? 2 : 0); return [[cellName(x), q, 1], [cellName(x), q, -1]]; })).sorular,
  ...[5, 6, 7, 8, 9, 10, 11, 12].map((n) => G[n].slice(8))];
const hk = (r, c) => adi(r, c), secK = (L) => L[rnd(L.length)];
function dene(n, f) { const R = [], gor = new Set(); let d = 0; while (R.length < n) { birak(++d < 2000000, 'küre üretim ' + R.length); let q = null; try { q = f(R.length); } catch (e) { if (!String(e.message).startsWith('SORU')) throw e; } if (!q) continue;
  const rows = q.tahta && q.tahta.s; if (rows) { let bozuk = false; rows.forEach((sat, r) => [...sat].forEach((ch, c) => { if ((ch === 'M' || ch === 'T') && r > 0 && r < 6) { const L = dorDortlu(kc(rows), ch, r, c); if (Math.max(L.yatay, L.dikey, L['çapraz']) >= 4) bozuk = true; } })); if (bozuk && !q.dortluSerbest) continue; }
  delete q.dortluSerbest; const k = JSON.stringify([q.tahta, q.metin]); if (gor.has(k)) continue; gor.add(k); R.push(q); } return R; }
const pp = (M, T) => [M.length ? 'M:' + M.join(',') : '', T.length ? 'T:' + T.join(',') : ''].join(' ');
const kr = (a, b) => hk(a + rnd(b - a + 1), rnd(7));
const birlesik = (M, T) => new Set([...M, ...T]).size === M.length + T.length;
function kAjan(i) { // ajan taşlar yanlış/doğru yerde
  if (i === 49) return { metin: 'Ajan taşlara dokun.', tahta: kt(['TTTTTTM', ...Array(5).fill('.......'), 'TMMMMMM']), cevap: 'G1 ve A7.', do: { kare: ['G1', 'A7'] } };
  const a = Math.floor(i / 7), b = i % 7, ust = 'TTTTTTT'.split(''), alt = 'MMMMMMM'.split(''); ust[a] = 'M'; alt[b] = 'T';
  return { metin: 'Bu dizilişte ajan taşlar doğru yerde mi?', tahta: kt([ust.join(''), ...Array(5).fill('.......'), alt.join('')]), cevap: `Mor ajan G1'de, turuncu ajan A7'de olmalı.`, do: { alanlar: [alan('Mor ajan (üstte)', ['Doğru', 'Yanlış'], a === 6 ? 'Doğru' : 'Yanlış'), alan('Turuncu ajan (altta)', ['Doğru', 'Yanlış'], b === 0 ? 'Doğru' : 'Yanlış')] } };
}
const hamleSoru = (n) => ({ metin: `Oyunda ${n} hamle oynandı. ${n + 1}. hamle kimin?`, cevap: (n + 1) % 2 ? 'Mor: tek numaralı hamleler morun.' : 'Turuncu: çift numaralı hamleler turuncunun.', do: { alanlar: [alan('Kimin?', ['Mor', 'Turuncu'], (n + 1) % 2 ? 'Mor' : 'Turuncu')] } });
const DOK = [['Ece taşa dokundu. Taşın kurallı hamlesi var. Başka taş oynayabilir mi?', 0], ['Can taşa dokundu, taşın hiç kurallı hamlesi yok. Başka taş oynayabilir mi?', 1], ['Dokunduğu taşı oynamamakta ısrar eden oyuncu uyarı alır mı?', 1], ['Oyuna turuncu başlar mı?', 0], ['İlk hamleyi mor mu yapar?', 1], ['Taş kuyuya değdiği anda hamle yapılmış sayılır mı?', 1], ['Kurallı hamleden sonra sıra rakibe geçer mi?', 1], ['Bir oyuncu üst üste iki hamle yapabilir mi?', 0], ['Üçüncü uyarıyı alan turu kaybeder mi?', 1], ['Kural dışı hamle geri alınır mı?', 1]];
const dokSoru = ([m, d]) => ({ metin: m, cevap: d ? 'Evet.' : 'Hayır.', do: { alanlar: [EH(!!d)] } });
function kHareket(satirlar, ajan) { return (i) => {
  const k = ajan && i % 5 === 4 ? (rnd(2) ? 'M' : 'T') : satirlar === 'ev' ? (rnd(2) ? 'M' : 'T') : (rnd(2) ? 'M' : 'T');
  let r; if (ajan && i % 5 === 4) r = k === 'M' ? 0 : 6; else if (satirlar === 'ev') r = ev(k); else if (satirlar === 'yan') r = ev(k) + (k === 'M' ? -1 : 1); else r = 2 + rnd(3);
  const c = rnd(7), a = adi(r, c), M = k === 'M' ? [a] : [], T = k === 'T' ? [a] : [];
  for (let j = rnd(4); j > 0; j--) { const x = r + rnd(3) - 1, y = c + rnd(3) - 1; if (x < 1 || x > 5 || y < 0 || y > 6) continue; const n = adi(x, y); if (n === a || M.includes(n) || T.includes(n)) continue; (rnd(2) ? M : T).push(n); }
  if (M.length > 7 || T.length > 7) return null;
  const s = tk(pp(M, T)), q = hareketSoru(s, a); return q; }; }
function kDort(i) {
  const evet = i % 2 === 1, satir = 1 + rnd(5), tip = rnd(3); let C; // çizgi kareleri
  if (tip === 0) C = [0, 1, 2, 3, 4, 5, 6].map((x) => [satir, x]); else if (tip === 1) { const c = rnd(7); C = [1, 2, 3, 4, 5].map((x) => [x, c]); } else { const y = rnd(3); C = [1, 2, 3, 4, 5].map((x, j) => [x, y + j]).filter(([, b]) => b < 7); }
  const K = karistir(C); if (K.length < 4) return null; const [r, c] = K[0], M = K.slice(1, evet ? 3 : 4).map(([a, b]) => adi(a, b));
  const O = []; for (const [dr, dc] of [[1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const a = r + dr, b = c + dc; if (a >= 1 && a <= 5 && b >= 0 && b < 7 && !K.slice(0, 4).some(([x, y]) => x === a && y === b)) O.push(adi(a, b)); }
  if (!O.length) return null; const m = secK(O); if (M.includes(m)) return null; const h = adi(r, c), T = rnd(2) && K[4] ? [adi(K[4][0], K[4][1])] : [];
  if (T.includes(m) || T.includes(h)) return null;
  const s = tk(pp([...M, m], T)), [r0, c0] = yer(m); if (!gidis(s, r0, c0).some(([a, b]) => a === r && b === c)) return null;
  const son = hamle(s, m, h), L = dorDortlu(son, 'M', r, c), Y = Object.entries(L).find(([, v]) => v >= 4); if (!!Y === evet) return null;
  return { metin: `${m}'deki mor taş yıldızlı ${h} karesine gidebilir mi? Neden?`, tahta: kt(s, [[r, c, '*'], [r0, c0, 'n']]), alt: 'Evet  /  Hayır: ..........................', cevap: Y ? `Hayır: ${Y[0]} dörtlü olur (boşluk ya da rakip taş fark etmez).` : 'Evet: dörtlü olmaz.', do: { alanlar: [EH(!Y)] } };
}
const YON8 = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function kYakala(enAz, enCok) { return (i) => {
  const k = rnd(2) ? 'M' : 'T', o = rakip(k), [dr, dc] = secK(YON8), bos = i % 5 === 4, n = enAz + rnd(enCok - enAz + 1), z = [2 + rnd(3), 1 + rnd(5)], K = [], R = [];
  for (let j = 1; j <= n; j++) R.push([z[0] + dr * j, z[1] + dc * j]); const ban = [z[0] + dr * (n + 1), z[1] + dc * (n + 1)];
  if ([...R, ban].some(([a, b]) => a < 1 || a > 5 || b < 0 || b > 6)) return null;
  const hedef = adi(z[0], z[1]), O = YON8.map(([a, b]) => [z[0] + a, z[1] + b]).filter(([a, b]) => a >= 1 && a <= 5 && b >= 0 && b <= 6 && !R.some(([x, y]) => x === a && y === b) && !(a === ban[0] && b === ban[1])); if (!O.length) return null;
  const [m0, m1] = secK(O), m = adi(m0, m1), B = R.map(([a, b]) => adi(a, b)), S = [m]; if (!bos) S.push(adi(ban[0], ban[1])); const M = k === 'M' ? S : B, T = k === 'M' ? B : S;
  if (!birlesik(M, T)) return null; const q = yakalaSoru(pp(M, T), m, hedef, 'sıkıştırma yok'); return q; }; }
function kAra(i) {
  if (i % 2) { const k = rnd(2) ? 'M' : 'T', o = ev(rakip(k)), f = ileri(k), c = rnd(7), r = o - f, h = adi(o, c), m = adi(r, c), izin = rnd(2) === 1, M = [], T = [];
    (k === 'M' ? M : T).push(m); if (!izin) { const d = (c + 1 + rnd(6)) % 7; (k === 'M' ? M : T).push(adi(o, d)); }
    const rakipSira = karistir([0, 1, 2, 3, 4, 5, 6].filter((x) => x !== c)).slice(0, 2 + rnd(2)); for (const x of rakipSira) { const n = adi(o, x); if (![...M, ...T].includes(n)) (k === 'M' ? T : M).push(n); }
    const s = tk(pp(M, T)), [r0, c0] = yer(m), [a, b] = yer(h); birak(gidis(s, r0, c0).some(([x, y]) => x === a && y === b) === izin, 'kAra');
    return { metin: `${m}'deki ${adK(k).toLocaleLowerCase('tr')} taş rakibin başlangıç sırasındaki ${h}'e gidebilir mi?`, tahta: kt(s, [[r0, c0, 'n'], [a, b, '*']]), alt: 'Evet  /  Hayır', cevap: izin ? 'Evet: orada hiç taşı yok.' : 'Hayır: o sırada zaten bir taşı var.', do: { alanlar: [EH(izin)] } }; }
  const k = rnd(2) ? 'M' : 'T', [dr, dc] = secK(YON8), r = 2 + rnd(3), c = 1 + rnd(5), A = adi(r + dr, c + dc), B = adi(r - dr, c - dc), f = ileri(k), m = adi(r - f, c), h = adi(r, c);
  if ([A, B].includes(m)) return null; const M = k === 'M' ? [m] : [A, B], T = k === 'M' ? [A, B] : [m], s = tk(pp(M, T)), q = yakalaSoru(pp(M, T), m, h);
  q.metin = `${m}'deki ${adK(k).toLocaleLowerCase('tr')} taş ${h}'e, iki rakip taşın arasına giriyor. Onu rakip alabilir mi?`; q.cevap = 'Hayır. Kendi isteğiyle araya giren taşı rakip alamaz.'; q.do = { alanlar: [EH(false)] }; delete q.tahtaC; return q;
}
function kSkor(i) {
  const q = kYakala(1, 2)(i); if (!q) return null; const al = q.do.kare.length, once = 1 + rnd(3), top = once + al, m = q.metin.split("'")[0], k = q.metin.includes('mor') ? 'Mor' : 'Turuncu', h = q.metin.match(/gidiyor|([A-G][1-7])'e/)[1];
  q.metin = `${k} daha önce ${once} taş aldı. ${m}'deki taş ${h}'e gidiyor. Şimdi kaç taşı oldu? Kazandı mı?`; q.cevap = `${top} taş. ${top >= 4 ? 'Kazandı!' : 'Henüz kazanmadı.'}`;
  q.do = { alanlar: [alan('Toplam', ['1', '2', '3', '4', '5'], String(top)), alan('Kazandı mı?', ['Evet', 'Hayır'], top >= 4 ? 'Evet' : 'Hayır')] }; return q;
}
const kBanka = [dene(50, kAjan), [...Array.from({ length: 40 }, (_, i) => hamleSoru(i + 1)), ...DOK.map(dokSoru)], dene(50, kHareket('ev', true)), dene(50, kHareket('orta')), dene(50, kHareket('yan')), dene(50, kDort), dene(50, kYakala(1, 1)), dene(50, kYakala(2, 3)), dene(50, kAra), dene(50, kSkor)];
console.log('banka', pBanka.map((L) => L.length).join(' '), '|', kBanka.map((L) => L.length).join(' '));
for (const L of [...pBanka, ...kBanka]) birak(L.length >= 50, 'banka eksik ' + L.length);
const KULUP_BANKA = { Pentago: pBanka.map((L) => L.slice(0, 50)), 'Küre': kBanka };

// Türkçe ekler: D4'e, E1'e, A2'ye, C6'ya; D4'teki, E1'deki, C6'daki
const YON = { 1: "e", 2: "ye", 3: "e", 4: "e", 5: "e", 6: "ya", 7: "ye" }, BUL = { 1: "deki", 2: "deki", 3: "teki", 4: "teki", 5: "teki", 6: "daki", 7: "deki" };
const ek = (t) => t.replace(/\b([A-G])([1-7])'(ye|e)(?![a-zçğıöşü])/g, (_, h, n) => `${h}${n}'${YON[n]}`).replace(/\b([A-G])([1-7])'(deki|teki)/g, (_, h, n) => `${h}${n}'${BUL[n]}`);
for (const L of Object.values(KULUP_ETK)) for (const e of L) for (const q of [...e.sorular, ...e.birlikte]) { q.metin = ek(q.metin); q.cevap = ek(q.cevap); }
for (const L of Object.values(KULUP_BANKA)) for (const B of L) for (const q of B) { q.metin = ek(q.metin); q.cevap = ek(q.cevap); delete q.alt; delete q.tahtaC; delete q.tahta2C; }
fs.writeFileSync(new URL('../js/kulup-banka.js', import.meta.url), '// Üretildi: node araclar/etkinlik-uret.mjs. Her konu için 50 dokunmatik soru.\nwindow.KULUP_BANKA = ' + JSON.stringify(KULUP_BANKA) + ';\n');
fs.writeFileSync(yol, '// Üretildi: node araclar/etkinlik-uret.mjs. Cevaplar kural motorlarından hesaplandı; elle değiştirmeyin.\nwindow.KULUP_ETK = ' + JSON.stringify(KULUP_ETK) + ';\n');
for (const [o, L] of Object.entries(KULUP_ETK)) L.forEach((e, i) => { console.log(`\n${o} ${i + 1}. ${e.ad} (kural ${e.kurallar})`); e.sorular.forEach((q, j) => console.log(`  ${j + 1}) ${q.metin} → ${q.cevap}`)); e.birlikte.forEach((q) => console.log(`  B) ${q.metin} → ${q.cevap}`)); });
