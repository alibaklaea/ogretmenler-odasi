# Pardus (Debian) için internetsiz .deb paketi üretir: python araclar/pardus_deb.py <paket klasörü> <çıktı.deb>
import gzip, io, os, sys, tarfile, time

KAYNAK, CIKTI = sys.argv[1], sys.argv[2]
AD, SURUM, HEDEF = "akil-oyunlari-tahtasi", "1.0.2", "opt/akil-oyunlari-tahtasi"
ZAMAN = int(time.time())

BASLAT = """#!/bin/sh
# Bulduğu ilk tarayıcıda tam ekran açar
S="file:///opt/akil-oyunlari-tahtasi/index.html#dokun"
for T in google-chrome google-chrome-stable chromium chromium-browser; do
  if command -v "$T" >/dev/null 2>&1; then exec "$T" --start-fullscreen --allow-file-access-from-files --user-data-dir="$HOME/.config/akil-oyunlari-tahtasi" "$S"; fi
done
if command -v firefox-esr >/dev/null 2>&1; then exec firefox-esr --kiosk "$S"; fi
if command -v firefox >/dev/null 2>&1; then exec firefox --kiosk "$S"; fi
exec xdg-open "$S"
"""
MASAUSTU = """[Desktop Entry]
Type=Application
Name=Akıl Oyunları Tahtası
Comment=İnternetsiz dokunarak etkinlikler
Exec=/usr/bin/akil-oyunlari-tahtasi
Icon=/opt/akil-oyunlari-tahtasi/img/ikon-512.png
Terminal=false
Categories=Education;
"""
KONTROL = f"""Package: {AD}
Version: {SURUM}
Architecture: all
Maintainer: Ali Bakla <alibaklaea@gmail.com>
Section: education
Priority: optional
Depends: xdg-utils
Description: Akil Oyunlari Tahtasi
 Internetsiz, dokunarak Pentago, Kure ve Satranc etkinlikleri.
"""


def ekle(t, ad, veri, kip=0o644):
    b = tarfile.TarInfo("./" + ad); b.size = len(veri); b.mode = kip; b.mtime = ZAMAN; b.uid = b.gid = 0; b.uname = b.gname = "root"
    t.addfile(b, io.BytesIO(veri))


def klasor(t, ad):
    b = tarfile.TarInfo("./" + ad); b.type = tarfile.DIRTYPE; b.mode = 0o755; b.mtime = ZAMAN; b.uid = b.gid = 0; b.uname = b.gname = "root"
    t.addfile(b)


veri = io.BytesIO()
with tarfile.open(fileobj=veri, mode="w:gz", format=tarfile.GNU_FORMAT) as t:
    goruldu = set()
    def yol(p):
        parca = p.split("/")
        for i in range(1, len(parca) + 1):
            k = "/".join(parca[:i])
            if k not in goruldu: goruldu.add(k); klasor(t, k)
    yol(HEDEF); yol("usr/bin"); yol("usr/share/applications")
    for kok, _, dosyalar in os.walk(KAYNAK):
        g = os.path.relpath(kok, KAYNAK).replace("\\", "/")
        h = HEDEF if g == "." else f"{HEDEF}/{g}"
        yol(h)
        for d in dosyalar:
            if d.endswith(".bat"): continue
            ekle(t, f"{h}/{d}", open(os.path.join(kok, d), "rb").read())
    ekle(t, f"usr/bin/{AD}", BASLAT.encode(), 0o755)
    ekle(t, f"usr/share/applications/{AD}.desktop", MASAUSTU.encode())

kontrol = io.BytesIO()
with tarfile.open(fileobj=kontrol, mode="w:gz", format=tarfile.GNU_FORMAT) as t:
    ekle(t, "control", KONTROL.encode())


def uye(ad, v):
    b = f"{ad:<16}{ZAMAN:<12}{0:<6}{0:<6}{'100644':<8}{len(v):<10}`\n".encode()
    return b + v + (b"\n" if len(v) % 2 else b"")


with open(CIKTI, "wb") as f:
    f.write(b"!<arch>\n" + uye("debian-binary", b"2.0\n") + uye("control.tar.gz", kontrol.getvalue()) + uye("data.tar.gz", veri.getvalue()))
print("hazır", CIKTI, os.path.getsize(CIKTI))
