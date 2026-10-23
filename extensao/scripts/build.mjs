import fs from 'node:fs/promises';import path from 'node:path';import{build}from'esbuild';import{createCanvas}from'@napi-rs/canvas';
const dest=path.resolve('dist');await fs.mkdir(dest,{recursive:true});
await build({entryPoints:['src/app.js'],outfile:path.join(dest,'app.js'),bundle:true,format:'esm',target:['chrome133'],minify:true,legalComments:'eof',platform:'browser'});
for(const file of ['app.html','app.css','manifest.json','background.js','LEIA-ME.md','VALIDACAO.md'])await fs.copyFile(file,path.join(dest,file));
const copy=async(from,to)=>{await fs.mkdir(path.dirname(to),{recursive:true});await fs.cp(from,to,{recursive:true});};
await copy('node_modules/pdfjs-dist/build/pdf.worker.min.mjs',path.join(dest,'vendor/pdf.worker.min.mjs'));
for(const name of ['cmaps','standard_fonts','wasm','iccs'])await copy('node_modules/pdfjs-dist/'+name,path.join(dest,'vendor',name));
await copy('node_modules/tesseract.js/dist/worker.min.js',path.join(dest,'vendor/ocr/worker.min.js'));
await fs.mkdir(path.join(dest,'vendor/ocr-core'),{recursive:true});
for(const file of await fs.readdir('node_modules/tesseract.js-core'))if(/\.wasm(?:\.js)?$/.test(file))await copy(path.join('node_modules/tesseract.js-core',file),path.join(dest,'vendor/ocr-core',file));
for(const lang of ['por','eng'])await copy(`node_modules/@tesseract.js-data/${lang}/4.0.0/${lang}.traineddata.gz`,path.join(dest,`vendor/lang/${lang}.traineddata.gz`));
await fs.mkdir(path.join(dest,'licenses'),{recursive:true});
for(const pkg of ['pdfjs-dist','jspdf','jspdf-autotable','pdf-lib','tesseract.js','tesseract.js-core','@tesseract.js-data/por','@tesseract.js-data/eng']){const dir='node_modules/'+pkg;for(const f of await fs.readdir(dir)){if(/^license|^copying|^notice/i.test(f))await copy(path.join(dir,f),path.join(dest,'licenses',pkg.replaceAll('/','-')+'-'+f));}}
await fs.copyFile('package-lock.json',path.join(dest,'licenses','dependency-lock.json'));
await fs.mkdir(path.join(dest,'icons'),{recursive:true});
for(const size of [16,48,128]){const c=createCanvas(size,size),ctx=c.getContext('2d');ctx.fillStyle='#16424d';ctx.fillRect(0,0,size,size);ctx.strokeStyle='#b6eecc';ctx.lineWidth=size/16;ctx.strokeRect(size*.22,size*.2,size*.56,size*.6);ctx.beginPath();ctx.moveTo(size*.32,size*.4);ctx.lineTo(size*.68,size*.4);ctx.moveTo(size*.32,size*.55);ctx.lineTo(size*.68,size*.55);ctx.moveTo(size*.32,size*.7);ctx.lineTo(size*.55,size*.7);ctx.stroke();await fs.writeFile(path.join(dest,`icons/${size}.png`),c.toBuffer('image/png'));}
console.log('Extensão pronta em '+dest);
