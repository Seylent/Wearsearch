export type CollectionSlug = 'hoodies' | 'sneakers' | 'jackets' | 'pants' | 'accessories';

export const COLLECTIONS: Record<
  CollectionSlug,
  {
    type: string;
    title: { uk: string; en: string };
    description: { uk: string; en: string };
    intro: { uk: string; en: string };
  }
> = {
  hoodies: {
    type: 'hoodies',
    title: { uk: 'Худі', en: 'Hoodies' },
    description: {
      uk: 'Худі від топ-брендів: базові моделі та нові дропи.',
      en: 'Hoodies from top brands: essentials and new drops.',
    },
    intro: {
      uk: 'Знайдіть комфортні худі для щоденного стилю з актуальних колекцій.',
      en: 'Find comfortable hoodies for everyday style from fresh collections.',
    },
  },
  sneakers: {
    type: 'shoes',
    title: { uk: 'Кросівки', en: 'Sneakers' },
    description: {
      uk: 'Кросівки та актуальне взуття з нових колекцій.',
      en: 'Sneakers and footwear edits with the latest releases.',
    },
    intro: {
      uk: 'Добірка кросівок і взуття з найцікавіших новинок сезону.',
      en: 'A curated sneaker selection with standout new drops.',
    },
  },
  jackets: {
    type: 'jackets',
    title: { uk: 'Куртки', en: 'Jackets' },
    description: {
      uk: 'Куртки, пуховики та верхній одяг з актуальних дропів.',
      en: 'Jackets, outerwear, and seasonal drops from top brands.',
    },
    intro: {
      uk: 'Оберіть верхній одяг для різних сезонів та погодних умов.',
      en: 'Shop outerwear for every season and weather.',
    },
  },
  pants: {
    type: 'pants',
    title: { uk: 'Штани', en: 'Pants' },
    description: {
      uk: 'Штани, джинси та повсякденні моделі для базового гардеробу.',
      en: 'Pants, denim, and everyday fits for a complete wardrobe.',
    },
    intro: {
      uk: 'Підійміть свій лук з сучасними силуетами і комфортними матеріалами.',
      en: 'Upgrade your fit with modern silhouettes and comfortable materials.',
    },
  },
  accessories: {
    type: 'accessories',
    title: { uk: 'Аксесуари', en: 'Accessories' },
    description: {
      uk: 'Аксесуари для завершення образу: сумки, головні убори, ремені.',
      en: 'Accessories to complete the look: bags, headwear, belts, and more.',
    },
    intro: {
      uk: 'Додайте фінальний штрих до стилю з актуальними аксесуарами.',
      en: 'Add the finishing touch with curated accessories.',
    },
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTIONS) as CollectionSlug[];

export const getCollectionConfig = (slug: string) => COLLECTIONS[slug as CollectionSlug] || null;

export const getCollectionType = (slug: string | undefined | null) => {
  if (!slug) return null;
  const config = getCollectionConfig(slug);
  return config?.type || null;
};
