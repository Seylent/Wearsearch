export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  UK: 'uk',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

export const LANGUAGE_CONFIG = {
  DEFAULT: SUPPORTED_LANGUAGES.UK,
  STORAGE_KEY: 'wearsearch_language',
  EXPLICIT_KEY: 'wearsearch_language_explicit',
  SUPPORTED: [SUPPORTED_LANGUAGES.UK, SUPPORTED_LANGUAGES.EN],
} as const;
