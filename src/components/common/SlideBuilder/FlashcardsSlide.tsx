import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Progress, Badge, message } from 'antd';
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface FlashcardsSlideProps {
  slide: any;
  onComplete?: (score: number) => void;
}

const FlashcardsSlide: React.FC<FlashcardsSlideProps> = ({ slide, onComplete }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (slide.content) {
      try {
        const content = JSON.parse(slide.content);
        let flashCards = content.flashcards?.cards || [];

        if (content.flashcards?.shuffle) {
          flashCards = [...flashCards].sort(() => Math.random() - 0.5);
          setIsShuffled(true);
        }

        setCards(flashCards);
      } catch (error) {
        console.error('Error parsing flashcards:', error);
        setCards([]);
      }
    }
  }, [slide.content]);

  const currentCard = cards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setCompletedCards((prev) => new Set([...prev, currentCard.id]));
    } else {
      // Все карточки просмотрены
      const finalScore = Math.round((completedCards.size / cards.length) * 100);
      onComplete?.(finalScore);
      message.success(`Просмотрено ${cards.length} карточек!`);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
    setCompletedCards(new Set());
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Легко';
      case 'medium':
        return 'Средне';
      case 'hard':
        return 'Сложно';
      default:
        return 'Обычно';
    }
  };

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Title level={3}>Флеш-карточки</Title>
        <Text type="secondary">Нет карточек для отображения</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
      }}
    >
      {/* Заголовок и прогресс */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Флеш-карточки
          </Title>
          <Space>
            {currentCard?.category && <Badge color="blue" text={currentCard.category} />}
            {currentCard?.difficulty && (
              <Badge
                color={getDifficultyColor(currentCard.difficulty)}
                text={getDifficultyLabel(currentCard.difficulty)}
              />
            )}
          </Space>
        </div>

        <Progress
          percent={Math.round(((currentCardIndex + 1) / cards.length) * 100)}
          showInfo={false}
          strokeColor="#1890ff"
        />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {currentCardIndex + 1} из {cards.length}
        </Text>
      </div>

      {/* Карточка */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          height: '300px',
          perspective: '1000px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            cursor: 'pointer',
          }}
          onClick={handleFlip}
        >
          {/* Лицевая сторона */}
          <Card
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f8ff',
              border: '2px solid #1890ff',
              borderRadius: '12px',
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Title level={2} style={{ marginBottom: '20px' }}>
                {currentCard?.front || 'Вопрос'}
              </Title>
              <Text type="secondary">Нажмите, чтобы перевернуть</Text>
            </div>
          </Card>

          {/* Обратная сторона */}
          <Card
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e6f7ff',
              border: '2px solid #52c41a',
              borderRadius: '12px',
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Title level={2} style={{ marginBottom: '20px', color: '#52c41a' }}>
                {currentCard?.back || 'Ответ'}
              </Title>
              <Text type="secondary">Нажмите, чтобы перевернуть обратно</Text>
            </div>
          </Card>
        </div>
      </div>

      {/* Навигация */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '20px',
          width: '100%',
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={handlePrevious} disabled={currentCardIndex === 0} size="large">
          Назад
        </Button>

        <Button
          type="primary"
          icon={isFlipped ? <RotateLeftOutlined /> : <RotateRightOutlined />}
          onClick={handleFlip}
          size="large"
        >
          {isFlipped ? 'Перевернуть обратно' : 'Перевернуть'}
        </Button>

        <Button
          icon={<ArrowRightOutlined />}
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          size="large"
        >
          Далее
        </Button>
      </div>

      {/* Дополнительные действия */}
      <div style={{ marginTop: '16px' }}>
        <Button icon={<ReloadOutlined />} onClick={handleShuffle} type="dashed">
          Перемешать карточки
        </Button>
      </div>

      {/* Статистика */}
      {completedCards.size > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Text type="secondary">
            Просмотрено: {completedCards.size} из {cards.length}
          </Text>
        </div>
      )}
    </div>
  );
};

export default FlashcardsSlide;
