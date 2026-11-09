import { EngineError, audioText } from './runtime.ts';

const scripts: Record<string,RegExp> = {
 ar:/\p{Script=Arabic}/u,fa:/\p{Script=Arabic}/u,ur:/\p{Script=Arabic}/u,he:/\p{Script=Hebrew}/u,
 ru:/\p{Script=Cyrillic}/u,uk:/\p{Script=Cyrillic}/u,bg:/\p{Script=Cyrillic}/u,
 ja:/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,zh:/\p{Script=Han}/u,ko:/\p{Script=Hangul}/u,
 hi:/\p{Script=Devanagari}/u,mr:/\p{Script=Devanagari}/u,th:/\p{Script=Thai}/u,el:/\p{Script=Greek}/u,
 bn:/\p{Script=Bengali}/u,ta:/\p{Script=Tamil}/u,te:/\p{Script=Telugu}/u,ka:/\p{Script=Georgian}/u,hy:/\p{Script=Armenian}/u,
};
export function targetText(value: unknown, languageCode: string): string {
 if(typeof value!=='string' || !value.trim()) throw new EngineError('INVALID_AI_RESPONSE',502,'Target text is missing.');
 const clean=value.normalize('NFC').trim();
 const script=scripts[languageCode.toLowerCase().split(/[-_]/)[0]];
 if(script && (!script.test(clean) || /\p{Script=Latin}/u.test(clean))) throw new EngineError('INVALID_TARGET_SCRIPT',502,'Target text contains an unexpected writing system.');
 if(/(?:transliteration|pronunciation|romanization)\s*:/i.test(clean)) throw new EngineError('INVALID_TARGET_SCRIPT',502,'Pronunciation guides are not target text.');
 return clean;
}
export function targetAudio(value: unknown, languageCode:string): string { return audioText(targetText(value,languageCode)); }
