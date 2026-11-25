// Kodlama Atölyesi: her haftanın Arduino'ya yüklenecek hazır kodu (öğretmen kodu).
// Pinler js/devre.js'deki bağlantı şemalarıyla birebir aynıdır. Seri Monitör ve LCD yazılarında Türkçe karakter yok (ekran bozmasın diye).
// v: DEVRE.H[no] içindeki devre sırası; lib: Kütüphane Yöneticisi'nden kurulacak kütüphaneler; ayar: öğrencinin değiştirebileceği sayılar.
window.KODLAR = (function () {
  const SERVO_TEST = `// Servo motoru tanıyorum: servo 0, 90 ve 180 dereceye sırayla gider.
#include <Servo.h>

Servo servo;              // servomuzun adı
const int SERVO_PIN = 9;  // turuncu kablo D9'da

void setup() {
  servo.attach(SERVO_PIN);
  Serial.begin(9600);
}

void loop() {
  int acilar[] = {0, 90, 180, 90};   // sırayla gidilecek açılar
  for (int i = 0; i < 4; i++) {
    servo.write(acilar[i]);
    Serial.print("Aci: ");
    Serial.println(acilar[i]);
    delay(1000);                     // 1 saniye bekle
  }
}`;

  const KAPAK = `// Akıllı kapak: el 20 cm'den yakına gelince kapak açılır, 3 saniye sonra kapanır.
#include <Servo.h>

const int TRIG_PIN = 7;
const int ECHO_PIN = 8;
const int SERVO_PIN = 9;

const int ESIK_CM = 20;      // bu mesafeden yakınsa kapak açılır
const int ACIK_ACI = 90;     // kapağın açık açısı
const int KAPALI_ACI = 0;    // kapağın kapalı açısı

Servo kapak;

long mesafeOlc() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);      // 10 mikrosaniyelik ses dalgası yolla
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long sure = pulseIn(ECHO_PIN, HIGH, 30000);  // yankının dönme süresi
  if (sure == 0) return 999;         // yankı gelmediyse çok uzak say
  return sure / 58;                  // süreyi santimetreye çevir
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  kapak.attach(SERVO_PIN);
  kapak.write(KAPALI_ACI);
  Serial.begin(9600);
}

void loop() {
  long cm = mesafeOlc();
  Serial.print("Mesafe: ");
  Serial.print(cm);
  Serial.println(" cm");

  if (cm < ESIK_CM) {
    kapak.write(ACIK_ACI);   // aç
    delay(3000);             // 3 saniye açık kalsın
    kapak.write(KAPALI_ACI); // kapat
    delay(500);
  }
  delay(100);
}`;

  const MESAFE = `long mesafeOlc() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long sure = pulseIn(ECHO_PIN, HIGH, 30000);
  if (sure == 0) return 999;   // yankı yoksa çok uzak say
  return sure / 58;            // cm
}`;

  const MOTOR = `// L298N pinleri: sol motor IN1-IN2-ENA, sağ motor IN3-IN4-ENB
const int IN1 = 2;
const int IN2 = 3;
const int IN3 = 4;
const int IN4 = 5;
const int ENA = 10;
const int ENB = 11;

int hiz = 180;   // 0-255 arası motor hızı

void motorlar(int solYon, int sagYon) {   // 1 ileri, -1 geri, 0 dur
  digitalWrite(IN1, solYon == 1);
  digitalWrite(IN2, solYon == -1);
  digitalWrite(IN3, sagYon == 1);
  digitalWrite(IN4, sagYon == -1);
  if (hiz >= 255) {                         // tam hız: PWM gerekmez
    digitalWrite(ENA, solYon != 0);
    digitalWrite(ENB, sagYon != 0);
  } else {
    analogWrite(ENA, solYon == 0 ? 0 : hiz);
    analogWrite(ENB, sagYon == 0 ? 0 : hiz);
  }
}
void ileri() { motorlar(1, 1); }
void geri()  { motorlar(-1, -1); }
void sag()   { motorlar(1, -1); }   // yerinde sağa dön
void sol()   { motorlar(-1, 1); }   // yerinde sola dön
void dur()   { motorlar(0, 0); }

void motorKur() {
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT); pinMode(ENB, OUTPUT);
  dur();
}`;

  const TMP_OKU = `float sicaklikOku() {          // TMP36: 0,5 V = 0 derece, her derece 0,01 V
  int ham = analogRead(TMP_PIN);
  float volt = ham * 5.0 / 1023.0;
  return (volt - 0.5) * 100.0;
}`;

  const K = {
    4: [{ v: 0, kod: SERVO_TEST }],
    5: [{ v: 0, lib: ["Servo"], kod: KAPAK, ayar: "ESIK_CM: kaç cm'de açılsın · ACIK_ACI: kapak ne kadar açılsın" }],
    6: [{ v: 0, kod: KAPAK, ayar: "ESIK_CM: kaç cm'de açılsın · ACIK_ACI: kapak ne kadar açılsın" }],
    7: [{ v: 0, kod: SERVO_TEST }],
    8: [{ v: 0, ayar: "Geliştirme için LED'i her basışta değiştiren kodu yapay zekâyla birlikte yazın.", kod: `// Basınca yanan lamba: butona basılınca LED yanar, bırakınca söner.
const int BUTON_PIN = 2;   // buton (10k aşağı çekme dirençli)
const int LED_PIN = 12;    // LED (220 ohm dirençli)

void setup() {
  pinMode(BUTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int durum = digitalRead(BUTON_PIN);   // basılıysa 1 (HIGH), değilse 0 (LOW)
  Serial.println(durum);

  if (durum == HIGH) {
    digitalWrite(LED_PIN, HIGH);   // yak
  } else {
    digitalWrite(LED_PIN, LOW);    // söndür
  }
  delay(20);
}` }],
    9: [{ v: 0, ayar: "ESIK: Seri Monitörde sınıfın ışığındaki ve el gölgesindeki değerlere bakıp ikisinin arasına koyun.", kod: `// Gece lambası: ortam kararınca LED kendiliğinden yanar.
const int LDR_PIN = A0;   // LDR + 10k direnç (gerilim bölücü)
const int LED_PIN = 12;

int ESIK = 300;   // bu değerin altı "karanlık" sayılır

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int isik = analogRead(LDR_PIN);   // aydınlıkta büyük, karanlıkta küçük (0-1023)
  Serial.print("Isik: ");
  Serial.println(isik);

  if (isik < ESIK) {
    digitalWrite(LED_PIN, HIGH);    // karanlık: yak
  } else {
    digitalWrite(LED_PIN, LOW);     // aydınlık: söndür
  }
  delay(200);
}` }],
    10: [{ v: 0, ayar: "FARK: panel titriyorsa büyüt · ADIM: daha hızlı dönsün diye büyüt. Panel ışıktan kaçıyorsa iki ADIM satırındaki + ile − işaretlerini yer değiştirin.", kod: `// Güneşi takip eden panel: hangi LDR daha aydınlıksa servo o tarafa döner.
#include <Servo.h>

const int SOL_LDR = A0;
const int SAG_LDR = A1;
const int SERVO_PIN = 9;

const int FARK = 50;   // fark bundan küçükse panel durur
const int ADIM = 2;    // her seferde kaç derece dönsün

Servo panel;
int aci = 90;          // ortadan başla

void setup() {
  panel.attach(SERVO_PIN);
  panel.write(aci);
  Serial.begin(9600);
}

void loop() {
  int sol = analogRead(SOL_LDR);
  int sag = analogRead(SAG_LDR);

  if (sol - sag > FARK) {
    aci = aci + ADIM;          // sol daha aydınlık: sola dön
  } else if (sag - sol > FARK) {
    aci = aci - ADIM;          // sağ daha aydınlık: sağa dön
  }
  aci = constrain(aci, 0, 180);   // servo 0-180 arasında kalsın
  panel.write(aci);

  Serial.print("Sol: "); Serial.print(sol);
  Serial.print("  Sag: "); Serial.print(sag);
  Serial.print("  Aci: "); Serial.println(aci);
  delay(50);
}` }],
    11: [{ v: 0, kod: `// Düğmeyle yönetilen robot kol: potansiyometre çevrildikçe servo döner.
#include <Servo.h>

const int POT_PIN = A1;
const int SERVO_PIN = 9;

Servo kol;

void setup() {
  kol.attach(SERVO_PIN);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(POT_PIN);          // 0-1023
  int aci = map(deger, 0, 1023, 0, 180);    // 0-180 dereceye çevir
  kol.write(aci);

  Serial.print("Pot: "); Serial.print(deger);
  Serial.print("  Aci: "); Serial.println(aci);
  delay(20);
}` }],
    12: [{ v: 0, ayar: "notalar ve sureler dizilerine kendi şarkının notalarını ekleyin (iki dizinin eleman sayısı aynı olmalı).", kod: `// Işık ve ses gösterisi: do-re-mi çalarken her notada LED yanar.
const int LED_PIN = 12;
const int BUZZER_PIN = 6;

// Notaların frekansları (Hz): do 262, re 294, mi 330, fa 349, sol 392
int notalar[] = {262, 294, 330, 262, 330, 294, 262};
int sureler[] = {400, 400, 400, 400, 400, 400, 800};   // milisaniye
const int NOTA_SAYISI = 7;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  for (int i = 0; i < NOTA_SAYISI; i++) {
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, notalar[i], sureler[i]);
    delay(sureler[i]);
    digitalWrite(LED_PIN, LOW);
    delay(80);                       // notalar arası kısa sessizlik
  }
  delay(2000);                       // şarkıyı 2 saniye sonra tekrarla
}` }],
    13: [{ v: 0, ayar: "UZAK_CM, COK_YAKIN_CM: uyarının başladığı ve sürekli öttüğü mesafeler.", kod: `// Park sensörü: engel yaklaştıkça bip sesi sıklaşır, çok yakında sürekli öter.
const int TRIG_PIN = 7;
const int ECHO_PIN = 8;
const int BUZZER_PIN = 6;
const int LED_PIN = 12;

const int UZAK_CM = 50;       // bundan uzaksa ses yok
const int COK_YAKIN_CM = 5;   // bundan yakınsa sürekli ses + LED

${MESAFE}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long cm = mesafeOlc();
  Serial.print("Mesafe: ");
  Serial.print(cm);
  Serial.println(" cm");

  if (cm > UZAK_CM) {
    noTone(BUZZER_PIN);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  } else if (cm <= COK_YAKIN_CM) {
    tone(BUZZER_PIN, 1000);           // sürekli öt
    digitalWrite(LED_PIN, HIGH);
    delay(100);
  } else {
    digitalWrite(LED_PIN, LOW);
    int bekle = map(cm, COK_YAKIN_CM, UZAK_CM, 60, 600);   // yaklaştıkça kısa bekleme
    tone(BUZZER_PIN, 1000, 80);       // kısa bip
    delay(bekle);
  }
}` }],
    14: [{ v: 0, lib: ["DHT sensor library (Adafruit)", "Adafruit Unified Sensor"], ayar: "SICAK_ESIK: LED'in yanacağı sıcaklık.", kod: `// Dijital termometre (gerçek devre, DHT11): sıcaklık ve nemi 2 saniyede bir yazar.
#include <DHT.h>

const int DHT_PIN = 3;
const int LED_PIN = 12;
float SICAK_ESIK = 26.0;    // bu sıcaklığın üstünde LED yanar

DHT dht(DHT_PIN, DHT11);

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);                          // DHT11 en fazla 2 saniyede bir ölçer
  float sicaklik = dht.readTemperature();
  float nem = dht.readHumidity();

  if (isnan(sicaklik) || isnan(nem)) {  // okunamadıysa kabloları kontrol et
    Serial.println("Sensor okunamadi! Kablolari kontrol et.");
    return;
  }

  Serial.print("Sicaklik: "); Serial.print(sicaklik); Serial.print(" C   ");
  Serial.print("Nem: %"); Serial.println(nem);

  digitalWrite(LED_PIN, sicaklik > SICAK_ESIK ? HIGH : LOW);
}` },
      { v: 1, ayar: "SICAK_ESIK: LED'in yanacağı sıcaklık. Tinkercad'de sensöre tıklayıp kaydırıcıyla sıcaklığı değiştirin.", kod: `// Dijital termometre (Tinkercad, TMP36): sıcaklığı her saniye yazar.
const int TMP_PIN = A2;
const int LED_PIN = 12;
float SICAK_ESIK = 26.0;

${TMP_OKU}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float sicaklik = sicaklikOku();
  Serial.print("Sicaklik: ");
  Serial.print(sicaklik);
  Serial.println(" C");
  digitalWrite(LED_PIN, sicaklik > SICAK_ESIK ? HIGH : LOW);
  delay(1000);
}` }],
    15: [{ v: 0, lib: ["DHT sensor library (Adafruit)", "Adafruit Unified Sensor"], ayar: "ACMA ve KAPAMA sıcaklıkları (arada en az 1-2 derece fark bırakın).", kod: `// Akıllı sera (gerçek devre): 27 derecede fan açılır, 25 derecenin altında kapanır.
#include <DHT.h>

const int DHT_PIN = 3;
const int FAN_PIN = 10;     // transistörün B bacağı (1k dirençle)
const int LED_PIN = 12;

float ACMA = 27.0;          // fan bu sıcaklığın üstünde açılır
float KAPAMA = 25.0;        // fan bu sıcaklığın altında kapanır

DHT dht(DHT_PIN, DHT11);
bool fanAcik = false;

void setup() {
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float sicaklik = dht.readTemperature();
  if (isnan(sicaklik)) {
    Serial.println("Sensor okunamadi!");
    return;
  }

  if (!fanAcik && sicaklik > ACMA) fanAcik = true;     // ısındı: aç
  if (fanAcik && sicaklik < KAPAMA) fanAcik = false;   // soğudu: kapat

  digitalWrite(FAN_PIN, fanAcik ? HIGH : LOW);
  digitalWrite(LED_PIN, fanAcik ? HIGH : LOW);

  Serial.print("Sicaklik: "); Serial.print(sicaklik);
  Serial.println(fanAcik ? " C  Fan: ACIK" : " C  Fan: KAPALI");
}` },
      { v: 1, ayar: "ACMA ve KAPAMA sıcaklıkları.", kod: `// Akıllı sera (Tinkercad, TMP36 + motor): 27 derecede motor döner, 25'in altında durur.
const int TMP_PIN = A2;
const int FAN_PIN = 10;
const int LED_PIN = 12;

float ACMA = 27.0;
float KAPAMA = 25.0;
bool fanAcik = false;

${TMP_OKU}

void setup() {
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float sicaklik = sicaklikOku();
  if (!fanAcik && sicaklik > ACMA) fanAcik = true;
  if (fanAcik && sicaklik < KAPAMA) fanAcik = false;

  digitalWrite(FAN_PIN, fanAcik ? HIGH : LOW);
  digitalWrite(LED_PIN, fanAcik ? HIGH : LOW);

  Serial.print("Sicaklik: "); Serial.print(sicaklik);
  Serial.println(fanAcik ? " C  Fan: ACIK" : " C  Fan: KAPALI");
  delay(500);
}` }],
    16: [{ v: 0, ayar: "SUSTURMA_SN: butona basınca alarm kaç saniye susacak.", kod: `// Hareket alarmı: PIR hareket görünce buzzer öter ve LED yanıp söner.
// Butona basınca alarm susar ve 10 saniye boyunca tekrar ötmez.
const int PIR_PIN = 4;
const int BUZZER_PIN = 6;
const int BUTON_PIN = 2;   // susturma butonu (10k aşağı çekme dirençli)
const int LED_PIN = 12;

const unsigned long SUSTURMA_SN = 10;
unsigned long susturmaBitis = 0;   // alarmın tekrar çalışabileceği an

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUTON_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR isiniyor, 30 saniye bekle...");
}

void loop() {
  if (digitalRead(BUTON_PIN) == HIGH) {
    susturmaBitis = millis() + SUSTURMA_SN * 1000;
    noTone(BUZZER_PIN);
    digitalWrite(LED_PIN, LOW);
    Serial.println("Alarm susturuldu.");
  }

  bool susturuldu = millis() < susturmaBitis;
  bool hareket = digitalRead(PIR_PIN) == HIGH;

  if (hareket && !susturuldu) {
    Serial.println("HAREKET VAR!");
    tone(BUZZER_PIN, 1500);
    digitalWrite(LED_PIN, HIGH);
    delay(150);
    noTone(BUZZER_PIN);
    digitalWrite(LED_PIN, LOW);
    delay(150);
  } else {
    noTone(BUZZER_PIN);
    digitalWrite(LED_PIN, LOW);
    delay(50);
  }
}` }],
    17: [{ v: 0, ayar: "KURU ve ISLAK: sensörü önce kuru, sonra ıslak toprağa koyup Seri Monitörde gördüğünüz değerleri yazın. Eşik ikisinin ortası olur.", kod: `// Bitkim susadı: toprak kuruyunca LED yanar, buzzer 3 kez öter, sonra 1 dakika bekler.
const int NEM_PIN = A3;
const int LED_PIN = 12;
const int BUZZER_PIN = 6;

// KALİBRASYON: kendi ölçtüğün değerleri yaz
int KURU = 900;    // sensör kuru topraktayken okunan değer
int ISLAK = 400;   // sensör ıslak topraktayken okunan değer

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(NEM_PIN);
  int esik = (KURU + ISLAK) / 2;
  // Bazı sensörlerde kuru toprak büyük, bazılarında küçük değer verir; ikisi de çalışsın:
  bool kuru = (KURU > ISLAK) ? (deger > esik) : (deger < esik);

  Serial.print("Nem degeri: "); Serial.print(deger);
  Serial.println(kuru ? "  -> KURU, sula!" : "  -> nemli");

  if (kuru) {
    digitalWrite(LED_PIN, HIGH);
    for (int i = 0; i < 3; i++) {     // 3 kısa bip
      tone(BUZZER_PIN, 1200, 150);
      delay(300);
    }
    delay(60000);                      // 1 dakika bekle
  } else {
    digitalWrite(LED_PIN, LOW);
    delay(1000);
  }
}` }],
    19: [{ v: 0, kod: `// Ruh hâli lambası: potansiyometre çevrildikçe renk gökkuşağı sırasıyla değişir.
const int KIRMIZI = 9;    // ~ işaretli (PWM) pinler
const int YESIL = 10;
const int MAVI = 11;
const int POT_PIN = A1;

void renk(int r, int g, int b) {   // her renk 0-255
  analogWrite(KIRMIZI, r);
  analogWrite(YESIL, g);
  analogWrite(MAVI, b);
}

void setup() {
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(MAVI, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(POT_PIN);             // 0-1023
  int ton = map(deger, 0, 1023, 0, 1529);      // gökkuşağında 6 bölüm x 255
  int bolum = ton / 255;
  int x = ton % 255;

  if (bolum == 0)      renk(255, x, 0);         // kırmızı -> sarı
  else if (bolum == 1) renk(255 - x, 255, 0);   // sarı -> yeşil
  else if (bolum == 2) renk(0, 255, x);         // yeşil -> turkuaz
  else if (bolum == 3) renk(0, 255 - x, 255);   // turkuaz -> mavi
  else if (bolum == 4) renk(x, 0, 255);         // mavi -> mor
  else                 renk(255, 0, 255 - x);   // mor -> kırmızı

  Serial.print("Pot: "); Serial.print(deger);
  Serial.print("  Bolum: "); Serial.println(bolum);
  delay(20);
}` }],
    20: [{ v: 0, ayar: "PENCERE_MS: iki alkış arasındaki en uzun süre. Sensörün mavi vidasını sessizken DO ışığı sönük kalacak şekilde ayarlayın.", kod: ALKIS("ses sensörü (DO)") },
      { v: 1, ayar: "PENCERE_MS: iki basış arasındaki en uzun süre.", kod: ALKIS("alkış butonu") }],
    21: [{ v: 0, lib: ["IRremote (Armin Joachimsmeyer, 4.x sürümü)"], ayar: "TUS_1, TUS_2, TUS_3: önce Seri Monitörde kendi kumandanızın tuş kodlarını görün ve buraya yazın.", kod: `// Kumandalı kapı: 1 tuşu 0 derece, 2 tuşu 90 derece, 3 tuşu 180 derece.
// Önce Seri Monitörü aç (9600), kumandada tuşlara bas, görünen kodları aşağıya yaz.
#include <IRremote.hpp>
#include <Servo.h>

const int IR_PIN = 11;
const int SERVO_PIN = 9;

// Tuş kodları (birçok küçük kumandada bunlardır; seninki farklıysa değiştir)
const int TUS_1 = 0x0C;
const int TUS_2 = 0x18;
const int TUS_3 = 0x5E;

Servo kapi;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(IR_PIN);
  kapi.attach(SERVO_PIN);
  kapi.write(0);
  Serial.println("Kumandada bir tusa bas...");
}

void loop() {
  if (IrReceiver.decode()) {
    int kod = IrReceiver.decodedIRData.command;
    Serial.print("Tus kodu: 0x");
    Serial.println(kod, HEX);

    if (kod == TUS_1) kapi.write(0);
    else if (kod == TUS_2) kapi.write(90);
    else if (kod == TUS_3) kapi.write(180);

    IrReceiver.resume();   // sıradaki tuşa hazırlan
  }
}` }],
    22: [{ v: 0, lib: ["LiquidCrystal I2C (Frank de Brabander)"], ayar: "ISIM: ikinci satırda kayacak yazı. Ekran yazmıyorsa 0x27 yerine 0x3F deneyin; yalnız kutucuklar görünüyorsa arkadaki mavi vidayla kontrastı ayarlayın.", kod: `// Karşılama tabelası: 1. satır sabit, 2. satırda isim sağdan sola kayar.
// LCD: SDA -> A4, SCL -> A5
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // adres 0x27 (olmazsa 0x3F)

String ISIM = "Kodlama Atolyesi";     // Türkçe harf yerine i, o, u, s, g, c kullan

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);       // sütun 0, satır 0
  lcd.print("Hos geldiniz");
}

void loop() {
  String bant = "                " + ISIM + "                ";   // başında ve sonunda 16 boşluk
  for (int i = 0; i <= bant.length() - 16; i++) {
    lcd.setCursor(0, 1);     // ikinci satır
    lcd.print(bant.substring(i, i + 16));
    delay(300);
  }
}` }],
    23: [{ v: 0, lib: ["DHT sensor library (Adafruit)", "Adafruit Unified Sensor", "LiquidCrystal I2C (Frank de Brabander)"], ayar: "18 ve 25: 'Rahat' aralığının sınırları. SICAK olunca LED yanar.", kod: `// Mini hava istasyonu (gerçek devre): sıcaklık ve nem LCD'de, durum "Rahat/Sicak/Soguk".
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int DHT_PIN = 3;
const int LED_PIN = 12;

DHT dht(DHT_PIN, DHT11);
LiquidCrystal_I2C lcd(0x27, 16, 2);   // olmazsa 0x3F

void setup() {
  pinMode(LED_PIN, OUTPUT);
  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.print("Olculuyor...");
}

void loop() {
  delay(2000);
  float sicaklik = dht.readTemperature();
  float nem = dht.readHumidity();
  if (isnan(sicaklik) || isnan(nem)) {
    lcd.clear();
    lcd.print("Sensor hatasi!");
    return;
  }

  String durum = "Rahat";
  if (sicaklik > 25) durum = "Sicak";
  if (sicaklik < 18) durum = "Soguk";
  digitalWrite(LED_PIN, durum == "Sicak" ? HIGH : LOW);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sicaklik: ");
  lcd.print((int)sicaklik);
  lcd.print(" C");
  lcd.setCursor(0, 1);
  lcd.print("Nem: %");
  lcd.print((int)nem);
  lcd.print(" ");
  lcd.print(durum);
}` },
      { v: 1, lib: ["LiquidCrystal I2C"], ayar: "Tinkercad'de ekran boş kalırsa adresi 0x20 yapın (Tinkercad'in I2C ekranında varsayılan adres 32 = 0x20 olabilir).", kod: `// Mini hava istasyonu (Tinkercad, TMP36 + I2C LCD).
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int TMP_PIN = A2;
const int LED_PIN = 12;

LiquidCrystal_I2C lcd(0x27, 16, 2);

${TMP_OKU}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  lcd.init();
  lcd.backlight();
}

void loop() {
  float sicaklik = sicaklikOku();
  String durum = "Rahat";
  if (sicaklik > 25) durum = "Sicak";
  if (sicaklik < 18) durum = "Soguk";
  digitalWrite(LED_PIN, durum == "Sicak" ? HIGH : LOW);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sicaklik: ");
  lcd.print((int)sicaklik);
  lcd.print(" C");
  lcd.setCursor(0, 1);
  lcd.print(durum);
  delay(1000);
}` }],
    24: [{ v: 0, ayar: "YARIM ve DOLU: sensörü bardağa yarıya ve tam daldırıp Seri Monitörde gördüğünüz değerleri yazın.", kod: SU("Su seviye sensörü") }, { v: 1, ayar: "YARIM ve DOLU: potansiyometreyi çevirerek deneyin.", kod: SU("Potansiyometre (Tinkercad'de su seviyesi yerine)") }],
    25: [{ v: 0, ayar: "hiz: 0-255 arası. Motor ters dönüyorsa o motorun iki kablosunun yerini değiştirin.", kod: `// Motor sürücü: motorlar 2 saniye ileri, 1 saniye dur, 2 saniye geri, 1 saniye dur.
${MOTOR}

void setup() {
  motorKur();
  Serial.begin(9600);
}

void loop() {
  Serial.println("Ileri");
  ileri();
  delay(2000);

  Serial.println("Dur");
  dur();
  delay(1000);

  Serial.println("Geri");
  geri();
  delay(2000);

  Serial.println("Dur");
  dur();
  delay(1000);
}` }],
    26: [{ v: 0, ayar: "DONUS_MS: 90 derece dönmek için gereken süre; araba tam köşe yapana kadar deneyerek değiştirin.", kod: `// Kare çizen robot araba: 4 kez "ileri 1 saniye, sağa dön".
${MOTOR}

int DONUS_MS = 500;   // 90 derecelik dönüş süresi (deneyerek bul)

void setup() {
  motorKur();
  delay(3000);        // arabayı yere koyman için 3 saniye
}

void loop() {
  for (int kenar = 0; kenar < 4; kenar++) {
    ileri();
    delay(1000);
    sag();
    delay(DONUS_MS);
  }
  dur();
  while (true) {}     // kare bitti: dur ve bekle (yeniden başlatmak için RESET'e bas)
}` }],
    27: [{ v: 0, lib: ["Servo"], ayar: "ENGEL_CM: kaç cm'de dursun · DONUS_MS: ne kadar dönsün · hiz: motor hızı.", kod: `// Engelden kaçan araba: 20 cm'den yakın engel görünce durur, geri gider, iki yana bakar, boş tarafa döner.
#include <Servo.h>

const int TRIG_PIN = 7;
const int ECHO_PIN = 8;
const int SERVO_PIN = 9;   // sensör kafası

const int ENGEL_CM = 20;
int DONUS_MS = 400;

Servo kafa;

${MOTOR}

${MESAFE}

long bak(int aci) {         // sensör kafasını çevir ve ölç
  kafa.write(aci);
  delay(400);
  return mesafeOlc();
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  kafa.attach(SERVO_PIN);
  kafa.write(90);           // ileri bak
  motorKur();
  hiz = 255;   // DİKKAT: Servo kütüphanesi D9-D10'da hız ayarını (PWM) bozar; ENA D10'da olduğu için tam hızda sürüyoruz.
  Serial.begin(9600);
  delay(3000);
}

void loop() {
  long cm = mesafeOlc();
  Serial.print("Mesafe: "); Serial.println(cm);

  if (cm > ENGEL_CM) {
    ileri();
  } else {
    dur();
    delay(200);
    geri();
    delay(500);
    dur();

    long sagda = bak(20);    // sağa bak
    long solda = bak(160);   // sola bak
    kafa.write(90);
    delay(300);

    if (sagda >= solda) sag();   // hangi taraf daha boşsa oraya dön
    else sol();
    delay(DONUS_MS);
    dur();
  }
  delay(50);
}` }],
    28: [{ v: 0, ayar: "ESIK: sensörleri beyaz zemine ve siyah banda tutup Seri Monitördeki değerlerin ortasını yazın. Araba ters tepki veriyorsa SIYAH_BUYUK'u false yapın. hiz: virajlarda kaçıyorsa düşürün.", kod: `// Çizgi izleyen araba: iki sensörle siyah bandı takip eder.
${MOTOR}

const int SOL_SENSOR = A0;
const int SAG_SENSOR = A1;

int ESIK = 500;             // beyaz ile siyah arasındaki değer
bool SIYAH_BUYUK = true;    // siyah bantta değer büyüyorsa true

bool siyahMi(int deger) {
  return SIYAH_BUYUK ? deger > ESIK : deger < ESIK;
}

void setup() {
  motorKur();
  hiz = 140;                // çizgi izlerken yavaş git
  Serial.begin(9600);
  delay(3000);
}

void loop() {
  int solDeger = analogRead(SOL_SENSOR);
  int sagDeger = analogRead(SAG_SENSOR);
  bool solSiyah = siyahMi(solDeger);
  bool sagSiyah = siyahMi(sagDeger);

  Serial.print("Sol: "); Serial.print(solDeger);
  Serial.print("  Sag: "); Serial.println(sagDeger);

  if (!solSiyah && !sagSiyah) ileri();       // ikisi de beyaz: düz git
  else if (solSiyah && !sagSiyah) sol();     // çizgi solda kaldı: sola dön
  else if (!solSiyah && sagSiyah) sag();     // çizgi sağda kaldı: sağa dön
  else dur();                                // ikisi de siyah: dur
  delay(10);
}` }]
  };

  function ALKIS(ad) {
    return `// Alkışla yanan lamba: 1 saniye içinde iki alkış gelirse lamba durum değiştirir.
// Giriş: ${ad} D3'te. Tek alkışta bir şey olmaz.
const int SES_PIN = 3;
const int LED_PIN = 12;

const unsigned long PENCERE_MS = 1000;   // iki alkış arasındaki en uzun süre
const unsigned long SUSKU_MS = 150;      // aynı alkışın yankısını sayma

int alkisSayisi = 0;
unsigned long ilkAlkis = 0;
unsigned long sonAlkis = 0;
bool lambaAcik = false;
int oncekiDurum = LOW;

void setup() {
  pinMode(SES_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int durum = digitalRead(SES_PIN);
  unsigned long simdi = millis();

  if (durum == HIGH && oncekiDurum == LOW && simdi - sonAlkis > SUSKU_MS) {   // yeni bir alkış
    sonAlkis = simdi;
    if (alkisSayisi == 0) ilkAlkis = simdi;
    alkisSayisi++;
    Serial.print("Alkis: ");
    Serial.println(alkisSayisi);
  }
  oncekiDurum = durum;

  if (alkisSayisi >= 2) {
    if (simdi - ilkAlkis <= PENCERE_MS) {
      lambaAcik = !lambaAcik;
      digitalWrite(LED_PIN, lambaAcik ? HIGH : LOW);
      Serial.println(lambaAcik ? "Lamba ACIK" : "Lamba KAPALI");
    }
    alkisSayisi = 0;
  }
  if (alkisSayisi == 1 && simdi - ilkAlkis > PENCERE_MS) alkisSayisi = 0;   // tek alkış: sıfırla
}`;
  }
  function SU(ad) {
    return `// Taşma alarmı: su seviyesini "bos / yarim / dolu" diye yazar; dolu olunca buzzer öter.
// Giriş: ${ad} A3'te.
const int SU_PIN = A3;
const int BUZZER_PIN = 6;
const int LED_PIN = 12;

int YARIM = 300;   // bu değerin üstü "yarim"
int DOLU = 550;    // bu değerin üstü "dolu"

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(SU_PIN);
  Serial.print("Deger: ");
  Serial.print(deger);

  if (deger > DOLU) {
    Serial.println("  -> DOLU!");
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 2000, 200);
  } else if (deger > YARIM) {
    Serial.println("  -> yarim");
    digitalWrite(LED_PIN, LOW);
  } else {
    Serial.println("  -> bos");
    digitalWrite(LED_PIN, LOW);
  }
  delay(500);
}`;
  }

  return K;
})();
