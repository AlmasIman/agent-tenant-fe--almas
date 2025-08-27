import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Input, Progress, message, Tooltip, Badge } from 'antd';
import { CheckOutlined, EyeOutlined, ReloadOutlined, BulbOutlined, TrophyOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Blank {
  id: string;
  word: string;
  hint?: string;
  position: number;
}

interface FillWordsSlideProps {
  slide: any;
  onComplete?: (score: number) => void;
}

const FillWordsSlide: React.FC<FillWordsSlideProps> = ({ slide, onComplete }) => {
  const [blanks, setBlanks] = useState<Blank[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [originalText, setOriginalText] = useState('');

  useEffect(() => {
    if (slide.content) {
      try {
        const content = JSON.parse(slide.content);
        const fillWords = content.fillWords;
        
        if (fillWords) {
          setBlanks(fillWords.blanks || []);
          setOriginalText(fillWords.text || '');
          setShowHints(fillWords.showHints || false);
        }
      } catch (error) {
        console.error('Error parsing fill words:', error);
        setBlanks([]);
        setOriginalText('');
      }
    }
  }, [slide.content]);

  const handleAnswerChange = (blankId: string, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [blankId]: value
    }));
  };

  const handleCheckAnswers = () => {
    const answeredBlanks = Object.keys(userAnswers).length;
    const totalBlanks = blanks.length;
    
    if (answeredBlanks < totalBlanks) {
      message.warning(`Заполните все пропуски! Осталось: ${totalBlanks - answeredBlanks}`);
      return;
    }

    let correctAnswers = 0;
    const caseSensitive = JSON.parse(slide.content || '{}').fillWords?.caseSensitive || false;

    blanks.forEach(blank => {
      const userAnswer = userAnswers[blank.id] || '';
      const correctAnswer = blank.word;
      
      const isCorrect = caseSensitive 
        ? userAnswer.trim() === correctAnswer
        : userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
      
      if (isCorrect) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / totalBlanks) * 100);
    setScore(finalScore);
    setIsCompleted(true);

    if (finalScore === 100) {
      message.success('Отлично! Все ответы правильные! 🎉');
    } else if (finalScore >= 80) {
      message.success(`Хорошо! Правильных ответов: ${correctAnswers} из ${totalBlanks}`);
    } else {
      message.info(`Правильных ответов: ${correctAnswers} из ${totalBlanks}. Попробуйте еще раз!`);
    }

    onComplete?.(finalScore);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsCompleted(false);
    setScore(0);
  };

  const handleShowHints = () => {
    setShowHints(!showHints);
  };

  const renderTextWithBlanks = () => {
    if (!originalText) return null;

    let result = [];
    let lastIndex = 0;

    // Сортируем пропуски по позиции
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank, index) => {
      // Добавляем текст до пропуска
      if (blank.position > lastIndex) {
        result.push(
          <span key={`text-${index}`} style={{ fontSize: '18px', lineHeight: '2.5' }}>
            {originalText.slice(lastIndex, blank.position)}
          </span>
        );
      }

      // Добавляем поле ввода для пропуска
      const isCorrect = isCompleted && userAnswers[blank.id]?.trim() === blank.word;
      const isIncorrect = isCompleted && userAnswers[blank.id]?.trim() !== blank.word;

      result.push(
        <span key={`blank-${blank.id}`} style={{ 
          display: 'inline-block', 
          margin: '0 8px',
          position: 'relative',
        }}>
          <Input
            value={userAnswers[blank.id] || ''}
            onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
            placeholder="Введите слово"
            disabled={isCompleted}
            style={{
              width: '140px',
              height: '40px',
              fontSize: '16px',
              borderRadius: '20px',
              border: isCompleted 
                ? (isCorrect ? '2px solid #52c41a' : '2px solid #ff4d4f')
                : '2px solid #d9d9d9',
              backgroundColor: isCompleted 
                ? (isCorrect ? '#f6ffed' : '#fff2f0')
                : '#ffffff',
              boxShadow: isCompleted 
                ? (isCorrect ? '0 0 0 2px rgba(82, 196, 26, 0.2)' : '0 0 0 2px rgba(255, 77, 79, 0.2)')
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            }}
            suffix={
              isCompleted && (
                <span style={{ 
                  color: isCorrect ? '#52c41a' : '#ff4d4f',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}>
                  {isCorrect ? <CheckOutlined /> : '✗'}
                </span>
              )
            }
          />
          {showHints && blank.hint && (
            <Tooltip title={blank.hint} placement="top">
              <BulbOutlined style={{ 
                marginLeft: '8px', 
                color: '#faad14',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              />
            </Tooltip>
          )}
        </span>
      );

      lastIndex = blank.position + blank.word.length;
    });

    // Добавляем оставшийся текст
    if (lastIndex < originalText.length) {
      result.push(
        <span key="text-end" style={{ fontSize: '18px', lineHeight: '2.5' }}>
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)';
    if (score >= 70) return 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)';
    return 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)';
  };

  if (!originalText || blanks.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
          Заполните пропуски
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Нет текста для заполнения
        </Text>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '16px',
    }}>
      {/* Заголовок */}
      <div style={{ 
        marginBottom: '24px',
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
          Заполните пропущенные слова
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
          Заполните все пропуски в тексте. {blanks.length} слов(а) нужно ввести.
        </Text>
      </div>

      {/* Прогресс */}
      <div style={{ 
        marginBottom: '24px',
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      }}>
        <Progress 
          percent={Math.round((Object.keys(userAnswers).length / blanks.length) * 100)} 
          showInfo={false}
          strokeColor={{
            '0%': '#667eea',
            '100%': '#764ba2',
          }}
          strokeWidth={8}
          trailColor="#f0f0f0"
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '8px',
        }}>
          <Text style={{ fontSize: '14px', color: '#666' }}>
            Заполнено: {Object.keys(userAnswers).length} из {blanks.length}
          </Text>
          <Badge 
            count={Object.keys(userAnswers).length} 
            showZero 
            style={{ 
              backgroundColor: Object.keys(userAnswers).length === blanks.length ? '#52c41a' : '#1890ff',
            }}
          />
        </div>
      </div>

      {/* Текст с пропусками */}
      <Card style={{ 
        flex: 1, 
        marginBottom: '24px',
        background: 'white',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ 
          padding: '24px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Paragraph style={{ 
            fontSize: '18px', 
            lineHeight: '2.5',
            margin: 0,
            textAlign: 'justify',
            color: '#2c3e50',
            fontWeight: '400',
          }}>
            {renderTextWithBlanks()}
          </Paragraph>
        </div>
      </Card>

      {/* Результат */}
      {isCompleted && (
        <Card style={{ 
          marginBottom: '24px',
          background: 'white',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '24px',
            background: getScoreGradient(score),
            textAlign: 'center',
            color: 'white',
          }}>
            <div style={{ marginBottom: '16px' }}>
              {score >= 90 && <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />}
              {score >= 70 && score < 90 && <StarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />}
            </div>
            <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
              Результат: {score}%
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
              {score >= 90 && 'Отлично! Вы отлично справились с заданием! 🎉'}
              {score >= 70 && score < 90 && 'Хорошо! Есть небольшие ошибки, но в целом хорошо! 👍'}
              {score < 70 && 'Попробуйте еще раз! Обратите внимание на ошибки. 💪'}
            </Text>
          </div>
        </Card>
      )}

      {/* Кнопки управления */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '16px',
      }}>
        {!isCompleted ? (
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={handleCheckAnswers}
            size="large"
            style={{
              height: '48px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
            }}
          >
            Проверить ответы
          </Button>
        ) : (
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleReset}
            size="large"
            style={{
              height: '48px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #1890ff',
              color: '#1890ff',
              background: 'white',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Попробовать снова
          </Button>
        )}

        <Button 
          icon={<EyeOutlined />}
          onClick={handleShowHints}
          type={showHints ? 'primary' : 'default'}
          size="large"
          style={{
            height: '48px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '600',
            background: showHints 
              ? 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)'
              : 'white',
            border: showHints ? 'none' : '2px solid #d9d9d9',
            color: showHints ? 'white' : '#666',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!showHints) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showHints) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {showHints ? 'Скрыть подсказки' : 'Показать подсказки'}
        </Button>
      </div>

      {/* Правильные ответы (показываются после завершения) */}
      {isCompleted && score < 100 && (
        <Card 
          title={
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
              Правильные ответы
            </span>
          }
          size="small" 
          style={{ 
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {blanks.map(blank => (
              <div key={blank.id} style={{ 
                padding: '8px 16px', 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '20px',
                fontSize: '14px',
                border: '1px solid #dee2e6',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <strong style={{ color: '#2c3e50' }}>{blank.word}</strong>
                {blank.hint && (
                  <span style={{ 
                    color: '#6c757d', 
                    marginLeft: '8px',
                    fontSize: '12px',
                  }}>
                    ({blank.hint})
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FillWordsSlide;
