// Çevrim dışı kullanım: uygulama kabuğu önceden, PDF'ler açıldıkça önbelleğe alınır.
const SURUM = "masa-v2";
const KABUK = ["./", "index.html", "css/masa.css", "js/plan-data.js", "js/takvim.js", "js/ozgun-etkinlikler.js", "js/gunler.js", "js/kodlama.js", "js/masa.js",
  "manifest.webmanifest", "img/ikon-192.png", "img/ikon-512.png"];

self.addEventListener("install", (e) => { e.waitUntil(caches.open(SURUM).then((c) => c.addAll(KABUK))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== SURUM).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  // Kabuk: önce ağ (güncel kalsın), olmazsa önbellek. PDF: önce önbellek.
  const pdf = e.request.url.includes("/pdf/");
  e.respondWith(
    pdf
      ? caches.match(e.request).then((r) => r || fetch(e.request).then((y) => { const k = y.clone(); caches.open(SURUM).then((c) => c.put(e.request, k)); return y; }))
      : fetch(e.request).then((y) => { const k = y.clone(); caches.open(SURUM).then((c) => c.put(e.request, k)); return y; }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
