let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{const req=indexedDB.open('tabelas-vendas-local',1);req.onupgradeneeded=()=>req.result.createObjectStore('data');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function get(key){const d=await db();return new Promise((resolve,reject)=>{const req=d.transaction('data').objectStore('data').get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function put(key,value){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('data','readwrite');tx.objectStore('data').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export async function forget(){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('data','readwrite');tx.objectStore('data').clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export async function walkDirectory(root){
 const files=[];const skipped=new Set(['tmp','node_modules','.git','extensao chrome tabelas','resultado icarai','dist']);
 async function walk(dir,prefix=''){
  for await(const [name,handle]of dir.entries()){
   if(handle.kind==='directory'){if(!skipped.has(name.toLowerCase()))await walk(handle,prefix+name+'/');}
   else if(/\.pdf$/i.test(name)){const f=await handle.getFile();files.push({path:prefix+name,name,handle,size:f.size,modified:f.lastModified});}
  }
 }
 await walk(root);return files.sort((a,b)=>a.path.localeCompare(b.path,'pt-BR'));
}
