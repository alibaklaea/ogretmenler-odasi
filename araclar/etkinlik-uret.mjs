// Kural etkinliklerini üretir: node araclar/etkinlik-uret.mjs → js/kulup-etkinlik.js
// Cevaplar kural motorlarından hesaplanır; birden çok doğru cevap ya da kuralı belirsiz kalan soru üretimi durdurur.
import fs from 'fs';
import { rotate, has5, moves, LINES, cellName, QNAME } from './pentago-motor.mjs';

let tohum = 20261030;
const rnd = (n) => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return Math.floor((tohum / 4294967296) * n); };
const yon = (d) => (d === 1 ? 'saat yönünde ↻' : 'saat yönünün tersine ↺');
const birak = (kosul, not) => { if (!kosul) throw new Error('SORU REDDEDİLDİ: ' + not); };

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
  const sorular = [{ metin: 'Tahtayı say: Kaç çukur var? Kaç tabla var?', tahta: pt(Array(36).fill(0)), alt: 'Çukur: ........  Tabla: ........', cevap: '36 çukur, 4 tabla.' }];
  for (const ad of L) {
    const i = hucreNo(ad);
    sorular.push({ metin: 'Yıldızlı çukurun adı ne? Hangi tablada?', tahta: pt(Array(36).fill(0), [[i, '*']]), alt: 'Adı: ......  Tabla: ....................', cevap: `${ad}, ${tablaAd(i)} tabla.` });
  }
  const i = hucreNo('C4');
  sorular.push({ metin: 'C4 çukuruna halka çiz. Hangi tablada?', tahta: pt(Array(36).fill(0)), tahtaC: pt(Array(36).fill(0), [[i, 'o']]), alt: 'Tabla: ....................', cevap: `C4, ${tablaAd(i)} tabla.` });
  return { ad: 'Tablalar ve çukurlar', kurallar: [1], yonerge: 'Tahta 6 × 6 ve dört 3 × 3 tabladan oluşur. Çukurun adı önce harf, sonra sayı ile okunur: C4 gibi.', sorular };
}
function p2(L = [[3, 3], [4, 3], [5, 4], [6, 6], [2, 1], [7, 7]]) {
  const sorular = [];
  for (const [s, b] of L) {
    const t = Array(36).fill(0);
    let k = 0; while (k < s + b) { const i = rnd(36); if (t[i]) continue; t[i] = k < s ? 1 : 2; k++; }
    birak(!has5(t, 1) && !has5(t, 2), 'p2 beşli');
    sorular.push({ metin: 'Siyah ve beyaz bilyeleri say. Sıra kimde?', tahta: pt(t), alt: 'Siyah: ....  Beyaz: ....  Sıra: ............', cevap: `Siyah ${s}, beyaz ${b}. Sıra ${s === b ? 'siyahta: sayılar eşit, siyah başlar' : 'beyazda: siyah bir bilye önde'}.` });
  }
  return { ad: 'Sıra kimde?', kurallar: [2, 3], yonerge: 'Siyah başlar, sonra sırayla oynanır. Bilye sayılarına bakarak sıranın kimde olduğunu bulabilirsin.', sorular };
}
const tablaDon = (s, d) => { const r = [[], [], []]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (d === 1) r[j][2 - i] = s[i][j]; else r[2 - j][i] = s[i][j]; } return r.map((x) => x.join('')); };
function p3(L = [[['SS.', '..B', 'S..'], 1], [['S..', 'S..', 'B.B'], 1], [['.B.', 'S.S', '...'], -1], [['SSB', '...', '...'], -1], [['S.B', '.B.', '..S'], 1], [['BS.', 'S..', '..B'], -1]]) {
  const sorular = L.map(([s, d]) => ({
    metin: `Tablayı ${yon(d)} 90° çevir. Bilyeleri sağdaki boş tablaya çiz.`, tahta: { tur: 'p3', s }, tahta2: { tur: 'p3', s: ['...', '...', '...'] }, tahta2C: { tur: 'p3', s: tablaDon(s, d) }, cevap: 'Doğru çizim yanda.' }));
  return { ad: 'Tablayı çevir', kurallar: [3], yonerge: 'Bir tabla 90° döner: saat yönünde ↻ ya da tersine ↺. Köşedeki bilye köşede, kenardaki kenarda kalır; ortadaki yerinden oynamaz.', sorular };
}
function p4(L = [['A1', 0, 1], ['C1', 0, -1], ['B3', 0, 1], ['D2', 1, 1], ['F4', 3, -1], ['B6', 2, -1]]) {
  const sorular = [];
  for (const [ad, q, d] of L) {
    const i = hucreNo(ad), t = Array(36).fill(0);
    t[i] = 1; dolgu(t, 5, new Set([i]));
    const iz = t.map((_, k) => k === i ? 9 : 0), son = rotate(iz, q, d).indexOf(9);
    birak(son !== i, 'p4 oynamadı ' + ad); birak(tablaAd(i) === QNAME[q], `p4 başka tabla ${ad}`);
    sorular.push({ metin: `${ad}'deki yıldızlı bilye ${QNAME[q]} tablada. Tablayı ${yon(d)} çevirince nereye gelir?`, tahta: pt(t, [[i, 'y']]), alt: 'Yeni yeri: ........', tahtaC: pt(rotate(t, q, d), [[son, 'y']]), cevap: `${cellName(son)}.` });
  }
  return { ad: 'Çevirince nereye gider?', kurallar: [3], yonerge: 'Bilyeler tablayla birlikte döner. Tablayı kafanda çevir ya da parmağınla izle.', sorular };
}
function p5(D = [
    ['......', 'SSSSS.', '.BB...', '..BB..', '......', '......'],
    ['.B....', '.B.S..', '.BS...', '.B....', '.B.S..', '......'],
    ['S.....', '.S..B.', '..S...', '...S.B', '....S.', '......'],
    ['SS.SSS', 'BB.BB.', '......', '......', '......', '......'],
    ['......', '....B.', '...B..', '..B.S.', '.B.S..', 'B.S...'],
    ['S.....', 'S.BB..', 'S.....', '......', 'S.....', 'S.BB..'],
  ]) {
  const sorular = D.map((s) => {
    const b = coz(s), F = besli(b);
    birak(F.length <= 1, 'p5 birden çok beşli');
    const a = F[0];
    return { metin: 'Burada 5 var mı? Varsa kimin, hangi yönde? Beşliyi çiz.', tahta: pt(b), alt: 'Kim: ............  Yön: ............', tahtaC: pt(b, a ? a.L.map((i) => [i, 'o']) : []), cevap: a ? `${a.p === 1 ? 'Siyah' : 'Beyaz'}, ${yonBul(a.L)}.` : 'Yok: araya boşluk girince 5 sayılmaz.' };
  });
  return { ad: 'Beşli avı', kurallar: [4], yonerge: 'Yatay, dikey ya da çapraz, arada boşluk olmadan 5 bilye yan yana olmalı.', sorular };
}
function tekCukur(b, p) { const r = []; for (let i = 0; i < 36; i++) { if (b[i]) continue; const c = b.slice(); c[i] = p; if (has5(c, p)) r.push(i); } return r; }
function p6(D = [
    ['......', '......', 'SSSS..', 'BB....', '.B....', '......'],
    ['...S..', '...S..', '...S..', '......', '...S..', 'BB.B..'],
    ['S.....', '.S.B..', '..S.B.', '......', '....S.', '......'],
    ['.....S', '....S.', '.B.S..', '.BS...', '......', '......'],
    ['B.....', 'B.S...', '......', 'B.S...', 'B.S...', '..S...'],
    ['......', '.SSSS.', '.BBB..', '......', 'B.....', '......'],
  ]) {
  const sorular = D.map((s) => {
    const b = coz(s), C = tekCukur(b, 1);
    birak(!has5(b, 1) && !has5(b, 2), 'p6 hazır beşli'); birak(C.length >= 1, 'p6 yok');
    return { metin: C.length > 1 ? 'Sıra siyahta. Bilyeyi nereye koyarsa hemen 5 olur? İki yer bul.' : 'Sıra siyahta. Bilyeyi nereye koyarsa hemen 5 olur?', tahta: pt(b), tahtaC: pt(b, C.map((i) => [i, 'o'])), alt: 'Çukur: ............', cevap: `${C.map(cellName).join(' ya da ')}. Oyun biter, tabla çevrilmez.` };
  });
  return { ad: 'Tek bilye kaldı', kurallar: [4, 5], yonerge: 'Bilyeyi koyunca 5 olduysa oyun biter; tablayı çevirmeye gerek yoktur.', sorular };
}
function p7(D = [
    [['SSSS..', '......', '.BB...', '.B....', '......', '......'], 'E1'],
    [['SSS...', '......', '.BB...', '.B....', '......', '......'], 'D1'],
    [['..S...', '..S...', '..S...', '..S...', 'BB....', 'B.....'], 'C5'],
    [['..S...', '..S...', '......', '..S...', 'BB....', 'B.....'], 'C3'],
    [['S.....', '.S....', '..S...', '...S..', 'BB....', 'B.B...'], 'E5'],
    [['S.....', '.S....', '..S...', '......', 'BB....', 'B.B...'], 'D4'],
  ], bek = 3) {
  let evet = 0;
  const sorular = D.map(([s, ad]) => {
    const b = coz(s), i = hucreNo(ad); birak(!b[i], 'p7 dolu');
    const c = b.slice(); c[i] = 1; const f = has5(c, 1); evet += f;
    return { metin: `Siyah ${ad}'ye koyuyor. 5 oldu mu? Tablayı çevirmesi gerekir mi?`, tahta: pt(b, [[i, '*']]), tahtaC: pt(c), alt: '5 oldu mu: ......  Çevirir mi: ......', cevap: f ? 'Evet 5 oldu. Hayır, çevirmez: oyun biter.' : 'Hayır, 5 olmadı. Evet, bir tablayı çevirmek zorunda.' };
  });
  birak(evet === bek, 'p7 denge');
  return { ad: 'Çevirmeli miyim?', kurallar: [3, 5], yonerge: 'Bilyeni koy. 5 olduysa kazandın, oyun biter. 5 olmadıysa bir tablayı çevirmek zorundasın.', sorular };
}
function hazirCevir(q, d, cikar) { // çevirince siyah 5 olan konum kurar
  for (let n = 0; n < 200000; n++) {
    const L = LINES[rnd(32)];
    const iz = Array(36).fill(0); L.forEach((i) => { iz[i] = 1; });
    const t = rotate(iz, q, -d);
    if (has5(t, 1)) continue;
    if (!L.some((i) => { const r = Math.floor(i / 6), c = i % 6; return (r >= 3 ? 2 : 0) + (c >= 3 ? 1 : 0) === q; })) continue;
    if (cikar) { const adaylar = t.map((v, i) => (v ? i : -1)).filter((i) => i >= 0); t[adaylar[rnd(adaylar.length)]] = 0; }
    dolgu(t, 4, new Set()); for (let i = 0; i < 36; i++) if (t[i] === 1 && !iz.includes(1) ) t[i] = 0;
    return t;
  }
  throw new Error('kurulamadı');
}
function p8(L = [[0, 1], [1, -1], [2, 1], [3, -1], [0, -1], [3, 1]]) {
  const sorular = [];
  for (const [q, d] of L) {
    for (let n = 0; ; n++) {
      birak(n < 300000, 'p8 bulunamadı');
      const t = hazirCevir(q, d, false);
      if (has5(t, 1) || has5(t, 2)) continue;
      const K = []; for (let a = 0; a < 4; a++) for (const e of [1, -1]) { const R = rotate(t, a, e); if (has5(R, 1) && !has5(R, 2)) K.push([a, e]); }
      if (K.length !== 1 || K[0][0] !== q || K[0][1] !== d) continue;
      const son = rotate(t, q, d);
      sorular.push({ metin: 'Siyah bilyesini koydu. Hangi tablayı, hangi yöne çevirirse 5 olur?', tahta: pt(t), tahtaC: pt(son, besli(son)[0].L.map((i) => [i, 'o'])), alt: 'Tabla: ..............  Yön: ↻  ↺', cevap: `${QNAME[q]} tabla, ${yon(d)}.` });
      break;
    }
  }
  return { ad: 'Çevirerek kazan', kurallar: [3, 4], yonerge: 'Bilyeler 5 değilken bir çevirme hepsini aynı çizgiye getirebilir. Aşağıdaki tahtalarda tam bir doğru çevirme var.', sorular };
}
function sonuc(R) { const s = has5(R, 1), b = has5(R, 2); return s && b ? 'Berabere' : s ? 'Siyah kazanır' : b ? 'Beyaz kazanır' : 'Oyun sürer'; }
function p9(alt) {
  // çevrilen tablada dikey iki sütun: çevirince yatay iki sıra olur
  const berabere = (q, d, r1, r2, ok) => { // çevirmeden sonra r1 siyah, r2 beyaz yatay 5
    const iz = Array(36).fill(0);
    for (let c = 0; c < 5; c++) { iz[r1 * 6 + c + ok] = 1; iz[r2 * 6 + c + ok] = 2; }
    return rotate(iz, q, -d);
  };
  const O = [
    [berabere(0, 1, 0, 1, 0), 0, 1, 'Berabere'],
    [berabere(1, -1, 1, 2, 1), 1, -1, 'Berabere'],
    [berabere(2, 1, 4, 5, 0), 2, 1, 'Berabere'],
    [(() => { const t = berabere(0, 1, 0, 1, 0); t[hucreNo('E2')] = 0; return t; })(), 0, 1, 'Siyah kazanır'],
    [(() => { const t = berabere(1, -1, 1, 2, 1); t[hucreNo('B2')] = 0; return t; })(), 1, -1, 'Beyaz kazanır'],
    [(() => { const t = berabere(2, 1, 4, 5, 0); t[hucreNo('E5')] = 0; t[hucreNo('E6')] = 0; return t; })(), 2, 1, 'Oyun sürer'],
  ];
  const sorular = (alt ? [[berabere(3, -1, 3, 4, 1), 3, -1, 'Berabere'], [(() => { const t = berabere(3, -1, 3, 4, 1); t[hucreNo('C5')] = 0; return t; })(), 3, -1, 'Siyah kazanır']] : O).map(([t, q, d, bek]) => {
    const R = rotate(t, q, d), S = sonuc(R);
    birak(S === bek, `p9 ${S} / ${bek}`); birak(!has5(t, 1) && !has5(t, 2), 'p9 çevirmeden beşli');
    return { metin: `Bilye kondu, şimdi ${QNAME[q]} tabla ${yon(d)} çevriliyor. Sonuç ne olur?`, tahta: pt(t), tahtaC: pt(R, besli(R).flatMap((f) => f.L.map((i) => [i, 'o']))), alt: 'Siyah  /  Beyaz  /  Berabere  /  Oyun sürer', cevap: `${S}.` };
  });
  return { ad: 'Berabere mi, kazandım mı?', kurallar: [4, 6], yonerge: 'Çevirme sonunda 5\'lere bakılır. İki oyuncunun da 5\'i varsa oyun berabere biter. Önce çevir, sonra çiz, sonra karar ver.', sorular };
}
function p10(L = [true, false, true, false, false, false]) {
  const sorular = [], gorulen = new Set();
  for (const erken of L) {
    for (let n = 0; ; n++) {
      birak(n < 500000, 'p10 bulunamadı');
      let t;
      if (erken) { const L = LINES[rnd(32)]; t = Array(36).fill(0); L.forEach((i) => { t[i] = 1; }); t[L[rnd(5)]] = 0; dolgu(t, 5, new Set(L)); for (let i = 0; i < 36; i++) if (t[i] === 1 && !L.includes(i)) t[i] = 2; }
      else { const q = rnd(4), d = rnd(2) ? 1 : -1; t = hazirCevir(q, d, true); for (let i = 0, k = 0; i < 36; i++) if (t[i] === 2 && k++ > 3) t[i] = 0; }
      const ks = t.join('');
      if (gorulen.has(ks) || has5(t, 1) || has5(t, 2)) continue;
      const W = moves(t, 1).filter((m) => m.res === 'WIN');
      if (W.length !== 1 || !!W[0].early !== erken) continue;
      const m = W[0];
      gorulen.add(ks);
      sorular.push({ metin: 'Sıra siyahta. Tek hamlede kazanmanın yolu bir tane. Bul!', tahta: pt(t), tahtaC: pt(m.board, besli(m.board)[0].L.map((i) => [i, 'o'])), alt: 'Çukur: ......  Tabla: ..........  Yön: ↻  ↺', cevap: erken ? `${cellName(m.cell)}'ye koy; 5 oldu, çevirme yok.` : `${cellName(m.cell)}'ye koy, ${QNAME[m.q]} tabla ${yon(m.d)}.` });
      break;
    }
  }
  return { ad: 'Şampiyon hamlesi', kurallar: [3, 4, 5], yonerge: 'Bazı tahtalarda koymak yeter, bazılarında çevirmek de gerekir. Tabla çevirmek gerekmiyorsa o kısmı boş bırak.', sorular };
}

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
    sorular: A.map(([ad, s]) => ({ metin: `Diziliş ${ad}: Doğru mu? Yanlışsa nedenini yaz.`, tahta: kt(s), alt: 'Doğru  /  Yanlış: ............................', cevap: { A: 'Doğru.', B: 'Yanlış: ajan taş yok.', C: 'Yanlış: ajanlar ters köşede.', D: 'Yanlış: ajanlar ortada olmaz.' }[ad] })),
    dy: [['Her oyuncunun 7 taşı vardır.', 1], ['Tahta 8 × 8 karedir.', 0], ['Üst sırada 6 turuncu ve 1 mor taş vardır.', 1], ['Alt sırada 7 mor taş vardır.', 0]] };
}
function k2() {
  const sorular = [3, 6, 9, 12].map((n) => ({ metin: `Oyunda ${n} hamle oynandı. ${n + 1}. hamle kimin?`, alt: 'Mor  /  Turuncu', cevap: (n + 1) % 2 ? 'Mor: tek numaralı hamleler morun.' : 'Turuncu: çift numaralı hamleler turuncunun.' }));
  return { ad: 'İlk hamle ve dokunma', kurallar: [3, 11], yonerge: 'Oyuna mor başlar, sonra sırayla oynanır. Bir taşa dokunduysan o taşı oynamak zorundasın.', sorular,
    dy: [['Oyuna turuncu başlar.', 0], ['Ece bir taşa dokundu, vazgeçip başka taş oynayabilir.', 0], ['Can taşına dokundu; o taşı oynamak zorunda.', 1], ['Mor ilk hamleyi yaptıktan sonra sıra turuncuya geçer.', 1], ['İki kez üst üste oynayabilirim.', 0], ['Dokunmadığım taşları düşünerek seçebilirim.', 1]] };
}
function hareketSoru(s, a) {
  const [r, c] = yer(a), k = s[r][c], G = gidis(s, r, c);
  return { metin: `${a}'deki ${adK(k).toLocaleLowerCase('tr')} taş nerelere gidebilir? Halka çiz.`, tahta: kt(s, [[r, c, 'n']]), tahtaC: kt(s, [[r, c, 'n'], ...G.map(([x, y]) => [x, y, 'o'])]), alt: 'Kaç kare? ........', cevap: `${G.length} kare: ${G.map(([x, y]) => adi(x, y)).join(', ')}.` };
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
    return { metin: `${m}'deki mor taş yıldızlı ${h} karesine gidebilir mi? Neden?`, tahta: kt(s, [[r, c, '*'], [r0, c0, 'n']]), alt: 'Evet  /  Hayır: ..........................', cevap: Y ? `Hayır: ${Y[0]} dörtlü olur (boşluk ya da rakip taş fark etmez).` : 'Evet: dörtlü olmaz.' };
  });
  
  return { ad: 'Dörtlü yasağı', kurallar: [6], yonerge: 'Taşların yatay, dikey ya da çapraz doğrultuda dörtlü olamaz. Arada boşluk ya da rakip taş olsa bile dörtlü yapmak hatalı hamledir.', sorular };
}
function yakalaSoru(p, m, h, ek) {
  const s = tk(p), [r0, c0] = yer(m), [r, c] = yer(h), A = netYakala(s, m, h), son = hamle(s, m, h), k = s[r0][c0];
  return { metin: `${m}'deki ${adK(k).toLocaleLowerCase('tr')} taş ${h}'e gidiyor. Hangi taşlar alınır? Çarpı koy.`, tahta: kt(s, [[r0, c0, 'n'], [r, c, '*']]), tahtaC: kt(sonRows(son), A.map(([x, y]) => [x, y, 'x'])), alt: 'Alınanlar: ......................', cevap: A.length ? `${A.map(([x, y]) => adi(x, y)).join(', ')} alınır.` : `Hiçbiri: ${ek || 'sıkıştırma yok'}.` };
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
    return { metin: `${m}'deki ${adK(k).toLocaleLowerCase('tr')} taş rakibin başlangıç sırasındaki ${h}'e gidebilir mi?`, tahta: kt(s, [[r0, c0, 'n'], [r, c, '*']]), alt: 'Evet  /  Hayır', cevap: izin ? 'Evet: orada hiç taşı yok.' : 'Hayır: o sırada zaten bir taşı var.' };
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
    return b;
  };
  const enIyi = (p, k) => {
    const s = tk(p), T = [];
    s.forEach((sat, r) => [...sat].forEach((ch, c) => { if (ch === k) gidis(s, r, c).forEach(([a, e]) => {
      const al = yakala(s, r, c, a, e);
      T.push({ m: adi(r, c), h: adi(a, e), n: al.length, al, r, c }); }); }));
    T.sort((x, y) => y.n - x.n); birak(T[0].n > T[1].n && T[0].n >= 2, 'k10 en iyi tek değil');
    const e = T[0];
    return { metin: `Sıra ${adK(k).toLocaleLowerCase('tr')}da. En çok taş alan hamleyi bul. Hangi taş, nereye?`, tahta: kt(s), tahtaC: kt(sonRows(hamle(s, e.m, e.h)), e.al.map(([x, y]) => [x, y, 'x'])), alt: 'Hamle: ...... → ......  Alınan: ......', cevap: `${e.m} → ${e.h}: ${e.n} taş alır.` };
  };
  return { ad: 'Dört taşa giden yol', kurallar: [7, 10], yonerge: 'Rakibin dört taşını oyundan çıkaran oyunu kazanır. Önce kaç taş aldığını say, sonra en iyi hamleni seç.',
    sorular: [skor('M:D3,D6 T:D4', 'D6', 'D5', 3), skor('M:B4,D5 T:C4', 'D5', 'D4', 2), skor('M:D5 T:C4', 'D5', 'D4', 3), skor('T:B4,E3 M:C4,D4', 'E3', 'E4', 2),
      enIyi('M:B4,E5,G3,E2 T:C4,D4,F3', 'M'), enIyi('M:A4,D2,D5 T:B4,C4,D3', 'M')] };
}

const KULUP_ETK = {
  Pentago: [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10].map((f) => f()),
  'Küre': [k1, k2, k3, k4, k5, k6, k7, k8, k9, k10].map((f) => f()),
};
// slaytta birlikte çözülen sorular: kâğıttakilerle aynı tür, farklı konum
const ayni = (q, e) => e.sorular.some((x) => JSON.stringify([x.metin, x.tahta]) === JSON.stringify([q.metin, q.tahta]));
const BIRLIKTE = {
  Pentago: [p1(['D5', 'A3']).sorular.slice(1, 3), p2([[4, 4], [3, 2]]).sorular, p3([[['S.S', '...', 'B..'], 1], [['.S.', 'B..', '..S'], -1]]).sorular, p4([['A3', 0, 1], ['E1', 1, -1]]).sorular,
    p5([['......', '..S...', '..S.B.', '..S.B.', '..S.B.', '..S...'], ['B.BBBB', '......', 'SS....', '......', '......', '......']]).sorular,
    p6([['......', '.BB...', '.B....', 'SS.SS.', '......', '......'], ['.S....', '..S...', '...S..', '.B..S.', '.B....', '......']]).sorular,
    p7([[['.SSSS.', '......', 'BB....', 'B.....', '......', '......'], 'F2'.replace('F2', 'A1')], [['.SS...', '......', 'BB....', 'B.....', '......', '......'], 'D1']], 1).sorular,
    p8([[1, 1], [2, -1]]).sorular, p9(true).sorular, p10([true, false]).sorular],
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
// Türkçe ekler: D4'e, E1'e, A2'ye, C6'ya; D4'teki, E1'deki, C6'daki
const YON = { 1: "e", 2: "ye", 3: "e", 4: "e", 5: "e", 6: "ya", 7: "ye" }, BUL = { 1: "deki", 2: "deki", 3: "teki", 4: "teki", 5: "teki", 6: "daki", 7: "deki" };
const ek = (t) => t.replace(/\b([A-G])([1-7])'(ye|e)(?![a-zçğıöşü])/g, (_, h, n) => `${h}${n}'${YON[n]}`).replace(/\b([A-G])([1-7])'(deki|teki)/g, (_, h, n) => `${h}${n}'${BUL[n]}`);
for (const L of Object.values(KULUP_ETK)) for (const e of L) for (const q of [...e.sorular, ...e.birlikte]) { q.metin = ek(q.metin); q.cevap = ek(q.cevap); }
fs.writeFileSync(yol, '// Üretildi: node araclar/etkinlik-uret.mjs. Cevaplar kural motorlarından hesaplandı; elle değiştirmeyin.\nwindow.KULUP_ETK = ' + JSON.stringify(KULUP_ETK) + ';\n');
for (const [o, L] of Object.entries(KULUP_ETK)) L.forEach((e, i) => { console.log(`\n${o} ${i + 1}. ${e.ad} (kural ${e.kurallar})`); e.sorular.forEach((q, j) => console.log(`  ${j + 1}) ${q.metin} → ${q.cevap}`)); e.birlikte.forEach((q) => console.log(`  B) ${q.metin} → ${q.cevap}`)); });
