export const normalize = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const brNumber = s => { const t=String(s).replace(/[^\d,.-]/g,''); return t ? Number(t.replace(/\./g,'').replace(',','.')) : null; };
export const brMoney = n => n == null ? 'Não informado' : n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const brArea = n => n == null ? 'Não informada' : n.toLocaleString('pt-BR',{maximumFractionDigits:2})+' m²';
export const unique = a => [...new Set(a)];
export function lineItems(items,tolerance=2.5) {
 const lines=[];
 for(const it of [...items].filter(i=>i.text?.trim()).sort((a,b)=>a.y-b.y||a.x-b.x)) {
  let line=lines.findLast(l=>Math.abs(l.y-it.y)<=tolerance);
  if(!line){line={y:it.y,items:[]};lines.push(line);}
  line.items.push(it);
 }
 return lines.sort((a,b)=>a.y-b.y).map(l=>({...l,items:l.items.sort((a,b)=>a.x-b.x),text:l.items.sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ').replace(/\s+/g,' ').trim()}));
}
export function textIn(items,left,right,top=-Infinity,bottom=Infinity){return lineItems(items.filter(i=>i.x+i.w/2>=left&&i.x+i.w/2<right&&i.y>=top&&i.y<bottom)).map(l=>l.text).join(' ').trim();}
export function typesOf(s='') {
 const n=normalize(s).replace(/\be(?=\d)/g,'e '),types=[];
 if(/studio|estudio/.test(n))types.push('Studio');
 if(/loft/.test(n))types.push('Loft');
 if(/lote/.test(n))types.push('Lote');
 if(/cobertura|cob duplex|cob linear/.test(n))types.push('Cobertura');
 if(/loja/.test(n))types.push('Loja');
 if(/casa/.test(n))types.push('Casa');
 if(/(?:\d\s*(?:e|a|,)\s*)?\d.*quarto|\b\d\s*q\b|^[1-5](?:\s+(?:e\s+|a\s+)?[1-5])*$/.test(n)) {
  for(const x of n.matchAll(/\b([1-5])\b/g))types.push(`${x[1]} quarto${x[1]==='1'?'':'s'}`);
 }
 return unique(types);
}
const headingWords=new Set(['zona sul','centro','centro de niteroi','regiao oceanica','pendotiba']);
export function parseGuide(pages) {
 const result=[];let region='';let lastNeighborhood='';
 for(const page of pages){
  const W=page.width,items=page.items,lines=lineItems(items);
  const headers=lines.filter(l=>normalize(l.text).includes('empreendimento')&&normalize(l.text).includes('endereco'));
  if(!headers.length)continue;
  const top=lines.filter(l=>l.y<headers[0].y && l.items.some(i=>i.size>14));
  const regionLine=top.find(l=>headingWords.has(normalize(l.text)));
  if(regionLine)region=regionLine.text;
  headers.forEach((header,h)=>{
   const prevY=h?headers[h-1].y:0;
   const above=lines.filter(l=>l.y>prevY&&l.y<header.y-3 && l.items.some(i=>i.size>=12));
   const nameLine=above.filter(l=>!headingWords.has(normalize(l.text))&&!/zona|empreendimento/i.test(l.text)).at(-1);
   let neighborhood=nameLine?.text||lastNeighborhood;
   if(!neighborhood) neighborhood=region;
   lastNeighborhood=neighborhood;
   const left=0,right=W, c1=W*.265,c2=W*.50,c3=W*.79;
   const bottom=h+1<headers.length?headers[h+1].y-30:page.height-25;
   let anchors=lineItems(items.filter(i=>i.x+i.w/2>=c2&&i.x+i.w/2<c3&&i.y>header.y+8&&i.y<bottom)).filter(l=>typesOf(l.text).length&&!/^tipologia$/i.test(l.text)); if(!anchors.length)anchors=lineItems(items.filter(i=>i.x+i.w/2>=c3&&i.y>header.y+8&&i.y<bottom)).filter(l=>/entregue|20\d{2}/i.test(l.text)||typesOf(l.text).length);
   anchors.forEach((a,index)=>{
    const lo=index?(anchors[index-1].y+a.y)/2:header.y+8;
    const hi=index+1<anchors.length?(a.y+anchors[index+1].y)/2:Math.min(bottom,a.y+24);
    const nearHeading=lines.filter(l=>l.y<a.y&&l.items.some(i=>i.size>=12)&&!['zona sul','regiao oceanica','pendotiba','centro'].includes(normalize(l.text))&&!/empreendimento|tipologia|endere[cç]o/i.test(l.text)).at(-1); const rowNeighborhood=nearHeading?.text||neighborhood; const name=textIn(items,left,c1,lo,hi); let address=textIn(items,c1,c2,lo,hi),type=textIn(items,c2,c3,lo,hi),delivery=textIn(items,c3,right,lo,hi); const guideWarnings=[]; if(!typesOf(type).length&&/^(rua|estrada|avenida)/i.test(type)&&normalize(address)==='pendotiba'){address=type;type=typesOf(delivery).length?delivery:'Não informada';if(typesOf(delivery).length)delivery='';guideWarnings.push('Colunas deslocadas no guia: endereço recuperado; conferir tipologia/entrega.');}
    if(!name||/empreendimento|tipologia/i.test(name))return;
    const m=name.match(/\(([^)]+)\)/);
    const title=name.replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
    result.push({id:'g-'+normalize(title+' '+rowNeighborhood+' '+address).replace(/ /g,'-'),name:title,builder:m?.[1]||'Não informada',address,types:typesOf(type).length?typesOf(type):['Não informada'],typeText:type,delivery,neighborhood:rowNeighborhood,region,guidePage:page.number,guideWarnings,review:false});
   });
  });
 }
 const seen=new Set();return result.filter(p=>{const key=normalize(p.name+' '+p.neighborhood+' '+p.address);if(seen.has(key))return false;seen.add(key);return true;});
}
const months={janeiro:1,jan:1,fevereiro:2,fev:2,marco:3,mar:3,abril:4,abr:4,maio:5,mai:5,junho:6,jun:6,julho:7,jul:7,agosto:8,ago:8,setembro:9,set:9,outubro:10,out:10,novembro:11,nov:11,dezembro:12,dez:12};
export function documentDates(name,pages,today=new Date()){
 const all=pages.map(p=>p.text).join('\n');const norm=normalize(all);
 const dates=[...all.matchAll(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/g)].map(m=>({iso:`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`,raw:m[0],index:m.index}));
 const dated=all.match(/(?:tabela\s+datada\s+de|Niter[oó]i[,]?)\s*:?\s*(\d{1,2})\s*(?:de\s+)?([a-zç]+)\s*(?:de\s+)?(20\d{2})/i);
 let issue=null;
 if(dated&&months[normalize(dated[2])])issue=`${dated[3]}-${String(months[normalize(dated[2])]).padStart(2,'0')}-${dated[1].padStart(2,'0')}`;
 const explicit=all.match(/tabela\s+datada\s+de\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]20\d{2})/i);
 if(explicit) issue=dates.find(d=>d.raw===explicit[1])?.iso;
 // Footer date, rather than delivery/instalment dates in headers.
 if(!issue){const tails=pages.map(p=>p.items.filter(i=>i.y>p.height*.76).map(i=>i.text).join(' ')).join(' '); const m=tails.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/);if(m)issue=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;}
 if(!issue){const standalone=pages.flatMap(p=>lineItems(p.items).map(l=>l.text)).filter(t=>/^\d{1,2}[\/-]\d{1,2}[\/-](?:20)?\d{2}$/.test(t.trim()));const m=standalone.at(-1)?.match(/(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2}|\d{2})/);if(m)issue=`${m[3].length===2?'20':''}${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;} if(!issue){const m=all.match(/\b(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(20\d{2})\b/i);if(m)issue=`${m[3]}-${String(months[normalize(m[2])]).padStart(2,'0')}-${m[1].padStart(2,'0')}`;} if(!issue){const m=all.match(/\b(\d{1,2})[- ](jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[- ](20\d{2}|\d{2})\b/i);if(m)issue=`${m[3].length===2?'20':''}${m[3]}-${String(months[m[2].toLowerCase()]).padStart(2,'0')}-${m[1].padStart(2,'0')}`;}
 const fn=normalize(name);const monthMatch=fn.match(/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s*(20\d{2})\b/);
 const filenameDate=monthMatch?`${monthMatch[2]}-${String(months[monthMatch[1]]).padStart(2,'0')}-01`:null;
 const validity=all.match(/(?:validade[^\n]{0,70}|v[aá]lida\s+at[eé][^\n]{0,20})/i)?.[0]||'';
 const vdates=[...validity.matchAll(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2}|\d{2})\b/g)];const last=vdates.at(-1);
 const expires=last?`${last[3].length===2?'20':''}${last[3]}-${last[2].padStart(2,'0')}-${last[1].padStart(2,'0')}`:null;
 const basis=issue||filenameDate;const age=basis?Math.max(0,Math.floor((today-new Date(basis+'T12:00:00'))/86400000)):null;
 return {issue,filenameDate,expires,expired:!!expires&&expires<today.toLocaleDateString('en-CA'),age,dateConflict:!!issue&&!!filenameDate&&issue.slice(0,7)!==filenameDate.slice(0,7)};
}
const removeWords=new Set(['tabela','tabelas','de','da','do','das','dos','venda','vendas','outubro','setembro','junho','julho','agosto','marco','fevereiro','janeiro','maio','abril','novembro','dezembro','fev','set','jun','out','com','logo','studio','studios','residencial','residenciais','by','lancamento','permutante','selling','jm','financiamento','bancario','100','na','obra','promocional']);
function titleTokens(s){return normalize(s).split(' ').filter(w=>!removeWords.has(w)&&!/^20\d\d$/.test(w)&&(!/^\d$/.test(w)));}
export function matchProject(project,path){
 const file=path.split('/').at(-1).replace(/\.pdf$/i,'');let a=titleTokens(project.name),b=titleTokens(file);
 if(normalize(project.name).includes('pebe'))a=['pebe','74'];
 const aliases={'sunset icarai':['sunset'],'soma inga residence':['soma'],'sou mais icarai':['sou','mais','icarai'],'oka studios residenciais':['oka','sao','francisco']};
 if(aliases[normalize(project.name)])a=aliases[normalize(project.name)];
 if(!a.length)return false;
 // Titles may have generic suffixes, but location words may never be dropped.
 const matches=a.filter(w=>b.includes(w));
 return matches.length===a.length || (a.length>=3&&matches.length/a.length>=.8&&a.filter(w=>['icarai','charitas','camb oinhas','piratininga','itacoa','itaipu','francisco','rosa'].includes(w)).every(w=>b.includes(w)));
}
function numericCells(line){
 const cells=[];
 for(const item of line.items){
  const matches=[...item.text.matchAll(/(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+,\d+|-?\d+)/g)];
  for(const m of matches){if(m[1].includes('%'))continue;const start=m.index+(m[0].indexOf(m[1]));const x=item.x+item.w*(start/item.text.length),w=Math.max(1,item.w*m[1].length/item.text.length);cells.push({raw:m[1],value:brNumber(m[1]),x,w,center:x+w/2});}
 }
 return cells;
}
function rowIdentity(line,page){
 const left=line.items.filter(i=>i.x<page.width*.27).map(i=>i.text).join(' ').trim();
 const m=left.match(/^(?:(ALMA|ESS[ÊE]NCIA|BLOCO\s*\d+)\s+)?((?:Cob(?:ertura)?\.?\s*(?:Duplex|Linear)?\s*\d+)|(?:Casa\s*\d+)|(?:Lote\s*\d+)|(?:\d{1,5}(?:-[A-Z])?))(?=\s|$)/i);
 return m?{unit:m[2].trim(),block:m[1]||'',start:left.indexOf(m[2])}:null;
}
function fieldLabel(items,cell,boundL,boundR,top,bottom){
 const words=items.filter(i=>!/^TABELA\s+(?:STAGE|DE\s+VENDAS)/i.test(i.text)&&!/^UNIDADES\s+(?:DO\s+PERMUTANTE|PERMUTANTES)/i.test(i.text)).flatMap(i=>[...i.text.matchAll(/\S+/g)].map(m=>({...i,text:m[0],x:i.x+i.w*m.index/i.text.length,w:i.w*m[0].length/i.text.length}))); const label=textIn(words,boundL,boundR,top,bottom).replace(/\s+/g,' ').trim();
 return label||'Campo sem cabeçalho legível';
}
function explicitType(text){
 const n=normalize(text);
 if(/studio|estudio/.test(n))return ['Studio'];
 if(/loft/.test(n))return ['Loft'];
 if(/\b1\s*(?:quarto|q)\b/.test(n))return ['1 quarto'];
 if(/\b([2-5])\s*(?:quartos?|q|suites?)\b/.test(n)){const m=n.match(/\b([2-5])\s*(?:quartos?|q|suites?)\b/);return [`${m[1]} quartos`];}
 if(/cobertura|cob duplex|cob linear|\bcob\s+\d/.test(n))return ['Cobertura'];
 if(/loja/.test(n))return ['Loja'];return [];
}
export function parsePriceDocument(doc,project){
 const units=[],warnings=[];let carriedSection='',block='',headerTemplate=[];
 for(const page of doc.pages){
  const matrixPage=page.items.some(i=>/\d+\s*[oº°]?\s*PAV/i.test(i.text)); const lines=lineItems(page.items),candidates=lines.map(l=>({line:l,identity:rowIdentity(l,page),cells:numericCells(l)})).filter(r=>r.identity&&(!matrixPage||!/^\d{1,2}$/.test(r.identity.unit))&&r.cells.some(c=>c.value>=10000));
  const headers=lines.filter(l=>(/\b(unidades?|apartamentos?)\b/i.test(l.text)||/QUADRA.*LOTE/i.test(l.text))&&!rowIdentity(l,page));
  const noteLine=lines.find(l=>/notas explicativas|observa[cç][oõ]es|condi[cç][oõ]es gerais/i.test(l.text));
  for(const {line,identity,cells} of candidates){
   if(noteLine&&line.y>noteLine.y)continue;
   const above=lines.filter(l=>l.y<line.y);
   const blockLine=above.filter(l=>/^(?:BLOCO|TORRE)\s*\d/i.test(l.text)).at(-1);
   if(blockLine)block=blockLine.text.match(/^(?:BLOCO|TORRE)\s*\d+(?:\s*-\s*[A-Za-zÀ-ÿ]+)?/i)?.[0]||blockLine.text;
   const sectionLine=above.filter(l=>/^\s*(?:[1-5]\s+QUARTOS?|STUDIOS?|COBERTURAS?|LOJAS)\s*$/i.test(l.text)).at(-1);
   if(sectionLine)carriedSection=sectionLine.text;
   const prevHeader=headers.filter(l=>l.y<line.y).at(-1);
   if(prevHeader&&/QUADRA.*LOTE/i.test(prevHeader.text)&&cells.length>=4){identity.block='Quadra '+cells[0].value;identity.unit='Lote '+cells[1].value;} const first=candidates.find(r=>r.line.y>(prevHeader?.y??-1))?.line.y??line.y;
   const headTop=prevHeader?Math.max(0,prevHeader.y-32):Math.max(0,first-105);
   let dataCells=cells.filter(c=>!(c.raw===identity.unit&&c.x<page.width*.28));
   if(identity.block){const firstCell=dataCells[0];if(firstCell&&normalize(identity.block).includes(String(firstCell.value))&&firstCell.x<page.width*.18)dataCells=dataCells.slice(1);}
   // Remove leading block column, unit, and integer bedroom counts from monetary consideration using labels.
   const fields=dataCells.map((c,j)=>{
    const left=j?(dataCells[j-1].center+c.center)/2:Math.max(0,c.x-18);
    const right=j+1<dataCells.length?(dataCells[j+1].center+c.center)/2:page.width;
    let label=fieldLabel(page.items,c,left,right,headTop,first-3); if(!prevHeader&&headerTemplate.length){const nearest=[...headerTemplate].sort((a,b)=>Math.abs(a.center-c.center/page.width)-Math.abs(b.center-c.center/page.width))[0];if(Math.abs(nearest.center-c.center/page.width)<.07)label=nearest.label;} return {label,value:c.raw,number:c.value,x:c.x,center:c.center};
   });
   if(prevHeader&&line===candidates.find(r=>r.line.y>(prevHeader?.y??-1))?.line)headerTemplate=fields.map(f=>({center:f.center/page.width,label:f.label})); for(let j=0;j<fields.length-1;j++){const split=fields[j].label.match(/^(.*(?:MENSAIS|SEMESTRAIS))\s+(\d+)$/i);if(split&&/^(?:SEMESTRAIS|MENSAIS|PENTAMESTRAIS|QUADRIMESTRAIS)/i.test(fields[j+1].label)){fields[j].label=split[1];fields[j+1].label=split[2]+' '+fields[j+1].label;}} let priceIndex=fields.findIndex(f=>/pre[cç]o|valor(?:\s+promocional)?/i.test(f.label)&&f.number>=10000);
   if(priceIndex<0)priceIndex=fields.findIndex(f=>f.number>=10000);
   if(priceIndex<0)continue;
   const price=fields[priceIndex].number;
   const promo=fields.find(f=>/promocional/i.test(f.label)&&f.number>=10000);
   const areaField=fields.find(f=>/área|area|metragem|m²|m2/i.test(f.label)&&f.number>5&&f.number<3000)||fields.find(f=>f.number>10&&f.number<1000&&f.value.includes(',')&&fields.indexOf(f)<priceIndex+2);
   const vacancy=fields.find(f=>/vaga/i.test(f.label)&&f.number>=0&&f.number<=20);
   const ownTypes=explicitType(line.text),sectionTypes=explicitType(carriedSection);
   const types=ownTypes.length?ownTypes:sectionTypes.length?sectionTypes:project.types;
   const typeBasis=ownTypes.length?'Tabela da unidade':sectionTypes.length?'Seção da tabela':'Guia; confirmar planta';
   let blockValue=identity.block||block;
   const bf=fields.find(f=>/bloco|torre/i.test(f.label)&&f.number>=1&&f.number<=20);
   if(bf&&!/^Quadra /i.test(identity.block))blockValue=String(bf.number);
   const raw=line.text;
   const status=/vendid|reservad|bloquead|indispon[ií]vel/i.test(raw)?'Não disponível':'Listada na tabela';
   units.push({id:`${project.id}|${doc.path}|${page.number}|${blockValue}|${identity.unit}`,projectId:project.id,projectName:project.name,unit:identity.unit,block:blockValue,types,typeBasis,area:areaField?.number??null,vacancies:vacancy?.number??null,price,promotionalPrice:promo?.number??null,offerPrice:promo?.number??price,fields:fields.map(({label,value,number})=>({label,value,number})),raw,source:doc.path,vendor:doc.path.split('/')[0],page:page.number,status,reviewed:false,ocr:page.ocr||false,warnings:[],date:doc.dates});
  }
 }
 // Matrices like 141 Living: floors are columns, unit endings are rows.
 if(!units.length){
  for(const page of doc.pages){
   const lines=lineItems(page.items);const floors=page.items.filter(i=>/([5-9]|1[0-9])\s*[oº°]?\s*PAV/i.test(i.text)).map(i=>({x:i.x+i.w/2,floor:Number(i.text.match(/\d+/)[0])}));
   if(!floors.length)continue;
   for(const line of lines){const end=line.text.match(/^\s*(0[1-9])\b/);if(!end)continue;const cells=numericCells(line),area=cells.find(c=>c.value>10&&c.value<300&&c.raw.includes(','));
    for(const c of cells.filter(c=>c.value>=10000)){const floor=[...floors].sort((a,b)=>Math.abs(a.x-c.center)-Math.abs(b.x-c.center))[0];const unit=String(floor.floor*100+Number(end[1]));units.push({id:`${project.id}|${doc.path}|${page.number}|${unit}`,projectId:project.id,projectName:project.name,unit,block:'',types:project.types,typeBasis:'Matriz; confirmar planta e numeração',area:area?.value??null,vacancies:null,price:c.value,promotionalPrice:null,offerPrice:c.value,fields:[{label:'Preço',value:c.raw,number:c.value}],raw:line.text,source:doc.path,vendor:doc.path.split('/')[0],page:page.number,status:'Listada na tabela',reviewed:false,ocr:page.ocr||false,warnings:['Número reconstruído por pavimento + final. Condições não discriminadas na matriz.'],date:doc.dates});}
   }
  }
 }
 for(const u of units){
  u.notesText=referenceText(doc).map(p=>p.text).join('\n'); if(/\bVENDIDOS\b|\bRESERVAS\b/i.test(u.notesText))u.warnings.push('O documento contém mapa/legenda de vendas ou reservas: conferir a situação desta unidade no original.'); if(u.date.expired)u.warnings.push('Validade expressa encerrada; renovar a tabela.');
  if(u.date.age>90)u.warnings.push(`Tabela com ${u.date.age} dias; confirmar atualização.`);
  if(u.date.dateConflict)u.warnings.push('Mês do nome do arquivo difere da data interna.');
  if(u.typeBasis.includes('Guia')||u.typeBasis.includes('Matriz'))u.warnings.push('Tipologia não discriminada por unidade; confirmar planta.');
  if(u.ocr)u.warnings.push('Leitura por OCR: conferir números na página original.');
  const same=units.filter(v=>v.unit===u.unit&&v.block===u.block&&v.source===u.source);
  if(same.length>1)u.warnings.push('Número repetido neste documento: verificar bloco e modalidades.');
  const arithmetic=checkPaymentSum(u);if(arithmetic)u.warnings.push(arithmetic);

 }
 if(!units.length)warnings.push('Nenhuma unidade extraída com segurança. Abra o PDF para revisão ou use OCR se for digitalizado.');
 return {units,warnings};
}
export function checkPaymentSum(unit){
 const payments=[];let hasStart=false,hasEnd=false;
 for(const f of unit.fields){const label=normalize(f.label.replace(/\d+(?:[.,]\d+)?\s*%/g,''));if(/preco|valor|area|metragem|vaga|tipo|bloco|torre|fracao|prestacao|renda/.test(label))continue;
  if(!/sinal|ato|dias|\b30d\b|\b60d\b|\b90d\b|mensais|semestrais|pentamestra|quadrimestra|finan|\bfin\b|unica|parcela|vista|^29\b|^37\b|30 60/.test(label))continue;
  let count=1;
  const before=label.match(/(\d+)\s+(?:mensais|semestrais|pentamestrais|quadrimestrais)/),after=label.match(/(?:mensais|semestrais|pentamestral|quadrimestral)\s+(\d+)/);
  if(before)count=Number(before[1]);else if(after)count=Number(after[1]);else if(/duas parcelas|2 x 3/.test(label))count=2;else if(/^29\b/.test(label))count=29;else if(/30 60 90/.test(label))count=3;else if(/30 60/.test(label))count=2;
  if(/sinal|ato/.test(label))hasStart=true;if(/finan|\bfin\b|vista/.test(label))hasEnd=true;
  payments.push({number:f.number,count});
 }
 if(!hasStart||!hasEnd||payments.length<2||payments.some(p=>p.number==null))return null;
 const sum=payments.reduce((a,p)=>a+p.number*p.count,0),diff=unit.offerPrice-sum;
 if(Math.abs(diff)>Math.max(10,unit.offerPrice*.0001))return `Soma do fluxo identificado difere do preço em ${brMoney(Math.abs(diff))}. Conferir campos, quantidades e condições no original; nenhum valor foi ajustado.`;
 return null;
}
export function referenceText(doc){
 return doc.pages.map(page=>({number:page.number,ocr:page.ocr,text:lineItems(page.items).filter(l=>!(rowIdentity(l,page)&&numericCells(l).some(c=>c.value>=10000))&&!/^\s*0[1-9]\s+/.test(l.text)).map(l=>l.text).join('\n')}));
}
export function filterProjects(projects,f={}){
 return projects.filter(p=>(!f.search||normalize([p.name,p.builder,p.address,p.neighborhood].join(' ')).includes(normalize(f.search)))&&(!f.region?.length||f.region.includes(p.region))&&(!f.neighborhood?.length||f.neighborhood.includes(p.neighborhood))&&(!f.builder?.length||f.builder.includes(p.builder))&&(!f.type?.length||f.type.some(t=>p.types.includes(t)))&&(!f.delivery?.length||f.delivery.includes(p.delivery))&&(!f.deliveryFrom||Number(p.delivery.match(/20\d{2}/)?.[0])>=Number(f.deliveryFrom))&&(!f.deliveryTo||Number(p.delivery.match(/20\d{2}/)?.[0])<=Number(f.deliveryTo)));
}
export function filterUnits(units,f={}){
 return units.filter(u=>(!f.search||normalize([u.projectName,u.unit,u.block,u.vendor,u.source,u.raw,u.notesText,...u.fields.map(f=>f.label+' '+f.value)].join(' ')).includes(normalize(f.search)))&&(!f.type?.length||f.type.some(t=>u.types.includes(t)))&&(!f.vendor?.length||f.vendor.includes(u.vendor))&&(f.minPrice===''||f.minPrice==null||u.offerPrice>=Number(f.minPrice))&&(f.maxPrice===''||f.maxPrice==null||u.offerPrice<=Number(f.maxPrice))&&(f.minArea===''||f.minArea==null||u.area!=null&&u.area>=Number(f.minArea))&&(f.maxArea===''||f.maxArea==null||u.area!=null&&u.area<=Number(f.maxArea))&&(!f.vacancies||f.vacancies==='unknown'&&u.vacancies==null||f.vacancies==='0'&&u.vacancies===0||f.vacancies==='1+'&&u.vacancies>=1)&&(!f.onlyReviewed||u.reviewed)&&(!f.onlyExact||['Tabela da unidade','Seção da tabela','Conferência manual na tabela'].includes(u.typeBasis))&&(!f.hideExpired||!u.date.expired)&&(!f.hideUnavailable||u.status!=='Não disponível')&&(!f.dateFrom||(u.date.issue||u.date.filenameDate||'')>=f.dateFrom)&&(!f.dateTo||(u.date.issue||u.date.filenameDate||'9999')<=f.dateTo)&&(!f.field||u.fields.some(v=>normalize(v.label).includes(normalize(f.field))&&(f.fieldOperator==='min'?v.number!=null&&v.number>=Number(f.fieldValue):f.fieldOperator==='max'?v.number!=null&&v.number<=Number(f.fieldValue):normalize(v.value).includes(normalize(f.fieldValue))))));
}
export function groupOffers(units){const m=new Map();for(const u of units){const key=`${u.projectId}|${normalize(u.block)}|${normalize(u.unit)}`;const a=m.get(key)||[];a.push(u);m.set(key,a);}return m;}
