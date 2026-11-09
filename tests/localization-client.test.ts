import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureLocale } from '../src/ai/master/localizationClient.ts';
import { currentUiLocale, uiText } from '../src/services/uiLocalization.ts';
import { getBundledI18n } from '../src/services/localization.ts';
import { UI_CATALOG } from '../src/ai/master/uiCatalog.ts';

test('slow locale response cannot overwrite a newer language selection', async () => {
  const original = globalThis.fetch;
  let finish!: (response: Response) => void;
  globalThis.fetch = async () => new Promise<Response>(resolve => { finish = resolve; });
  try {
    const older = ensureLocale('fr');
    await ensureLocale('en');
    finish(Response.json({success:true, mode:'localization', ui_translation:getBundledI18n('fr'), ui_labels:Object.fromEntries(Object.keys(UI_CATALOG).map(key=>[key,'Libellé']))}));
    await older;
    assert.equal(currentUiLocale(),'en');
    await ensureLocale('fr');
    assert.equal(currentUiLocale(),'fr');
    assert.equal(uiText(Object.keys(UI_CATALOG)[0]),'Libellé');
    await ensureLocale('en');
    assert.equal(currentUiLocale(),'en');
  } finally { globalThis.fetch = original; }
});
