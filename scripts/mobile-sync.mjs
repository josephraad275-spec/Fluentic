import { spawnSync } from 'node:child_process';
import { resolveApiUrl } from '../src/services/apiTransport.ts';

if (!process.env.VITE_API_BASE_URL) throw new Error('Set VITE_API_BASE_URL to the approved HTTPS backend origin before packaging.');
resolveApiUrl('/api/health', process.env.VITE_API_BASE_URL);
for (const [command,args] of [['npm',['run','build']],['npx',['cap','sync']]]) {
  const result=spawnSync(command,args,{stdio:'inherit',shell:process.platform==='win32'});
  if(result.error) throw result.error;
  if(result.status!==0) process.exit(result.status || 1);
}
