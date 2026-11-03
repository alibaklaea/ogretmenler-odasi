// Ders öncesi hazırlık: planda geçen ama öğretmenin elinde hazır olmayan her şey.
// Anahtar: "<plan>-<hafta>" (ör. "D1-8"). Alanlar:
//   liste: ders öncesi ihtiyaç ve yapılacaklar (malzeme listesine otomatik eklenir)
//   icerik: öğretmen evrakı. tur: "metin" {p:[]}, "tablo" {cols, rows, not}, "grafik" {etiket, deger, birim, not},
//           "kartlar" {items} (kes-kullan), "balik" (balık kılçığı şablonu)
//   video: YouTube videoları {id, ad, kanal, neden}. Okul ağında youtube.com kapalı olduğu için site içine
//          youtube-nocookie ile gömülür. Hepsi 3 Kasım 2026'da oEmbed ile doğrulandı (var ve gömülebilir).
window.HAZIRLIK = {
  // ================= DESTEK 1 =================
  "D1-8": {
    liste: [
      "Kapalı bir karton kutu (ayakkabı kutusu) ve içine ses ile ağırlık veren gizemli bir nesne koy: çam kozalağı, küçük zil, anahtarlık ya da ceviz. Kutuyu bantla kapat.",
      "İkinci bir kutu hazırla, üstüne “MERAK KUTUSU” yaz ve kapağına kart atılacak bir yarık aç. Yıl boyu sınıfta kalacak.",
      "Ek 1 (Dedektif Formu) ve Ek 2 (Merak Kartları) fotokopileri: öğrenci sayısı kadar. Ek 2 kesileceği için makas.",
      "İsteğe bağlı: mutfak tartısı (“Tartıyorum” satırı için).",
      "“Meraktan buluşa” öykülerini yazdır ya da tahtaya yansıt (aşağıda hazır).",
      "Videoları derse girmeden bir kez aç, ses düzeyini kontrol et."
    ],
    icerik: [
      { baslik: "Meraktan buluşa: Newton'un elması", tur: "metin", p: [
        "1666 yılında İngiltere'de veba salgını yüzünden Cambridge Üniversitesi kapandı. Genç Isaac Newton köyüne, Woolsthorpe'a döndü.",
        "Bir gün bahçede otururken ağaçtan bir elma düştü. Herkesin her gün gördüğü bu olay Newton'un aklına bir soru getirdi: “Elma neden hep dümdüz aşağı düşüyor da yana ya da yukarı gitmiyor?”",
        "Newton bir adım daha ileri gitti: “Elmayı aşağı çeken kuvvet Ay'a kadar uzanıyor olabilir mi?” Yıllarca bu soru üzerinde çalıştı ve 1687'de evrensel çekim yasasını yayımladı.",
        "Doğru bilgi: Elma Newton'un kafasına düşmedi. Newton bu anıyı yaşlılığında arkadaşı William Stukeley'e anlatmıştır.",
        "Merakın yeri: Herkesin sıradan bulduğu bir olaya “neden?” diye sormak."
      ] },
      { baslik: "Meraktan buluşa: Fleming'in küfü", tur: "metin", p: [
        "1928 yılında Londra'da çalışan bilim insanı Alexander Fleming, tatile çıkmadan önce bakteri üretilen cam kapları tezgâhta bıraktı.",
        "Döndüğünde kaplardan birinde küf üremişti. Asıl şaşırtıcı olan, küfün çevresindeki bakterilerin ölmüş olmasıydı.",
        "Fleming kabı kirli diye atmak yerine sordu: “Bu küf bakterileri neden öldürüyor?” Küfün ürettiği maddeye penisilin adını verdi.",
        "Sonraki yıllarda Howard Florey ve Ernst Chain penisilini ilaca dönüştürdü. Üçü 1945'te Nobel Ödülü'nü paylaştı. Penisilin milyonlarca insanın hayatını kurtardı.",
        "Merakın yeri: Beklenmedik bir sonucu “hata” deyip atmamak."
      ] },
      { baslik: "Meraktan buluşa: Cahit Arf'ın soruları", tur: "metin", p: [
        "Cahit Arf 1910'da Selanik'te doğdu. Öğrenciliğinde matematiğe tutkuyla bağlandı. Formülleri ezberlemek yerine her birinin nereden geldiğini, neden doğru olduğunu anlamaya çalışırdı.",
        "Paris'te, normalde üç yıl süren École Normale Supérieure eğitimini iki yılda bitirdi. Ardından Almanya'da, Göttingen Üniversitesi'nde doktora yaptı.",
        "Bulduğu bir matematik kavramı bugün dünyada “Arf değişmezi” adıyla anılır. 2009'da basılan 10 Türk lirasının arka yüzünde Cahit Arf'ın portresi ve Arf değişmezinin formülü vardır.",
        "Merakın yeri: Anlamadığı şeyi ezberleyip geçmek yerine “Bu neden böyle?” diye sormak.",
        "Derste: Bir 10 TL banknotu getirip arka yüzünü öğrencilere göster."
      ] },
      { baslik: "Gizemli nesne önerileri", tur: "tablo", cols: ["Nesne", "Ses", "Ağırlık", "Neden iyi seçim?"],
        rows: [["Çam kozalağı", "Hışırtı, yuvarlanır", "Hafif", "Şekli tahmin edilebilir ama zor"], ["Küçük zil", "Çınlar", "Hafif", "Ses ipucu çok güçlü"], ["Anahtarlık", "Şıngırdar", "Orta", "Metal sesi tanıdık"], ["Ceviz (3-4 tane)", "Tıkırdar", "Orta", "Birden fazla parça olduğunu fark ettirir"], ["Silgi", "Sessiz, kayar", "Çok hafif", "Az ipucu verir, zor tur için"]],
        not: "Kırılabilen, keskin ya da yiyecek alerjisi yapabilecek nesne koyma." }
    ],
    video: [
      { id: "zhPfTltTmQ0", ad: "Yer çekimi: Isaac Newton'un keşfi", kanal: "Elif Çevik Anaokulu", neden: "Newton öyküsü, çocuk diliyle" },
      { id: "1Mm8y5bzl2Q", ad: "Penisilin nasıl bulundu?", kanal: "TRT Arşiv", neden: "Fleming öyküsü" },
      { id: "uJEY0Rr5nCc", ad: "Hayat hikâyesi: Cahit Arf", kanal: "Konya Bilim Merkezi", neden: "Cahit Arf öyküsü" }
    ]
  },
  "D1-9": {
    liste: [
      "Ek 1 (Soru Tamircisi) fotokopisi: öğrenci sayısı kadar.",
      "“Soru makinesi” için masalara konacak nesneler: oyuncak araba, saksıda bitki, buz kalıbı ya da bir bardak su.",
      "Kararını Ver (MEB) etkinliği için ön ve arka ambar malzeme listeleri MEB PDF'inde: her gruba bir takım çıktı.",
      "Post-it ve kalem; 10 dakikalık sayaç (tahtadaki sayaç kullanılabilir)."
    ],
    icerik: [
      { baslik: "Tahtaya yazılacak soru çiftleri", tur: "tablo", cols: ["Araştırılamaz (bulanık)", "Araştırılabilir (test edilebilir)"],
        rows: [["Bitkiler müzik sever mi?", "Müzik dinletilen bitki, dinletilmeyenden daha hızlı uzar mı?"], ["Hangi top en iyisi?", "Hangi top aynı yükseklikten bırakılınca en yükseğe zıplar?"], ["Su güzel mi?", "Musluk suyu mu, şişe suyu mu daha çabuk donar?"], ["Kediler mutlu mu?", "Kedi oyun oynadığı günlerde daha mı az uyuyor?"]],
        not: "Öğrencilere sor: Hangi sütundaki soruyu ölçebiliriz? Ölçmek için ne kullanırız?" }
    ],
    video: [
      { id: "5hA1AuAgAOc", ad: "6 dakikada bilimsel yöntem", kanal: "Tonguç Akademi", neden: "Soru → hipotez → deney akışı" }
    ]
  },
  "D1-10": {
    liste: [
      "Tedavülden kalkmış kâğıt paralar ya da renkli çıktıları. Görseller TCMB Banknot Müzesi sayfasında: tcmb.gov.tr → Banknotlar → Tedavülden kalkan banknotlar.",
      "Ek 1 (yabancı ülke paraları) ve Ek 2 (problem kartları) MEB PDF'inde: Ek 1 her gruba, Ek 2'den her gruba bir problem.",
      "Varsa evdeki eski madenî paralar ya da yurt dışından kalan paralar.",
      "Takas oyunu için küçük nesneler: kalem, silgi, ataş, çıkartma."
    ],
    icerik: [
      { baslik: "Paranın kısa tarihi (öğretmen notu)", tur: "metin", p: [
        "Takas: İnsanlar önce mal karşılığı mal değiştirdi. Sorun: Elinde buğday olan kişinin ayakkabıya ihtiyacı olmayabilir, et ve süt gibi ürünler bozulur, büyük malları taşımak zordur.",
        "Mal para: Tuz, deniz kabuğu, hayvan ve tahıl gibi değerli kabul edilen mallar para yerine kullanıldı. İngilizcedeki “salary” (maaş) sözcüğü Latincede tuzla ilgili bir kökten gelir.",
        "Madenî para: Bilinen ilk madenî paralar MÖ 7. yüzyılda Anadolu'da, Lidya'da basıldı. Bu bilgi derste Türkiye bağlantısı olarak vurgulanabilir.",
        "Kâğıt para: İlk kez Çin'de kullanıldı. Osmanlı'da ilk kâğıt para (kaime) 1840'ta basıldı.",
        "Bugün: Banka kartı, mobil ödeme ve dijital para. Tartışma sorusu: “Para tamamen dijital olursa neler değişir?”"
      ] }
    ],
    video: [
      { id: "L1x5NaYwfDw", ad: "Paranın tarihi", kanal: "Türkiye Cumhuriyet Merkez Bankası", neden: "Resmî kaynak; takastan bugüne" }
    ]
  },
  "D1-11": {
    liste: [
      "Giriş fotoğrafı: Gece uydu görüntüsü. NASA Earth Observatory'nin “Night Lights” sayfasında Türkiye ve Avrupa'nın gece görüntüleri var; derse girmeden indir ya da tahtada aç.",
      "Gazete haberi metni MEB materyalinde: tahtaya yansıt.",
      "Balık kılçığı şablonu: her gruba bir A3 (aşağıda yazdırılabilir şablon var).",
      "Post-it, renkli kalem."
    ],
    icerik: [
      { baslik: "Balık kılçığı şablonu (A4/A3 yazdır)", tur: "balik", bas: "Işık kirliliği", kollar: ["İnsan sağlığı", "Hayvanlar", "Bitkiler", "Gökyüzü gözlemi", "Enerji", "Ekonomi"] },
      { baslik: "Işık kirliliğinin türleri (öğretmen notu)", tur: "tablo", cols: ["Tür", "Ne demek?", "Örnek"],
        rows: [["Gök parlaması", "Şehir ışıklarının gökyüzünü aydınlatması", "Şehirde yıldızların görünmemesi"], ["Kamaşma", "Göz alan aşırı parlak ışık", "Karşıdan gelen arabanın uzun farı"], ["Işık taşması", "Işığın istenmeyen yere düşmesi", "Sokak lambasının yatak odasına vurması"], ["Işık karmaşası", "Bir arada çok sayıda parlak ışık", "Reklam panoları ve vitrinler"]] }
    ],
    video: [
      { id: "K5EBrAuEyDk", ad: "Işık kirliliği (4. sınıf fen)", kanal: "Tonguç 4. Sınıf", neden: "Kısa konu anlatımı" },
      { id: "N5suztA0oDM", ad: "Işık kirliliğinin olumsuz etkileri", kanal: "Başkent Akademik Eğitim Kanalı", neden: "Canlılara etkileri (balık kılçığı için)" }
    ]
  },
  "D1-12": {
    liste: [
      "Ek 1 ve Ek 2 MEB PDF'inde (Minik Fil Dodo): öğrenci sayısı kadar.",
      "Doğal çevre ve yapay çevre fotoğrafları: orman, göl, park, baraj, şehir, hayvanat bahçesi (tahtaya yansıtmak için).",
      "Çizim için renkli kalemler."
    ],
    icerik: [
      { baslik: "Sınıflama için örnek listesi", tur: "tablo", cols: ["Doğal çevre", "Yapay çevre", "Tartışmalı (neden?)"],
        rows: [["Orman", "Şehir parkı", "Hayvanat bahçesi: hayvanlar doğal, ortam yapay"], ["Göl", "Baraj gölü", "Botanik bahçesi"], ["Mağara", "Metro tüneli", "Ağaçlandırılmış tepe"], ["Dağ", "Futbol sahası", "Akvaryum"]],
        not: "Üçüncü sütun tartışmayı derinleştirir: “İnsan eli değdiği an yapay mı olur?”" }
    ],
    video: [
      { id: "83ldsf5hIGw", ad: "Doğal ve yapay çevre", kanal: "Tonguç 3. Sınıf", neden: "Kavramların hatırlatılması" }
    ]
  },
  "D1-13": {
    liste: [
      "Ek 1 (Çözüm Terazisi) ve merak merdiveni kâğıdı: öğrenci sayısı kadar.",
      "8. haftadaki Merak Kutusu: içindeki sorularla birlikte sınıfa getir.",
      "Üç çözüm kartı (aşağıda hazır): kes ve tahtaya as."
    ],
    icerik: [
      { baslik: "“Koridor çok kalabalık” çözüm kartları", tur: "kartlar", items: ["ÇÖZÜM A\nTeneffüsü kaldıralım.", "ÇÖZÜM B\nSınıflar sırayla teneffüse çıksın.", "ÇÖZÜM C\nKoridoru renkli boyayalım."] }
    ],
    video: [
      { id: "5hA1AuAgAOc", ad: "6 dakikada bilimsel yöntem", kanal: "Tonguç Akademi", neden: "Meraktan araştırma sorusuna geçiş" }
    ]
  },
  "D1-14": {
    liste: [
      "“Kayıp Kalem Vakası” öyküsü ve ipucu kartları (aşağıda hazır): kartları kes, her masaya bir set.",
      "Ek 1 (vaka dosyası) fotokopisi: öğrenci sayısı kadar.",
      "Bilgi toplama için 2-3 kitap ya da ansiklopedi ve önceden açılmış güvenli bir site.",
      "Görüşme için okuldan bir yetişkinle (bahçıvan, müdür yardımcısı) önceden konuş, saat ayarla.",
      "Dedektif panosu için kraft kâğıdı, iple bağlamak için yün ip ya da renkli bant."
    ],
    icerik: [
      { baslik: "Kayıp Kalem Vakası (okunacak öykü)", tur: "metin", p: [
        "Pazartesi sabahı Deniz'in yeni mavi kalemi kayboldu. Kalem son kez ilk derste, Deniz'in sırasında görülmüştü.",
        "Masalara dağıtılan ipucu kartlarını okuyun. Önce not almadan hatırlamaya çalışın, sonra not alarak tekrar deneyin.",
        "Sonunda sorun: Hangi ipucu bir kanıt, hangisi yalnızca bir tahmin?"
      ] },
      { baslik: "İpucu kartları", tur: "kartlar", items: ["İPUCU 1\nKalem ilk derste Deniz'in sırasındaydı.", "İPUCU 2\nTeneffüste sınıfta kimse kalmadı.", "İPUCU 3\nDeniz ikinci derste sırasını pencere kenarına taşıdı.", "İPUCU 4\nTemizlik görevlisi teneffüste sınıfı süpürdü.", "İPUCU 5\nPencere kenarındaki dolabın altında mavi bir kapak bulundu.", "İPUCU 6\nEce de mavi kalem kullanıyor, ama onunki eski."] },
      { baslik: "Çözüm (öğretmene)", tur: "metin", p: [
        "Kalem büyük olasılıkla sıra taşınırken yere düştü ve dolabın altına yuvarlandı (İpucu 3 ve 5 birbirini destekliyor).",
        "İpucu 6 bir tuzaktır: Ece'nin de mavi kalemi olması onun aldığını kanıtlamaz. Bu, “kanıt ile tahmin” farkını konuşmak için kullanılır."
      ] }
    ],
    video: [
      { id: "5hA1AuAgAOc", ad: "6 dakikada bilimsel yöntem", kanal: "Tonguç Akademi", neden: "Araştırma basamakları" }
    ]
  },
  "D1-15": {
    liste: [
      "Giriş için ıslak yol fotoğrafı (yağmurdan sonra bir sokak). Kendi telefonundan çekebilirsin.",
      "Buz deneyi: aynı büyüklükte buz küpleri (her grup için 4), 4 tabak ya da kapak; pencere önü, gölge, kâğıt ve metal yüzey (alüminyum folyo ya da metal kutu kapağı).",
      "Saat ya da sayaç (her 5 dakikada bir gözlem).",
      "Ek 1 ve Ek 2 fotokopisi; peçete."
    ],
    icerik: [
      { baslik: "Islak yol fotoğrafı için örnek cevaplar", tur: "tablo", cols: ["Gözlem (görüyorum)", "Çıkarım (düşünüyorum)"],
        rows: [["Yol ıslak ve parlıyor.", "Yağmur yağmış olabilir."], ["Gökyüzü gri.", "Yine yağabilir."], ["Kaldırımda su birikintisi var.", "Burası çukur olabilir."], ["Bir araba ıslak yerden geçiyor.", "Belki belediye yolu yıkamıştır."]],
        not: "Son satır, aynı gözlemden farklı çıkarımlar yapılabileceğini gösterir." },
      { baslik: "Buz deneyi gözlem çizelgesi", tur: "tablo", cols: ["Yer", "Tahminim (sıra)", "5. dk", "10. dk", "15. dk", "20. dk"],
        rows: [["Pencere önü"], ["Gölge"], ["Kâğıt üstü"], ["Metal üstü"]],
        not: "Metal ısıyı iyi ilettiği için buz genelde metal üstünde daha çabuk erir; öğrenciler çoğunlukla güneşli yeri tahmin eder. Bu şaşırtıcı sonuç tartışma için kullanılır." }
    ],
    video: []
  },
  "D1-16": {
    liste: [
      "Son beş günün devam sayılarını yoklama defterinden çıkar ve tahtaya yaz.",
      "Çetele için tahta kalemi; Ek 1 (sütun grafiği) fotokopisi.",
      "Komşu sınıftan veri iste. Alamazsan aşağıdaki hazır veriyi kullan."
    ],
    icerik: [
      { baslik: "Hazır veri: komşu sınıfın en sevdiği meyve", tur: "grafik", etiket: ["Elma", "Muz", "Çilek", "Portakal", "Karpuz"], deger: [6, 4, 8, 3, 5], birim: "öğrenci",
        not: "26 öğrenci. Öğrencilere önce kendi sınıflarının sonucunu tahmin ettir, sonra bu grafikle karşılaştır." }
    ],
    video: [
      { id: "010ZzMDtt2E", ad: "Sütun grafiği / Veri toplama ve değerlendirme", kanal: "İlkokul Öğretmenim", neden: "Çetele ve sütun grafiği hatırlatma" }
    ]
  },
  "D1-17": {
    liste: [
      "Ek 1 rol kartları: her grup için bir takım (Başkan, Kayıtçı, Zaman Bekçisi, Malzemeci, Sunucu); kes.",
      "Ek 2 ekip değerlendirme formu: öğrenci sayısı kadar.",
      "Sayaç (1 dakikalık “k harfiyle hayvanlar” görevi).",
      "Mini araştırma için atık sayım kâğıdı ve eldiven (okuldaki çöp kutularını incelemek için)."
    ],
    icerik: [],
    video: [
      { id: "Xm7j4UTFAh8", ad: "Takım çalışması", kanal: "Animanya TV", neden: "Kısa çocuk filmi, girişte izlenir" }
    ]
  },
  "D1-18": {
    liste: [
      "Ece senaryosunu tahtaya yansıt (etkinlik metninde var).",
      "Ek 1 durum kartları: kes, her gruba bir set.",
      "İki “ekran görüntüsü” (aşağıda hazır): güvenilir müze sayfası ile uydurma paylaşım.",
      "Araştırmacı yemini için büyük kâğıt."
    ],
    icerik: [
      { baslik: "Karşılaştırılacak iki kaynak", tur: "tablo", cols: ["Kaynak A: Bilim müzesi sayfası", "Kaynak B: Sosyal medya paylaşımı"],
        rows: [["Başlık: Ahtapotlar nerede yaşar?", "Başlık: AHTAPOTLAR AĞAÇTA YAŞAR!!! 🐙🌳"], ["Yazar: Müze deniz biyoloğu, ad ve unvan belli", "Yazar: @gercekbilgi2026, kim olduğu belli değil"], ["Tarih: 2025, güncellenmiş", "Tarih: yok"], ["Kanıt: 3 bilimsel kaynak listelenmiş", "Kanıt: “Herkes biliyor, paylaş!”"], ["Başka kaynaklar da aynısını söylüyor", "Başka hiçbir güvenilir kaynak doğrulamıyor"]],
        not: "Bilgi: İnternette yıllardır dolaşan “ağaç ahtapotu” sitesi, öğrencilere kaynak sorgulamayı öğretmek için uydurulmuş ünlü bir şakadır. Ahtapotlar denizde yaşar." }
    ],
    video: [
      { id: "V9NEgB_jJQI", ad: "Bilgileri neden teyit etmeliyiz?", kanal: "Yetkin Gençler", neden: "Güvenilir kaynak bölümü" }
    ]
  },

  // ================= DESTEK 3 =================
  "D3-8": {
    liste: [
      "Girişteki “kısa tablo ve grafik” aşağıda hazır: tahtaya yansıt ya da yazdır.",
      "Ek 1 (araştırma formu) fotokopisi: öğrenci sayısı kadar.",
      "Okul içi ölçüm için gözlem çizelgesi, kronometre ya da telefon sayacı; post-it."
    ],
    icerik: [
      { baslik: "Örnek veri: okul kantininde bir hafta", tur: "tablo", cols: ["Ürün", "Pzt", "Sal", "Çar", "Per", "Cum", "Toplam"],
        rows: [["Su", "34", "30", "28", "36", "42", "170"], ["Ayran", "12", "15", "10", "14", "19", "70"], ["Simit", "25", "22", "27", "20", "26", "120"], ["Tost", "18", "20", "16", "22", "24", "100"], ["Günlük toplam", "89", "87", "81", "92", "111", "460"]] },
      { baslik: "Haftalık satış grafiği", tur: "grafik", etiket: ["Su", "Ayran", "Simit", "Tost"], deger: [170, 70, 120, 100], birim: "adet" },
      { baslik: "Veri ne söylüyor, ne söylemiyor? (öğrenciler ayırır)", tur: "tablo", cols: ["Cümle", "Cevap (öğretmene)"],
        rows: [["1. Haftada en çok su satıldı.", "Veriden çıkar (170 adet)."], ["2. Cuma günü satış diğer günlerden fazla.", "Veriden çıkar (111)."], ["3. Öğrenciler en çok suyu seviyor.", "Çıkmaz: satın almak sevmek demek değil; fiyat ve hava etkili olabilir."], ["4. Ayran sağlıklı olduğu için az satıldı.", "Çıkmaz: nedenle ilgili veri yok."], ["5. Gelecek hafta da en çok su satılacak.", "Tahmin: veriye dayanır ama kesin değil."], ["6. En çok alışverişi öğretmenler yaptı.", "Çıkmaz: kimin aldığı kaydedilmemiş."]] }
    ],
    video: [
      { id: "DRjsxsq0Aik", ad: "Korelasyon = neden-sonuç değildir!", kanal: "Anadolu Üniversitesi Açıköğretim", neden: "Kısa: birlikte değişmek neden olmak değildir" }
    ]
  },
  "D3-9": {
    liste: [
      "Giriş oylaması için “uygun / uygun değil / emin değilim” kartları: her öğrenciye üç renk kart (yeşil, kırmızı, sarı).",
      "Etik ikilem kartları ve örnek araştırma önerisi (aşağıda hazır): kes, her gruba bir set.",
      "Ek 1 fotokopisi; etik onay formu için A4."
    ],
    icerik: [
      { baslik: "Oylama durumları", tur: "kartlar", items: ["Arkadaşının fotoğrafını izin almadan posterine koymak", "Deneyde çıkmayan bir sonucu tabloya yazmak", "İnternetten bir paragrafı kaynak göstermeden kopyalamak", "Anketi doldurmak istemeyen birine ısrar etmek", "Bir kaynaktan alıntı yapıp adını yazmak", "Beklenmedik sonucu da raporda göstermek"] },
      { baslik: "Etik ikilem kartları", tur: "kartlar", items: ["GİZLİLİK\nAnkette sınıf arkadaşlarınızın adlarını ve notlarını sordunuz. Sonuçları panoya asacaksınız.", "GÖNÜLLÜLÜK\nÖğretmeniniz ankete katılanlara artı puan vereceğini söyledi.", "DOĞRULUK\nDeneyde iki ölçüm diğerlerinden çok farklı çıktı. Grup bunları silmek istiyor.", "KAYNAK GÖSTERME\nGrafiği bir siteden aldınız ama site adını hatırlamıyorsunuz.", "ADALET\nAnketi sadece arkadaşlarınıza dağıttınız ve “okulun görüşü” diye sunacaksınız."] },
      { baslik: "Etik kurula gelen örnek araştırma önerisi", tur: "metin", p: [
        "Araştırma sorusu: “Okulumuzdaki öğrenciler günde kaç saat telefon kullanıyor?”",
        "Yöntem: Teneffüste koridordaki öğrencilerin telefonlarına bakıp ekran süresi ayarlarının fotoğrafını çekeceğiz. Fotoğrafları isimleriyle birlikte sunumda göstereceğiz.",
        "Kurulun bulması gereken sorunlar: izin yok (gönüllülük), kişisel veri ve isim (gizlilik), fotoğraf çekmek (izin), yalnızca koridordakiler (örneklem adaleti).",
        "Düzeltme örneği: İsimsiz anket, katılım isteğe bağlı, veli/öğretmen izni, sonuçlar yalnızca toplu sayı olarak."
      ] }
    ],
    video: [
      { id: "NrIDBXhi2T0", ad: "İntihal mi yapıyorum?", kanal: "Dr. Azra Yıldız", neden: "Kaynak göstermenin önemi (öğretmen önce izlesin)" }
    ]
  },
  "D3-10": {
    liste: [
      "Aynı konuda üç farklı kaynak örneği (aşağıda hazır): yazdır ya da yansıt.",
      "Ek 1 rubrik fotokopisi.",
      "Doğrulama için iki güvenilir site önceden açık olsun: teyit.org ve bir ansiklopedi ya da üniversite sayfası."
    ],
    icerik: [
      { baslik: "Üç kaynak: “Günde 8 bardak su içmek şart mı?”", tur: "tablo", cols: ["Ölçüt", "Kaynak 1: Sağlık bakanlığı sayfası", "Kaynak 2: Kişisel blog", "Kaynak 3: Mesajlaşma grubundan ileti"],
        rows: [["Yazar/kurum", "Resmî kurum", "Ad var, uzmanlık yok", "Belli değil"], ["Tarih", "Var, yakın tarihli", "4 yıl önce", "Yok"], ["Kanıt", "Araştırmalara bağlantı", "Kişisel deneyim", "“Doktor arkadaşım söyledi”"], ["Amaç", "Bilgilendirmek", "Ürün satmak (su şişesi reklamı)", "Paylaşılmak"], ["Doğrulanabilir mi?", "Evet", "Kısmen", "Hayır"]],
        not: "Örnekler derste kullanılmak üzere hazırlanmıştır; gerçek kişi ya da kurum alıntısı değildir." }
    ],
    video: [
      { id: "V9NEgB_jJQI", ad: "Bilgileri neden teyit etmeliyiz?", kanal: "Yetkin Gençler", neden: "Teyit ve medyaya güven" },
      { id: "LHnIsIy0poI", ad: "Yanlış bilgi neden ve nasıl yayılır?", kanal: "Yetkin Gençler", neden: "“Çok paylaşılan doğru mudur?” sorusu" }
    ]
  },
  "D3-11": {
    liste: [
      "Her grup için 10 yaprak A4 kâğıt (aynı gramaj), seloteyp, makas, cetvel.",
      "Köprü ayakları için iki eş yükseklikte kitap yığını; aralık 20 cm.",
      "Yük için küçük bir plastik bardak ve madenî paralar (ya da aynı boyda pul/somun); mutfak tartısı varsa getir.",
      "Ek 1 deney planı ve veri tablosu fotokopisi; grafik kâğıdı."
    ],
    icerik: [
      { baslik: "Standart test prosedürü (tahtaya yaz)", tur: "metin", p: [
        "1. Köprü yalnızca 1 yaprak A4 ve en fazla 20 cm bantla yapılır.",
        "2. Kitap yığınlarının arası 20 cm olur, köprü her iki uca 2 cm biner.",
        "3. Bardak köprünün tam ortasına konur; paralar birer birer eklenir.",
        "4. Köprü bardağın masaya değmesine kadar taşıdığı para sayısı kaydedilir.",
        "5. Her model 3 kez denenir, ortalama alınır."
      ] },
      { baslik: "Veri tablosu", tur: "tablo", cols: ["Model", "1. deneme", "2. deneme", "3. deneme", "Ortalama"],
        rows: [["Düz kâğıt"], ["Akordeon katlama"], ["U kanal (kenarlar kalkık)"], ["Rulo (tüp) destekli"]],
        not: "Bağımsız değişken: katlama biçimi. Bağımlı: taşınan para sayısı. Kontrol: kâğıt türü, aralık, bant miktarı, yük yeri." }
    ],
    video: [
      { id: "QZIwn4_NzTs", ad: "Tek A4 kâğıdından şişe taşıyan köprü", kanal: "ARC Labs", neden: "Katlamanın taşıma gücüne etkisi" }
    ]
  },
  "D3-12": {
    liste: [
      "Girişteki “kısa veri seti ve üç sonuç cümlesi” aşağıda hazır.",
      "İddia-kanıt-gerekçe kâğıdı (Ek 1) fotokopisi.",
      "Tümdengelim/tümevarım alıştırma kartları (aşağıda hazır): kes."
    ],
    icerik: [
      { baslik: "Veri seti: bitkiye verilen su ve boy (2 hafta)", tur: "tablo", cols: ["Saksı", "Günlük su", "Işık", "2 hafta sonra boy"],
        rows: [["A", "50 ml", "Pencere önü", "12 cm"], ["B", "100 ml", "Pencere önü", "15 cm"], ["C", "100 ml", "Dolap içi", "4 cm"], ["D", "200 ml", "Pencere önü", "9 cm"]] },
      { baslik: "Hangi sonuç verilerle destekleniyor?", tur: "tablo", cols: ["Sonuç cümlesi", "Cevap (öğretmene)"],
        rows: [["1. Ne kadar çok su verirsek bitki o kadar uzar.", "Desteklenmiyor: D en çok suyu aldı ama A ve B'den kısa."], ["2. Işıksız kalan bitki daha az uzadı.", "Destekleniyor: B ile C aynı suyu aldı, yalnızca ışık farklı."], ["3. En iyi sulama miktarı tam 100 ml'dir.", "Kısmen: bu veride en iyi B, ama 100 ile 200 arasını denemedik."]] },
      { baslik: "Akıl yürütme kartları", tur: "kartlar", items: ["TÜMDENGELİM\nBütün memeliler akciğerle solur. Yunus memelidir. O hâlde …", "TÜMDENGELİM\nOkulda zil çalınca ders biter. Zil çaldı. O hâlde …", "TÜMEVARIM\nGördüğüm 20 kuğunun hepsi beyazdı. O hâlde bütün kuğular beyaz mı? (Avustralya'da siyah kuğular var!)", "TÜMEVARIM\nSon 5 cuma kantinde tost bitti. Bu cuma da biter mi? Ne kadar eminsin?"] }
    ],
    video: [
      { id: "227LnTyy4_Q", ad: "Tümevarım mı tümdengelim mi? Bilimin akıl yolu", kanal: "Anadolu Üniversitesi Açıköğretim", neden: "Kısa ve net" }
    ]
  },
  "D3-13": {
    liste: [
      "Girişteki “kısa örüntü seti” aşağıda hazır: yazdır ya da yansıt.",
      "Kendi örüntülerini tasarlamak için kareli kâğıt, renkli kalem.",
      "Mantık problemi için tablo kâğıdı."
    ],
    icerik: [
      { baslik: "Örüntü seti (giriş)", tur: "tablo", cols: ["Örüntü", "Sıradaki", "Kural (öğretmene)"],
        rows: [["2, 5, 8, 11, …", "14", "+3"], ["1, 4, 9, 16, …", "25", "kare sayılar (1², 2², 3²…)"], ["1, 1, 2, 3, 5, 8, …", "13", "önceki iki sayının toplamı"], ["▲ ■ ■ ▲ ■ ■ ▲ …", "■", "1 üçgen, 2 kare tekrar eder"], ["Pzt, Çar, Cum, Paz, …", "Salı", "birer gün atlanır"]] },
      { baslik: "Mantık problemi (birden fazla stratejiyle çöz)", tur: "metin", p: [
        "Ali, Bora ve Cem'in evcil hayvanları kedi, köpek ve balık. Ali'nin hayvanı havlamaz. Bora'nın hayvanı suda yaşamaz. Cem kediden korkar. Kim hangi hayvana bakıyor?",
        "Cevap: Cem kediden korktuğu için kedi Ali'de ya da Bora'da. Ali'ninki havlamaz, yani köpek değil. Bora'nınki suda yaşamaz, yani balık değil. Kedi Ali'de ise Bora köpek, Cem balık olur: tutarlı. Kedi Bora'da ise Ali balık, Cem köpek olur: bu da tutarlı. Öğrencilere sor: Tek çözüm için hangi ipucu eklenmeli? (Örnek: “Bora'nın hayvanı miyavlamaz.”)",
        "Strateji karşılaştırma: tablo (✓/✗), sistematik liste (6 olasılığı yazıp elemek), deneme-yanılma."
      ] }
    ],
    video: [
      { id: "zFyXZtVtVKw", ad: "8 dakikada sayı örüntüleri", kanal: "Tonguç Akademi", neden: "Kural bulma stratejileri" }
    ]
  },
  "D3-14": {
    liste: [
      "Giriş için günlük bir nesne: ataş, plastik şişe ya da mandal (her gruba bir tane).",
      "SCAMPER soru kartları (aşağıda hazır): kes.",
      "Kâğıt prototip için karton, makas, bant, renkli kalem; post-it (30 fikir için)."
    ],
    icerik: [
      { baslik: "SCAMPER soru kartları", tur: "kartlar", items: ["S – YERİNE KOY\nHangi parçayı ya da malzemeyi değiştirebilirim?", "C – BİRLEŞTİR\nBaşka bir nesneyle birleşirse ne olur?", "A – UYARLA\nBaşka bir alanda kullanılan hangi fikir buraya uyar?", "M – DEĞİŞTİR / BÜYÜT / KÜÇÜLT\nBoyutu, rengi, şekli değişirse ne olur?", "P – BAŞKA AMAÇLA KULLAN\nBunu başka kimler, nerede kullanabilir?", "E – ÇIKAR\nHangi parçayı atarsam yine çalışır?", "R – TERSİNE ÇEVİR\nSırayı ya da yönü ters çevirirsem ne olur?"] }
    ],
    video: [
      { id: "rCIlCMTyA1Q", ad: "SCAMPER tekniği: yenilikçi düşünme", kanal: "Yarının Girişimcileri", neden: "Tekniğin örnekle anlatımı" }
    ]
  },
  "D3-15": {
    liste: [
      "Giriş için günlük bir ürün: akıllı telefon, bisiklet ya da su şişesi (gerçek ya da görsel).",
      "Mühendislik alanları karşılaştırma matrisi (aşağıda hazır).",
      "Problem kartları: akıllı şehir, deprem, enerji, sağlık (gruplara birer tane)."
    ],
    icerik: [
      { baslik: "Bir akıllı telefonun arkasındaki mühendisler", tur: "tablo", cols: ["Alan", "Telefondaki işi", "Kullandığı araç"],
        rows: [["Elektrik-elektronik", "Devre kartı, şarj, anten", "Devre tasarım yazılımı, osiloskop"], ["Bilgisayar/yazılım", "İşletim sistemi, uygulamalar", "Programlama dilleri"], ["Malzeme", "Kırılmaz cam, hafif kasa", "Laboratuvar testleri"], ["Makine", "Titreşim motoru, ısı dağılımı", "3B tasarım, simülasyon"], ["Endüstri", "Fabrikada üretim sırası, maliyet", "Planlama ve istatistik"], ["Kimya", "Pil kimyası", "Deney ve analiz"]] }
    ],
    video: [
      { id: "FyjlYZapPwE", ad: "Mühendislik nedir?", kanal: "Bu Ne Biçim Ders", neden: "Mühendisler ne iş yapar?" }
    ]
  },
  "D3-16": {
    liste: [
      "Hatalı sıralanmış algoritma kartları (aşağıda hazır): kes, karıştır.",
      "Kaçış odası için 3 görev zarfı (aşağıdaki görevleri zarflara koy) ve son kilit için 3 haneli şifre.",
      "Tersine mühendislik için sökülebilir basit bir nesne: tükenmez kalem, mandal ya da el feneri; küçük tornavida."
    ],
    icerik: [
      { baslik: "Hatalı algoritma: Çay demleme (doğru sıraya diz)", tur: "kartlar", items: ["Çaydanlığın altını yak.", "Demliğe çay koy.", "Çaydanlığa su doldur.", "Su kaynayınca demliğe dök.", "10-15 dakika demlenmesini bekle.", "Bardağa doldur."] },
      { baslik: "Kaçış odası görevleri", tur: "tablo", cols: ["Görev", "Soru", "Şifre parçası (öğretmene)"],
        rows: [["1. Sıra", "Robot 1'den başlar, her adımda 2 ekler. 4. adımda hangi sayıdadır? (1, 3, 5, …)", "7"], ["2. Koşul", "EĞER sayı çiftse 2'ye böl, DEĞİLSE 1 ekle. 6'dan başla, 2 adım uygula.", "4  (6 → 3 → 4)"], ["3. Tekrar", "“3 kez tekrarla: 1 adım ileri, sola dön” komutundan sonra robot kaç kez döndü?", "3"]],
        not: "Son kilidin şifresi: 7-4-3. Görev 2'de kuralı tek adım uygulayan gruplar 3 bulur; bu hata algoritmayı adım adım izlemenin önemini konuşmak için kullanılır." }
    ],
    video: [
      { id: "pdz1H87P2Os", ad: "Algoritma nedir? Neden algoritma öğrenmeliyim?", kanal: "KodlaBaba", neden: "Çocuklar için algoritma" }
    ]
  },
  "D3-17": {
    liste: [
      "Giriş için iki yapay zekâ örneği (aşağıda hazır).",
      "Risk-koruma eşleştirme kartları: şifre, kişisel veri, sahte içerik, dijital iz.",
      "Mucit incelemesi için kısa kaynak (aşağıda El-Cezeri metni hazır)."
    ],
    icerik: [
      { baslik: "Günlük hayattan iki yapay zekâ örneği", tur: "tablo", cols: ["Örnek", "Yararı", "Riski", "Kararı kim vermeli?"],
        rows: [["Video sitesinin “sana önerilenler” listesi", "Sevdiğin içerikleri bulursun", "Hep aynı tür içerik, zaman kaybı", "Ne izleyeceğine sen karar vermelisin"], ["Telefonun fotoğraftaki yüzleri tanıması", "Albümleri düzenler", "Kişisel veri, izinsiz tanıma", "Fotoğraftaki kişinin izni önemli"]] },
      { baslik: "Mucit: El-Cezeri (kısa kaynak)", tur: "metin", p: [
        "El-Cezeri 12. yüzyılın sonu ile 13. yüzyılın başında Cizre'de yaşadı ve Artuklu sarayında çalıştı.",
        "1206'da tamamladığı kitabında su saatleri, otomatik çalışan makineler ve mekanik düzenekler dahil 50'den fazla aletin nasıl yapılacağını çizimleriyle anlattı.",
        "Bu nedenle sibernetik ve robot biliminin öncülerinden sayılır.",
        "İnceleme soruları: Hangi ihtiyacı fark etti? Nasıl deneme-yanılma yaptı? Buluşu kimin hayatını kolaylaştırdı?"
      ] }
    ],
    video: [
      { id: "ZauBYEsBr2w", ad: "Yapay zekâ, makine öğrenmesi ve büyük veri nedir?", kanal: "Tam Çocuk İşi", neden: "Çocuklar için yapay zekâ" }
    ]
  },
  "D3-18": {
    liste: [
      "Mini girişim planı kâğıdı (Ek 1) fotokopisi.",
      "Özellik önceliklendirme için üç renk post-it: zorunlu, yararlı, ek.",
      "Görsel kimlik (logo, ad) için renkli kalem ve A4."
    ],
    icerik: [
      { baslik: "Örnek sorun ve kullanıcı cümleleri", tur: "tablo", cols: ["Sorun", "Kullanıcı bakış açısıyla"],
        rows: [["Kantinde sıra çok uzun.", "Teneffüste aç kalan bir 5. sınıf öğrencisi olarak, sırada beklemeden yiyecek almak istiyorum, çünkü teneffüs 10 dakika."], ["Kayıp eşyalar sahibine dönmüyor.", "Montunu kaybeden bir öğrenci olarak, eşyamın nerede olduğunu çabuk öğrenmek istiyorum."], ["Okul bahçesinde gölge yok.", "Yazın bahçede oynayan bir öğrenci olarak, güneşten korunacak bir yer istiyorum."]] }
    ],
    video: [
      { id: "Y1bTe3RUo58", ad: "Girişimcilik nedir?", kanal: "BilişimNotları Net", neden: "Ortaokul düzeyinde örneklerle" }
    ]
  }
};
