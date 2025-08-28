# ImageTextEditor - Редактор изображений с текстом

Полнофункциональный компонент для добавления текста поверх изображений с возможностью перетаскивания, стилизации и экспорта.

## Возможности

### Загрузка изображений
- **По URL**: Вставьте ссылку на изображение и нажмите Enter
- **С компьютера**: Перетащите файл или нажмите кнопку "Загрузить с компьютера"
- Поддерживаемые форматы: JPG, PNG, GIF, WebP

### Работа с текстом
- **Добавление**: Нажмите "Добавить текст" для создания нового текстового элемента
- **Перетаскивание**: Кликните и перетащите текст в любое место на изображении
- **Редактирование**: Двойной клик для редактирования содержимого

### Стилизация текста
- **Шрифты**: Arial, Times New Roman, Courier New, Georgia, Verdana, Impact, Comic Sans MS
- **Размеры**: От 12px до 96px
- **Цвета**: Встроенный выбор цвета с HTML5 color picker
- **Выравнивание**: По левому краю, по центру, по правому краю
- **Стили**: Жирный, курсив, подчеркнутый, зачеркнутый
- **Прозрачность**: Настройка прозрачности от 0% до 100%

### Дополнительные эффекты
- **Тени**: Настройка цвета, размытия и смещения тени
- **Обводка**: Цветная обводка текста с настраиваемой толщиной
- **Фон**: Цветной фон за текстом с настраиваемой прозрачностью
- **Поворот**: Поворот текста на 15° влево или вправо

### Экспорт
- **Скачивание**: Скачать готовое изображение в формате PNG
- **Сохранение**: Сохранить данные для дальнейшего использования

## Использование

### Базовое использование

```tsx
import ImageTextEditor from '@app/components/common/ImageTextEditor/ImageTextEditor';

const MyComponent = () => {
  const handleSave = (imageData: string, textElements: TextElement[]) => {
    console.log('Сохраненное изображение:', imageData);
    console.log('Текстовые элементы:', textElements);
  };

  return (
    <ImageTextEditor 
      onSave={handleSave}
      initialImageUrl="https://example.com/image.jpg"
    />
  );
};
```

### С предустановленными текстовыми элементами

```tsx
const initialTextElements = [
  {
    id: '1',
    text: 'Заголовок',
    x: 100,
    y: 50,
    fontSize: 32,
    color: '#ff0000',
    fontFamily: 'Arial, sans-serif',
    isDragging: false,
    rotation: 0,
    opacity: 1,
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    fontStyle: 'normal' as const,
    textDecoration: 'none' as const,
    shadow: {
      enabled: true,
      color: '#000000',
      blur: 2,
      offsetX: 1,
      offsetY: 1
    },
    stroke: {
      enabled: false,
      color: '#ffffff',
      width: 1
    },
    backgroundColor: {
      enabled: false,
      color: '#ffffff',
      opacity: 0.5
    }
  }
];

<ImageTextEditor 
  onSave={handleSave}
  initialTextElements={initialTextElements}
/>
```

## Интерфейсы

### ImageTextEditorProps

```typescript
interface ImageTextEditorProps {
  onSave?: (imageData: string, textElements: TextElement[]) => void;
  initialImageUrl?: string;
  initialTextElements?: TextElement[];
}
```

### TextElement

```typescript
interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isDragging: boolean;
  rotation: number;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
  backgroundColor: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}
```

## Маршрут

Компонент доступен по маршруту: `/image-text-editor`

## Особенности

1. **Перетаскивание**: Текст можно перетаскивать мышью по изображению
2. **Выбор**: Кликните на текст для его выбора и редактирования
3. **Множественные элементы**: Можно добавлять неограниченное количество текстовых элементов
4. **Предварительный просмотр**: Все изменения отображаются в реальном времени
5. **Экспорт в Canvas**: Текст отрисовывается на Canvas для качественного экспорта
6. **Адаптивность**: Компонент адаптируется под размер контейнера

## Технические детали

- Использует HTML5 Canvas для экспорта изображений
- Поддерживает CORS для загрузки изображений с внешних доменов
- Оптимизирован для производительности с большими изображениями
- Использует styled-components для стилизации
- Полностью типизирован с TypeScript
