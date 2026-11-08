import type { GoogleGenAI, GenerateContentParameters } from '@google/genai';

export class EngineError extends Error {
  constructor(public readonly code: string, public readonly status: number, message: string) { super(message); }
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new EngineError('INVALID_REQUEST',400,'Expected an object.');
  return value as Record<string, unknown>;
}
export function text(value: unknown, field: string, max=12000): string {
  if (typeof value !== 'string' || !value.trim() || value.length>max) throw new EngineError('INVALID_REQUEST',400,`Invalid ${field}.`);
  return value.trim();
}
export function parseObject(source: string): Record<string, unknown> {
  const clean=source.trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'');
  try {
    const result=JSON.parse(clean);
    if(!result || typeof result!=='object' || Array.isArray(result)) throw new Error();
    return result;
  } catch { throw new EngineError('INVALID_AI_RESPONSE',502,'The AI returned an invalid JSON object.'); }
}
export function audioText(source: string): string {
  return source.normalize('NFC').replace(/```[\s\S]*?```/g,' ').replace(/!\[[^\]]*\]\([^)]*\)/g,' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/<[^>]*>/g,' ')
    .replace(/^[ \t]*#{1,6}\s+/gm,'').replace(/[*_`~|]/g,'').replace(/[\p{Extended_Pictographic}\u200b\ufeff]/gu,'').replace(/\s+/g,' ').trim();
}

export interface JsonGenerator {
  generate(instruction: string, input: unknown, maxTokens?: number): Promise<Record<string, unknown>>;
}
export async function generateContent(ai: GoogleGenAI, request: GenerateContentParameters, delay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms))) {
  for(let attempt=0;attempt<3;attempt++) {
    try { return await ai.models.generateContent({...request,config:{...request.config,httpOptions:{...request.config?.httpOptions,timeout:request.config?.httpOptions?.timeout || 20000}}}); }
    catch(error) {
      const status=Number((error as {status?:number})?.status);
      const retryable=status===429 || status>=500 || error instanceof TypeError;
      if(attempt<2 && retryable) { await delay(300*2**attempt);continue; }
      if(error instanceof EngineError)throw error;
      throw new EngineError(status===429?'RATE_LIMITED':'AI_UNAVAILABLE',status===429?429:502,'AI service is temporarily unavailable.');
    }
  }
  throw new EngineError('AI_UNAVAILABLE',502,'AI service is temporarily unavailable.');
}
export class GeminiJsonGenerator implements JsonGenerator {
  constructor(private readonly getAI: ()=>GoogleGenAI|null, private readonly delay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms))) {}
  async generate(instruction: string, input: unknown, maxTokens=3500): Promise<Record<string, unknown>> {
    const ai=this.getAI();
    if(!ai) throw new EngineError('AI_NOT_CONFIGURED',503,'AI service is unavailable.');
    const result=await generateContent(ai,{model:process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash',contents:JSON.stringify(input),config:{systemInstruction:instruction,responseMimeType:'application/json',temperature:0.2,maxOutputTokens:maxTokens}},this.delay);
    return parseObject(result.text || '');
  }
}
