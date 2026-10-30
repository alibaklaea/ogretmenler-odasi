// Pentago kural motoru — TAZOF kuralları:
// 1) Bilyeyi koy. Koyunca 5 olduysa oyun biter (çevirmeye gerek yok).
// 2) Değilse bir tablayı 90° çevir (saat yönü ya da tersi).
// 3) Çevirince yalnız sen 5 olduysan kazanırsın; ikiniz de 5 ise berabere; yalnız rakip 5 ise rakip kazanır.
// Tahta: 36 hücre, indeks r*6+c. 0 boş, 1 SİYAH (TAZOF: ilk oynayan siyah), 2 beyaz.
// Tablalar: 0 sol üst, 1 sağ üst, 2 sol alt, 3 sağ alt. Yön: 1 saat yönü, -1 saat yönünün tersi.

export const LINES = [];
{
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 6; c++)
      for (const [dr, dc] of dirs) {
        const er = r + 4 * dr;
        const ec = c + 4 * dc;
        if (er < 0 || er > 5 || ec < 0 || ec > 5) continue;
        LINES.push([0, 1, 2, 3, 4].map((k) => (r + k * dr) * 6 + (c + k * dc)));
      }
}
if (LINES.length !== 32) throw new Error('çizgi sayısı ' + LINES.length);

export const ROTS = [];
for (let q = 0; q < 4; q++) for (const d of [1, -1]) ROTS.push([q, d]);

export const rotate = (b, q, d) => {
  const n = b.slice();
  const r0 = q >= 2 ? 3 : 0;
  const c0 = q % 2 ? 3 : 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      n[(r0 + r) * 6 + c0 + c] = d === 1 ? b[(r0 + 2 - c) * 6 + c0 + r] : b[(r0 + c) * 6 + c0 + 2 - r];
  return n;
};

export const fiveLines = (b, p) => LINES.filter((L) => L.every((i) => b[i] === p));
export const has5 = (b, p) => LINES.some((L) => b[L[0]] === p && b[L[1]] === p && b[L[2]] === p && b[L[3]] === p && b[L[4]] === p);

// Hamle sonucu: {res: 'WIN'|'DRAW'|'LOSS'|'GO', board, early}
export const play = (b, p, cell, q, d) => {
  if (b[cell] !== 0) throw new Error('dolu hücre');
  const b1 = b.slice();
  b1[cell] = p;
  if (has5(b1, p)) return {res: 'WIN', board: b1, early: true};
  const b2 = rotate(b1, q, d);
  const me = has5(b2, p);
  const op = has5(b2, 3 - p);
  if (me && op) return {res: 'DRAW', board: b2};
  if (me) return {res: 'WIN', board: b2};
  if (op) return {res: 'LOSS', board: b2};
  if (!b2.includes(0)) return {res: 'DRAW', board: b2};
  return {res: 'GO', board: b2};
};

// Tüm hamleler (koyunca kazanan hamlede çevirme yok: q=-1)
export const moves = (b, p) => {
  const out = [];
  for (let i = 0; i < 36; i++) {
    if (b[i] !== 0) continue;
    const b1 = b.slice();
    b1[i] = p;
    if (has5(b1, p)) {
      out.push({cell: i, q: -1, d: 0, res: 'WIN', board: b1, early: true});
      continue;
    }
    for (const [q, d] of ROTS) out.push({cell: i, q, d, ...play(b, p, i, q, d)});
  }
  return out;
};

// Hızlı: p'nin 1 hamlede kazancı var mı?
const four = (b, p) => LINES.some((L) => {
  let m = 0;
  let e = 0;
  for (const i of L) {
    if (b[i] === p) m++;
    else if (b[i] === 0) e++;
  }
  return m === 4 && e === 1;
});
export const winIn1 = (b, p) => {
  if (four(b, p)) return true;
  for (const [q, d] of ROTS) {
    const R = rotate(b, q, d);
    if (has5(R, 3 - p)) continue;
    if (has5(R, p) || four(R, p)) return true;
  }
  return false;
};

// M hamlesinden sonra p 2. hamlesinde zorla kazanıyor mu?
export const forcesWin = (after, p) => {
  const o = 3 - p;
  for (let i = 0; i < 36; i++) {
    if (after[i] !== 0) continue;
    const b1 = after.slice();
    b1[i] = o;
    if (has5(b1, o)) return false;
    for (const [q, d] of ROTS) {
      const r = play(after, o, i, q, d);
      if (r.res === 'LOSS') continue; // rakip kendini kaybettirdi
      if (r.res !== 'GO') return false; // rakip kazandı ya da berabere
      if (!winIn1(r.board, p)) return false;
    }
  }
  return true;
};

const COLS = 'ABCDEF';
export const cellName = (i) => COLS[i % 6] + (Math.floor(i / 6) + 1);
export const QNAME = ['sol üst', 'sağ üst', 'sol alt', 'sağ alt'];
export const moveText = (m) =>
  m.q < 0 ? `${cellName(m.cell)}'ye koy (çevirmeden 5!)` : `${cellName(m.cell)} + ${QNAME[m.q]} tabla ${m.d === 1 ? 'saat yönünde ↻' : 'saat yönünün tersine ↺'}`;
export const key = (b) => b.join('');
