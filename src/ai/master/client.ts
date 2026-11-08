import { apiFetch } from '../../services/apiTransport.ts';
import type { MasterMode } from './engine.ts';

export async function masterRequest<T>(mode:MasterMode,payload:Record<string,unknown>,signal?:AbortSignal):Promise<T> {
 for(let attempt=0;attempt<3;attempt++) {
  signal?.throwIfAborted();
  let response:Response;
  try { response=await apiFetch('/api/engine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,payload}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(60000)]):AbortSignal.timeout(60000)}); }
  catch(error) {if(signal?.aborted)throw error;if(attempt===2)throw new Error('ENGINE_UNAVAILABLE');await wait(300*2**attempt,signal);continue;}
  const data:unknown=await response.json().catch(()=>null);
  if(response.ok && data && typeof data==='object' && !Array.isArray(data) && (data as Record<string,unknown>).success===true && (data as Record<string,unknown>).mode===mode)return data as T;
  if((response.status===429||response.status>=500)&&attempt<2){await wait(300*2**attempt,signal);continue;}
  throw new Error('ENGINE_UNAVAILABLE');
 }
 throw new Error('ENGINE_UNAVAILABLE');
}
function wait(ms:number,signal?:AbortSignal):Promise<void>{
 return new Promise((resolve,reject)=>{signal?.throwIfAborted();const abort=()=>{clearTimeout(timer);reject(signal?.reason);};const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},ms);signal?.addEventListener('abort',abort,{once:true});});
}
