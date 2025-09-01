import React, { useState } from 'react';
import { Card, Button, Space, Typography, message } from 'antd';
import { SimpleQuizPlayer } from '../Khamza_planB/SimpleQuizPlayer';
import { H5PQuiz, H5PQuizResult } from '../Khamza_planB/types';

const { Title, Paragraph } = Typography;

const ImageDragDropDemoPage: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<H5PQuizResult | null>(null);

  // Демо-викторина с drag and drop на изображениях
  const demoQuiz: H5PQuiz = {
    id: 'image-drag-drop-demo',
    title: 'Демо: Drag and Drop на изображениях',
    description: 'Тестирование нового типа вопроса с перетаскиванием элементов на изображение',
    questions: [
      {
        id: 'q1',
        type: 'image-drag-drop',
        question: 'Перетащите правильные названия частей клубники на соответствующие места',
        correctAnswer: [], // Для image-drag-drop правильные ответы определяются в imageDragDrop
        points: 10,
        imageDragDrop: {
          imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=400&fit=crop',
          dropZones: [
            {
              id: 'zone1',
              x: 30, // 30% от ширины изображения
              y: 40, // 40% от высоты изображения
              width: 80,
              height: 40,
              label: 'Зона 1',
              correctItems: ['item1'],
            },
            {
              id: 'zone2',
              x: 70,
              y: 60,
              width: 80,
              height: 40,
              label: 'Зона 2',
              correctItems: ['item2'],
            },
            {
              id: 'zone3',
              x: 50,
              y: 80,
              width: 80,
              height: 40,
              label: 'Зона 3',
              correctItems: ['item3'],
            },
          ],
          draggableItems: [
            {
              id: 'item1',
              text: 'Fragaria',
              correctZoneId: 'zone1',
            },
            {
              id: 'item2',
              text: 'Vaccinium',
              correctZoneId: 'zone2',
            },
            {
              id: 'item3',
              text: 'Rubus',
              correctZoneId: 'zone3',
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'image-drag-drop',
        question: 'Перетащите названия цветов на соответствующие части растения',
        correctAnswer: [],
        points: 10,
        imageDragDrop: {
          imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop',
          dropZones: [
            {
              id: 'flower1',
              x: 25,
              y: 30,
              width: 60,
              height: 30,
              label: 'Цветок',
              correctItems: ['rose'],
            },
            {
              id: 'flower2',
              x: 75,
              y: 50,
              width: 60,
              height: 30,
              label: 'Лист',
              correctItems: ['tulip'],
            },
            {
              id: 'flower3',
              x: 50,
              y: 70,
              width: 60,
              height: 30,
              label: 'Стебель',
              correctItems: ['daisy'],
            },
          ],
          draggableItems: [
            {
              id: 'rose',
              text: 'Роза',
              correctZoneId: 'flower1',
            },
            {
              id: 'tulip',
              text: 'Тюльпан',
              correctZoneId: 'flower2',
            },
            {
              id: 'daisy',
              text: 'Ромашка',
              correctZoneId: 'flower3',
            },
          ],
        },
      },
    ],
    timeLimit: 5, // 5 минут
    passingScore: 70,
    shuffleQuestions: false,
    showResults: true,
    allowRetry: true,
    maxAttempts: 3,
  };

  const handleQuizComplete = (result: H5PQuizResult) => {
    setQuizResult(result);
    message.success(`Викторина завершена! Ваш результат: ${result.score}%`);
  };

  const handleQuizExit = () => {
    setShowQuiz(false);
    setQuizResult(null);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setQuizResult(null);
  };

  if (showQuiz) {
    return (
      <div style={{ padding: '20px' }}>
        <SimpleQuizPlayer quiz={demoQuiz} onComplete={handleQuizComplete} onExit={handleQuizExit} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Демо: Drag and Drop на изображениях</Title>

        <Paragraph>
          Это демонстрация нового типа вопроса <strong>image-drag-drop</strong>, который позволяет пользователям
          перетаскивать элементы на изображение в определенные зоны.
        </Paragraph>

        <Title level={3}>Особенности:</Title>
        <ul>
          <li>Загрузка изображения по URL</li>
          <li>Определение зон для перетаскивания (drop zones)</li>
          <li>Перетаскиваемые элементы с текстом</li>
          <li>Визуальная обратная связь при перетаскивании</li>
          <li>Проверка правильности размещения</li>
          <li>Возможность сброса и повторного размещения</li>
        </ul>

        <Title level={3}>Как использовать:</Title>
        <ol>
          <li>Нажмите "Начать викторину"</li>
          <li>Перетащите элементы из нижней панели на соответствующие зоны на изображении</li>
          <li>Используйте кнопку "Сбросить" для очистки всех размещений</li>
          <li>Завершите викторину, нажав "Далее"</li>
        </ol>

        {quizResult && (
          <Card style={{ marginTop: '20px', backgroundColor: '#f6ffed' }}>
            <Title level={4}>Последний результат:</Title>
            <Paragraph>
              <strong>Результат:</strong> {quizResult.score}% ({quizResult.correctAnswers}/{quizResult.totalQuestions}{' '}
              правильных)
            </Paragraph>
            <Paragraph>
              <strong>Время:</strong> {Math.floor(quizResult.timeSpent / 60)}:
              {(quizResult.timeSpent % 60).toString().padStart(2, '0')}
            </Paragraph>
            <Paragraph>
              <strong>Статус:</strong> {quizResult.passed ? 'Пройдено' : 'Не пройдено'}
            </Paragraph>
          </Card>
        )}

        <Space style={{ marginTop: '20px' }}>
          <Button type="primary" size="large" onClick={handleStartQuiz}>
            Начать викторину
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ImageDragDropDemoPage;
