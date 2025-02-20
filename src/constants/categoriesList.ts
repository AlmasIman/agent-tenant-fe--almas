export type CategoryType = 'kb' | 'trainings' | 'users';

interface Category {
  name: CategoryType;
  title: string;
}

export const categoriesList: Category[] = [
  {
    name: 'kb',
    title: 'база знаний',
  },
  {
    name: 'trainings',
    title: 'тренинги',
  },
  {
    name: 'users',
    title: 'пользователи',
  }
];
