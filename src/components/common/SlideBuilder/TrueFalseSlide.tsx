import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Radio, message, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Slide } from './types';

const { Title, Paragraph } = Typography;

interface TrueFalseSlideProps {
  slide: Slide;
}

const TrueFalseSlide: React.FC<TrueFalseSlideProps> = ({ slide }) => {
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Парсим контент слайда
  const parseContent = () => {
    try {
      const content = JSON.parse(slide.content);
      return {
        question: content.question || 'Вопрос не найден',
        answer: content.answer || false,
        explanation: content.explanation || '',
      };
    } catch (error) {
      // Если не JSON, пытаемся извлечь из структуры trueFalse
      if (slide.content && typeof slide.content === 'object') {
        const trueFalseContent = (slide.content as any).trueFalse;
        if (trueFalseContent) {
          return {
            question: trueFalseContent.question || 'Вопрос не найден',
            answer: trueFalseContent.answer || false,
            explanation: trueFalseContent.explanation || '',
          };
        }
      }
      return {
        question: 'Вопрос не найден',
        answer: false,
        explanation: '',
      };
    }
  };

  const { question, answer, explanation } = parseContent();

  const handleAnswerChange = (value: boolean) => {
    setUserAnswer(value);
    setIsAnswered(true);
  };

  const handleCheckAnswer = () => {
    if (userAnswer === null) {
      message.warning('Пожалуйста, выберите ответ');
      return;
    }

    const correct = userAnswer === answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      message.success('Правильно! 🎉');
    } else {
      message.error('Неправильно. Попробуйте ещё раз!');
    }
  };

  const handleReset = () => {
    setUserAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowResult(false);
  };

  if (!question || question === 'Вопрос не найден') {
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
        <Title level={3} style={{ marginBottom: 12 }}>
          Вопрос True/False
        </Title>
        <Paragraph type="secondary">Нет вопроса для отображения</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Заголовок */}
      <div style={{ textAlign: 'center' }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          Вопрос True/False
        </Title>
        <Tag color="blue">Выберите правильный ответ</Tag>
      </div>

      {/* Вопрос */}
      <Card style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <div style={{ padding: 16, background: '#fafafa', borderRadius: 12 }}>
          <Paragraph
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              margin: 0,
              textAlign: 'center',
              color: '#262626',
              fontWeight: '500',
            }}
          >
            {question}
          </Paragraph>
        </div>
      </Card>

      {/* Варианты ответов */}
      <Card style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <div style={{ padding: 16 }}>
          <Radio.Group
            value={userAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            style={{ width: '100%' }}
            disabled={showResult}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio
                value={true}
                style={{
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: userAnswer === true ? '2px solid #1677ff' : '1px solid #f0f0f0',
                  backgroundColor: userAnswer === true ? '#f0f8ff' : '#fff',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <CheckOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                <span style={{ fontWeight: '500' }}>Правда (True)</span>
              </Radio>
              <Radio
                value={false}
                style={{
                  fontSize: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: userAnswer === false ? '2px solid #1677ff' : '1px solid #f0f0f0',
                  backgroundColor: userAnswer === false ? '#f0f8ff' : '#fff',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <CloseOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                <span style={{ fontWeight: '500' }}>Ложь (False)</span>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      </Card>

      {/* Результат */}
      {showResult && (
        <Card
          style={{
            background: isCorrect ? '#f6ffed' : '#fff2f0',
            borderRadius: 12,
            border: `1px solid ${isCorrect ? '#b7eb8f' : '#ffccc7'}`,
          }}
        >
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              {isCorrect ? (
                <CheckOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              ) : (
                <CloseOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
              )}
            </div>
            <Title level={4} style={{ marginBottom: 8, color: isCorrect ? '#52c41a' : '#ff4d4f' }}>
              {isCorrect ? 'Правильно!' : 'Неправильно'}
            </Title>
            <Paragraph style={{ marginBottom: 8 }}>
              Правильный ответ: <strong>{answer ? 'Правда (True)' : 'Ложь (False)'}</strong>
            </Paragraph>
            {explanation && (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {explanation}
              </Paragraph>
            )}
          </div>
        </Card>
      )}

      {/* Кнопки управления */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        {!showResult ? (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleCheckAnswer}
            disabled={!isAnswered}
            size="large"
          >
            Проверить ответ
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
      </div>
    </div>
  );
};

export default TrueFalseSlide;
