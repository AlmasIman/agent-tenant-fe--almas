# Руководство по Image Drag and Drop

## Обзор

Новый тип вопроса `image-drag-drop` позволяет создавать интерактивные задания, где пользователи перетаскивают элементы на изображение в определенные зоны. Это идеально подходит для:

- Анатомических схем
- Карт с подписями
- Диаграмм с элементами
- Образовательных материалов с визуальными элементами

## Структура вопроса

### Основные поля

```typescript
{
  id: string;
  type: 'image-drag-drop';
  question: string;
  correctAnswer: []; // Пустой массив для image-drag-drop
  points: number;
  imageDragDrop: {
    imageUrl: string;
    dropZones: DropZone[];
    draggableItems: DraggableItem[];
  };
}
```

### DropZone (Зона для перетаскивания)

```typescript
interface DropZone {
  id: string;           // Уникальный идентификатор зоны
  x: number;           // Позиция X в процентах от ширины изображения
  y: number;           // Позиция Y в процентах от высоты изображения
  width: number;       // Ширина зоны в пикселях
  height: number;      // Высота зоны в пикселях
  label?: string;      // Подпись зоны (опционально)
  correctItems: string[]; // ID правильных элементов для этой зоны
}
```

### DraggableItem (Перетаскиваемый элемент)

```typescript
interface DraggableItem {
  id: string;           // Уникальный идентификатор элемента
  text: string;         // Текст элемента
  correctZoneId: string; // ID правильной зоны для этого элемента
}
```

## Пример создания вопроса

```typescript
const question: H5PQuizQuestion = {
  id: 'anatomy-question',
  type: 'image-drag-drop',
  question: 'Перетащите названия частей тела на соответствующие места',
  correctAnswer: [],
  points: 10,
  imageDragDrop: {
    imageUrl: 'https://example.com/anatomy-diagram.jpg',
    dropZones: [
      {
        id: 'head-zone',
        x: 50,    // 50% от ширины изображения
        y: 20,    // 20% от высоты изображения
        width: 100,
        height: 50,
        label: 'Голова',
        correctItems: ['head-item']
      },
      {
        id: 'heart-zone',
        x: 50,
        y: 50,
        width: 80,
        height: 40,
        label: 'Сердце',
        correctItems: ['heart-item']
      }
    ],
    draggableItems: [
      {
        id: 'head-item',
        text: 'Голова',
        correctZoneId: 'head-zone'
      },
      {
        id: 'heart-item',
        text: 'Сердце',
        correctZoneId: 'heart-zone'
      }
    ]
  }
};
```

## Как использовать

### 1. Создание викторины

```typescript
import { H5PQuiz } from './types';

const quiz: H5PQuiz = {
  id: 'my-quiz',
  title: 'Анатомия человека',
  description: 'Тест по анатомии с drag and drop',
  questions: [
    // Ваши вопросы image-drag-drop
  ],
  timeLimit: 10,
  passingScore: 70,
  shuffleQuestions: false,
  showResults: true,
  allowRetry: true
};
```

### 2. Использование в SimpleQuizPlayer

```typescript
import { SimpleQuizPlayer } from './SimpleQuizPlayer';

<SimpleQuizPlayer
  quiz={quiz}
  onComplete={(result) => console.log('Результат:', result)}
  onExit={() => console.log('Выход')}
/>
```

### 3. Демо-страница

Перейдите на `/image-drag-drop-demo` для тестирования функционала.

## Особенности интерфейса

### Визуальные элементы

1. **Изображение с зонами**: Отображается с пунктирными границами зон
2. **Перетаскиваемые элементы**: Панель с элементами внизу
3. **Обратная связь**: Цветовая индикация правильности размещения
4. **Управление**: Кнопка сброса для очистки всех размещений

### Интерактивность

- **Drag and Drop**: Перетаскивание элементов мышью
- **Click to Place**: Клик по зоне для размещения выбранного элемента
- **Remove**: Клик по размещенному элементу для удаления
- **Reset**: Кнопка для сброса всех размещений

## Лучшие практики

### 1. Размеры зон

- Делайте зоны достаточно большими для удобного перетаскивания
- Рекомендуемый минимальный размер: 60x30 пикселей
- Учитывайте размер текста элементов

### 2. Позиционирование

- Используйте проценты для позиций (x, y) для адаптивности
- Тестируйте на разных размерах экрана
- Избегайте перекрытия зон

### 3. Изображения

- Используйте качественные изображения
- Оптимизируйте размер файлов
- Убедитесь в хорошем контрасте с текстом

### 4. Текст элементов

- Делайте текст коротким и понятным
- Используйте одинаковый стиль для всех элементов
- Избегайте специальных символов

## Примеры использования

### Анатомия

```typescript
// Части тела
{
  imageUrl: 'human-body-diagram.jpg',
  dropZones: [
    { id: 'head', x: 50, y: 15, width: 80, height: 40, label: 'Голова' },
    { id: 'heart', x: 50, y: 45, width: 60, height: 30, label: 'Сердце' },
    { id: 'lungs', x: 40, y: 45, width: 60, height: 30, label: 'Легкие' }
  ],
  draggableItems: [
    { id: 'head-item', text: 'Голова', correctZoneId: 'head' },
    { id: 'heart-item', text: 'Сердце', correctZoneId: 'heart' },
    { id: 'lungs-item', text: 'Легкие', correctZoneId: 'lungs' }
  ]
}
```

### Карта

```typescript
// Столицы стран
{
  imageUrl: 'europe-map.jpg',
  dropZones: [
    { id: 'france', x: 30, y: 40, width: 60, height: 30, label: 'Франция' },
    { id: 'germany', x: 45, y: 35, width: 60, height: 30, label: 'Германия' },
    { id: 'spain', x: 25, y: 55, width: 60, height: 30, label: 'Испания' }
  ],
  draggableItems: [
    { id: 'paris', text: 'Париж', correctZoneId: 'france' },
    { id: 'berlin', text: 'Берлин', correctZoneId: 'germany' },
    { id: 'madrid', text: 'Мадрид', correctZoneId: 'spain' }
  ]
}
```

### Диаграмма

```typescript
// Части растения
{
  imageUrl: 'plant-diagram.jpg',
  dropZones: [
    { id: 'root', x: 50, y: 85, width: 60, height: 25, label: 'Корень' },
    { id: 'stem', x: 50, y: 60, width: 40, height: 30, label: 'Стебель' },
    { id: 'leaf', x: 70, y: 50, width: 50, height: 20, label: 'Лист' },
    { id: 'flower', x: 50, y: 25, width: 60, height: 30, label: 'Цветок' }
  ],
  draggableItems: [
    { id: 'root-item', text: 'Корень', correctZoneId: 'root' },
    { id: 'stem-item', text: 'Стебель', correctZoneId: 'stem' },
    { id: 'leaf-item', text: 'Лист', correctZoneId: 'leaf' },
    { id: 'flower-item', text: 'Цветок', correctZoneId: 'flower' }
  ]
}
```

## Технические детали

### Состояние ответов

Ответы сохраняются в формате:
```typescript
{
  [itemId]: zoneId
}
```

### Проверка правильности

```typescript
const isCorrect = draggableItems.every(item => 
  answers[item.id] === item.correctZoneId
);
```

### Производительность

- Изображения загружаются асинхронно
- Drag and drop оптимизирован для плавности
- Состояние обновляется только при необходимости

## Устранение неполадок

### Проблемы с позиционированием

1. Проверьте, что координаты x, y указаны в процентах
2. Убедитесь, что зоны не выходят за границы изображения
3. Тестируйте на разных размерах экрана

### Проблемы с перетаскиванием

1. Проверьте, что все ID уникальны
2. Убедитесь, что `correctZoneId` соответствует существующей зоне
3. Проверьте, что изображение загрузилось корректно

### Проблемы с проверкой

1. Убедитесь, что все элементы имеют правильные `correctZoneId`
2. Проверьте, что структура данных соответствует интерфейсу
3. Убедитесь, что `correctAnswer` установлен в пустой массив

## Заключение

Тип вопроса `image-drag-drop` предоставляет мощный инструмент для создания интерактивных образовательных материалов. При правильном использовании он может значительно улучшить вовлеченность пользователей и эффективность обучения.
