import { UI_CATALOG } from '../ai/master/uiCatalog.ts';
let activeLocale='en';
const packs=new Map<string,Record<string,string>>();
export function installUiTranslations(code:string,pack:Record<string,string>):void {
 const keys=Object.keys(UI_CATALOG);
 if(!pack || Object.keys(pack).length!==keys.length || keys.some(key=>typeof pack[key]!=='string'||!pack[key].trim()))throw new Error('Incomplete UI label catalog.');
 packs.set(code,pack);activeLocale=code;
}
export function activateEnglishUi():void{activeLocale='en';}
export function currentUiLocale():string{return activeLocale;}
export function uiText(key:string):string {
 const source=UI_CATALOG[key];
 if(!source)throw new Error(`Unknown UI label: ${key}`);
 return activeLocale==='en'?source:packs.get(activeLocale)![key];
}
