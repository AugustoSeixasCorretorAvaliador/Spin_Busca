import {jsPDF} from 'jspdf';
import {autoTable} from 'jspdf-autotable';
import {PDFDocument} from 'pdf-lib';
import {brMoney,brArea,groupOffers,referenceText} from './core.js';
const clean=s=>String(s??'').replace(/[\u2010-\u2015]/g,'-').replace(/\u202f|\u00a0/g,' ').replace(/[^\u0009\u000a\u000d\u0020-\u00ff]/g,' ');
export async function makeExport({projects,units=[],docs=new Map(),client='',title='Seleção de imóveis',notes='',includeOriginals=false,getFile,onProgress}){
 const pdf=new jsPDF({unit:'mm',format:'a4'}),width=182;let y=18;
 const newPage=()=>{pdf.addPage();y=18;};
 const text=(s,size=10,bold=false)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);for(const line of pdf.splitTextToSize(clean(s),width)){if(y>277)newPage();pdf.text(line,14,y);y+=size*.45+1;}y+=2;};
 const tab=(headers,rows)=>{if(y>255)newPage();autoTable(pdf,{startY:y,head:[headers.map(clean)],body:rows.map(r=>r.map(clean)),margin:{left:14,right:14,top:16,bottom:16},styles:{font:'helvetica',fontSize:8,cellPadding:2,overflow:'linebreak'},headStyles:{fillColor:[22,66,77]},alternateRowStyles:{fillColor:[245,248,249]},rowPageBreak:'avoid'});y=pdf.lastAutoTable.finalY+6;};
 text(title,21,true);if(client)text(`Preparado para ${client}`,12);text(`Emitido em ${new Date().toLocaleString('pt-BR')}`,9);
 text('Preços e disponibilidade conforme os documentos identificados. Sujeitos a atualização e confirmação pelo vendedor. Sinal não representa toda a entrada; financiamento sujeito à análise de crédito. Entrega indicada como previsão não comprova conclusão.',9);
 if(notes)text(notes,10);
 if(!units.length){
  tab(['Empreendimento / construtora','Bairro / endereço','Tipologias no guia','Entrega'],projects.map(p=>[`${p.name}\n${p.builder}`,`${p.neighborhood}\n${p.address}`,p.typeText,p.delivery||'Não informada']));
  text('Fonte: Guia de Bairro.pdf, páginas '+[...new Set(projects.map(p=>p.guidePage))].sort((a,b)=>a-b).join(', ')+'. Este relatório é uma seleção do guia, sem consulta de estoque ou preços.',9);
 }else{
  const groups=groupOffers(units);text(`${projects.length} empreendimento(s), ${groups.size} identificação(ões) de unidade e ${units.length} oferta(s)/modalidade(s). Vendedores e modalidades diferentes não foram consolidados como novo estoque.`,9);
  tab(['Empreendimento / vendedor','Unidade / bloco','Tipo / área','Preço do fluxo','Data da tabela'],units.map(u=>[`${u.projectName}\n${u.vendor}`,`${u.unit}${u.block?' / '+u.block:''}`,`${u.types.join(', ')}\n${brArea(u.area)}`,brMoney(u.offerPrice),u.date.issue||u.date.filenameDate||'Não informada']));
  for(const u of units){
   newPage();const p=projects.find(p=>p.id===u.projectId);text(`${u.projectName} · unidade ${u.unit}`,15,true);
   text(`${p?.neighborhood||''} - ${p?.address||''}`,10);text(`Vendedor: ${u.vendor}${u.block?' | Bloco/torre/quadra: '+u.block:''}`,10);
   text(`Tipologia: ${u.types.join(', ')} (${u.typeBasis}). Área: ${brArea(u.area)}. Vagas: ${u.vacancies??'não informadas'}.`,10);
   text(`Preço: ${brMoney(u.offerPrice)}${u.promotionalPrice?' (promocional do fluxo indicado)':''}. Entrega no guia: ${p?.delivery||'não informada'}.`,11,true);
   text(`Situação: ${u.status}. ${u.reviewed?'Conferência manual registrada pelo usuário.':'Extração ainda não conferida manualmente.'}`,9);
   for(const warning of u.warnings)text('Atenção: '+warning,9,true);
   tab(['Campo da tabela','Valor transcrito'],u.fields.map(f=>[f.label,f.value]));
   text('Transcrição da linha: '+u.raw,8);
   text(`Fonte: ${u.source}, página ${u.page}. Data interna: ${u.date.issue||'não identificada'}; mês do arquivo: ${u.date.filenameDate?.slice(0,7)||'não identificado'}; validade: ${u.date.expires||'não identificada'}.`,9);
  }
  for(const source of [...new Set(units.map(u=>u.source))]){
   const doc=docs.get(source);if(!doc)continue;
   newPage();text('Condições e referência documental',16,true);text(source,10,true);
   text('Cabeçalhos e condições transcritos do documento. As linhas de outras unidades foram omitidas; a seleção está identificada nas páginas anteriores. Consulte o original para conferir a diagramação.',9);
   for(const page of referenceText(doc)){text(`Página ${page.number}${page.ocr?' - OCR; conferir original':''}`,11,true);text(page.text,8);}
  }
 }
 for(let n=1;n<=pdf.getNumberOfPages();n++){pdf.setPage(n);pdf.setFontSize(8);pdf.setTextColor(90);pdf.text(`${n} / ${pdf.getNumberOfPages()} - Seleção documental`,14,289);}
 let bytes=pdf.output('arraybuffer');
 if(includeOriginals&&units.length){
  const merged=await PDFDocument.load(bytes);
  for(const source of [...new Set(units.map(u=>u.source))]){onProgress?.('Anexando '+source);const file=await getFile(source);const original=await PDFDocument.load(await file.arrayBuffer());const pages=await merged.copyPages(original,original.getPageIndices());pages.forEach(p=>merged.addPage(p));}
  bytes=await merged.save();
 }
 return new Blob([bytes],{type:'application/pdf'});
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
