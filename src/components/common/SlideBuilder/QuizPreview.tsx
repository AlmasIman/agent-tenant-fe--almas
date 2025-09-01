import React from 'react';
import { Card, Typography, Space, Tag, Badge, Radio } from 'antd';
import { EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface QuizPreviewProps {
  content: string;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ content }) => {
  const parseQuestions = () => {
    if (!content) return [];

    const questions = [];
    const lines = content.split('\n');
    let currentQuestion: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('Вопрос') || line.match(/^\d+\./)) {
        // Начинается новый вопрос
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          id: questions.length + 1,
          question: line.replace(/^Вопрос\s*\d*:?\s*/, '').replace(/^\d+\.\s*/, ''),
          options: [],
          correctAnswer: -1,
          explanation: '',
        };
      } else if (line.match(/^[A-D]\)/)) {
        // Вариант ответа
        if (currentQuestion) {
          const option = line.replace(/^[A-D]\)\s*/, '');
          currentQuestion.options.push(option);
        }
      } else if (line.startsWith('Правильный ответ:')) {
        // Правильный ответ
        if (currentQuestion) {
          const answer = line.replace('Правильный ответ:', '').trim();
          const answerIndex = 'ABCD'.indexOf(answer.toUpperCase());
          if (answerIndex !== -1) {
            currentQuestion.correctAnswer = answerIndex;
          }
        }
      } else if (line.startsWith('Объяснение:')) {
        // Объяснение
        if (currentQuestion) {
          currentQuestion.explanation = line.replace('Объяснение:', '').trim();
        }
      }
    }

    // Добавляем последний вопрос
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const questions = parseQuestions();

  const renderPreview = () => {
    if (!content) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#8c8c8c',
          }}
        >
          <QuestionCircleOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
          <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Введите вопросы в формате: Вопрос X: Текст вопроса</Text>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#faad14',
          }}
        >
          <Text style={{ fontSize: '14px', color: '#faad14' }}>
            Неверный формат. Используйте правильную структуру вопросов
          </Text>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {questions.slice(0, 2).map((question, index) => (
          <div
            key={question.id}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              border: '1px solid #dee2e6',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginRight: '12px',
                }}
              >
                {index + 1}
              </div>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#262626',
                  flex: 1,
                }}
              >
                {question.question}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <Radio.Group disabled>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} style={{ marginBottom: '8px' }}>
                    <Radio
                      value={optionIndex}
                      checked={optionIndex === question.correctAnswer}
                      style={{
                        color: optionIndex === question.correctAnswer ? '#52c41a' : '#666',
                        fontWeight: optionIndex === question.correctAnswer ? '600' : 'normal',
                      }}
                    >
                      <span
                        style={{
                          color: optionIndex === question.correctAnswer ? '#52c41a' : '#666',
                          fontWeight: optionIndex === question.correctAnswer ? '600' : 'normal',
                        }}
                      >
                        {String.fromCharCode(65 + optionIndex)}) {option}
                      </span>
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>

            {question.explanation && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(82, 196, 26, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(82, 196, 26, 0.2)',
                }}
              >
                <Text
                  style={{
                    fontSize: '12px',
                    color: '#52c41a',
                    fontStyle: 'italic',
                  }}
                >
                  💡 {question.explanation}
                </Text>
              </div>
            )}
          </div>
        ))}

        {questions.length > 2 && (
          <div
            style={{
              textAlign: 'center',
              padding: '12px',
              background: '#f0f0f0',
              borderRadius: '8px',
              color: '#666',
              fontSize: '12px',
            }}
          >
            ... и еще {questions.length - 2} вопросов
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <EyeOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: '600', color: '#262626' }}>Предварительный просмотр</span>
        </Space>
      }
      style={{
        marginTop: '16px',
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
      headStyle={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderBottom: '1px solid #f0f0f0',
        padding: '12px 16px',
      }}
      bodyStyle={{
        padding: '20px',
        background: 'white',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #f0f0f0',
          minHeight: '120px',
        }}
      >
        {renderPreview()}
      </div>

      {questions.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Badge
              count={questions.length}
              showZero
              style={{
                backgroundColor: questions.length > 0 ? '#52c41a' : '#d9d9d9',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ❓ Вопросов
              </span>
            </Badge>

            <Badge
              count={questions.filter((q) => q.correctAnswer !== -1).length}
              showZero
              style={{
                backgroundColor: questions.filter((q) => q.correctAnswer !== -1).length > 0 ? '#faad14' : '#d9d9d9',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ✅ С ответами
              </span>
            </Badge>
          </div>

          {questions.length > 0 && questions.every((q) => q.correctAnswer !== -1) && (
            <div
              style={{
                padding: '4px 12px',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              ✅ Готово к использованию
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default QuizPreview;
