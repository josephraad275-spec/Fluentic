import type { Express, RequestHandler } from 'express';
import type { GoogleGenAI } from '@google/genai';
import { FluenticMasterEngine, type MasterMode } from './engine.ts';
import { EngineError, GeminiJsonGenerator, object } from './runtime.ts';

export function registerMasterEngine(app:Express,getAI:()=>GoogleGenAI|null) {
 const engine=new FluenticMasterEngine(new GeminiJsonGenerator(getAI));
 const handler:RequestHandler=async(req,res)=>{
  try {
   const body=object(req.body);const payload=object(body.payload);
   if(JSON.stringify(payload).length>100000)throw new EngineError('PAYLOAD_TOO_LARGE',413,'Engine payload is too large.');
   const modes=['onboarding','placement_test','active_chat','personal_lesson','localization'];
   if(!modes.includes(String(body.mode)))throw new EngineError('INVALID_MODE',400,'Unsupported engine mode.');
   const result=await engine.execute(body.mode as MasterMode,payload);
   res.json({...result,success:true});
  }catch(error){
   const known=error instanceof EngineError;
   const status=known?error.status:502;
   if(status===429)res.setHeader('Retry-After','2');
   res.status(status).json({success:false,status:'unavailable',code:known?error.code:'INVALID_AI_RESPONSE',error:status<500&&known?error.message:'The learning service is temporarily unavailable.'});
  }
 };
 for(const path of ['/api/engine','/api/gemini/engine','/api/omni-engine'])app.post(path,handler);
 return engine;
}
