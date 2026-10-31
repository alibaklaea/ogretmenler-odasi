// İnternetsiz tahta paketi: siteyi kopyalar, eski tarayıcı motorlarına uygun derler.
// node araclar/tahta-paket.mjs <hedef klasör>  (esbuild: npx esbuild)
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const KOK = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const HEDEF = path.resolve(process.argv[2]);
fs.rmSync(HEDEF, { recursive: true, force: true });
fs.mkdirSync(HEDEF, { recursive: true });
for (const d of ['img', 'video', 'js', 'css']) fs.cpSync(path.join(KOK, d), path.join(HEDEF, d), { recursive: true });

const esbuild = process.argv[3];
const derle = (dosya) => execFileSync(process.execPath, [esbuild, dosya, '--target=chrome52', '--allow-overwrite', '--log-level=error', `--outfile=${dosya}`, '--charset=utf8']);
for (const f of fs.readdirSync(path.join(HEDEF, 'js'))) derle(path.join(HEDEF, 'js', f));
derle(path.join(HEDEF, 'css', 'masa.css'));

let h = fs.readFileSync(path.join(KOK, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
h = h.replace('<script>if (location.protocol.startsWith("http"))', '<script>document.documentElement.className = "uygulama"; if (!location.hash) location.hash = "dokun";</script>\n<script>if (location.protocol.startsWith("http"))');
h = h.replace('<script>document.documentElement.className', '<script src="js/eski-tarayici.js"></script>\n<script>document.documentElement.className');
fs.copyFileSync(path.join(KOK, 'araclar', 'eski-tarayici.js'), path.join(HEDEF, 'js', 'eski-tarayici.js'));
fs.writeFileSync(path.join(HEDEF, 'index.html'), h);
console.log('paket hazır:', HEDEF);
