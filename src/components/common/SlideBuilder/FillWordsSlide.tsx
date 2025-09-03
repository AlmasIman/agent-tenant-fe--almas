import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Input, Progress, message, Tooltip, Badge } from 'antd';
import {
  CheckOutlined,
  EyeOutlined,
  ReloadOutlined,
  BulbOutlined,
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';

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
    setUserAnswers((prev) => ({
      ...prev,
      [blankId]: value,
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

    blanks.forEach((blank) => {
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

    // Разбиваем текст по последовательностям подчёркиваний (одно или больше)
    const parts = originalText.split(/(_{1,})/g);
    let blankIndex = 0;

    const renderText = (text: string, key: string) => (
      <span key={key} style={{ fontSize: '18px', lineHeight: '2.2', whiteSpace: 'pre-wrap' }}>
        {text}
      </span>
    );

    return parts.map((part, idx) => {
      const isPlaceholder = /^_{1,}$/.test(part);
      if (!isPlaceholder) {
        return renderText(part, `text-${idx}`);
      }

      const blank = blanks[blankIndex];
      const blankId = blank ? blank.id : String(blankIndex + 1);
      const correctWord = blank ? blank.word : '';
      const hint = blank?.hint;

      const isCorrect = isCompleted && (userAnswers[blankId] || '').trim() === correctWord;

      blankIndex++;

      return (
        <span
          key={`blank-${idx}`}
          style={{ display: 'inline-block', margin: '0 8px', position: 'relative' }}
        >
          <Input
            value={userAnswers[blankId] || ''}
            onChange={(e) => handleAnswerChange(blankId, e.target.value)}
            placeholder="Введите слово"
            disabled={isCompleted}
            style={{
              width: '140px',
              height: '40px',
              fontSize: '16px',
              borderRadius: '20px',
              border: isCompleted ? (isCorrect ? '2px solid #52c41a' : '2px solid #ff4d4f') : '2px solid #d9d9d9',
              backgroundColor: isCompleted ? (isCorrect ? '#f6ffed' : '#fff2f0') : '#ffffff',
              boxShadow: isCompleted
                ? isCorrect
                  ? '0 0 0 2px rgba(82, 196, 26, 0.2)'
                  : '0 0 0 2px rgba(255, 77, 79, 0.2)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            }}
            suffix={isCompleted && <span style={{ color: isCorrect ? '#52c41a' : '#ff4d4f' }}>{isCorrect ? <CheckOutlined /> : '✗'}</span>}
          />
          {showHints && hint && (
            <Tooltip title={hint} placement="top">
              <BulbOutlined
                style={{ marginLeft: '8px', color: '#faad14', fontSize: '18px', cursor: 'pointer', transition: 'transform 0.2s ease' }}
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
    });
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
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          color: '#262626',
        }}
      >
        <Title level={3} style={{ marginBottom: '12px' }}>
          Заполните пропуски
        </Title>
        <Text type="secondary">Нет текста для заполнения</Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Заголовок */}
      <div style={{ textAlign: 'center' }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          Заполните пропуски
        </Title>
        <Text type="secondary">Всего слов: {blanks.length}</Text>
      </div>

      {/* Прогресс */}
      <div style={{ marginBottom: 16, padding: 12, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <Progress
          percent={Math.round((Object.keys(userAnswers).length / blanks.length) * 100)}
          showInfo={false}
          strokeColor="#1677ff"
          strokeWidth={8}
          trailColor="#f0f0f0"
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: '14px', color: '#666' }}>
            Заполнено: {Object.keys(userAnswers).length} из {blanks.length}
          </Text>
          <Badge
            count={Object.keys(userAnswers).length}
            showZero
            style={{
              backgroundColor: Object.keys(userAnswers).length === blanks.length ? '#52c41a' : '#1677ff',
            }}
          />
        </div>
      </div>

      {/* Текст с пропусками */}
      <Card style={{ flex: 1, marginBottom: 16, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <div
          style={{
            padding: 16,
            background: '#fafafa',
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Paragraph
            style={{
              fontSize: '18px',
              lineHeight: 2.2,
              margin: 0,
              textAlign: 'justify',
              color: '#262626',
              fontWeight: '400',
            }}
          >
            {renderTextWithBlanks()}
          </Paragraph>
        </div>
      </Card>

      {/* Результат */}
      {isCompleted && (
        <Card style={{ marginBottom: 16, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ marginBottom: 8 }}>
              {score >= 90 && <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />}
              {score >= 70 && score < 90 && <StarOutlined style={{ fontSize: 32, color: '#faad14' }} />}
            </div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Результат: {score}%
            </Title>
            <Text type="secondary">
              {score >= 90 && 'Отлично! Все ответы правильные.'}
              {score >= 70 && score < 90 && 'Хорошо! Есть небольшие ошибки.'}
              {score < 70 && 'Попробуйте ещё раз и обратите внимание на ошибки.'}
            </Text>
          </div>
        </Card>
      )}

      {/* Кнопки управления */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        {!isCompleted ? (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleCheckAnswers}
            size="large"
          >
            Проверить ответы
          </Button>
        ) : (
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            size="large"
          >
            Попробовать снова
          </Button>
        )}

        <Button
          icon={<EyeOutlined />}
          onClick={handleShowHints}
          type={showHints ? 'primary' : 'default'}
          size="large"
        >
          {showHints ? 'Скрыть подсказки' : 'Показать подсказки'}
        </Button>
      </div>

      {/* Правильные ответы (показываются после завершения) */}
      {isCompleted && score < 100 && (
        <Card title={<span style={{ fontSize: 16, fontWeight: 600 }}>Правильные ответы</span>} size="small" style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {blanks.map((blank) => (
              <div
                key={blank.id}
                style={{
                  padding: '6px 12px',
                  background: '#fafafa',
                  borderRadius: 16,
                  fontSize: 14,
                  border: '1px solid #f0f0f0',
                }}
              >
                <strong style={{ color: '#262626' }}>{blank.word}</strong>
                {blank.hint && (
                  <span
                    style={{
                      color: '#8c8c8c',
                      marginLeft: 8,
                      fontSize: 12,
                    }}
                  >
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
