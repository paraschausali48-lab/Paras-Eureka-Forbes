/**
 * Translations Dictionary Loader
 *
 * This file dynamically loads translatable strings for English, Hindi, Marathi, and Gujarati.
 * By utilizing asynchronous module imports, Astro automatically code-splits these
 * dictionaries, guaranteeing extremely fast build times and zero client-side bundle bloat.
 */

export type TranslationDictionary = Record<string, string>;

// Use Astro/Vite's native bundler to map all locale files automatically
const locales = import.meta.glob('../locales/*.ts');

export async function getTranslations(lang: string): Promise<TranslationDictionary> {
  // Find the requested language file, fallback to English if missing
  const loader = locales[`../locales/${lang}.ts`] || locales[`../locales/en.ts`];
  const module = (await loader()) as { default: TranslationDictionary };
  return module.default;
}

export async function useTranslations(lang: string) {
  // Utilizing Vite dynamic imports to lazily load exact translation payloads
  const targetLang = await getTranslations(lang);
  const fallbackLang = lang === 'en' ? targetLang : await getTranslations('en');

  return function t(key: string): string {
    return targetLang[key] || fallbackLang[key] || key;
  };
}
