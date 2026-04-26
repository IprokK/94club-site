export type EventItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  status: 'Скоро' | 'Прошло' | 'Черновик';
  image: string;
};

export type GalleryItem = {
  id: number;
  title: string;
  tag: string;
  image: string;
  /** Ссылка на папку с фото на Яндекс.Диске (с API). */
  yandexDiskUrl?: string | null;
};

export const defaultEvents: EventItem[] = [
  {
    id: 1,
    title: 'Офлайн-запуск 94 Club',
    category: 'Старт',
    date: '23 мая',
    location: 'ИТМО',
    status: 'Прошло',
    image: '/assets/page-2.png',
    description: 'Первое большое знакомство с клубом: люди, музыка, активности и та самая атмосфера, после которой хочется остаться надолго.'
  },
  {
    id: 2,
    title: 'Квест «94 оттенка любви»',
    category: 'Квест',
    date: '14 февраля',
    location: 'Кампус',
    status: 'Прошло',
    image: '/assets/events-poster.png',
    description: 'Командный формат, станции, загадки и романтичный визуальный стиль. Формат, который объединяет и дарит эмоции.'
  },
  {
    id: 3,
    title: 'Выезд «Бесконечная весна»',
    category: 'Выезд',
    date: 'Весенний сезон',
    location: 'За городом',
    status: 'Прошло',
    image: '/assets/minimag-triptych.png',
    description: 'Два дня перезагрузки: костёр, прогулки, разговоры, творческие активности и сильное комьюнити вокруг.'
  },
  {
    id: 4,
    title: 'Новые знакомства, новые возможности',
    category: 'Анонс',
    date: 'Скоро',
    location: '94 Club',
    status: 'Скоро',
    image: '/assets/brandbook.png',
    description: 'Большой набор в сообщество для тех, кто хочет быть внутри событий, а не просто наблюдать со стороны.'
  }
];

export const defaultGallery: GalleryItem[] = [
  { id: 1, title: 'Фирменный стиль 94 Club', tag: 'Брендбук', image: '/assets/brandbook.png' },
  { id: 2, title: 'Афиша мероприятий', tag: 'Плакат', image: '/assets/events-poster.png' },
  { id: 3, title: 'Страница мини-журнала', tag: 'Журнал', image: '/assets/page-1.png' },
  { id: 4, title: 'События клуба', tag: 'Коллаж', image: '/assets/page-2.png' },
  { id: 5, title: 'Триптих мини-журнала', tag: '3 страницы', image: '/assets/minimag-triptych.png' }
];
