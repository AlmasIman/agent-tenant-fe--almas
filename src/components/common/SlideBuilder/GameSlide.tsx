import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Progress, Badge, message } from 'antd';
import { TrophyOutlined, StarOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface GameSlideProps {
  slide: any;
  onComplete?: (score: number) => void;
  onProgress?: (progress: number) => void;
}

const GameSlide: React.FC<GameSlideProps> = ({ slide, onComplete, onProgress }) => {
  const [gameState, setGameState] = useState('ready'); // ready, playing, completed
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setCurrentLevel(1);
  };

  const endGame = () => {
    setGameState('completed');
    onComplete?.(score);
    message.success(`Игра завершена! Ваш счет: ${score}`);
  };

  const addScore = (points: number) => {
    setScore(score + points);
    onProgress?.(score + points);
  };

  const renderMemoryGame = () => {
    const [cards, setCards] = useState<Array<{id: number, value: string, flipped: boolean, matched: boolean}>>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);

    useEffect(() => {
      const values = ['🎮', '🎲', '🎯', '🏆', '⭐', '🔥', '💎', '🌟'];
      const gameCards = [...values, ...values].map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false,
      }));
      setCards(gameCards.sort(() => Math.random() - 0.5));
    }, []);

    const handleCardClick = (cardId: number) => {
      if (flippedCards.length === 2 || cards[cardId].flipped || cards[cardId].matched) return;

      const newCards = [...cards];
      newCards[cardId].flipped = true;
      setCards(newCards);

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
        setTimeout(() => {
          const [first, second] = newFlippedCards;
          if (cards[first].value === cards[second].value) {
            newCards[first].matched = true;
            newCards[second].matched = true;
            addScore(10);
          } else {
            newCards[first].flipped = false;
            newCards[second].flipped = false;
          }
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Игра "Память"</Title>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '10px', 
          maxWidth: '400px', 
          margin: '0 auto' 
        }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              style={{
                width: '80px',
                height: '80px',
                border: '2px solid #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: 'pointer',
                backgroundColor: card.flipped || card.matched ? '#f0f0f0' : '#1890ff',
                color: card.flipped || card.matched ? '#000' : 'transparent',
                transition: 'all 0.3s',
              }}
            >
              {card.flipped || card.matched ? card.value : '?'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPuzzleGame = () => {
    const [puzzle, setPuzzle] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
      const numbers = Array.from({ length: 8 }, (_, i) => i + 1);
      numbers.push(0); // пустая клетка
      setPuzzle(numbers.sort(() => Math.random() - 0.5));
    }, []);

    const moveTile = (index: number) => {
      const emptyIndex = puzzle.indexOf(0);
      if (isAdjacent(index, emptyIndex)) {
        const newPuzzle = [...puzzle];
        [newPuzzle[index], newPuzzle[emptyIndex]] = [newPuzzle[emptyIndex], newPuzzle[index]];
        setPuzzle(newPuzzle);
        setMoves(moves + 1);
        
        if (isSolved(newPuzzle)) {
          addScore(Math.max(100 - moves * 2, 20));
          message.success('Пазл собран!');
        }
      }
    };

    const isAdjacent = (index1: number, index2: number) => {
      const row1 = Math.floor(index1 / 3);
      const col1 = index1 % 3;
      const row2 = Math.floor(index2 / 3);
      const col2 = index2 % 3;
      return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    };

    const isSolved = (puzzleState: number[]) => {
      return puzzleState.every((num, index) => num === (index + 1) % 9);
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Пазл "15"</Title>
        <Text>Ходов: {moves}</Text>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '5px', 
          maxWidth: '300px', 
          margin: '20px auto' 
        }}>
          {puzzle.map((num, index) => (
            <div
              key={index}
              onClick={() => moveTile(index)}
              style={{
                width: '80px',
                height: '80px',
                border: '2px solid #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: num === 0 ? 'default' : 'pointer',
                backgroundColor: num === 0 ? 'transparent' : '#1890ff',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {num === 0 ? '' : num}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDragDropGame = () => {
    const [items, setItems] = useState([
      { id: 1, text: 'React', category: 'frontend', dragged: false },
      { id: 2, text: 'Vue', category: 'frontend', dragged: false },
      { id: 3, text: 'Angular', category: 'frontend', dragged: false },
      { id: 4, text: 'Node.js', category: 'backend', dragged: false },
      { id: 5, text: 'Python', category: 'backend', dragged: false },
      { id: 6, text: 'Java', category: 'backend', dragged: false },
    ]);
    const [dropZones, setDropZones] = useState({
      frontend: [],
      backend: [],
    });

    const handleDragStart = (e: React.DragEvent, item: any) => {
      e.dataTransfer.setData('text/plain', item.id.toString());
    };

    const handleDrop = (e: React.DragEvent, category: string) => {
      e.preventDefault();
      const itemId = parseInt(e.dataTransfer.getData('text/plain'));
      const item = items.find(i => i.id === itemId);
      
      if (item && item.category === category) {
        addScore(5);
        message.success(`Правильно! ${item.text} - это ${category}`);
      } else {
        message.error('Неправильно! Попробуйте еще раз');
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Перетащите технологии в правильные категории</Title>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1 }}>
            <Title level={4}>Frontend</Title>
            <div
              onDrop={(e) => handleDrop(e, 'frontend')}
              onDragOver={handleDragOver}
              style={{
                minHeight: '200px',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fafafa',
              }}
            >
              {dropZones.frontend.map((item: any) => (
                <div key={item.id} style={{ padding: '10px', margin: '5px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <Title level={4}>Backend</Title>
            <div
              onDrop={(e) => handleDrop(e, 'backend')}
              onDragOver={handleDragOver}
              style={{
                minHeight: '200px',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fafafa',
              }}
            >
              {dropZones.backend.map((item: any) => (
                <div key={item.id} style={{ padding: '10px', margin: '5px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1890ff',
                color: 'white',
                borderRadius: '20px',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGameContent = () => {
    const gameType = slide.content?.game?.type || 'memory';
    
    switch (gameType) {
      case 'memory':
        return renderMemoryGame();
      case 'puzzle':
        return renderPuzzleGame();
      case 'dragdrop':
        return renderDragDropGame();
      default:
        return renderMemoryGame();
    }
  };

  if (gameState === 'ready') {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <TrophyOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '20px' }} />
        <Title level={2}>Готовы к игре?</Title>
        <Text>Нажмите кнопку, чтобы начать увлекательное приключение!</Text>
        <br />
        <Button type="primary" size="large" onClick={startGame} style={{ marginTop: '20px' }}>
          Начать игру
        </Button>
      </Card>
    );
  }

  if (gameState === 'completed') {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '20px' }} />
        <Title level={2}>Игра завершена!</Title>
        <Text>Ваш финальный счет: <strong>{score}</strong></Text>
        <br />
        <Progress percent={(score / 100) * 100} style={{ margin: '20px 0' }} />
        <Button type="primary" onClick={startGame}>
          Играть снова
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <Text strong>Счет: {score}</Text>
          <br />
          <Text>Время: {timeLeft}s</Text>
        </div>
        <Badge count={currentLevel} style={{ backgroundColor: '#52c41a' }}>
          <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
        </Badge>
      </div>
      
      {renderGameContent()}
    </Card>
  );
};

export default GameSlide;
