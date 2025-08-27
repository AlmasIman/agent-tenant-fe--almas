import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Radio, message, Progress } from 'antd';
import { CheckOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizSlideProps {
  slide: any;
  onComplete?: (score: number) => void;
}

const QuizSlide: React.FC<QuizSlideProps> = ({ slide, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (slide.content) {
      try {
        const content = JSON.parse(slide.content);
        const quiz = content.quiz;
        
        if (quiz && quiz.questions) {
          setQuestions(quiz.questions);
          setShowExplanation(quiz.showExplanation || false);
        }
      } catch (error) {
        console.error('Error parsing quiz:', error);
        setQuestions([]);
      }
    }
  }, [slide.content]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const answeredQuestions = Object.keys(userAnswers).length;
    const totalQuestions = questions.length;
    
    if (answeredQuestions < totalQuestions) {
      message.warning(`Ответьте на все вопросы! Осталось: ${totalQuestions - answeredQuestions}`);
      return;
    }

    let correctAnswers = 0;
    questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(finalScore);
    setIsCompleted(true);

    if (finalScore === 100) {
      message.success('Отлично! Все ответы правильные! 🎉');
    } else if (finalScore >= 80) {
      message.success(`Хорошо! Правильных ответов: ${correctAnswers} из ${totalQuestions}`);
    } else {
      message.info(`Правильных ответов: ${correctAnswers} из ${totalQuestions}. Попробуйте еще раз!`);
    }

    onComplete?.(finalScore);
  };

  const handleReset = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setScore(0);
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

  if (questions.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
          Викторина
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
          Нет вопросов для отображения
        </Text>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.correctAnswer;

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
          Викторина
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
          Вопрос {currentQuestionIndex + 1} из {questions.length}
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
          percent={Math.round(((currentQuestionIndex + 1) / questions.length) * 100)} 
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
            Прогресс: {currentQuestionIndex + 1} из {questions.length}
          </Text>
          <Text style={{ fontSize: '14px', color: '#666' }}>
            Отвечено: {Object.keys(userAnswers).length} из {questions.length}
          </Text>
        </div>
      </div>

      {/* Вопрос */}
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
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Title level={3} style={{ 
            marginBottom: '24px',
            color: '#2c3e50',
            textAlign: 'center',
          }}>
            {currentQuestion.question}
          </Title>

          {/* Варианты ответов */}
          <Radio.Group 
            value={userAnswer}
            onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} style={{
                  padding: '12px 16px',
                  background: userAnswer === index 
                    ? (isCorrect ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)')
                    : '#ffffff',
                  border: userAnswer === index 
                    ? (isCorrect ? '2px solid #52c41a' : '2px solid #ff4d4f')
                    : '2px solid #f0f0f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (userAnswer === undefined) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (userAnswer === undefined) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                >
                  <Radio 
                    value={index}
                    style={{
                      width: '100%',
                      color: userAnswer === index 
                        ? (isCorrect ? '#52c41a' : '#ff4d4f')
                        : '#666',
                      fontWeight: userAnswer === index ? '600' : 'normal',
                    }}
                  >
                    <span style={{ 
                      color: userAnswer === index 
                        ? (isCorrect ? '#52c41a' : '#ff4d4f')
                        : '#666',
                      fontWeight: userAnswer === index ? '600' : 'normal',
                      fontSize: '16px',
                    }}>
                      {String.fromCharCode(65 + index)}) {option}
                    </span>
                  </Radio>
                </div>
              ))}
            </div>
          </Radio.Group>

          {/* Объяснение */}
          {showExplanation && userAnswer !== undefined && currentQuestion.explanation && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(82, 196, 26, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(82, 196, 26, 0.2)',
            }}>
              <Text style={{ 
                fontSize: '14px', 
                color: '#52c41a',
                fontStyle: 'italic',
              }}>
                💡 {currentQuestion.explanation}
              </Text>
            </div>
          )}
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
              <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            </div>
            <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
              Результат: {score}%
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
              {score >= 90 && 'Отлично! Вы отлично справились с викториной! 🎉'}
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
      }}>
        {!isCompleted ? (
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={handleNextQuestion}
            disabled={userAnswer === undefined}
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
              if (userAnswer !== undefined) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (userAnswer !== undefined) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
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
      </div>
    </div>
  );
};

export default QuizSlide;
