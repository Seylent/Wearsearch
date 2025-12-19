/**
 * Translation utilities for category names and other common terms
 */

export const getCategoryTranslation = (category: string): string => {
  const translations: { [key: string]: string } = {
    'jackets': 'Куртки',
    'hoodies': 'Худі',
    'T-shirts': 'Футболки',
    't-shirts': 'Футболки',
    'pants': 'Штани',
    'jeans': 'Джинси',
    'shorts': 'Шорти',
    'shoes': 'Взуття',
    'accessories': 'Аксесуари'
  };
  return translations[category] || category;
};

export const getColorTranslation = (color: string): string => {
  const translations: { [key: string]: string } = {
    'Black': 'Чорний',
    'White': 'Білий',
    'Blue': 'Синій',
    'Red': 'Червоний',
    'Green': 'Зелений',
    'Yellow': 'Жовтий',
    'Brown': 'Коричневий',
    'Gray': 'Сірий',
    'Grey': 'Сірий',
    'Pink': 'Рожевий',
    'Purple': 'Фіолетовий',
    'Orange': 'Помаранчевий',
    'Beige': 'Бежевий',
    'Navy': 'Темно-синій'
  };
  return translations[color] || color;
};

export const getGenderTranslation = (gender: string): string => {
  const translations: { [key: string]: string } = {
    'male': 'Чоловіча',
    'female': 'Жіноча',
    'unisex': 'Унісекс'
  };
  return translations[gender] || gender;
};
