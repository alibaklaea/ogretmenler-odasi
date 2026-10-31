# Çocuk Kulübü satranç alıştırmaları: her sorunun cevabı python-chess ile hesaplanır ve doğrulanır.
# Çalıştır: python araclar/satranc_sorulari.py  → js/kulup-satranc.js
import chess, json, collections, pathlib

TAS = {"K": "Şah", "Q": "Vezir", "R": "Kale", "B": "Fil", "N": "At", "P": "Piyon"}
DEGER = {"P": 1, "N": 3, "B": 3, "R": 5, "Q": 9, "K": 0}


def ad(sq): return chess.square_name(sq)


def tam(fen): return fen if " " in fen else fen + " w - - 0 1"


def tr_hamle(b, m):
    p = b.piece_at(m.from_square).symbol().upper()
    s = ("" if p == "P" else TAS[p] + " ") + ad(m.from_square) + ("x" if b.is_capture(m) else "-") + ad(m.to_square)
    if m.promotion: s += " (" + TAS[chess.piece_symbol(m.promotion).upper()] + ")"
    b2 = b.copy(); b2.push(m)
    return s + (" MAT!" if b2.is_checkmate() else " şah!" if b2.is_check() else "")


def gidebilir(fen, kare):
    """Taşın gidebileceği kareler. İki şah da varsa kurallı hamleler, yoksa saldırı kareleri (kendi taşı hariç)."""
    b = chess.Board(tam(fen)); sq = chess.parse_square(kare); p = b.piece_at(sq)
    if b.king(chess.WHITE) is not None and b.king(chess.BLACK) is not None:
        b.turn = p.color
        return sorted({ad(m.to_square) for m in b.legal_moves if m.from_square == sq})
    return sorted(ad(s) for s in b.attacks(sq) if not (b.piece_at(s) and b.piece_at(s).color == p.color))


def git(fen, kare, soru=None):
    k = gidebilir(fen, kare); p = chess.Board(tam(fen)).piece_at(chess.parse_square(kare))
    return {"fen": fen, "soru": soru or f"{kare} karesindeki {TAS[p.symbol().upper()].lower()} hangi karelere gidebilir? X ile işaretle, kaç kare olduğunu yaz.",
            "cevap": (f"{len(k)} kare: " + ", ".join(k)) if k else "Hiçbir yere gidemez (önü kapalı).", "isaret": k, "vurgu": [kare]}


def mat1(fen, soru="Tek hamlede mat et!"):
    b = chess.Board(fen); r = []
    for m in b.legal_moves:
        b.push(m); ok = b.is_checkmate(); b.pop()
        if ok: r.append(m)
    assert len(r) == 1, (fen, [b.san(m) for m in r])
    return {"fen": fen, "soru": soru + (" (Sıra beyazda)" if b.turn else " (Sıra siyahta)"), "cevap": tr_hamle(b, r[0]), "isaret": [ad(r[0].to_square)]}


def durum(fen):
    b = chess.Board(fen)
    if b.is_checkmate(): return "MAT"
    if b.is_stalemate(): return "PAT (berabere)"
    if b.is_check(): return "ŞAH (ama mat değil, kaçabilir)"
    return "Ne şah ne mat ne pat"


def durum_s(fen):
    b = chess.Board(fen)
    return {"fen": fen, "soru": f"Sıra {'beyaz' if b.turn else 'siyah'}da. Şah mı, mat mı, pat mı?", "cevap": durum(fen)}


def at_mesafe(a, h):
    s, t = chess.parse_square(a), chess.parse_square(h); q = collections.deque([(s, 0)]); gor = {s}
    while q:
        x, d = q.popleft()
        if x == t: return d
        for y in chess.SquareSet(chess.BB_KNIGHT_ATTACKS[x]):
            if y not in gor: gor.add(y); q.append((y, d + 1))


def catal(fen):
    b = chess.Board(fen); r = []
    for m in b.legal_moves:
        if b.piece_at(m.from_square).piece_type != chess.KNIGHT: continue
        b.push(m)
        hedef = [s for s in b.attacks(m.to_square) if b.piece_at(s) and b.piece_at(s).color == b.turn and b.piece_at(s).piece_type in (chess.KING, chess.QUEEN, chess.ROOK)]
        b.pop()
        if len(hedef) >= 2: r.append((m, hedef))
    assert len(r) == 1, (fen, [(b.san(m), h) for m, h in r]); m, h = r[0]
    return {"fen": fen, "soru": "Atınla çatal yap: aynı anda iki büyük taşa saldır!", "cevap": tr_hamle(b, m) + " → saldırdığı taşlar: " + ", ".join(TAS[b.piece_at(s).symbol().upper()] + " " + ad(s) for s in h), "isaret": [ad(m.to_square)]}


def acmaz(fen):
    b = chess.Board(fen)
    p = [s for s in chess.SQUARES if b.piece_at(s) and b.piece_at(s).color == b.turn and b.piece_at(s).piece_type != chess.KING and b.is_pinned(b.turn, s)]
    assert len(p) == 1, (fen, p)
    return {"fen": fen, "soru": f"{'Beyaz' if b.turn else 'Siyah'} taşlardan hangisi açmazda? Neden kıpırdayamıyor?",
            "cevap": f"{TAS[b.piece_at(p[0]).symbol().upper()]} {ad(p[0])}: oynarsa arkasındaki şah saldırıya açılır.", "isaret": [ad(p[0])]}


def acmaz_al(fen, hamle):
    b = chess.Board(fen); assert b.is_pinned(chess.WHITE, chess.E2)
    m = b.parse_san(hamle); b.push(m)
    assert not b.is_attacked_by(chess.BLACK, m.to_square), "vezir geri alınır"
    b.pop()
    return {"fen": fen, "soru": "Beyaz vezir açmazda mı? Beyaz ne yapmalı?", "cevap": "Evet, açmazda; ama açmaz hattı üzerinde gidebilir: " + tr_hamle(b, m) + " Kale alınır, vezir güvende.", "isaret": [ad(m.to_square)]}


def rok(fen):
    b = chess.Board(fen)
    ok = any(b.is_castling(m) and m.to_square == chess.G1 for m in b.legal_moves)
    neden = ""
    if not ok:
        if b.is_check(): neden = ": şah tehdit altında, rok yapılamaz."
        elif b.piece_at(chess.F1) or b.piece_at(chess.G1): neden = ": şahla kale arasında taş var."
        else: neden = ": şahın geçeceği ya da varacağı kare rakip tarafından tehdit ediliyor."
    return {"fen": fen, "soru": "Beyaz kısa rok yapabilir mi? Neden?", "cevap": ("EVET" if ok else "HAYIR") + neden}


def materyal(fen):
    b = chess.Board(fen); pm = b.piece_map().values()
    w = sum(DEGER[p.symbol().upper()] for p in pm if p.color); s = sum(DEGER[p.symbol().upper()] for p in pm if not p.color)
    return {"fen": fen, "soru": "Taş değerlerini topla (piyon 1, at 3, fil 3, kale 5, vezir 9). Kim önde?",
            "cevap": f"Beyaz {w}, siyah {s}: " + ("eşit" if w == s else ("beyaz" if w > s else "siyah") + f" {abs(w - s)} puan önde")}


def vezir_catal(fen, hamle):
    b = chess.Board(fen); m = b.parse_san(hamle); b.push(m)
    hedef = [s for s in b.attacks(m.to_square) if b.piece_at(s) and b.piece_at(s).color == b.turn and b.piece_at(s).piece_type in (chess.KING, chess.QUEEN, chess.ROOK)]
    assert b.is_check() and len(hedef) >= 2
    b.pop()
    return {"fen": fen, "soru": "Vezirle çatal yap: şah çekerken kaleyi de kazan!", "cevap": tr_hamle(b, m) + " → şah kaçınca a8'deki kale alınır.", "isaret": [ad(m.to_square)]}


H = []
# 1. hafta: tahta, koordinat, başlangıç dizilişi
H.append([
    {"fen": "8/8/8/8/8/8/8/8", "soru": "Yıldızlı karenin adı ne? (Önce harf, sonra sayı.)", "yildiz": ["e4"], "cevap": "e4"},
    {"fen": "8/8/8/8/8/8/8/8", "soru": "Yıldızlı karenin adı ne?", "yildiz": ["b7"], "cevap": "b7"},
    {"fen": "8/8/8/8/8/8/8/8", "soru": "g3 karesine yıldız çiz. Bu kare açık renk mi, koyu renk mi?", "cevap": "g3: " + ("koyu" if chess.BB_DARK_SQUARES & chess.BB_G3 else "açık") + " renk kare", "isaret": ["g3"]},
    {"fen": "8/8/8/8/8/8/8/4K3", "soru": "Beyaz şah hangi karede?", "cevap": "e1"},
    {"fen": chess.STARTING_BOARD_FEN, "soru": "Siyah vezir hangi karede? Kendi renginde mi?", "cevap": "d8: vezir kendi rengindeki karede durur.", "isaret": ["d8"]},
    {"fen": chess.STARTING_BOARD_FEN, "soru": "Beyaz atlar ve beyaz filler hangi karelerde?", "cevap": "Atlar b1 ve g1, filler c1 ve f1.", "isaret": ["b1", "g1", "c1", "f1"]}])
# 2. hafta: kale ve fil
H.append([git("8/8/8/8/3R4/8/8/8", "d4"), git("8/8/8/8/P7/8/8/R3n3", "a1"), git("8/8/8/8/8/8/8/2B5", "c1"),
          git("8/1p6/8/8/4B3/8/2P5/8", "e4"), git("8/8/8/2p5/8/2R1P3/8/8", "c3"), git("8/8/5p2/8/3b4/8/1P6/8", "d4")])
# 3. hafta: vezir ve şah
H.append([git("8/8/8/8/3Q4/8/8/8", "d4"), git("8/8/8/1p6/8/3Q1P2/8/8", "d3"),
          git("4k3/8/8/8/8/8/8/4K3 w - - 0 1", "e1", "Beyaz şah hangi karelere gidebilir? X ile işaretle."),
          git("4k3/8/8/8/8/8/3r4/4K3 w - - 0 1", "e1", "Beyaz şah nereye gidebilir? (Rakibin saldırdığı kareye şah giremez!)"),
          git("8/8/8/3k4/8/3K4/8/8 w - - 0 1", "d3", "Beyaz şah nereye gidebilir? (İki şah yan yana gelemez!)"),
          git("7k/8/8/8/8/8/1q6/K7 w - - 0 1", "a1", "Beyaz şah tehlikede! Nereye kaçabilir ya da neyi alabilir?")])
# 4. hafta: at
H.append([git("8/8/8/8/3N4/8/8/8", "d4"), git("8/8/8/8/8/8/8/N7", "a1"), git("8/8/8/2p1P3/8/3N4/1P6/8", "d3"),
          {"fen": "8/8/8/8/8/8/8/N7", "soru": "At a1'den h8'e (yıldız) en az kaç hamlede gider?", "yildiz": ["h8"], "cevap": f"{at_mesafe('a1', 'h8')} hamle"},
          {"fen": "8/8/8/8/8/8/8/1N6", "soru": "At b1'den yıldızlı karelere en az kaç hamlede gider? (d2 ve c3)", "yildiz": ["d2", "c3"], "cevap": f"d2: {at_mesafe('b1', 'd2')} hamle, c3: {at_mesafe('b1', 'c3')} hamle"},
          {"fen": "8/8/8/8/8/8/8/1N6", "soru": "At b1'den hemen üstündeki b2'ye en az kaç hamlede gider?", "yildiz": ["b2"], "cevap": f"{at_mesafe('b1', 'b2')} hamle"}])
# 5. hafta: piyon, terfi, geçerken alma
H.append([git("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1", "e2", "e2'deki piyon nereye gidebilir?"),
          git("4k3/8/8/3ppp2/4P3/8/8/4K3 w - - 0 1", "e4", "e4'teki piyon nereye gidebilir? (Düz giderken alamaz, çapraz alır!)"),
          git("4k3/8/8/8/8/4n3/4P3/4K3 w - - 0 1", "e2", "Önü kapalı bu piyon nereye gidebilir?"),
          {"fen": "4k3/1P6/8/8/8/8/8/4K3 w - - 0 1", "soru": "b7'deki piyon b8'e çıkınca ne olur?", "cevap": "Terfi eder: vezir, kale, fil ya da at olur. Çoğunlukla vezir seçilir.", "isaret": ["b8"]},
          git("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1", "e5", "Siyah piyon d7'den d5'e iki kare geldi. e5'teki beyaz piyon nereye gidebilir? (Geçerken alma!)"),
          git("4k3/8/8/8/3Pp3/8/8/4K3 b - d3 0 1", "e4", "Beyaz piyon d2'den d4'e geldi. e4'teki siyah piyon nereye gidebilir?")])
# 6. hafta: şah, mat, pat
H.append([durum_s("4R1k1/5ppp/8/8/8/8/8/6K1 b - - 0 1"), durum_s("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"), durum_s("4k3/8/8/8/8/8/8/4R1K1 b - - 0 1"),
          durum_s("k7/1Q6/1K6/8/8/8/8/8 b - - 0 1"), durum_s("k7/8/1Q6/8/8/8/8/7K b - - 0 1"), durum_s("4k3/8/8/8/8/8/3Q4/4K3 b - - 0 1")])
# 7. hafta: rok ve taş değerleri
H.append([rok("4k3/8/8/8/8/8/8/4K2R w K - 0 1"), rok("4k3/8/8/8/8/8/8/4KB1R w K - 0 1"), rok("4k3/8/8/8/2b5/8/8/4K2R w K - 0 1"), rok("4k3/4r3/8/8/8/8/8/4K2R w K - 0 1"),
          materyal("r3k3/pp6/8/8/8/8/PPP5/R2QK3 w - - 0 1"), materyal("4k3/1q6/8/8/8/8/3NB3/R3K2R w - - 0 1")])
# 8. hafta: temel matlar (kale + şah, vezir + şah)
H.append([mat1("6k1/8/6K1/8/8/8/8/R7 w - - 0 1"), mat1("k7/8/1K6/8/8/8/8/7R w - - 0 1"), mat1("4k3/8/4K3/8/8/8/8/R7 w - - 0 1"),
          mat1("k7/8/2K5/8/8/8/8/1Q6 w - - 0 1"), mat1("7k/8/5K2/8/8/8/8/6Q1 w - - 0 1"), mat1("8/8/8/8/8/1K6/7R/k7 w - - 0 1")])
# 9. hafta: açılış tuzakları
SON = "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
H.append([mat1("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", "Çoban matı!"),
          mat1("rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2", "Tembel matı!"),
          mat1("rnbqkbnr/ppppp2p/5p2/6p1/4P3/8/PPPP1PPP/RNBQKBNR w KQkq g6 0 3", "Siyah iki kötü hamle yaptı."),
          {"fen": SON, "soru": "Beyaz vezir f7'yi aldı. Siyah şah veziri alabilir mi? Durum ne?", "cevap": durum(SON) + ": vezir c4'teki fil tarafından korunuyor, şah onu alamaz."},
          {"fen": "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3", "soru": "Beyaz çoban matı tehdit ediyor (f7'ye bak). Siyah ne oynamalı?", "cevap": "f7'yi korumalı: Vezir e7 ya da Vezir f6. (g6 da olur, vezire saldırır.)", "isaret": ["f7"]},
          {"fen": chess.STARTING_BOARD_FEN, "soru": "Açılışın 3 altın kuralını yaz.", "cevap": "1) Merkezi piyonlarla tut (e4, d4). 2) At ve filleri çıkar. 3) Rok yap. Veziri erken çıkarma!"}])
# 10. hafta: çatal
H.append([catal("r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1"), catal("6k1/8/2q5/3N4/8/8/8/6K1 w - - 0 1"), catal("3r3k/8/8/4N3/8/8/8/6K1 w - - 0 1"), catal("2r1k3/8/8/8/4N3/8/8/K7 w - - 0 1"),
          {"fen": "8/8/8/3N4/8/8/8/8", "soru": "At kaç kareye saldırır? Saldırdığı kareleri işaretle.", "cevap": f"{len(gidebilir('8/8/8/3N4/8/8/8/8', 'd5'))} kare", "isaret": gidebilir("8/8/8/3N4/8/8/8/8", "d5"), "vurgu": ["d5"]},
          vezir_catal("r3k3/8/8/8/8/8/8/4K2Q w - - 0 1", "Qe4+")])
# 11. hafta: açmaz
H.append([acmaz("4k3/4n3/8/8/8/8/8/4R1K1 b - - 0 1"), acmaz("4k3/8/1b6/2N5/8/4K3/8/8 w - - 0 1"), acmaz("3q3k/8/8/8/8/8/3R4/3K4 w - - 0 1"), acmaz("7k/6r1/8/8/3B4/8/8/6K1 b - - 0 1"),
          {"fen": "4k3/8/8/8/8/8/8/4K3", "soru": "Açmaz nedir? Kendi cümlenle yaz. Hangi taşlar açmaz yapabilir?", "cevap": "Bir taş oynarsa arkasındaki şah ya da daha değerli taş saldırıya açılıyorsa o taş açmazdadır. Açmazı kale, fil ve vezir yapar."},
          acmaz_al("4k3/8/8/4r3/8/8/4Q3/4K3 w - - 0 1", "Qxe5+")])
# 12. hafta: son yatay matı ve tekrar
H.append([mat1("6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1", "Son yatay matı!"), mat1("1r4k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1"),
          mat1("6k1/5ppp/8/8/8/8/5PPP/2Q3K1 w - - 0 1"), mat1("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1"),
          {"fen": "6k1/5ppp/8/8/8/8/5PPP/6K1", "soru": "Son yatay matından korunmanın iki yolunu yaz.", "cevap": "1) Şahın önündeki bir piyonu ilerlet, kaçış karesi aç (ör. h3). 2) Son yatayı kale ya da vezirle koru."},
          {"fen": chess.STARTING_BOARD_FEN, "soru": "Bu dönem en sevdiğin taktik hangisi? Bir örneğini çiz.", "cevap": "Kişisel cevap (çatal, açmaz, son yatay matı, çoban matı…)"}])

# ---------- akıllı tahta soruları: her hafta 10 etkileşimli soru (dokun ya da seç), kâğıt 10 soruya tamamlanır ----------
import random
R = random.Random(20261031)
HARF, BASLA = "abcdefgh", chess.STARTING_BOARD_FEN
KOSE = ["a1", "h1", "a8", "h8"]


def kare_rastgele(a=0, b=7, c=0, d=7): return HARF[R.randint(a, b)] + str(R.randint(c + 1, d + 1))


def konum(tas):
    b = chess.Board(None)
    for sq, sem in tas.items(): b.set_piece_at(chess.parse_square(sq), chess.Piece.from_symbol(sem))
    return b.board_fen()


def dokun(q):
    q = dict(q); q["soru"] = q["soru"].replace("X ile işaretle, kaç kare olduğunu yaz.", "Karelere dokun.").replace("X ile işaretle.", "Karelere dokun.")
    return q


def sec(fen, soru, secenek, dogru, cevap, **k):
    assert dogru in secenek
    return {"fen": fen, "soru": soru, "secenek": secenek, "dogru": dogru, "cevap": cevap, **k}


def havuz_git(sem, ad_, n, yol=None):
    Q, gor = [], set()
    while len(Q) < n:
        sq = kare_rastgele(1, 6, 1, 6); tas = {sq: sem}
        for _ in range(R.randint(1, 3)):
            k = kare_rastgele(0, 7, 1, 6)
            if k not in tas: tas[k] = R.choice("PN" if sem.isupper() else "pn") if R.random() < .4 else R.choice("pnb" if sem.isupper() else "PNB")
        f = konum(tas)
        if f in gor or len(gidebilir(f, sq)) < 3: continue
        gor.add(f); q = git(f, sq, f"{sq} karesindeki {ad_} hangi karelere gidebilir? Karelere dokun."); Q.append(q)
    return Q


def t1():
    Q = []
    for sq in ["c5", "f2", "h7", "a4", "d6", "g1"]: Q.append({"fen": "8/8/8/8/8/8/8/8", "soru": f"{sq} karesine dokun.", "cevap": sq, "isaret": [sq]})
    Q += [{"fen": BASLA, "soru": "Beyaz vezire dokun.", "cevap": "d1", "isaret": ["d1"]}, {"fen": BASLA, "soru": "Siyah kalelere dokun.", "cevap": "a8 ve h8", "isaret": ["a8", "h8"]},
          {"fen": BASLA, "soru": "Beyaz şaha dokun.", "cevap": "e1", "isaret": ["e1"]}, {"fen": BASLA, "soru": "Siyah atlara dokun.", "cevap": "b8 ve g8", "isaret": ["b8", "g8"]},
          {"fen": BASLA, "soru": "Beyaz fillere dokun.", "cevap": "c1 ve f1", "isaret": ["c1", "f1"]}, {"fen": "8/8/8/8/8/8/8/8", "soru": "Yıldızlı karenin adı ne?", "yildiz": ["d3"], "secenek": ["c3", "d3", "d4", "e3"], "dogru": "d3", "cevap": "d3"},
          sec("8/8/8/8/8/8/8/8", "Yıldızlı kare hangi renk?", ["Açık", "Koyu"], "Açık" if not chess.BB_DARK_SQUARES & chess.BB_H1 else "Koyu", "Sağ alt köşedeki h1 açık renktir.", yildiz=["h1"]),
          {"fen": "8/8/8/8/8/8/8/8", "soru": "Tahtanın sağ alt köşesindeki kareye dokun.", "cevap": "h1", "isaret": ["h1"]}, {"fen": "8/8/8/8/8/8/8/8", "soru": "Dört köşe kareye de dokun.", "cevap": "a1, h1, a8, h8", "isaret": KOSE},
          {"fen": BASLA, "soru": "Siyah vezire dokun.", "cevap": "d8", "isaret": ["d8"]}]
    return Q


def t_at():
    Q = havuz_git("N", "at", 10)
    for a, h in [("a1", "c5"), ("b1", "e3"), ("g1", "f7"), ("d4", "e5")]:
        n = at_mesafe(a, h); Q.append(sec(konum({a: "N"}), f"At {a}'den yıldızlı {h} karesine en az kaç hamlede gider?", ["1", "2", "3", "4"], str(n), f"{n} hamle", yildiz=[h]))
    return Q


def t_piyon():
    Q = []
    for sq, eng in [("c2", None), ("g2", None), ("d3", None), ("f4", "e5"), ("b5", "c6"), ("d4", "c5"), ("e3", "f4"), ("c4", "d5"), ("h2", None)]:
        tas = {"e8": "k", "e1": "K", sq: "P"}
        if eng: tas[eng] = "p"
        Q.append(git(konum(tas) + " w - - 0 1", sq, f"{sq}'teki piyon nereye gidebilir? Karelere dokun."))
    Q += [git("4k3/8/8/4pP2/8/8/8/4K3 w - e6 0 1", "f5", "Siyah piyon e7'den e5'e geldi. f5'teki piyon nereye gidebilir? Karelere dokun."),
          git("4k3/8/8/8/4Pp2/8/8/4K3 b - e3 0 1", "f4", "Beyaz piyon e2'den e4'e geldi. f4'teki siyah piyon nereye gidebilir? Karelere dokun."),
          {"fen": "4k3/6P1/8/8/8/8/8/4K3 w - - 0 1", "soru": "Piyon hangi kareye çıkınca terfi eder? Dokun.", "cevap": "g8: son yataya varınca terfi eder.", "isaret": ["g8"]},
          sec("4k3/P7/8/8/8/8/8/4K3 w - - 0 1", "Piyon a8'e çıkınca hangisi olamaz?", ["Vezir", "Kale", "Şah", "At"], "Şah", "Piyon şah olamaz; vezir, kale, fil ya da at olur."),
          git("4k3/8/8/8/8/3p4/3P4/4K3 w - - 0 1", "d2", "Bu piyon nereye gidebilir?")]
    Q[-1]["soru"] += " Kareye dokun, gidemiyorsa Doğru mu'ya bas."
    return Q


def durum_havuz():
    kota = {"MAT": 4, "PAT": 3, "ŞAH": 4, "YOK": 3}; Q, gor = [], set(); ETK = ["Şah", "Mat", "Pat", "Hiçbiri"]
    while any(kota.values()):
        ks = R.choice(["a8", "h8", "a1", "h1", "e8", "a5", "h4", "d8", "g8"])
        tas = {ks: "k"}; km = kare_rastgele(); s = R.choice("QR"); ks2 = kare_rastgele()
        if km == ks or ks2 in (ks, km): continue
        tas[km] = "K"; tas[ks2] = s
        b = chess.Board(konum(tas) + " b - - 0 1")
        if not b.is_valid(): continue
        k = "MAT" if b.is_checkmate() else "PAT" if b.is_stalemate() else "ŞAH" if b.is_check() else "YOK"
        if kota[k] == 0 or b.fen() in gor: continue
        gor.add(b.fen()); kota[k] -= 1
        Q.append(sec(b.fen(), "Sıra siyahta. Bu durum hangisi?", ETK, {"MAT": "Mat", "PAT": "Pat", "ŞAH": "Şah", "YOK": "Hiçbiri"}[k], durum(b.fen())))
    R.shuffle(Q); return Q


def rok_havuz():
    F = ["4k3/8/8/8/8/8/8/R3K3 w Q - 0 1", "4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1", "4k3/8/8/8/8/6b1/8/4K2R w K - 0 1", "4k3/8/8/8/1b6/8/8/4K2R w K - 0 1", "5r1k/8/8/8/8/8/8/4K2R w K - 0 1", "6rk/8/8/8/8/8/8/4K2R w K - 0 1", "4k3/8/8/8/8/8/8/4KN1R w K - 0 1"]
    Q = []
    for f in F:
        if "w Q" in f:
            ok = any(chess.Board(f).is_castling(m) for m in chess.Board(f).legal_moves)
            Q.append(sec(f, "Beyaz uzun rok yapabilir mi?", ["Evet", "Hayır"], "Evet" if ok else "Hayır", "Evet: şahla kale arası boş, kareler güvende." if ok else "Hayır.")); continue
        q = rok(f); ok = q["cevap"].startswith("EVET")
        Q.append(sec(f, "Beyaz kısa rok yapabilir mi?", ["Evet", "Hayır"], "Evet" if ok else "Hayır", q["cevap"]))
    for f in ["r3k3/ppp5/8/8/8/8/PP6/1N1QK3 w - - 0 1", "1q2k3/8/8/8/8/8/PPP5/R3K3 w - - 0 1", "3rk3/pp6/8/8/8/8/P7/3RK3 w - - 0 1", "2b1k3/1n6/8/8/8/8/3R4/4K3 w - - 0 1", "4k3/8/5n2/8/8/2B5/8/4K3 w - - 0 1", "q3k3/8/8/8/8/8/8/R2QK3 w - - 0 1", "3rk3/8/8/8/8/8/PPPPPP2/4K3 w - - 0 1"]:
        q = materyal(f); c = q["cevap"]; d = "Eşit" if "eşit" in c else "Beyaz" if ": beyaz" in c else "Siyah"
        Q.append(sec(f, "Taş değerlerini topla. Kim önde?", ["Beyaz", "Siyah", "Eşit"], d, c))
    R.shuffle(Q); return Q


def mat_havuz(sem, n):
    Q, gor = [], set()
    while len(Q) < n:
        ks = R.choice(["g8", "a8", "h8", "b8", "h4", "a5", "e8", "c8"]); km = kare_rastgele(); s = kare_rastgele()
        if len({ks, km, s}) < 3: continue
        b = chess.Board(konum({ks: "k", km: "K", s: sem}) + " w - - 0 1")
        if not b.is_valid(): continue
        r = [m for m in b.legal_moves if b.gives_check(m) and (b.push(m) or b.is_checkmate(), b.pop())[0]]
        if len(r) != 1 or b.fen() in gor: continue
        gor.add(b.fen()); Q.append(mat1(b.fen()))
    return Q


def tuzak_havuz():
    Q, gor = [], set()
    H1 = [["e4", None, "Bc4", None, "Qh5", None], ["e4", None, "Qf3", None, "Bc4", None], ["e4", None, "Bc4", None, "Qf3", None], ["e4", None, "Qh5", None, "Bc4", None]]
    while len(Q) < 10:
        b = chess.Board(); P = R.choice(H1); ok = True
        for h in P:
            try: b.push(b.parse_san(h) if h else R.choice([m for m in b.legal_moves if chess.square_rank(m.to_square) >= 4]))
            except ValueError: ok = False; break
        if not ok or b.is_game_over(): continue
        r = []
        for m in b.legal_moves:
            b.push(m); e = b.is_checkmate(); b.pop()
            if e: r.append(m)
        if len(r) != 1 or b.fen() in gor: continue
        gor.add(b.fen()); Q.append(mat1(b.fen(), "Çoban matını bul!"))
    Q += [{"fen": "8/8/8/8/8/8/8/8", "soru": "Merkezdeki dört kareye dokun.", "cevap": "d4, e4, d5, e5", "isaret": ["d4", "e4", "d5", "e5"]},
          {"fen": BASLA, "soru": "Açılışta önce hangi iki piyon merkeze çıkar? Dokun.", "cevap": "d2 ve e2 piyonları.", "isaret": ["d2", "e2"]},
          sec(BASLA, "Açılışta hangisi yapılmaz?", ["Merkezi tut", "Atları çıkar", "Veziri erken çıkar", "Rok yap"], "Veziri erken çıkar", "Veziri erken çıkarmak yanlıştır: rakip onu kovalar."),
          {"fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1", "soru": "Çoban matının hedefindeki siyah piyona dokun.", "cevap": "f7: yalnız şah korur.", "isaret": ["f7"]}]
    return Q


def catal_havuz(n):
    Q, gor = [], set()
    while len(Q) < n:
        t = {"h1": "K"}; ks = kare_rastgele(0, 7, 4, 7); k2 = kare_rastgele(0, 7, 3, 7); na = kare_rastgele(1, 6, 1, 5)
        if len({ks, k2, na}) < 3 or "h1" in (ks, k2, na): continue
        t = {"g1": "K", ks: "k", k2: R.choice("rq"), na: "N"}
        b = chess.Board(konum(t) + " w - - 0 1")
        if not b.is_valid() or b.fen() in gor or b.is_check(): continue
        try: q = catal(b.fen())
        except AssertionError: continue
        m = chess.parse_square(q["isaret"][0]); kor = b.is_attacked_by(chess.BLACK, m)
        if kor: continue
        gor.add(b.fen()); q["soru"] = "Atınla çatal yap! At hangi kareye gitmeli? Dokun."; Q.append(q)
    return Q


def acmaz_havuz(n):
    Q, gor = [], set()
    while len(Q) < n:
        sat = R.choice("RBQ"); ks = kare_rastgele(0, 7, 5, 7); ar = kare_rastgele(1, 6, 2, 6); uz = kare_rastgele(0, 7, 0, 2)
        if len({ks, ar, uz}) < 3: continue
        b = chess.Board(konum({"h1": "K", ks: "k", ar: R.choice("nbrp"), uz: sat}) + " b - - 0 1")
        if chess.parse_square(ks) == b.king(chess.BLACK) and not b.is_valid(): continue
        if b.fen() in gor or b.is_check():continue
        try: q = acmaz(b.fen())
        except AssertionError: continue
        gor.add(b.fen()); q["soru"] = "Siyahın açmazdaki taşına dokun."; Q.append(q)
    return Q


def sonyatay_havuz(n):
    Q, gor = [], set()
    while len(Q) < n:
        p = R.choice([("g8", "fgh"), ("b8", "abc"), ("h8", "gh")]); ks, pa = p; s = kare_rastgele(0, 7, 0, 5); kg = kare_rastgele(0, 7, 0, 1)
        t = {ks: "k", s: R.choice("RQ"), kg: "K"}
        for h in pa: t[h + "7"] = "p"
        if len(t) < 3 + len(pa): continue
        b = chess.Board(konum(t) + " w - - 0 1")
        if not b.is_valid() or b.fen() in gor: continue
        r = []
        for m in b.legal_moves:
            b.push(m); e = b.is_checkmate(); b.pop()
            if e: r.append(m)
        if len(r) != 1 or chess.square_rank(r[0].to_square) != 7: continue
        gor.add(b.fen()); Q.append(mat1(b.fen(), "Son yatay matını yap!"))
    return Q


K = 14  # tahta 10 + kâğıda 4
T = [t1(), havuz_git("R", "kale", 7) + havuz_git("B", "fil", 7), havuz_git("Q", "vezir", 8) + [git(konum({"e8": "k", k: "K", s: "r"}) + " w - - 0 1", k, "Beyaz şah nereye gidebilir? Karelere dokun.") for k, s in [("e1", "d8"), ("c3", "a4"), ("g2", "f8"), ("d4", "b5"), ("b2", "h3"), ("f3", "e8")]],
     t_at(), t_piyon(), durum_havuz(), rok_havuz(), mat_havuz("R", 7) + mat_havuz("Q", 7), tuzak_havuz(), catal_havuz(K), acmaz_havuz(K), sonyatay_havuz(K)]
for i, L in enumerate(T):
    del L[K:]
    assert len(L) == K, (i, len(L))
    if i in (1, 2, 7): R.shuffle(L)
    L[:] = [dokun(q) for q in L]
    for q in L:
        assert q.get("isaret") is not None or q.get("secenek"), q
        if i != 0 and "isaret" in q: assert all(len(x) == 2 for x in q["isaret"])
TAHTA = [L[:10] for L in T]
for w, L in zip(H, T):
    for q in L[10:]: w.append({k: v for k, v in q.items() if k not in ("secenek", "dogru")} | {"soru": q["soru"].replace("Karelere dokun.", "X ile işaretle.").replace("Dokun.", "Kareyi işaretle.").replace(" dokun.", " yıldız çiz.")})
for i, (w, t) in enumerate(zip(H, TAHTA)):
    an = {(q["fen"], q["soru"]) for q in w}
    assert not any((q["fen"], q["soru"]) in an for q in t), i

# ---------- 1. hafta etkinlik sayfaları (takımsız, siyah-beyaz): her sayfa tek konu, 6 soru ----------
BOS = "8/8/8/8/8/8/8/8"
HARFLER, SAYILAR = list("abcdefgh"), list("12345678")


def alan(ad_, secenek, dogru):
    assert dogru in secenek, (ad_, dogru)
    return {"ad": ad_, "secenek": secenek, "dogru": dogru}


def renk_alan(k): return alan("Renk", ["Açık", "Koyu"], renk(k))


def renk(k): return "Koyu" if chess.BB_SQUARES[chess.parse_square(k)] & chess.BB_DARK_SQUARES else "Açık"


def s1():
    Q = [{"fen": BOS, "soru": "Tahtayı say: Bir yatayda kaç kare var? Toplam kaç kare var?", "alt": "Yatayda: ....  Toplam: ....", "cevap": "Bir yatayda 8, toplam 64 kare.", "do": {"alanlar": [alan("Yatayda", ["6", "8", "10"], "8"), alan("Toplam", ["36", "49", "64", "81"], "64")]}},
         {"fen": BOS, "soru": "Sağ alt köşedeki kare hangi renk? Yıldız çiz.", "alt": "Açık  /  Koyu", "cevap": f"{renk('h1')} renk (h1).", "isaret": ["h1"], "do": {"kare": ["h1"], "alanlar": [renk_alan("h1")]}}]
    for k in ["e4", "d4", "a8", "g7"]: Q.append({"fen": BOS, "soru": "Yıldızlı kare açık mı, koyu mu?", "yildiz": [k], "alt": "Açık  /  Koyu", "cevap": f"{renk(k)} ({k}).", "do": {"alanlar": [renk_alan(k)]}})
    return {"ad": "Tahtayı tanı", "konu": "64 kare", "yonerge": "Satranç tahtasında 64 kare vardır. Kareler açık ve koyu sırayla dizilir. Tahta konurken sağ alt köşe açık renk olur.", "sorular": Q}


def s2():
    Q = []
    for k in ["c6", "f2", "a5", "h3", "d8", "e1"]: Q.append({"fen": BOS, "soru": "Yıldızlı kare hangi dikeyde, hangi yatayda?", "yildiz": [k], "alt": "Dikey: ....  Yatay: ....", "cevap": f"{k[0]} dikeyi, {k[1]}. yatay.", "do": {"alanlar": [alan("Dikey", HARFLER, k[0]), alan("Yatay", SAYILAR, k[1])]}})
    return {"ad": "Yatay ve dikey", "konu": "Yatay, dikey", "yonerge": "Dikeyler harfle (a-h), yataylar sayıyla (1-8) gösterilir. Dikey yukarı aşağı, yatay sağa sola uzanır.", "sorular": Q}


def s3():
    Q = []
    for a, b in [("a1", "d4"), ("c1", "h6"), ("b2", "b6"), ("h1", "e4"), ("a3", "c6"), ("d1", "a4")]:
        A, B = chess.parse_square(a), chess.parse_square(b); ok = abs(chess.square_file(A) - chess.square_file(B)) == abs(chess.square_rank(A) - chess.square_rank(B))
        Q.append({"fen": BOS, "soru": "Yıldızlı iki kare aynı çaprazda mı? Çizerek bul.", "yildiz": [a, b], "alt": "Evet  /  Hayır", "cevap": "Evet, aynı çaprazda." if ok else "Hayır, aynı çaprazda değil.", "do": {"alanlar": [alan("Aynı çaprazda mı?", ["Evet", "Hayır"], "Evet" if ok else "Hayır")]}})
    assert 2 <= sum(q["cevap"].startswith("Evet") for q in Q) <= 4
    return {"ad": "Çapraz çizgiler", "konu": "Çapraz", "yonerge": "Çapraz çizgi köşeden köşeye gider. Çapraz boyunca bütün kareler aynı renktir.", "sorular": Q}


def s4():
    Q = [{"fen": BOS, "soru": "Yıldızlı karenin adı ne?", "yildiz": [k], "alt": "Karenin adı: ........", "cevap": k, "do": {"alanlar": [alan("Harf", HARFLER, k[0]), alan("Sayı", SAYILAR, k[1])]}} for k in ["b3", "g5", "e7", "a2", "h8", "d6"]]
    return {"ad": "Karenin adı", "konu": "Koordinat", "yonerge": "Karenin adı önce harf, sonra sayı ile okunur: e4 gibi.", "sorular": Q}


def s5():
    Q = [{"fen": BOS, "soru": f"{k} karesine yıldız çiz. Rengi ne?", "alt": "Açık  /  Koyu", "cevap": f"{k}: {renk(k).lower()} kare.", "isaret": [k], "do": {"kare": [k], "alanlar": [renk_alan(k)]}} for k in ["f3", "c7", "h5", "a6", "e2", "b8"]]
    return {"ad": "Kareyi bul", "konu": "Koordinat", "yonerge": "Önce harfi bul, parmağınla yukarı çık, sayıda dur.", "sorular": Q}


def s6():
    Q = []
    for k, t in [("d4", "R"), ("e5", "n"), ("c3", "B"), ("f6", "q"), ("b4", "K"), ("g5", "p")]:
        Q.append({"fen": konum({k: t}), "soru": f"{k} karesindeki taşın adı ne? Hangi renk?", "alt": "Taş: ............  Renk: ........", "cevap": f"{'Beyaz' if t.isupper() else 'Siyah'} {TAS[t.upper()].lower()}.", "do": {"alanlar": [alan("Taş", ["Şah", "Vezir", "Kale", "Fil", "At", "Piyon"], TAS[t.upper()]), alan("Renk", ["Beyaz", "Siyah"], "Beyaz" if t.isupper() else "Siyah")]}})
    return {"ad": "Taşları tanı", "konu": "Taşlar", "yonerge": "Satrançta altı çeşit taş vardır: şah, vezir, kale, fil, at ve piyon.", "sorular": Q}


def s7():
    b = chess.Board(); Q = []
    for yazi, tip, r in [("Beyazın kaç piyonu var?", chess.PAWN, chess.WHITE), ("Siyahın kaç atı var?", chess.KNIGHT, chess.BLACK), ("Beyazın kaç kalesi var?", chess.ROOK, chess.WHITE), ("Siyahın kaç veziri var?", chess.QUEEN, chess.BLACK), ("Beyazın kaç fili var?", chess.BISHOP, chess.WHITE)]:
        n = len(b.pieces(tip, r)); Q.append({"fen": BASLA, "soru": yazi, "alt": "Sayı: ........", "cevap": str(n), "do": {"alanlar": [alan("Sayı", ["1", "2", "4", "8"], str(n))]}})
    Q.append({"fen": BASLA, "soru": "Tahtada toplam kaç taş var?", "alt": "Sayı: ........", "cevap": str(len(b.piece_map())), "do": {"alanlar": [alan("Sayı", ["16", "24", "32", "64"], str(len(b.piece_map())))]}})
    return {"ad": "Taşları say", "konu": "Taşlar", "yonerge": "Oyun başında iki tarafın da aynı taşları vardır. Tahtaya bak, say ve yaz.", "sorular": Q}


def s8():
    b = chess.Board(); Q = []
    for yazi, tip, r in [("Beyaz kaleler", chess.ROOK, chess.WHITE), ("Siyah atlar", chess.KNIGHT, chess.BLACK), ("Beyaz filler", chess.BISHOP, chess.WHITE), ("Siyah vezir", chess.QUEEN, chess.BLACK), ("Beyaz şah", chess.KING, chess.WHITE), ("Siyah kaleler", chess.ROOK, chess.BLACK)]:
        L = sorted(ad(x) for x in b.pieces(tip, r)); Q.append({"fen": BASLA, "soru": f"{yazi} hangi karede? Halka çiz, adını yaz.", "alt": "Kare: ................", "cevap": " ve ".join(L), "isaret": L, "do": {"kare": L}})
    return {"ad": "Taşlar nerede?", "konu": "Başlangıç dizilişi", "yonerge": "Köşelerde kaleler, yanlarında atlar, sonra filler durur. Ortada vezir ve şah vardır, piyonlar önde dizilir.", "sorular": Q}


def s9():
    Q = []
    for a, b_ in [("a1", "b1"), ("c1", "d1"), ("e1", "d1"), ("f8", "g8"), ("d8", "e8"), ("h8", "g8")]:
        t = chess.Board(); A, B = chess.parse_square(a), chess.parse_square(b_); pa, pb = t.piece_at(A), t.piece_at(B); t.set_piece_at(A, pb); t.set_piece_at(B, pa)
        fark = sorted(ad(x) for x in chess.SQUARES if t.piece_at(x) != chess.Board().piece_at(x)); assert len(fark) == 2
        Q.append({"fen": t.board_fen(), "soru": "İki taş yer değiştirmiş. Hangi kareler yanlış?", "alt": "Kareler: ........ ve ........", "cevap": f"{fark[0]} ve {fark[1]}", "isaret": fark, "do": {"kare": fark}})
    return {"ad": "Yanlış dizilişi bul", "konu": "Başlangıç dizilişi", "yonerge": "Vezir kendi rengini sever: beyaz vezir d1'de, siyah vezir d8'de durur. Şah onun yanındadır.", "sorular": Q}


def s10():
    Q = []
    for L in [["d1"], ["g8"], ["c1", "f1"], ["a8", "h1"], ["e8", "e1"], ["b1", "d8", "f8"]]:
        t = chess.Board(); ad_ = []
        for k in L:
            p = t.piece_at(chess.parse_square(k)); ad_.append(f"{k}: {'beyaz' if p.color else 'siyah'} {TAS[p.symbol().upper()].lower()}"); t.remove_piece_at(chess.parse_square(k))
        Q.append({"fen": t.board_fen(), "soru": f"{len(L)} taş eksik. Boş kareyi bul, eksik taşı yaz.", "alt": "Eksik: ................................", "cevap": ", ".join(ad_), "isaret": L, "do": {"kare": L}})
    return {"ad": "Dizilişi tamamla", "konu": "Başlangıç dizilişi", "yonerge": "Tahtayı dikkatle tara. Başlangıç dizilişinde olması gereken taşlardan bazıları yok.", "sorular": Q}


ETK = [f() for f in (s1, s2, s3, s4, s5, s6, s7, s8, s9, s10)]


# ---------- 50 dokunmatik soru: taş adı, taşı bul, yanlış dizilişi düzelt ----------
def yanlis(hatalar):
    """Başlangıç dizilişine ('a', 'b') yer değiştirme ya da ('a', 'b', 't') taşıma uygular."""
    t = chess.Board()
    for h in hatalar:
        A, B = chess.parse_square(h[0]), chess.parse_square(h[1]); pa, pb = t.piece_at(A), t.piece_at(B)
        assert pa is not None, h
        t.set_piece_at(B, pa)
        if pb is not None: t.set_piece_at(A, pb)
        else: t.remove_piece_at(A)
    assert t.board_fen() != BASLA
    return t.board_fen()


def duzelt(metin, hatalar):
    f = yanlis(hatalar); say = sum(chess.Board(f + " w - - 0 1").piece_at(x) != chess.Board().piece_at(x) for x in chess.SQUARES)
    return {"fen": f, "metin": metin, "cevap": "Taşlar başlangıç dizilişindeki yerlerine döndü.", "do": {"duzelt": BASLA}, "fark": say}


def elli_ad():
    Q = []; b = chess.Board()
    for k in ["a1", "b1", "c1", "d1", "e1", "h2", "g8", "f8", "d8", "e8"]:
        p = b.piece_at(chess.parse_square(k)); ad_ = TAS[p.symbol().upper()]; r = "Beyaz" if p.color else "Siyah"
        Q.append({"fen": BASLA, "vurgu": [k], "metin": f"{k} karesindeki taşın adı ne? Rengi ne?", "cevap": f"{r} {ad_.lower()}.", "do": {"alanlar": [alan("Taş", ["Şah", "Vezir", "Kale", "Fil", "At", "Piyon"], ad_), alan("Renk", ["Beyaz", "Siyah"], r)]}})
    return {"ad": "Taşların adı", "konu": "Taşlar", "yonerge": "Sarı karedeki taşa bak. Adını ve rengini seç.", "sorular": Q, "birlikte": []}


def elli_bul():
    b = chess.Board(); Q = []
    for yazi, tip, r in [("Beyaz şaha", chess.KING, True), ("Siyah şaha", chess.KING, False), ("Beyaz vezire", chess.QUEEN, True), ("Siyah vezire", chess.QUEEN, False), ("Beyaz fillere", chess.BISHOP, True), ("Siyah fillere", chess.BISHOP, False), ("Beyaz atlara", chess.KNIGHT, True), ("Siyah atlara", chess.KNIGHT, False), ("Beyaz kalelere", chess.ROOK, True), ("Siyah kalelere", chess.ROOK, False)]:
        L = sorted(ad(x) for x in b.pieces(tip, r)); Q.append({"fen": BASLA, "metin": f"{yazi} dokun.", "cevap": " ve ".join(L), "do": {"kare": L}})
    return {"ad": "Taşı bul", "konu": "Taşlar", "yonerge": "İstenen taşların hepsine dokun, sonra Doğru mu?'ya bas.", "sorular": Q, "birlikte": []}


NASIL = "Taşa dokun, sonra doğru kareye dokun."


def elli_sah():
    H = [("Beyaz şah ile vezirin yeri karışmış. Düzelt!", [("d1", "e1")]), ("Siyah şah ile vezirin yeri karışmış. Düzelt!", [("d8", "e8")]), ("İki tarafta da şah ile vezirin yeri karışmış. Düzelt!", [("d1", "e1"), ("d8", "e8")]),
         ("Beyaz vezir yerinde değil. Düzelt!", [("d1", "d3")]), ("Beyaz şah yerinde değil. Düzelt!", [("e1", "e3")]), ("Siyah vezir yerinde değil. Düzelt!", [("d8", "d6")]), ("Siyah şah yerinde değil. Düzelt!", [("e8", "e6")]),
         ("Beyaz şah da vezir de yerinde değil. Düzelt!", [("d1", "d3"), ("e1", "e3")]), ("Siyah şah da vezir de yerinde değil. Düzelt!", [("d8", "c6"), ("e8", "f6")]), ("Beyazda şah ile vezir karışmış, siyah vezir de yerinde değil. Düzelt!", [("d1", "e1"), ("d8", "d6")])]
    return {"ad": "Şah ve vezir yanlış yerde", "konu": "Düzeltme", "yonerge": NASIL + " Vezir kendi rengini sever: beyaz vezir d1, siyah vezir d8. Şah onun yanında durur.", "sorular": [duzelt(m, h) for m, h in H], "birlikte": []}


def elli_fil():
    H = [("Beyazın solunda at ile fil karışmış. Düzelt!", [("b1", "c1")]), ("Beyazın sağında at ile fil karışmış. Düzelt!", [("f1", "g1")]), ("Siyahta b8 ve c8 karışmış. Düzelt!", [("b8", "c8")]), ("Siyahta f8 ve g8 karışmış. Düzelt!", [("f8", "g8")]),
         ("Beyazda iki yanda da at ile fil karışmış. Düzelt!", [("b1", "c1"), ("f1", "g1")]), ("Siyahta iki yanda da at ile fil karışmış. Düzelt!", [("b8", "c8"), ("f8", "g8")]), ("Dört yerde at ile fil karışmış. Düzelt!", [("b1", "c1"), ("f1", "g1"), ("b8", "c8"), ("f8", "g8")]),
         ("Bir beyaz fil yerinde değil. Düzelt!", [("c1", "e3")]), ("Bir beyaz at yerinde değil. Düzelt!", [("b1", "c3")]), ("Bir siyah fil ve bir siyah at yerinde değil. Düzelt!", [("f8", "c5"), ("g8", "f6")])]
    return {"ad": "Fil ve at yanlış yerde", "konu": "Düzeltme", "yonerge": NASIL + " Köşeden ortaya doğru sıra: kale, at, fil.", "sorular": [duzelt(m, h) for m, h in H], "birlikte": []}


def elli_karma():
    H = [("Beyazda kale ile at karışmış. Düzelt!", [("a1", "b1")]), ("Siyahta at ile kale karışmış. Düzelt!", [("g8", "h8")]), ("Beyazda kale ile fil karışmış. Düzelt!", [("h1", "f1")]), ("Beyazda fil ile vezir karışmış. Düzelt!", [("c1", "d1")]), ("Siyahta şah ile fil karışmış. Düzelt!", [("e8", "f8")]),
         ("Bir beyaz piyon önde duruyor. Düzelt!", [("e2", "e4")]), ("İki siyah piyon önde duruyor. Düzelt!", [("d7", "d5"), ("e7", "e5")]), ("Üç yerde hata var: şah-vezir ve at-fil. Düzelt!", [("d1", "e1"), ("b1", "c1"), ("f8", "g8")]),
         ("Beyazda sıra tamamen karışmış: kale, at, fil. Düzelt!", [("a1", "c1"), ("b1", "c1")]), ("Tahtayı tara: kaç hata varsa düzelt!", [("d8", "e8"), ("b1", "c1"), ("a2", "a3"), ("h1", "g1")])]
    return {"ad": "Karışık düzeltme", "konu": "Düzeltme", "yonerge": NASIL + " Tahtayı başlangıç dizilişine getir.", "sorular": [duzelt(m, h) for m, h in H], "birlikte": []}


ELLI = [elli_ad(), elli_bul(), elli_sah(), elli_fil(), elli_karma()]
assert sum(len(e["sorular"]) for e in ELLI) == 50
assert all(q["do"]["duzelt"] == BASLA for e in ELLI[2:] for q in e["sorular"])
for e in ETK:
    assert len(e["sorular"]) == 6
    e["birlikte"] = []
    assert all("do" in q for q in e["sorular"]), e["ad"]
    print(e["ad"], "|", " | ".join(q["cevap"][:22] for q in e["sorular"]))

for i, w in enumerate(H, 1):
    for q in w: chess.Board(tam(q["fen"]))
    print(i, " | ".join(q["cevap"][:26] for q in TAHTA[i - 1][:4]))
pathlib.Path(__file__).resolve().parent.parent.joinpath("js", "kulup-satranc.js").write_text(
    "// Otomatik üretildi: araclar/satranc_sorulari.py (cevaplar python-chess ile hesaplandı). Elle düzenlemeyin.\nwindow.KULUP_SATRANC = " + json.dumps(H, ensure_ascii=False) + ";\nwindow.KULUP_SATRANC_TAHTA = " + json.dumps(TAHTA, ensure_ascii=False) + ";\nwindow.KULUP_SATRANC_ETK = " + json.dumps(ETK, ensure_ascii=False) + ";\nwindow.KULUP_SATRANC_50 = " + json.dumps(ELLI, ensure_ascii=False) + ";\n", encoding="utf-8")
