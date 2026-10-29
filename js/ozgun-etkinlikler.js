// Destek 1 yıllık planında olup MEB yardımcı materyalinde karşılığı bulunmayan haftalar için özgün etkinlikler.
// Çalışma kâğıdı blokları: p (metin), boxes (etiketli kutular), table, lines, cards (kes-kullan), check, scale (öz değerlendirme), ticket (3-2-1 çıkış bileti)
window.OZGUN = {
  "4": {
    ad: "LİDERLİK ATÖLYESİ",
    soru: "Lider en çok konuşan kişi midir?",
    giris: "Tahtaya bir orkestra şefi, bir takım kaptanı ve bir sınıf başkanı görseli yansıtılır. Öğrencilere “Bu üç kişinin ortak noktası ne?” diye sorulur; cevaplar tahtada kelime bulutu olarak toplanır.",
    dersler: [
      { baslik: "Keşfetme", metin: "Öğrenciler “Lider kimdir?” sorusuna ilk cevaplarını post-itlere yazar. Cevaplar “söyledikleri” ve “yaptıkları” olarak iki sütunda gruplanır." },
      { baslik: "Liderlik kartları", metin: "Gruplar Ek 1'deki özellik kartlarını keser, “mutlaka olmalı / olsa iyi olur / gerekmez” olarak sıralar ve sıralarını bir cümleyle gerekçelendirir." },
      { baslik: "Kule görevi", metin: "Her gruba 20 kâğıt ve bant verilir; 10 dakikada en yüksek kuleyi kuracaklar. Her 3 dakikada bir lider değişir. Öğretmen hangi liderlikte işin hızlandığını not eder." },
      { baslik: "Liderlik pusulası", metin: "Gruplar kule deneyimini konuşur ve Ek 2'deki liderlik pusulasını doldurur: dinlemek, yön göstermek, cesaret vermek, sorumluluk almak." },
      { baslik: "Paylaşma", metin: "Her öğrenci “Ben bir grupta liderlik ettiğimde …” cümlesini tamamlar. Pusulalar panoda sergilenir, çıkış bileti doldurulur." }
    ],
    urun: "Grup liderlik pusulası (afiş)",
    zengin: "Bir tarihî ya da güncel lideri seçip pusuladaki dört yönden hangisinde güçlü olduğunu kanıtla açıklar.",
    destek: "Özellik kartları resimli verilir; sıralama üç yerine iki kategoriyle (gerekli / gereksiz) yapılır.",
    ekler: [
      { baslik: "LİDERLİK ÖZELLİK KARTLARI • KES-SIRALA", yonerge: "Kartları kes. Grubunla birlikte üç sütuna yerleştir: Mutlaka olmalı – Olsa iyi olur – Gerekmez.",
        bloklar: [
          { t: "cards", items: ["Dinler", "Karar verir", "Herkese söz hakkı verir", "En çok konuşur", "Hatasını kabul eder", "Sözünü tutar", "Hep kendisi kazanır", "Cesaret verir", "Plan yapar", "Sinirlenince bağırır", "Yardım ister", "Örnek olur"] },
          { t: "table", cols: ["Mutlaka olmalı", "Olsa iyi olur", "Gerekmez"], rows: 4 },
          { t: "lines", label: "En önemli bulduğumuz özellik ve nedeni:", n: 2 }
        ] },
      { baslik: "LİDERLİK PUSULAM", yonerge: "Kule görevini düşün. Pusulanın her yönüne o yönle ilgili gördüğün bir davranışı yaz.",
        bloklar: [
          { t: "boxes", cols: 2, h: 38, items: ["KUZEY • Yön gösterir", "DOĞU • Dinler", "BATI • Cesaret verir", "GÜNEY • Sorumluluk alır"] },
          { t: "lines", label: "Ben bir grupta liderlik ettiğimde …", n: 2 },
          { t: "ticket" }
        ] }
    ]
  },
  "7": {
    ad: "BİLİM DALLARI HARİTASI",
    soru: "Bir yağmur damlasını kaç farklı bilim insanı inceleyebilir?",
    giris: "Tahtaya tek bir yağmur damlası görseli yansıtılır. Öğrenciler damlayı kimlerin, neden inceleyebileceğini tahmin eder (meteorolog, kimyager, biyolog, fizikçi…).",
    dersler: [
      { baslik: "Bilim dalı kartları", metin: "Ek 1'deki soru kartları kesilir. Gruplar her soruyu hangi bilim dalının cevaplayacağına karar verip haritada doğru bölgeye yapıştırır." },
      { baslik: "Haritayı genişlet", metin: "Gruplar haritaya kendi sorularını ekler. Birden fazla bilim dalına giren sorular sınır çizgilerine yerleştirilir; “disiplinler arası” kavramı konuşulur." }
    ],
    urun: "Sınıf bilim dalları haritası",
    zengin: "Haritada iki bilim dalının kesiştiği bir meslek (biyomühendis, astrobiyolog vb.) araştırıp kısa tanıtım kartı yazar.",
    destek: "Bilim dalları dörtle (fizik, kimya, biyoloji, yer bilimleri) sınırlanır; her dal bir renk ve simgeyle gösterilir.",
    ekler: [
      { baslik: "BİLİM DALLARI HARİTASI", yonerge: "Soru kartlarını kes. Her soruyu cevaplayabilecek bilim dalının bölgesine yapıştır. İki dala da giriyorsa sınırın üstüne koy.",
        bloklar: [
          { t: "cards", items: ["Arılar neden dans eder?", "Ay neden şekil değiştirir?", "Demir neden paslanır?", "Depremler nasıl oluşur?", "Gökkuşağı nasıl oluşur?", "Kalbimiz neden atar?", "Bulutlar neden yüzer?", "Volkanlar neden patlar?", "Ekmek neden kabarır?"] },
          { t: "boxes", cols: 3, h: 44, items: ["FİZİK", "KİMYA", "BİYOLOJİ", "ASTRONOMİ", "YER BİLİMİ", "METEOROLOJİ"] },
          { t: "lines", label: "Benim sorum ve bilim dalı:", n: 2 }
        ] }
    ]
  },
  "8": {
    ad: "MERAK KUTUSU",
    soru: "Merak etmeseydik bugün neyi bilmiyor olurduk?",
    giris: "Sınıfa kapalı bir kutu getirilir. Öğrenciler kutuyu açmadan sallar, tartar, dinler ve içinde ne olduğunu tahmin eder. Kutu açılmadan önce “Neyi bilmek istedin?” sorusu konuşulur.",
    dersler: [
      { baslik: "Kutunun sırrı", metin: "Öğrenciler kutuyu açmadan duyularıyla ipucu toplar, Ek 1'e gözlem ve tahminlerini yazar. Kutu açılır, tahminler karşılaştırılır." },
      { baslik: "Meraktan buluşa", metin: "Newton'un elması, Fleming'in küfü, Cahit Arf'ın sorularıyla dolu öğrencilik yılları gibi kısa öyküler okunur. Gruplar her öyküde merakın yerini bulur." },
      { baslik: "Soru yağmuru", metin: "Öğrenciler 5 dakikada sınıf ve okul hakkında aklına gelen bütün “neden?” sorularını yazar. Sorular sınıfın merak kutusuna atılır." },
      { baslik: "Soru seçme", metin: "Kutudan sorular çekilir; gruplar her sorunun “gözlemle mi, deneyle mi, araştırarak mı” cevaplanacağına karar verir." },
      { baslik: "Paylaşma", metin: "Her grup bir soruyu seçip küçük bir araştırma planı sunar. Merak kutusu yıl boyu sınıfta kalır; her hafta bir soru çekilir." }
    ],
    urun: "Sınıf merak kutusu ve soru planları",
    zengin: "Kutudan çıkan bir soru için evde basit bir gözlem yapıp sonucu ertesi derse getirir.",
    destek: "Soru yazmak için “Neden …?”, “Ne olur eğer …?”, “Nasıl …?” soru başlatıcıları verilir.",
    ekler: [
      { baslik: "MERAK KUTUSU DEDEKTİF FORMU", yonerge: "Kutuyu açmadan duyularını kullan. Her duyu için bir ipucu yaz ve tahminini söyle.",
        bloklar: [
          { t: "table", cols: ["Duyu", "Ne fark ettim?", "Bu bana ne düşündürdü?"], rows: [["Duyuyorum"], ["Dokunuyorum"], ["Tartıyorum (ağır/hafif)"], ["Kokluyorum"]] },
          { t: "boxes", cols: 2, h: 30, items: ["İlk tahminim", "Kutu açılınca gördüğüm"] },
          { t: "lines", label: "Tahminim neden tuttu ya da tutmadı?", n: 2 }
        ] },
      { baslik: "MERAK KARTLARIM • KES-KUTUYA AT", yonerge: "Her karta bir “neden?” sorusu yaz. Sorunun nasıl cevaplanabileceğini işaretle.",
        bloklar: [
          { t: "cards", blank: true, items: ["Sorum: ___________ □ Gözlem □ Deney □ Araştırma", "Sorum: ___________ □ Gözlem □ Deney □ Araştırma", "Sorum: ___________ □ Gözlem □ Deney □ Araştırma", "Sorum: ___________ □ Gözlem □ Deney □ Araştırma", "Sorum: ___________ □ Gözlem □ Deney □ Araştırma", "Sorum: ___________ □ Gözlem □ Deney □ Araştırma"] },
          { t: "ticket" }
        ] }
    ]
  },
  "9a": {
    ad: "DOĞRU SORUYU BUL",
    soru: "Her soru bir cevaba götürür mü?",
    giris: "Tahtaya iki soru yazılır: “Bitkiler sever mi?” ve “Bitkiler ışıksız kalırsa ne olur?”. Öğrenciler hangisinin araştırılabileceğini tartışır.",
    dersler: [
      { baslik: "Soru tamircisi", metin: "Ek 1'deki bulanık sorular incelenir. Öğrenciler her soruyu ölçülebilir, test edilebilir bir soruya dönüştürür." },
      { baslik: "Soru makinesi", metin: "Gruplar bir nesne seçer (oyuncak araba, bitki, buz). “Ne olur eğer…?” kalıbıyla üç test edilebilir soru üretir; en iyisini sınıfa sunar." }
    ],
    urun: "Test edilebilir soru listesi",
    zengin: "Seçtiği soruyu test etmek için değiştireceği ve sabit tutacağı şeyleri belirler.",
    destek: "Soruların yanında “Ölçebilir miyim? Gözleyebilir miyim?” kontrol kutuları kullanılır.",
    ekler: [
      { baslik: "SORU TAMİRCİSİ", yonerge: "Soldaki sorular araştırılamayacak kadar bulanık. Onları test edilebilir sorulara dönüştür.",
        bloklar: [
          { t: "table", cols: ["Bulanık soru", "Tamir edilmiş soru", "Ölçebilir miyim?"], rows: [["Kediler mutlu mu?"], ["Hangi top en iyisi?"], ["Su güzel mi?"], ["Bitkiler müzik sever mi?"]] },
          { t: "boxes", cols: 3, h: 30, items: ["Ne olur eğer …? (1)", "Ne olur eğer …? (2)", "Ne olur eğer …? (3)"] },
          { t: "check", items: ["Sorumun cevabı gözlem ya da ölçümle bulunabilir.", "Sorum tek bir şeyi soruyor.", "Sorumu bir arkadaşım okuyunca aynı şeyi anlıyor."] }
        ] }
    ]
  },
  "13a": {
    ad: "ÇÖZÜMÜMÜ DEĞERLENDİRİYORUM",
    soru: "Bir çözüm işe yaradıysa iyi bir çözüm müdür?",
    giris: "“Teneffüste koridor çok kalabalık” problemi için üç çözüm gösterilir: teneffüsü kaldırmak, sırayla çıkmak, koridoru boyamak. Öğrenciler hangisinin işe yarayacağını oylar.",
    dersler: [
      { baslik: "Çözüm terazisi", metin: "Gruplar seçtikleri çözümü Ek 1'deki terazide tartar: faydalar bir kefeye, yan etkiler diğer kefeye yazılır." },
      { baslik: "Kim etkilenir?", metin: "Gruplar çözümden etkilenen kişileri (öğrenciler, öğretmenler, temizlik görevlisi) listeler. Çözümü bir kez daha düzenleyip yeni hâlini sunar." }
    ],
    urun: "Revize edilmiş çözüm kartı",
    zengin: "Çözümün bir hafta, bir ay ve bir yıl sonraki etkilerini tahmin eden zaman çizgisi çizer.",
    destek: "Fayda ve yan etki için hazır örnek kartlarından seçim yapılır.",
    ekler: [
      { baslik: "ÇÖZÜM TERAZİSİ", yonerge: "Problemi ve çözümünü yaz. Faydaları sol kefeye, yan etkileri sağ kefeye ekle. Terazi hangi tarafa ağır basıyor?",
        bloklar: [
          { t: "boxes", cols: 2, h: 22, items: ["Problem", "Çözümümüz"] },
          { t: "boxes", cols: 2, h: 52, items: ["FAYDALAR (+)", "YAN ETKİLER (−)"] },
          { t: "lines", label: "Çözümümüzü şöyle geliştirdik:", n: 3 }
        ] }
    ]
  },
  "13b": {
    ad: "MERAKIMDAN ARAŞTIRMAYA",
    soru: "Bir merak nasıl araştırma sorusuna dönüşür?",
    giris: "Merak kutusundan (8. hafta) bir soru çekilir. Öğrencilere “Bu soruyu araştırmaya başlamak için ilk ne yaparsınız?” diye sorulur.",
    dersler: [
      { baslik: "Merak merdiveni", metin: "Öğrenciler bir merakını Ek 1'deki merdivende adım adım daraltır: merak → konu → soru → nereden öğrenirim?" },
      { baslik: "Araştırma planı", metin: "Gruplar en ilginç soruyu seçer; kimden, nereden, nasıl bilgi toplayacaklarını planlar ve planlarını sunar." }
    ],
    urun: "Merak merdiveni ve araştırma planı",
    zengin: "Aynı merak için iki farklı araştırma sorusu yazıp hangisinin daha kolay araştırılacağını tartışır.",
    destek: "Merdivenin her basamağı için örnek cümle verilir.",
    ekler: [
      { baslik: "MERAK MERDİVENİ", yonerge: "En alttaki basamaktan başla. Her basamakta merakını biraz daha netleştir.",
        bloklar: [
          { t: "boxes", cols: 1, h: 18, items: ["4. Bilgiyi nereden ve kimden toplayacağım?", "3. Araştırma sorum", "2. Konu", "1. Merak ettiğim şey"] },
          { t: "check", items: ["Kitap / dergi", "Uzman bir kişiyle görüşme", "Gözlem", "Basit deney", "Güvenilir internet sitesi"] }
        ] }
    ]
  },
  "14": {
    ad: "ARAŞTIRMA DEDEKTİFLERİ",
    soru: "Bir dedektif ipucu toplarken neden not alır?",
    giris: "Sınıfa “Kayıp Kalem Vakası” anlatılır ve masalara ipucu kartları dağıtılır. Öğrenciler not almadan ipuçlarını hatırlamaya çalışır, sonra not alarak tekrar dener.",
    dersler: [
      { baslik: "Vaka dosyası", metin: "Gruplar araştırma konusunu seçer (örneğin “Okul bahçesindeki ağaçlar”). Ek 1'e bildiklerini, bilmek istediklerini yazar." },
      { baslik: "İpucu avı", metin: "Öğrenciler kitap, ansiklopedi ve öğretmenin seçtiği sitelerden bilgi toplar; her bilgiyi kaynağıyla birlikte ipucu kartına yazar." },
      { baslik: "Görüşme", metin: "Gruplar okuldaki bir yetişkinle (bahçıvan, öğretmen, müdür yardımcısı) kısa görüşme yapar; soruları önceden hazırlar." },
      { baslik: "Panoyu kur", metin: "İpucu kartları dedektif panosuna asılır, birbirini destekleyen bilgiler iple bağlanır." },
      { baslik: "Vaka kapandı", metin: "Gruplar ne öğrendiklerini ve hâlâ neyi bilmediklerini sunar. BİL-İSTE-ÖĞREN tablosu tamamlanır." }
    ],
    urun: "Dedektif panosu ve BİL-İSTE-ÖĞREN tablosu",
    zengin: "Topladığı iki bilgi çeliştiğinde hangisine neden güvendiğini açıklar.",
    destek: "İpucu kartında “Ne öğrendim? / Nereden öğrendim?” iki satırla sınırlanır.",
    ekler: [
      { baslik: "VAKA DOSYASI • BİL-İSTE-ÖĞREN", yonerge: "Araştırma konunu yaz. Araştırmadan önce ilk iki sütunu, araştırmadan sonra son sütunu doldur.",
        bloklar: [
          { t: "boxes", cols: 1, h: 16, items: ["Vaka (araştırma konum):"] },
          { t: "table", cols: ["BİLİYORUM", "İSTİYORUM (öğrenmek)", "ÖĞRENDİM"], rows: 6 }
        ] },
      { baslik: "İPUCU KARTLARI • KES-PANOYA AS", yonerge: "Her bilgiyi bir karta yaz. Kaynağını mutlaka ekle.",
        bloklar: [
          { t: "cards", blank: true, items: ["İpucu: ______  Kaynak: ______", "İpucu: ______  Kaynak: ______", "İpucu: ______  Kaynak: ______", "İpucu: ______  Kaynak: ______", "İpucu: ______  Kaynak: ______", "İpucu: ______  Kaynak: ______"] },
          { t: "lines", label: "Görüşme sorularım:", n: 3 }
        ] }
    ]
  },
  "15": {
    ad: "GÖZLEMDEN TAHMİNE",
    soru: "Gördüğümüz şeyle düşündüğümüz şey aynı mıdır?",
    giris: "Tahtaya ıslak bir yol fotoğrafı yansıtılır. Öğrenciler “Ne görüyorsun?” ve “Ne düşünüyorsun?” cevaplarını ayrı ayrı söyler; gözlem ile çıkarım arasındaki fark konuşulur.",
    dersler: [
      { baslik: "Gözlem mi, tahmin mi?", metin: "Ek 1'deki cümleler “gözlem” ve “tahmin” olarak ayrılır. Öğrenciler gerekçelerini paylaşır." },
      { baslik: "Buz deneyi", metin: "Farklı ortamlara (pencere önü, gölge, kâğıt üstü, metal üstü) buz küpleri bırakılır. Öğrenciler hangisinin önce eriyeceğini tahmin eder." },
      { baslik: "Gözlem çizelgesi", metin: "Her 5 dakikada bir buzlar gözlenip Ek 2'ye kaydedilir. Tahminler gözlemlerle karşılaştırılır." },
      { baslik: "Neden?", metin: "Gruplar gözlemlerine dayanarak yeni bir tahmin yapar: “Bir dahaki sefere … önce erir, çünkü …”." },
      { baslik: "Paylaşma", metin: "Gruplar gözlem tablolarını ve tahminlerini sunar; hangi gözlemin düşüncelerini değiştirdiğini anlatır." }
    ],
    urun: "Gözlem çizelgesi ve gerekçeli tahmin",
    zengin: "Deneyde değiştirilecek bir şey önerir (buzun boyutu, tuz ekleme) ve sonucu tahmin eder.",
    destek: "Gözlem çizelgesi resimli (tam buz / yarım / su) işaretlemeyle doldurulur.",
    ekler: [
      { baslik: "GÖZLEM Mİ, TAHMİN Mİ?", yonerge: "Her cümleyi oku. Gözlemse G, tahminse T yaz. Bir tanesinin nedenini açıkla.",
        bloklar: [
          { t: "table", cols: ["Cümle", "G / T"], rows: [["Yol ıslak."], ["Az önce yağmur yağmış."], ["Gökyüzü gri."], ["Birazdan yine yağacak."], ["Bir şemsiye kapının önünde duruyor."], ["Evde biri var."]] },
          { t: "lines", label: "Şunun tahmin olduğunu düşünüyorum, çünkü …", n: 2 }
        ] },
      { baslik: "BUZ GÖZLEM ÇİZELGESİ", yonerge: "Önce tahminini yaz. Sonra her 5 dakikada buzların durumunu kaydet.",
        bloklar: [
          { t: "boxes", cols: 1, h: 16, items: ["Tahminim: En önce … eriyecek, çünkü …"] },
          { t: "table", cols: ["Yer", "5. dk", "10. dk", "15. dk", "20. dk"], rows: [["Pencere önü"], ["Gölge"], ["Kâğıt üstü"], ["Metal üstü"]] },
          { t: "lines", label: "Gözlemlerime göre yeni tahminim:", n: 2 }
        ] }
    ]
  },
  "16": {
    ad: "VERİDEN GELECEĞE",
    soru: "Dünün verisi yarını tahmin etmemize yeter mi?",
    giris: "Sınıfın son beş günlük devam sayısı tahtaya yazılır. Öğrenciler yarın kaç kişinin geleceğini tahmin eder ve tahminlerinin dayanağını söyler.",
    dersler: [
      { baslik: "Veri toplama", metin: "Sınıf bir veri seçer: en sevilen meyve, okula geliş yolu, uyku saati. Öğrenciler çetele tutarak veri toplar." },
      { baslik: "Grafik", metin: "Toplanan veri Ek 1'de sütun grafiğine dönüştürülür. Grafikten üç bilgi çıkarılır." },
      { baslik: "Tahmin", metin: "Gruplar “Başka bir sınıfta sonuç ne olur?” sorusunu tahmin eder ve tahminlerini gerekçelendirir." },
      { baslik: "Sınama", metin: "Komşu sınıftan veri istenir (ya da öğretmen hazır veri verir). Tahminler gerçek veriyle karşılaştırılır." },
      { baslik: "Paylaşma", metin: "Gruplar tahminlerinin neden tuttuğunu ya da tutmadığını anlatır; “daha çok veri” fikrini tartışır." }
    ],
    urun: "Sınıf veri grafiği ve tahmin raporu",
    zengin: "Hava durumu tahminlerinin nasıl yapıldığını araştırıp veriyle ilişkisini açıklar.",
    destek: "Grafik hazır eksenlerle ve sınırlı kategoriyle verilir.",
    ekler: [
      { baslik: "VERİ DEFTERİM", yonerge: "Sınıfta topladığınız veriyi çeteleyle yaz, sonra sütun grafiği çiz.",
        bloklar: [
          { t: "table", cols: ["Seçenek", "Çetele", "Sayı"], rows: 5 },
          { t: "boxes", cols: 1, h: 70, items: ["SÜTUN GRAFİĞİ"] },
          { t: "lines", label: "Grafikten çıkardığım üç bilgi:", n: 3 }
        ] },
      { baslik: "TAHMİN KARTIM", yonerge: "Başka bir sınıfın sonucunu tahmin et. Gerçek sonucu öğrenince karşılaştır.",
        bloklar: [
          { t: "boxes", cols: 2, h: 36, items: ["Tahminim", "Gerçek sonuç"] },
          { t: "lines", label: "Tahminim tuttu / tutmadı, çünkü …", n: 3 },
          { t: "ticket" }
        ] }
    ]
  },
  "17": {
    ad: "BİRLİKTE ARAŞTIRIYORUZ",
    soru: "Bir ekip, tek kişiden daha mı iyi araştırır?",
    giris: "Öğrenciler önce tek başlarına 1 dakikada “k” harfiyle başlayan hayvanları yazar, sonra grupla 1 dakika daha. Listelerin uzunluğu karşılaştırılır.",
    dersler: [
      { baslik: "Ekip rolleri", metin: "Ek 1'deki rol kartları tanıtılır: Başkan, Kayıtçı, Zaman Bekçisi, Malzemeci, Sunucu. Her grup rollerini dağıtır." },
      { baslik: "Ekip sözleşmesi", metin: "Gruplar birlikte çalışma kurallarını yazar ve sözleşmeyi imzalar." },
      { baslik: "Mini araştırma", metin: "Gruplar ortak bir soruyu araştırır (örneğin “Okulumuzda en çok hangi atık çıkıyor?”). Her rol kendi görevini yapar." },
      { baslik: "Rol değişimi", metin: "Araştırmanın ortasında roller değiştirilir. Öğrenciler yeni rolde neyi zor bulduklarını konuşur." },
      { baslik: "Ekip değerlendirme", metin: "Gruplar sonuçlarını sunar ve Ek 2'deki ekip değerlendirme formunu doldurur." }
    ],
    urun: "Ekip sözleşmesi ve mini araştırma sunumu",
    zengin: "Grubunda çıkan bir anlaşmazlığı nasıl çözdüklerini adım adım yazar.",
    destek: "Rol kartlarında görevler simgelerle gösterilir; tek rolle başlanır.",
    ekler: [
      { baslik: "EKİP ROL KARTLARI VE SÖZLEŞME", yonerge: "Rol kartlarını kes ve dağıtın. Sonra ekip sözleşmenizi yazıp imzalayın.",
        bloklar: [
          { t: "cards", items: ["BAŞKAN • Herkesin konuşmasını sağlar", "KAYITÇI • Fikirleri yazar", "ZAMAN BEKÇİSİ • Süreyi takip eder", "MALZEMECİ • Araç-gereci getirir", "SUNUCU • Sonucu sınıfa anlatır", "SORGULAYICI • “Emin miyiz?” diye sorar"] },
          { t: "lines", label: "EKİP SÖZLEŞMEMİZ — Biz birlikte çalışırken …", n: 4 },
          { t: "boxes", cols: 4, h: 16, items: ["İmza", "İmza", "İmza", "İmza"] }
        ] },
      { baslik: "EKİP DEĞERLENDİRME FORMU", yonerge: "Ekibini ve kendini dürüstçe değerlendir.",
        bloklar: [
          { t: "scale", items: ["Herkes fikrini söyleyebildi.", "Rolümü yerine getirdim.", "Anlaşmazlıkları konuşarak çözdük.", "Süreyi iyi kullandık.", "Arkadaşlarımı dinledim."] },
          { t: "lines", label: "Bir dahaki sefere ekibimiz şunu daha iyi yapabilir:", n: 2 }
        ] }
    ]
  },
  "18a": {
    ad: "ARAŞTIRMADA ETİK",
    soru: "Bir araştırmada doğru sonuca ulaşmak her şeyi haklı çıkarır mı?",
    giris: "Kısa bir senaryo okunur: Ece, arkadaşlarının cevaplarını izin almadan kullanıp posterini bitirmiştir. Öğrenciler Ece'nin ne yapması gerektiğini tartışır.",
    dersler: [
      { baslik: "Etik kartlar", metin: "Gruplar Ek 1'deki durum kartlarını “uygun / uygun değil” olarak ayırır ve her kararı bir cümleyle gerekçelendirir." },
      { baslik: "Araştırmacı yemini", metin: "Sınıf birlikte araştırmacı yemini yazar: izin almak, kaynak göstermek, veriyi değiştirmemek, canlılara zarar vermemek." }
    ],
    urun: "Sınıf araştırmacı yemini",
    zengin: "Hayvan ya da insanla yapılan araştırmalarda nelere dikkat edilmesi gerektiğini araştırır.",
    destek: "Durum kartları resimli ve iki seçenekli verilir.",
    ekler: [
      { baslik: "ETİK Mİ, DEĞİL Mİ? • DURUM KARTLARI", yonerge: "Kartları kes. Uygun olanları yeşil, uygun olmayanları kırmızı bölgeye koy.",
        bloklar: [
          { t: "cards", items: ["Arkadaşımın fikrini adıyla birlikte kullandım.", "Deney sonucu beğenmediğim için sayıyı değiştirdim.", "Anket yapmadan önce izin istedim.", "İnternetten bir resmi kaynağını yazmadan kullandım.", "Karıncaları incelerken yuvalarını bozmadım.", "Görüşme yaptığım kişinin adını sormadan yazdım."] },
          { t: "boxes", cols: 2, h: 46, items: ["ETİK (uygun)", "ETİK DEĞİL"] },
          { t: "lines", label: "ARAŞTIRMACI YEMİNİM: Araştırma yaparken …", n: 3 }
        ] }
    ]
  },
  "18b": {
    ad: "GÜVENİLİR KAYNAK PEŞİNDE",
    soru: "İnternette yazan her şey doğru mudur?",
    giris: "Tahtaya iki ekran görüntüsü yansıtılır: bir bilim müzesinin sayfası ve “Ahtapotlar ağaçta yaşar!” başlıklı bir paylaşım. Öğrenciler hangisine neden güvendiklerini söyler.",
    dersler: [
      { baslik: "Kaynak dedektifi", metin: "Öğrenciler Ek 1'deki dört soruyla (Kim yazmış? Ne zaman? Kanıt var mı? Başka kaynak aynısını söylüyor mu?) üç kaynağı inceler." },
      { baslik: "Güven ölçer", metin: "Gruplar kaynakları güven ölçerde sıralar, sonuçlarını karşılaştırır ve “güvenilir kaynak” tanımı yazar." }
    ],
    urun: "Kaynak güven ölçeri",
    zengin: "Aynı bilgiyi üç farklı kaynakta bulup karşılaştırır.",
    destek: "Kontrol soruları evet/hayır işaretlemesine indirilir.",
    ekler: [
      { baslik: "KAYNAK DEDEKTİFİ • GÜVEN ÖLÇER", yonerge: "Her kaynak için dört soruyu cevapla. Sonra güven ölçerde işaretle.",
        bloklar: [
          { t: "table", cols: ["Soru", "Kaynak 1", "Kaynak 2", "Kaynak 3"], rows: [["Kim yazmış? (kişi/kurum)"], ["Ne zaman yazılmış?"], ["Kanıt / kaynak gösteriyor mu?"], ["Başka bir kaynak da aynısını söylüyor mu?"], ["GÜVEN ÖLÇER (1-5)"]] },
          { t: "lines", label: "Bence güvenilir bir kaynak …", n: 2 }
        ] }
    ]
  },
  "19": {
    ad: "BİLİMSEL ARAŞTIRMANIN İZİNDE",
    soru: "Bilim insanları bir soruyu cevaplarken hangi yolu izler?",
    giris: "“Bitkiler ışığa doğru mu büyür?” sorusu tahtaya yazılır. Öğrenciler bunu nasıl öğrenebileceklerini sırayla söyler; söylenenler tahtada adım adım dizilir.",
    dersler: [
      { baslik: "Adımları sırala", metin: "Ek 1'deki bilimsel süreç kartları (soru, hipotez, deney, veri, sonuç, paylaşım) karışık verilir; gruplar sıralar." },
      { baslik: "Deney tasarımı", metin: "Gruplar ayakkabı kutusu labirentinde fasulye filizi deneyi planlar: neyi değiştirecek, neyi sabit tutacak, neyi ölçecekler?" },
      { baslik: "Kurulum", metin: "Deney kurulur, ilk gözlemler Ek 2'deki deney defterine kaydedilir. Deney sınıfta birkaç hafta sürecek." },
      { baslik: "Bilim insanı öyküsü", metin: "Aziz Sancar'ın DNA onarımı çalışmasının adımları kısa bir öyküyle anlatılır; öğrenciler öyküde süreç adımlarını bulur." },
      { baslik: "Paylaşma", metin: "Gruplar deney planlarını sunar; diğer gruplar “Neyi sabit tuttunuz?” sorusunu sorar." }
    ],
    urun: "Deney planı ve deney defteri",
    zengin: "Deneyde değiştirilecek ikinci bir değişken önerir ve yeni hipotez yazar.",
    destek: "Süreç kartları renk kodlu ve simgeli verilir.",
    ekler: [
      { baslik: "BİLİMSEL SÜREÇ KARTLARI • KES-SIRALA", yonerge: "Kartları kes ve doğru sıraya diz. Her adımın yanına fasulye deneyimizden bir örnek yaz.",
        bloklar: [
          { t: "cards", items: ["SONUÇ ÇIKAR", "SORU SOR", "DENEY YAP", "PAYLAŞ", "HİPOTEZ KUR", "VERİ TOPLA"] },
          { t: "table", cols: ["Sıra", "Adım", "Fasulye deneyimizde"], rows: 6 }
        ] },
      { baslik: "DENEY DEFTERİM", yonerge: "Deneyini planla ve gözlemlerini kaydet.",
        bloklar: [
          { t: "boxes", cols: 3, h: 26, items: ["Değiştirdiğim", "Sabit tuttuğum", "Ölçtüğüm"] },
          { t: "boxes", cols: 1, h: 16, items: ["Hipotezim: Bence … çünkü …"] },
          { t: "table", cols: ["Gün", "Gözlem (çizim/not)", "Boy (cm)"], rows: 5 }
        ] }
    ]
  },
  "22": {
    ad: "VERİDEN TAHMİNE",
    soru: "Bir topu bırakırsak kaç kez zıplar? Tahmin etmek için neye ihtiyacımız var?",
    giris: "Bir top farklı yüksekliklerden bırakılır; öğrenciler ilk zıplama yüksekliğini tahmin eder. Tahminin neye dayandığı sorulur.",
    dersler: [
      { baslik: "Ölçüm planı", metin: "Gruplar duvara metre şerit yapıştırır; topu 25, 50, 75 ve 100 cm'den bırakacaklarını planlar." },
      { baslik: "Veri toplama", metin: "Her yükseklikten üçer deneme yapılır, sıçrama yüksekliği Ek 1'e yazılır ve ortalama alınır." },
      { baslik: "Grafik ve örüntü", metin: "Veriler çizgi grafiğe aktarılır. Öğrenciler yükseklik arttıkça zıplamanın nasıl değiştiğini açıklar." },
      { baslik: "Tahmin et, sına", metin: "Gruplar grafiğe bakarak 125 cm'den bırakılan topun ne kadar zıplayacağını tahmin eder, sonra dener." },
      { baslik: "Paylaşma", metin: "Tahmin ile ölçüm arasındaki fark konuşulur; daha çok deneme yapmanın tahmini nasıl iyileştirdiği tartışılır." }
    ],
    urun: "Zıplama grafiği ve sınanmış tahmin",
    zengin: "Farklı top türleriyle (pinpon, tenis, basketbol) deneyi tekrarlayıp karşılaştırır.",
    destek: "Ortalama yerine en çok tekrar eden değer kullanılır; grafik hazır ızgarada çizilir.",
    ekler: [
      { baslik: "ZIPLAYAN TOP VERİ TABLOSU", yonerge: "Topu her yükseklikten üç kez bırak. Zıplama yüksekliğini ölç, ortalamayı bul.",
        bloklar: [
          { t: "table", cols: ["Bırakma (cm)", "1. deneme", "2. deneme", "3. deneme", "Ortalama"], rows: [["25"], ["50"], ["75"], ["100"]] },
          { t: "boxes", cols: 1, h: 64, items: ["ÇİZGİ GRAFİĞİ (yatay: bırakma yüksekliği, dikey: zıplama)"] },
          { t: "boxes", cols: 2, h: 24, items: ["125 cm için tahminim", "Ölçtüğüm"] }
        ] }
    ]
  },
  "23a": {
    ad: "KANITA DAYALI ÜRÜN",
    soru: "Bir afişi bilimsel yapan nedir?",
    giris: "İki afiş karşılaştırılır: biri “Su içmek çok iyidir!” diyor, diğeri sınıfın topladığı veriyi grafikle gösteriyor. Öğrenciler hangisine daha çok inandıklarını söyler.",
    dersler: [
      { baslik: "İddia-kanıt-gerekçe", metin: "Öğrenciler önceki haftalarda topladıkları verilerden birini seçip iddia, kanıt ve gerekçe olarak düzenler." },
      { baslik: "Bilim afişi", metin: "Gruplar Ek 1'deki şablonla bilim afişi hazırlar ve galeri yürüyüşünde akran geri bildirimi alır." }
    ],
    urun: "Kanıta dayalı bilim afişi",
    zengin: "Afişine “Bu sonucu ne değiştirebilir?” başlıklı bir sınırlılık kutusu ekler.",
    destek: "İddia ve gerekçe için cümle başlatıcıları verilir.",
    ekler: [
      { baslik: "BİLİM AFİŞİ ŞABLONU", yonerge: "Araştırmanı afişe dönüştür. Her iddianın bir kanıtı olsun.",
        bloklar: [
          { t: "boxes", cols: 1, h: 16, items: ["Başlık / araştırma sorum"] },
          { t: "boxes", cols: 3, h: 50, items: ["İDDİA: Bence …", "KANIT: Verilerim gösteriyor ki …", "GEREKÇE: Çünkü …"] },
          { t: "boxes", cols: 2, h: 44, items: ["Grafik / çizim", "Sonuç ve yeni sorum"] }
        ] }
    ]
  },
  "30": {
    ad: "TEKNOLOJİNİN DÜNÜ, BUGÜNÜ, YARINI",
    soru: "Telefon 50 yıl sonra neye benzeyecek?",
    giris: "Tahtaya çevirmeli telefon, tuşlu telefon ve akıllı telefon görselleri yansıtılır. Öğrenciler sırayı tahmin eder ve her birinin hangi problemi çözdüğünü konuşur.",
    dersler: [
      { baslik: "Zaman tüneli", metin: "Gruplar bir teknoloji seçer (ulaşım, iletişim, aydınlatma, müzik dinleme) ve Ek 1'de geçmiş-bugün-gelecek tüneli hazırlar." },
      { baslik: "Büyükanne röportajı", metin: "Öğrenciler evdeki bir büyükle yapacakları röportajın sorularını yazar: “Sizin çocukluğunuzda nasıl …?”" },
      { baslik: "Dijital güvenlik", metin: "Teknolojinin getirdiği yeni sorunlar konuşulur. Ek 2'deki güçlü şifre ve kişisel bilgi kartlarıyla dijital güvenlik oyunu oynanır." },
      { baslik: "Geleceğin aleti", metin: "Gruplar seçtikleri teknolojinin 2075 sürümünü atık malzemeyle modeller ve hangi güvenlik önlemini içerdiğini yazar." },
      { baslik: "Teknoloji fuarı", metin: "Modeller sergilenir. Her grup “dün-bugün-yarın” hikâyesini 1 dakikada anlatır." }
    ],
    urun: "Teknoloji zaman tüneli ve gelecek modeli",
    zengin: "Seçtiği teknolojinin çevreye etkisinin zaman içinde nasıl değiştiğini karşılaştırır.",
    destek: "Zaman tüneli görsel kartlarla (kes-yapıştır) oluşturulur.",
    ekler: [
      { baslik: "TEKNOLOJİ ZAMAN TÜNELİ", yonerge: "Seçtiğin teknolojinin geçmişini, bugününü ve geleceğini çiz ve anlat.",
        bloklar: [
          { t: "boxes", cols: 1, h: 14, items: ["Seçtiğim teknoloji:"] },
          { t: "boxes", cols: 3, h: 58, items: ["DÜN (çizim + not)", "BUGÜN (çizim + not)", "YARIN 2075 (çizim + not)"] },
          { t: "table", cols: ["", "Dün", "Bugün", "Yarın"], rows: [["Hangi problemi çözüyor?"], ["Yeni hangi sorunu getiriyor?"]] }
        ] },
      { baslik: "DİJİTAL GÜVENLİK KARTLARI", yonerge: "Kartları kes. Paylaşılabilir bilgileri yeşil, paylaşılmaması gerekenleri kırmızı bölgeye koy. Sonra güçlü bir şifre kuralı yaz.",
        bloklar: [
          { t: "cards", items: ["En sevdiğim renk", "Ev adresim", "Okulumun adı ve sınıfım", "En sevdiğim kitap", "Şifrem", "Annemin telefon numarası", "Bugün yaptığım resim", "Konumum"] },
          { t: "boxes", cols: 2, h: 40, items: ["PAYLAŞILABİLİR", "PAYLAŞILMAZ"] },
          { t: "lines", label: "Güçlü şifre kuralım:", n: 2 }
        ] }
    ]
  },
  "31": {
    ad: "YAPAY ZEKÂ GÜNLÜK HAYATTA",
    soru: "Bir makine nasıl “öğrenir”?",
    giris: "Öğrencilere günlük hayattan görseller gösterilir: sesli asistan, yüz tanıyan telefon, film öneren uygulama, robot süpürge. Hangilerinde yapay zekâ olduğu tahmin edilir.",
    dersler: [
      { baslik: "Yapay zekâ avı", metin: "Öğrenciler evde, okulda ve sokakta karşılaştıkları akıllı sistemleri Ek 1'e listeler." },
      { baslik: "İnsan makine oyunu", metin: "Bir öğrenci “makine” olur. Sınıf ona kedi ve köpek resimleri gösterip etiket söyler; makine kural çıkarır, sonra yeni bir resmi tahmin eder." },
      { baslik: "Örnekten öğrenme", metin: "Gruplar Ek 2'deki meyve kartlarıyla bir sınıflandırma kuralı “öğretir”. Az ve yanlış örnek verilince makinenin nasıl hata yaptığı gösterilir." },
      { baslik: "Yapay zekâ ve sorumluluk", metin: "“Yapay zekâ yanlış karar verirse kim sorumlu?” sorusu tartışılır; yapay zekâ kullanırken uyulacak üç kural yazılır." },
      { baslik: "Bir problem, bir yardımcı", metin: "Gruplar okullarındaki bir problem için yapay zekâlı bir yardımcı tasarlar: ne öğrenecek, hangi örneklerden, neye karar verecek?" }
    ],
    urun: "Yapay zekâlı okul yardımcısı tasarım kartı",
    zengin: "Tasarladığı yardımcının yanlış karar verebileceği bir durumu ve önlemini yazar.",
    destek: "İnsan makine oyunu iki kategori ve büyük resimli kartlarla oynanır.",
    ekler: [
      { baslik: "YAPAY ZEKÂ AVI", yonerge: "Karşılaştığın akıllı sistemleri yaz. Ne öğrendiğini ve neye karar verdiğini düşün.",
        bloklar: [
          { t: "table", cols: ["Nerede?", "Akıllı sistem", "Neyi öğreniyor?", "Neye karar veriyor?"], rows: [["Evde"], ["Okulda"], ["Sokakta"], ["Telefonda"]] },
          { t: "lines", label: "Yapay zekâ kullanırken uyacağım üç kural:", n: 3 }
        ] },
      { baslik: "MAKİNEYE ÖĞRET • ÖRNEK KARTLARI", yonerge: "Kartları kes. Makineye önce sadece 2 örnek göster, sonra 8 örnek. Hangisinde daha az hata yaptı?",
        bloklar: [
          { t: "cards", items: ["Elma • kırmızı • yuvarlak", "Muz • sarı • uzun", "Çilek • kırmızı • küçük", "Limon • sarı • yuvarlak", "Kiraz • kırmızı • küçük", "Mısır • sarı • uzun", "Domates • kırmızı • yuvarlak", "Armut • sarı • damla"] },
          { t: "boxes", cols: 2, h: 30, items: ["2 örnekle makinenin kuralı", "8 örnekle makinenin kuralı"] },
          { t: "boxes", cols: 1, h: 30, items: ["OKUL YARDIMCIMIZ: Problem → Ne öğrenecek? → Neye karar verecek?"] }
        ] }
    ]
  },
  "32": {
    ad: "MÜHENDİSLİK DÜNYASI",
    soru: "Bir köprüyü kaç farklı mühendis birlikte yapar?",
    giris: "Okul binasının fotoğrafı gösterilir. Öğrenciler binanın yapımında kimlerin çalıştığını tahmin eder (inşaat, elektrik, makine, bilgisayar mühendisi…).",
    dersler: [
      { baslik: "Mühendis kartları", metin: "Gruplar Ek 1'deki iş kartlarını doğru mühendislik dalıyla eşleştirir ve tabloya yerleştirir." },
      { baslik: "Mühendis ekibi", metin: "Her grup “oyun parkı” projesi için hangi mühendislere ihtiyaç duyacağını belirler ve görevlerini yazar." }
    ],
    urun: "Mühendislik dalları sınıflandırma tablosu",
    zengin: "Yeni ortaya çıkan bir mühendislik dalını (uzay, yapay zekâ, biyomedikal) araştırır.",
    destek: "Mühendislik dalları dörtle sınırlanır, her biri simgeyle gösterilir.",
    ekler: [
      { baslik: "MÜHENDİS KİM? • İŞ KARTLARI", yonerge: "İş kartlarını kes ve ilgili mühendislik dalının altına yapıştır.",
        bloklar: [
          { t: "cards", items: ["Köprü tasarlar", "Robot kolu yapar", "Telefon uygulaması yazar", "Barajı hesaplar", "Elektrik şebekesi kurar", "Uçak motoru geliştirir", "Yapay kalp kapakçığı tasarlar", "Toprağı sulama sistemi kurar"] },
          { t: "boxes", cols: 3, h: 40, items: ["İnşaat", "Makine", "Elektrik-Elektronik", "Bilgisayar", "Biyomedikal", "Ziraat"] },
          { t: "lines", label: "Oyun parkı projemizde çalışacak mühendisler ve görevleri:", n: 3 }
        ] }
    ]
  },
  "33": {
    ad: "TERSİNE MÜHENDİSLİK ATÖLYESİ",
    soru: "Bir şeyin nasıl çalıştığını anlamak için onu sökmek mi, yapmak mı daha öğreticidir?",
    giris: "Öğrencilere içi görünmeyen bir tükenmez kalem verilir. “Bu kalem nasıl çalışıyor?” sorusuna önce tahminle, sonra kalemi sökerek cevap ararlar.",
    dersler: [
      { baslik: "Söküm planı", metin: "Gruplar güvenli bir nesne seçer (basmalı kalem, mandal, el feneri, eski oyuncak). Sökmeden önce parçalarını tahmin edip Ek 1'e çizer." },
      { baslik: "Sök ve kaydet", metin: "Nesne dikkatle sökülür. Her parça numaralanıp çizilir; görevi tahmin edilir." },
      { baslik: "Nasıl çalışıyor?", metin: "Gruplar parçaların birlikte nasıl çalıştığını ok çizimleriyle açıklar ve nesneyi tekrar birleştirir." },
      { baslik: "Geliştir", metin: "Gruplar nesneyi daha iyi yapmak için bir değişiklik önerir. Mühendislik (tasarla → yap) ile tersine mühendislik (incele → anla → geliştir) karşılaştırılır." },
      { baslik: "Paylaşma", metin: "Gruplar patlatılmış çizimlerini ve geliştirme önerilerini sergiler." }
    ],
    urun: "Patlatılmış parça çizimi ve geliştirme önerisi",
    zengin: "Seçtiği nesnenin ilk hâlini araştırıp zaman içinde nasıl değiştiğini karşılaştırır.",
    destek: "Az parçalı nesneler (mandal, basmalı kalem) seçilir; parça adları hazır verilir.",
    ekler: [
      { baslik: "TERSİNE MÜHENDİSLİK DOSYASI", yonerge: "Sökmeden önce tahmin et, söktükten sonra her parçayı çiz ve görevini yaz.",
        bloklar: [
          { t: "boxes", cols: 2, h: 40, items: ["Sökmeden önce: İçinde neler var? (tahmin çizimi)", "Patlatılmış çizim (parçalar ayrı ayrı)"] },
          { t: "table", cols: ["No", "Parça", "Görevi", "Malzemesi"], rows: 6 },
          { t: "table", cols: ["", "Mühendislik", "Tersine mühendislik"], rows: [["Nereden başlar?"], ["Ne yapar?"], ["Ne üretir?"]] },
          { t: "lines", label: "Geliştirme önerim:", n: 2 }
        ] }
    ]
  },
  "34": {
    ad: "MUCİTLER VE BULUŞLAR",
    soru: "Bir buluş, mucidin aklına birden mi gelir?",
    giris: "Cırt cırt bandın buluş öyküsü anlatılır: George de Mestral köpeğinin tüyüne yapışan dikenleri büyüteçle inceler. Öğrenciler “Sen olsan ne fark ederdin?” sorusunu cevaplar.",
    dersler: [
      { baslik: "Mucit kartları", metin: "Gruplar Ek 1'deki mucit-buluş kartlarını eşleştirir: Cezeri, Hezarfen Ahmed Çelebi, Edison, Marie Curie, Gazi Yaşargil, Cahit Arf…" },
      { baslik: "Mucidin yolculuğu", metin: "Her grup bir mucidi araştırır ve Ek 2'de buluş yolculuğunu çizer: fark ettiği problem → denemeler → hatalar → buluş." },
      { baslik: "Toplumu değiştiren buluş", metin: "“Bu buluş olmasaydı bugün hayatımız nasıl olurdu?” sorusu tartışılır." },
      { baslik: "Benim buluşum", metin: "Öğrenciler günlük hayattaki küçük bir sıkıntıya buluş tasarlar ve basit malzemelerle maket yapar." },
      { baslik: "Mucitler fuarı", metin: "Maketler sergilenir; öğrenciler buluşlarının adını, çözdüğü problemi ve kimlere faydalı olacağını anlatır." }
    ],
    urun: "Mucit yolculuğu posteri ve buluş maketi",
    zengin: "Kendi buluşunun olası yan etkisini düşünüp bir iyileştirme ekler.",
    destek: "Mucit kartlarında görsel ipuçları bulunur; buluş tasarımı hazır şablonla yapılır.",
    ekler: [
      { baslik: "MUCİT-BULUŞ EŞLEŞTİRME KARTLARI", yonerge: "Kartları kes. Her mucidi buluşuyla eşleştir.",
        bloklar: [
          { t: "cards", items: ["El-Cezerî", "Otomatik su saati ve mekanik düzenekler", "Hezarfen Ahmed Çelebi", "Yapay kanatlarla uçuş denemesi", "Thomas Edison", "Uzun süre yanan ampul", "Marie Curie", "Radyoaktivite araştırmaları", "Gazi Yaşargil", "Mikrocerrahi teknikleri", "Cahit Arf", "Arf değişmezi (matematik)"] }
        ] },
      { baslik: "MUCİDİN YOLCULUĞU • BENİM BULUŞUM", yonerge: "Önce araştırdığın mucidin yolculuğunu, sonra kendi buluşunu yaz.",
        bloklar: [
          { t: "boxes", cols: 4, h: 38, items: ["Fark ettiği problem", "Denemeleri", "Hataları", "Buluşu"] },
          { t: "boxes", cols: 2, h: 52, items: ["Benim buluşumun çizimi", "Adı • Çözdüğü problem • Kimlere faydalı?"] },
          { t: "ticket" }
        ] }
    ]
  }
};
