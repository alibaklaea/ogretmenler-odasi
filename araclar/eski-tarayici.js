// Eski akıllı tahta tarayıcıları için eksik işlevler (yalnız internetsiz pakete girer)
(function () {
  var O = Object, A = Array.prototype, S = String.prototype;
  if (!O.getOwnPropertyDescriptors) O.getOwnPropertyDescriptors = function (o) { var r = {}; O.getOwnPropertyNames(o).concat(O.getOwnPropertySymbols(o)).forEach(function (k) { r[k] = O.getOwnPropertyDescriptor(o, k); }); return r; };
  if (!O.values) O.values = function (o) { return O.keys(o).map(function (k) { return o[k]; }); };
  if (!O.entries) O.entries = function (o) { return O.keys(o).map(function (k) { return [k, o[k]]; }); };
  if (!O.fromEntries) O.fromEntries = function (L) { var r = {}; Array.from(L).forEach(function (e) { r[e[0]] = e[1]; }); return r; };
  function tanim(t, ad, f) { if (!t[ad]) O.defineProperty(t, ad, { value: f, writable: true, configurable: true }); }
  tanim(A, "flat", function (d) { d = d === undefined ? 1 : d; return this.reduce(function (r, x) { return r.concat(Array.isArray(x) && d > 0 ? x.flat(d - 1) : [x]); }, []); });
  tanim(A, "flatMap", function (f, t) { return this.map(f, t).flat(1); });
  tanim(A, "at", function (i) { return this[i < 0 ? this.length + i : i]; });
  tanim(S, "padStart", function (n, c) { var s = String(this); c = c === undefined ? " " : String(c); while (s.length < n) s = c + s; return s.slice(s.length - Math.max(n, this.length)); });
  tanim(S, "padEnd", function (n, c) { var s = String(this); c = c === undefined ? " " : String(c); while (s.length < n) s += c; return s.slice(0, Math.max(n, this.length)); });
  tanim(S, "replaceAll", function (a, b) { return a instanceof RegExp ? this.replace(a, b) : this.split(a).join(b); });
  tanim(S, "trimEnd", function () { return this.replace(/\s+$/, ""); });
  [Element.prototype, DocumentFragment.prototype].forEach(function (P) {
    tanim(P, "append", function () { for (var i = 0; i < arguments.length; i++) { var x = arguments[i]; this.appendChild(x instanceof Node ? x : document.createTextNode(x)); } });
    tanim(P, "prepend", function () { for (var i = arguments.length - 1; i >= 0; i--) { var x = arguments[i]; this.insertBefore(x instanceof Node ? x : document.createTextNode(x), this.firstChild); } });
  });
  if (window.SVGElement && !("dataset" in SVGElement.prototype)) O.defineProperty(SVGElement.prototype, "dataset", { configurable: true, get: function () {
    var r = {}, L = this.attributes;
    for (var i = 0; i < L.length; i++) if (L[i].name.indexOf("data-") === 0) r[L[i].name.slice(5).replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })] = L[i].value;
    return r;
  } });
  tanim(Element.prototype, "remove", function () { if (this.parentNode) this.parentNode.removeChild(this); });
})();
