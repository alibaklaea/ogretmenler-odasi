global.window={};require(process.argv[2]+'/js/devre.js');require(process.argv[2]+'/js/kodlar.js');
const fs=require('fs');const K=window.KODLAR;const L=[];
for(const no of Object.keys(K)) K[no].forEach((c,i)=>{const ad=`h${no}_${i}`;fs.mkdirSync('derle/'+ad,{recursive:true});fs.writeFileSync(`derle/${ad}/${ad}.ino`,c.kod+'\n');L.push(ad)});
fs.writeFileSync('derle/liste.txt',L.join('\n'));
