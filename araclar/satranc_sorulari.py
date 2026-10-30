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

for i, w in enumerate(H, 1):
    for q in w: chess.Board(tam(q["fen"]))
    print(i, " | ".join(q["cevap"][:30] for q in w))
pathlib.Path(__file__).resolve().parent.parent.joinpath("js", "kulup-satranc.js").write_text(
    "// Otomatik üretildi: araclar/satranc_sorulari.py (cevaplar python-chess ile hesaplandı). Elle düzenlemeyin.\nwindow.KULUP_SATRANC = " + json.dumps(H, ensure_ascii=False) + ";\n", encoding="utf-8")
