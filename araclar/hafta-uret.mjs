// Haftalık paketler: her kulüp haftasına 10 etkinlik kâğıdı (6'şar soru) + en az 30 dokunmatik soru.
// node araclar/hafta-uret.mjs → js/kulup-hafta.js
// Kaynak: doğrulanmış bankalar (kulup-etkinlik.js, kulup-banka.js, kulup-banka-satranc.js) + burada üretilen Equilibrio soruları.
// Kurallar: bir soru dönem boyunca yalnızca bir kez kullanılır; Pentago bilye sayısı, Küre taş sayısı, Equilibrio parça sayısı denetlenir.
import fs from 'fs';
import vm from 'vm';

const kok = new URL('../js/', import.meta.url);
const W = {}; vm.createContext(W); W.window = W;
for (const f of ['kulup.js', 'kulup-etkinlik.js', 'kulup-banka.js', 'kulup-banka-satranc.js']) vm.runInContext(fs.readFileSync(new URL(f, kok), 'utf8'), W);
const KE = W.KULUP_ETK, KB = W.KULUP_BANKA, KS = W.KULUP_BANKA_S, KL = W.KULUP;
const hata = (k, n) => { if (!k) throw new Error('DENETİM: ' + n); };
let tohum = 20261108;
const rnd = (n) => { tohum = (tohum * 1664525 + 1013904223) >>> 0; return Math.floor((tohum / 4294967296) * n); };
const karistir = (L) => { const a = L.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const anahtar = (q) => JSON.stringify([q.metin || q.soru, q.tahta || q.fen || '', q.yildiz || '', q.vurgu || '']);

// ---------- Equilibrio ----------
const PARCA = { kup: ['Küp', 4], prizma: ['Kare prizma', 4], yamuk: ['Dik yamuk', 4], silindir: ['Silindir', 2], ucgen: ['Üçgen prizma', 2], kopru: ['Köprü', 1], yarim: ['Yarım silindir', 1] };
const TUR = Object.keys(PARCA), AD = (t) => PARCA[t][0], ADLAR = TUR.map(AD);
const alan = (ad, secenek, dogru) => { hata(secenek.includes(dogru), `seçenek yok ${ad} ${dogru}`); hata(new Set(secenek).size === secenek.length, 'tekrarlı seçenek ' + ad); return { ad, secenek, dogru }; };
const sayiSec = (d, en = 0) => { const s = new Set([d]); while (s.size < 4) s.add(Math.max(en, d + rnd(7) - 3)); return [...s].sort((a, b) => a - b).map(String); };
const adSec = (d) => karistir([d, ...karistir(ADLAR.filter((x) => x !== d)).slice(0, 3)]);
const say = (L) => { const s = {}; TUR.forEach((t) => { s[t] = 0; }); L.forEach((t) => { s[t]++; }); return s; };
const envanterUygun = (L) => Object.entries(say(L)).every(([t, n]) => n <= PARCA[t][1]);
const kutu18 = () => TUR.flatMap((t) => Array(PARCA[t][1]).fill(t));
function sec(n) { for (;;) { const L = karistir(kutu18()).slice(0, n); if (envanterUygun(L)) return L; } }
// tahta: { tur: 'e', dizi: [[tur, yıldız?]] } yan yana parçalar; { tur: 'e', yapi: [[alt→üst], ...] } sütun sütun yapı
const dizi = (L, y) => ({ tur: 'e', dizi: L.map((t, i) => (i === y ? [t, 1] : [t])) });
function eAd() { const L = sec(3 + rnd(4)), y = rnd(L.length);
  return { metin: 'Yıldızlı parçanın adı ne?', tahta: dizi(L, y), cevap: AD(L[y]) + '.', do: { alanlar: [alan('Parça', adSec(AD(L[y])), AD(L[y]))] } }; }
function eSay() { const L = sec(6 + rnd(9)), t = L[rnd(L.length)], n = say(L)[t];
  return { metin: `Bu parçaların arasında kaç tane ${AD(t).toLocaleLowerCase('tr')} var?`, tahta: dizi(L), cevap: `${n} tane ${AD(t).toLocaleLowerCase('tr')}.`, do: { alanlar: [alan('Sayı', sayiSec(n, 0), String(n))] } }; }
function eToplam() { const L = sec(5 + rnd(10)), n = L.length;
  return { metin: 'Toplam kaç parça var? Sayarak bul.', tahta: dizi(L), cevap: `${n} parça.`, do: { alanlar: [alan('Toplam', sayiSec(n, 1), String(n))] } }; }
function eEksik(i) { const tam = karistir(kutu18()), k = i % 3 === 0 ? 2 : 1, eksik = tam.slice(0, k), var_ = tam.slice(k);
  hata(var_.length + k === 18, 'eksik sayımı');
  if (k === 1) return { metin: 'Kutuda 18 parça olmalı. Hangi parça eksik?', tahta: dizi(var_), cevap: `Bir ${AD(eksik[0]).toLocaleLowerCase('tr')} eksik.`, do: { alanlar: [alan('Eksik parça', adSec(AD(eksik[0])), AD(eksik[0]))] } };
  return { metin: 'Kutuda 18 parça olmalı. Kaç parça eksik?', tahta: dizi(var_), cevap: `2 parça eksik: ${eksik.map((t) => AD(t).toLocaleLowerCase('tr')).join(' ve ')}.`, do: { alanlar: [alan('Eksik', ['1', '2', '3', '4'], '2')] } }; }
function eKutu(i) { const t = TUR[i % 7], n = PARCA[t][1];
  if (i % 8 === 7) return { metin: 'Bir Equilibrio kutusunda toplam kaç parça vardır?', cevap: '18 parça.', do: { alanlar: [alan('Toplam', ['12', '16', '18', '20'], '18')] } };
  return { metin: `Bir Equilibrio kutusunda kaç tane ${AD(t).toLocaleLowerCase('tr')} vardır?`, tahta: dizi([t]), cevap: `${n} tane.`, do: { alanlar: [alan('Sayı', ['1', '2', '3', '4'], String(n))] } }; }
function yapiKur() { // 2-4 sütun, her sütun 1-3 parça; köprü/yarım silindir yalnız en üstte
  for (;;) { const S = Array.from({ length: 2 + rnd(3) }, () => Array.from({ length: 1 + rnd(3) }, () => TUR[rnd(5)]));
    S.forEach((s) => { if (rnd(4) === 0) s[s.length - 1] = rnd(2) ? 'kopru' : 'yarim'; if (rnd(5) === 0) s[s.length - 1] = 'ucgen'; });
    S.forEach((s) => { for (let j = 0; j < s.length - 1; j++) if (['ucgen', 'kopru', 'yarim'].includes(s[j])) s[j] = 'kup'; });
    const gen = { kup: 1, prizma: 1, silindir: 1, yamuk: 2, ucgen: 2, kopru: 2, yarim: 2 };
    const saglam = S.every((s) => s.every((p, j) => j === 0 || (gen[p] <= gen[s[j - 1]] && !(s[j - 1] === 'yamuk' && gen[p] > 1))));
    const L = S.flat(); if (saglam && L.length >= 3 && L.length <= 9 && envanterUygun(L)) return { S, L }; } }
function eYapi(i) { const { S, L } = yapiKur(), s = say(L), tip = i % 3, tahta = { tur: 'e', yapi: S };
  if (tip === 0) return { metin: 'Bu yapıda kaç parça kullanılmış?', tahta, cevap: `${L.length} parça.`, do: { alanlar: [alan('Parça', sayiSec(L.length, 1), String(L.length))] } };
  if (tip === 1) { const t = L[rnd(L.length)]; return { metin: `Bu yapıda kaç tane ${AD(t).toLocaleLowerCase('tr')} var?`, tahta, cevap: `${s[t]} tane.`, do: { alanlar: [alan('Sayı', sayiSec(s[t], 0), String(s[t]))] } }; }
  const yok = TUR.filter((t) => !s[t]), varlar = TUR.filter((t) => s[t]); if (!yok.length || varlar.length < 3) return null;
  const d = yok[rnd(yok.length)], O = karistir([d, ...karistir(varlar).slice(0, 3)]).map(AD);
  return { metin: 'Bu yapıda hangi parça hiç kullanılmamış?', tahta, cevap: `${AD(d)}.`, do: { alanlar: [alan('Parça', O, AD(d))] } }; }
const KURAL_E = [['Kutuda 18 parça vardır.', 1], ['Kutuda 4 tane silindir vardır.', 0], ['Yapı kartın aynısı olmalıdır.', 1], ['Karttaki açıklıkları kapatabilirim.', 0], ['İki parçayı birleştirip tek parça gibi kullanabilirim.', 0],
  ['Bir parça düşerse toplanır ve devam edilir.', 1], ['Bir parça düşünce oyun biter.', 0], ['İlk bitiren elini kaldırır ve “Bitirdim!” der.', 1], ['Yapı dengede durmadan “Bitirdim!” diyebilirim.', 0], ['Erken “Bitirdim!” demek uyarı getirir.', 1],
  ['Her turda 5 şekil dizilir.', 1], ['Her şekil 3 puandır.', 0], ['Hakem şeklin numarasını söyler.', 1], ['Önce dizerim, kitapçığı sonra açarım.', 0], ['Kutuda 1 köprü ve 1 yarım silindir vardır.', 1], ['Kutuda küpten daha çok silindir vardır.', 0],
  ['Turu alan oyuncu 1 puan alır.', 1], ['Turu kaybeden oyuncu 2 puan alır.', 0], ['Dik yamuktan 4 tane vardır.', 1], ['Üçgen prizmadan 4 tane vardır.', 0]];
const eKural = (i) => { const [m, d] = KURAL_E[i % KURAL_E.length]; return { metin: `Doğru mu, yanlış mı? ${m}`, cevap: d ? 'Doğru.' : 'Yanlış.', do: { alanlar: [alan('Cevap', ['Doğru', 'Yanlış'], d ? 'Doğru' : 'Yanlış')] } }; };
const ISIM = ['Ece', 'Can', 'Ada', 'Efe', 'Elif', 'Mert', 'Zeynep', 'Kerem', 'Defne', 'Ali', 'Nehir', 'Emir'];
function ePuan(i) { const [a, b] = karistir(ISIM).slice(0, 2), x = rnd(6), y = 5 - x;
  if (i % 2 === 0) { const kaz = x > y ? a : b; return { metin: `Bir turda 5 şekil dizildi. ${a} ${x} şekli, ${b} ${y} şekli önce bitirdi. Turu kim alır?`, cevap: `${kaz}: daha çok şekil bitirdi (${Math.max(x, y)} – ${Math.min(x, y)}).`, do: { alanlar: [alan('Turu alan', [a, b], kaz)] } }; }
  const T = Array.from({ length: 3 + rnd(2) }, () => rnd(2)), top = T.reduce((s, v) => s + v, 0);
  return { metin: `Mini ligde ${a} ${T.length} tur oynadı. Tur sonuçları: ${T.map((v) => (v ? 'aldı' : 'kaybetti')).join(', ')}. ${a} kaç tur puanı topladı?`, cevap: `${top} puan: aldığı her tur 1 puan.`, do: { alanlar: [alan('Puan', sayiSec(top, 0), String(top))] } }; }
function havuz(n, f) { const R = [], gor = new Set(); let d = 0; while (R.length < n) { hata(++d < 200000, 'equilibrio üretimi ' + f.name); const q = f(R.length); if (!q) continue; const k = anahtar(q); if (gor.has(k)) continue; gor.add(k); R.push(q); } return R; }
const EQ = { ad: ['Parçanın adı', 'Parçaları adlarıyla tanı. Yıldızlı parçaya bak.', havuz(80, eAd)], say: ['Parçaları say', 'Parçaları tek tek say; saydığını işaretlemek işini kolaylaştırır.', havuz(90, eSay).concat(havuz(30, eToplam))],
  eksik: ['Kutuyu kontrol et', 'Kutuda 18 parça vardır: 4 küp, 4 kare prizma, 4 dik yamuk, 2 silindir, 2 üçgen prizma, 1 köprü, 1 yarım silindir.', havuz(80, eEksik)], kutu: ['Kutuda neler var?', 'Kutudaki parça sayılarını hatırla.', havuz(8, eKutu)],
  yapi: ['Yapıyı incele', 'Yapıdaki parçaları alttan üste, soldan sağa say.', havuz(110, eYapi)], kural: ['Kurallar', 'Equilibrio kurallarını hatırla.', havuz(KURAL_E.length, eKural)], puan: ['Tur ve puan', 'Her turda 5 şekil dizilir. Daha çok şekli önce bitiren turu alır ve 1 puan kazanır.', havuz(90, ePuan)] };

// ---------- havuzlar ----------
const ETIKET_E = { kup: 1 };
function alt(q) { const A = q.do || {}; const p = []; (A.alanlar || []).forEach((a) => p.push(a.secenek.length <= 6 && a.secenek.join(' / ').length < 70 ? `${a.ad}: ${a.secenek.join('  /  ')}` : `${a.ad}: ..........`)); if (A.kare) p.push(A.kare.length ? 'Cevap: ....................' : ''); if (A.cizim) return ''; return p.filter(Boolean).join('   ') || 'Cevap: ....................'; }
function isaretle(q, oyun) { // cevap anahtarı için tahtaya cevabı çiz
  const r = { ...q };
  if (q.do && q.do.cizim && q.tahta2) r.tahta2C = { tur: 'p3', s: q.do.cizim };
  if (!r.tahtaC && q.tahta && q.do && q.do.kare && q.do.kare.length && (q.tahta.tur === 'p' || q.tahta.tur === 'k')) {
    const m = q.do.kare.map((k) => { const c = k.charCodeAt(0) - 65, s = +k.slice(1) - 1; return [s, c, oyun === 'Küre' && q.metin.includes('alınır') ? 'x' : 'o']; });
    r.tahtaC = { ...q.tahta, m: [...(q.tahta.m || []), ...m] };
  }
  if (!r.alt) r.alt = alt(q);
  return r;
}
const P = {}, gor = {};
const ekle = (oyun, t, ad, yonerge, L) => { (P[oyun] = P[oyun] || {})[t] = { ad, yonerge, L: L.map((q) => isaretle(q, oyun)) }; };
for (const oyun of ['Pentago', 'Küre']) KE[oyun].forEach((e, t) => ekle(oyun, t, e.ad, e.yonerge, [...e.sorular, ...(e.birlikte || []), ...KB[oyun][t]].filter((q) => q.do)));
for (const [t, [ad, y, L]] of Object.entries(EQ)) ekle('Equilibrio', t, ad, y, L);
// satranç: hafta hafta 90 soru (python-chess ile doğrulandı); kâğıtta dokunma yerine işaretleme
const SAT_DIL = [[' karesine dokun.', ' karesini X ile işaretle.'], ['Karelere dokun.', 'Kareleri X ile işaretle.'], ['taşlarının hepsine dokun.', 'taşlarının hepsini X ile işaretle.'], ['taşlarına dokun.', 'taşlarını X ile işaretle.'],
  ['taşına dokun.', 'taşını X ile işaretle.'], [' Dokun.', ' O kareyi X ile işaretle.'], ['Yanlış karelere dokun.', 'Yanlış kareleri X ile işaretle.'], ['Boş kalan yerlere dokun.', 'Boş kalan kareleri X ile işaretle.']];
const kagitDili = (m) => SAT_DIL.reduce((s, [a, b]) => s.split(a).join(b), m);
const SON = { 1: ['deki', 'e', 'den'], 2: ['deki', 'ye', 'den'], 3: ['teki', 'e', 'ten'], 4: ['teki', 'e', 'ten'], 5: ['teki', 'e', 'ten'], 6: ['daki', 'ya', 'dan'], 7: ['deki', 'ye', 'den'], 8: ['deki', 'e', 'den'] };
const ekDuzelt = (t) => t.replace(/\b([a-hA-G])([1-8])'([dt][ae]ki)\b/g, (_, h, n) => `${h}${n}'${SON[n][0]}`).replace(/\b([a-hA-G])([1-8])'([dt][ae]n)\b/g, (_, h, n) => `${h}${n}'${SON[n][2]}`).replace(/\b([a-hA-G])([1-8])'(y?[ae])(?![a-zçğıöşü])/g, (_, h, n) => `${h}${n}'${SON[n][1]}`);
const SATKONU = KL.programlar.SAT.haftalar.map((w) => w.ad);

// ---------- denetimler ----------
function denetle(q, oyun) {
  const A = q.do; hata(A && (A.alanlar || A.kare || A.cizim || A.duzelt), 'dokunmatik cevap yok: ' + q.metin);
  (A.alanlar || []).forEach((a) => hata(a.secenek.includes(a.dogru), 'doğru seçenekte yok: ' + q.metin));
  const t = q.tahta, m = q.metin || q.soru || '';
  if (oyun === 'Pentago' && t && t.tur === 'p') {
    const s = t.s.join(''), S = [...s].filter((c) => c === 'S').length, B = [...s].filter((c) => c === 'B').length;
    hata(S - B === 0 || S - B === 1, `Pentago bilye sayısı S${S} B${B}: ${m}`);
    if (/Sıra siyahta|Siyah .* koyuyor|Sıra siyah/.test(m)) hata(S === B, `sıra siyahta ama S${S} B${B}: ${m}`);
    if (/^Siyah bilyesini koydu/.test(m)) hata(S === B + 1, `siyah koydu ama S${S} B${B}: ${m}`);
    if (/^Beyaz bilyesini koydu/.test(m)) hata(S === B, `beyaz koydu ama S${S} B${B}: ${m}`);
    (A.kare || []).forEach((k) => { const i = (k.charCodeAt(0) - 65) + (+k[1] - 1) * 6; hata(/^[A-F][1-6]$/.test(k), 'çukur adı ' + k); if (/koy|5 olur/.test(m)) hata(s[i] === '.', `dolu çukura bilye: ${k} ${m}`); });
  }
  if (oyun === 'Küre' && t && t.tur === 'k') {
    const s = t.s.join(''), M = [...s].filter((c) => c === 'M').length, T = [...s].filter((c) => c === 'T').length;
    hata(M <= 7 && T <= 7, `Küre taş sayısı M${M} T${T}`); (A.kare || []).forEach((k) => hata(/^[A-G][1-7]$/.test(k), 'kare adı ' + k));
  }
  if (oyun === 'Equilibrio' && t) { const L = t.dizi ? t.dizi.map((x) => x[0]) : t.yapi.flat(); hata(envanterUygun(L), 'Equilibrio parça sayısı kutuyu aşıyor: ' + m); }
  if (oyun === 'Satranç') hata(typeof q.fen === 'string' && q.fen.split('/').length >= 8, 'fen');
}

// ---------- haftalık dağıtım ----------
const kullan = {};
function al(oyun, konular, n, haric) { // konulardan sırayla, tekrar etmeden n soru
  const R = []; kullan[oyun] = kullan[oyun] || new Set();
  const dene = (t) => { const H = P[oyun][t]; if (!H) return null; const q = H.L.find((x) => !kullan[oyun].has(anahtar(x)) && !(haric && haric.has(anahtar(x)))); if (!q) return null; kullan[oyun].add(anahtar(q)); return { ...q, _t: t }; };
  let i = 0, bos = 0;
  while (R.length < n) { const q = dene(konular[i % konular.length]); i++; if (q) { R.push(q); bos = 0; continue; }
    if (++bos > konular.length) { const yedek = Object.keys(P[oyun]).find((t) => P[oyun][t].L.some((x) => !kullan[oyun].has(anahtar(x)))); hata(yedek !== undefined, `${oyun} soruları bitti`); const q2 = dene(yedek); if (q2) R.push(q2); } }
  return R;
}
const K = (oyun, t) => [oyun, t];
const AKIL = [
  { kagit: [K('Pentago', 0), K('Pentago', 1), K('Pentago', 2), K('Pentago', 3), K('Pentago', 1), K('Küre', 0), K('Küre', 1), K('Küre', 2), K('Küre', 0), K('Küre', 2)], dokun: [K('Pentago', 0), K('Pentago', 2), K('Pentago', 3), K('Küre', 0), K('Küre', 2)] },
  { kagit: [K('Pentago', 4), K('Pentago', 4), K('Pentago', 5), K('Pentago', 5), K('Pentago', 6), K('Pentago', 6), K('Pentago', 3), K('Pentago', 2), K('Pentago', 4), K('Pentago', 5)], dokun: [K('Pentago', 4), K('Pentago', 5), K('Pentago', 6)] },
  { kagit: [K('Küre', 6), K('Küre', 6), K('Küre', 7), K('Küre', 7), K('Küre', 8), K('Küre', 8), K('Küre', 3), K('Küre', 4), K('Küre', 6), K('Küre', 7)], dokun: [K('Küre', 6), K('Küre', 7), K('Küre', 8), K('Küre', 4)] },
  { kagit: [K('Equilibrio', 'ad'), K('Equilibrio', 'ad'), K('Equilibrio', 'kutu'), K('Equilibrio', 'say'), K('Equilibrio', 'say'), K('Equilibrio', 'eksik'), K('Equilibrio', 'eksik'), K('Equilibrio', 'ad'), K('Equilibrio', 'say'), K('Equilibrio', 'eksik')], dokun: [K('Equilibrio', 'ad'), K('Equilibrio', 'say'), K('Equilibrio', 'eksik')] },
  { kagit: [K('Equilibrio', 'kural'), K('Equilibrio', 'kural'), K('Equilibrio', 'puan'), K('Equilibrio', 'puan'), K('Equilibrio', 'yapi'), K('Equilibrio', 'yapi'), K('Equilibrio', 'say'), K('Equilibrio', 'eksik'), K('Equilibrio', 'yapi'), K('Equilibrio', 'puan')], dokun: [K('Equilibrio', 'kural'), K('Equilibrio', 'puan'), K('Equilibrio', 'yapi')] },
  { kagit: [K('Küre', 5), K('Küre', 5), K('Küre', 8), K('Küre', 8), K('Küre', 4), K('Küre', 9), K('Küre', 5), K('Küre', 3), K('Küre', 4), K('Küre', 9)], dokun: [K('Küre', 5), K('Küre', 8), K('Küre', 4)] },
  { kagit: [K('Pentago', 7), K('Pentago', 7), K('Pentago', 8), K('Pentago', 8), K('Pentago', 9), K('Pentago', 9), K('Pentago', 6), K('Pentago', 5), K('Pentago', 7), K('Pentago', 8)], dokun: [K('Pentago', 7), K('Pentago', 8), K('Pentago', 9)] },
  { kagit: [K('Küre', 9), K('Küre', 9), K('Küre', 1), K('Küre', 6), K('Küre', 7), K('Küre', 8), K('Küre', 5), K('Küre', 2), K('Küre', 9), K('Küre', 6)], dokun: [K('Küre', 9), K('Küre', 1), K('Küre', 7), K('Küre', 3)] },
  { kagit: [K('Equilibrio', 'yapi'), K('Equilibrio', 'yapi'), K('Equilibrio', 'puan'), K('Equilibrio', 'puan'), K('Equilibrio', 'eksik'), K('Equilibrio', 'ad'), K('Equilibrio', 'say'), K('Equilibrio', 'yapi'), K('Equilibrio', 'eksik'), K('Equilibrio', 'say')], dokun: [K('Equilibrio', 'yapi'), K('Equilibrio', 'puan'), K('Equilibrio', 'eksik'), K('Equilibrio', 'ad')] },
  { kagit: [K('Pentago', 10), K('Pentago', 10), K('Pentago', 11), K('Pentago', 11), K('Pentago', 9), K('Pentago', 10), K('Pentago', 11), K('Pentago', 8), K('Pentago', 7), K('Pentago', 9)], dokun: [K('Pentago', 10), K('Pentago', 11), K('Pentago', 9)] },
  { kagit: [K('Pentago', 4), K('Pentago', 8), K('Pentago', 10), K('Küre', 6), K('Küre', 8), K('Küre', 9), K('Equilibrio', 'yapi'), K('Equilibrio', 'puan'), K('Equilibrio', 'say'), K('Equilibrio', 'eksik')], dokun: [K('Pentago', 5), K('Pentago', 6), K('Küre', 7), K('Küre', 4), K('Equilibrio', 'yapi'), K('Equilibrio', 'ad')] },
  { kagit: [K('Pentago', 9), K('Pentago', 10), K('Pentago', 11), K('Pentago', 8), K('Pentago', 7), K('Küre', 9), K('Küre', 8), K('Küre', 3), K('Küre', 5), K('Küre', 7)], dokun: [K('Pentago', 9), K('Pentago', 11), K('Pentago', 10), K('Küre', 9), K('Küre', 5), K('Küre', 8)] }];

const SORU_KAGIT = 6, SORU_DOKUN = 30;
const sade = (q) => { const r = { ...q }; delete r._t; return r; };
const HAFTA = { AKIL: [], SAT: [] };
AKIL.forEach((w, i) => {
  const kagitlar = w.kagit.map(([oyun, t], j) => { const H = P[oyun][t], S = al(oyun, [t], SORU_KAGIT); S.forEach((q) => denetle(q, oyun));
    return { oyun, ad: H.ad, yonerge: H.yonerge, sorular: S.map((q) => sade({ ...q, metin: ekDuzelt(q.metin), cevap: ekDuzelt(q.cevap) })) }; });
  const oyunlar = [...new Set(w.dokun.map(([o]) => o))], pay = Math.ceil(SORU_DOKUN / oyunlar.length) + 2;
  const dokun = karistir(oyunlar.flatMap((o) => al(o, w.dokun.filter(([x]) => x === o).map(([, t]) => t), pay).map((q) => { denetle(q, o); const { alt: _, tahtaC, tahta2C, ...r } = sade(q); return { ...r, oyun: o, konu: P[o][q._t].ad, metin: ekDuzelt(r.metin), cevap: ekDuzelt(r.cevap) }; })));
  hata(kagitlar.length === 10 && kagitlar.every((k) => k.sorular.length === SORU_KAGIT), 'akıl kâğıt sayısı');
  hata(dokun.length >= SORU_DOKUN, 'akıl dokunmatik sayısı ' + dokun.length);
  HAFTA.AKIL.push({ kagitlar, dokun });
});
KS.haftalar.forEach((L, i) => {
  hata(L.length >= 10 * SORU_KAGIT + SORU_DOKUN, 'satranç hafta bankası küçük ' + i);
  L.forEach((q) => denetle(q, 'Satranç'));
  const kagit = L.slice(0, 60).map((q) => ({ ...q, metin: ekDuzelt(kagitDili(q.metin)), cevap: ekDuzelt(q.cevap), alt: alt(q) }));
  kagit.forEach((q) => hata(!/dokun/i.test(q.metin), 'kâğıtta dokun ifadesi kaldı: ' + q.metin));
  const kagitlar = Array.from({ length: 10 }, (_, j) => ({ oyun: 'Satranç', ad: `${SATKONU[i]} · ${j + 1}`, yonerge: 'Tahtaya dikkatle bak. Gerekirse taşları parmağınla izle, sonra cevabını yaz ya da X ile işaretle.', sorular: kagit.slice(j * 6, j * 6 + 6) }));
  const dokun = L.slice(60, 90).map((q) => ({ ...q, oyun: 'Satranç', konu: SATKONU[i], metin: ekDuzelt(q.metin), cevap: ekDuzelt(q.cevap) }));
  HAFTA.SAT.push({ kagitlar, dokun });
});
// genel denetim: dönem boyunca aynı soru iki kez yok
for (const p of ['AKIL', 'SAT']) { const g = new Set(); HAFTA[p].forEach((w, i) => [...w.kagitlar.flatMap((k) => k.sorular), ...w.dokun].forEach((q) => { const k = anahtar(q); hata(!g.has(k), `${p} ${i + 1}. hafta tekrar: ${q.metin}`); g.add(k); })); }
fs.writeFileSync(new URL('kulup-hafta.js', kok), '// Üretildi: node araclar/hafta-uret.mjs. Her hafta 10 kâğıt (6 soru) + en az 30 dokunmatik soru; elle değiştirmeyin.\nwindow.KULUP_HAFTA = ' + JSON.stringify(HAFTA) + ';\n');
for (const p of ['AKIL', 'SAT']) HAFTA[p].forEach((w, i) => console.log(p, i + 1, '| kâğıt', w.kagitlar.map((k) => k.ad.slice(0, 14)).join(', '), '| dokun', w.dokun.length));
