import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import {createWorker} from 'tesseract.js';
import {lineItems,documentDates} from './core.js';
const asset=p=>new URL(p,document.baseURI).href;
pdfjs.GlobalWorkerOptions.workerSrc=asset('vendor/pdf.worker.min.mjs');
export const pdfOptions={isEvalSupported:false,useSystemFonts:true,cMapUrl:asset('vendor/cmaps/'),cMapPacked:true,standardFontDataUrl:asset('vendor/standard_fonts/'),wasmUrl:asset('vendor/wasm/')};
function loadDocument(data){
 const port=new Worker(asset('vendor/pdf.worker.min.mjs'),{type:'module'});
 const worker=new pdfjs.PDFWorker({port});
 const loading=pdfjs.getDocument({...pdfOptions,data,worker});
 return {loading,async release(){try{await loading.destroy();}finally{worker.destroy();port.terminate();}}};
}
let ocrWorker;
async function getOCR(onProgress){
 if(!ocrWorker)ocrWorker=await createWorker(['por','eng'],1,{workerPath:asset('vendor/ocr/worker.min.js'),corePath:asset('vendor/ocr-core'),langPath:asset('vendor/lang'),workerBlobURL:false,logger:m=>onProgress?.(`OCR: ${m.status} ${Math.round((m.progress||0)*100)}%`)});
 return ocrWorker;
}
export async function readPdf(file,path,{ocr=false,onProgress}={}){
 const task=loadDocument(new Uint8Array(await file.arrayBuffer())); const pages=[];
 try{const pdf=await task.loading.promise;
 for(let n=1;n<=pdf.numPages;n++){
  onProgress?.(`${path} · página ${n}/${pdf.numPages}`);
  const p=await pdf.getPage(n),v=p.getViewport({scale:1}),text=await p.getTextContent();
  let items=text.items.filter(x=>x.str!==undefined).map(x=>({text:x.str,x:x.transform[4],y:v.height-x.transform[5],w:x.width,h:x.height,size:Math.abs(x.transform[3])}));
  let wasOCR=false;
  if(ocr&&items.map(i=>i.text).join('').trim().length<100){
   const scale=2,viewport=p.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   await p.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
   const worker=await getOCR(onProgress);const {data}=await worker.recognize(canvas,{}, {blocks:true,text:true});
   const words=(data.blocks||[]).flatMap(b=>(b.paragraphs||[]).flatMap(q=>(q.lines||[]).flatMap(l=>l.words||[])));
   items=words.map(w=>({text:w.text,x:w.bbox.x0/scale,y:w.bbox.y1/scale,w:(w.bbox.x1-w.bbox.x0)/scale,h:(w.bbox.y1-w.bbox.y0)/scale,size:(w.bbox.y1-w.bbox.y0)/scale}));wasOCR=true;
  }
  pages.push({number:n,width:v.width,height:v.height,items,text:lineItems(items).map(l=>l.text).join('\n'),ocr:wasOCR});p.cleanup();
 }
 return {path,pages,dates:documentDates(path,pages),fingerprint:`${file.size}:${file.lastModified}`,scanned:pages.some(p=>p.text.trim().length<100)};
 }finally{await task.release();}
}
export async function renderPage(file,pageNumber,canvas){
 const task=loadDocument(new Uint8Array(await file.arrayBuffer()));
 try{const pdf=await task.loading.promise;const p=await pdf.getPage(pageNumber),original=p.getViewport({scale:1});const viewport=p.getViewport({scale:Math.min(2,1200/original.width)});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await p.render({canvasContext:canvas.getContext('2d'),viewport}).promise;return pdf.numPages;}finally{await task.release();}
}
