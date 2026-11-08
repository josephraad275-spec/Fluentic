import { installUiTranslations, activateEnglishUi } from '../../services/uiLocalization.ts';
import { masterRequest } from './client.ts';
import { installTranslations, getBundledI18n, type TranslationDictionary } from '../../services/localization.ts';
type LocalePack = { ui_translation: TranslationDictionary; ui_labels: Record<string, string> };
const cached = new Map<string, LocalePack>();
const pending = new Map<string, Promise<LocalePack>>();
let selection = 0;
export async function ensureLocale(languageCode: string): Promise<void> {
  const revision = ++selection;
  const code = languageCode.trim().toLowerCase().split(/[-_]/)[0];
  if (code === 'en') {
    activateEnglishUi();
    installTranslations('en', getBundledI18n('en'));
    return;
  }
  let request = pending.get(code);
  if (!request) {
    request = cached.has(code) ? Promise.resolve(cached.get(code)!) :
      masterRequest<LocalePack>('localization', { nativeLanguageCode: code }).then(pack => {
        const keys = Object.keys(getBundledI18n('en'));
        if (!pack.ui_translation || Object.keys(pack.ui_translation).length !== keys.length ||
            keys.some(key => typeof pack.ui_translation[key] !== 'string' || !pack.ui_translation[key].trim())) {
          throw new Error('Incomplete localization dictionary.');
        }
        cached.set(code, pack);
        return pack;
      }).finally(() => pending.delete(code));
    pending.set(code, request);
  }
  const pack = await request;
  if (revision !== selection) return;
  installUiTranslations(code, pack.ui_labels);
  installTranslations(code, pack.ui_translation);
}
