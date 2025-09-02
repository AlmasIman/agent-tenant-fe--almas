import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Radio, message, Progress, Divider } from 'antd';
import { CheckOutlined, ReloadOutlined, TrophyOutlined, QuestionCircleOutlined } from '@ant-design/icons';

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

        // Handle both formats: wrapped in quiz object or direct data
        const quizData = content.quiz || content;

        if (quizData && quizData.questions) {
          const formattedQuestions = quizData.questions.map((q: any, index: number) => ({
            id: q.id || `question-${index}`,
            question: q.question || q.prompt || q.text || '',
            options: q.options || q.answers || [],
            correctAnswer:
              q.correctAnswer ||
              q.correct ||
              (q.correct_indices && q.correct_indices.length > 0 ? q.correct_indices[0] : 0),
            explanation: q.explanation || '',
          }));
          setQuestions(formattedQuestions);
          setShowExplanation(quizData.showExplanation || false);
        } else {
          console.warn('No questions found in quiz data:', content);
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error parsing quiz:', error);
        setQuestions([]);
      }
    }
  }, [slide.content]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
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
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.correctAnswer;

      console.log(`Question ${index + 1}: User answered ${userAnswer}, Correct is ${correctAnswer}`);

      if (userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    console.log(`Final score: ${correctAnswers}/${totalQuestions} = ${finalScore}%`);

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

  if (questions.length === 0) {
    return (
      <div className="slide-container">
        <div className="slide-content">
          <div className="slide-title-section">
            <Title level={2} className="slide-title">
              {slide.title}
            </Title>
            <Divider className="slide-divider" />
          </div>

          <div className="quiz-placeholder">
            <QuestionCircleOutlined className="placeholder-icon" />
            <div className="placeholder-text">Нет вопросов для отображения</div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
            .slide-container {
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              overflow: hidden;
              border: none;
              padding: 40px;
            }



            .slide-content {
              padding: 0;
            }

            .slide-title-section {
              margin-bottom: 32px;
            }

            .slide-title {
              color: #1e293b !important;
              font-size: 28px !important;
              font-weight: 700 !important;
              margin: 0 0 16px 0 !important;
              line-height: 1.3 !important;
            }

            .slide-divider {
              margin: 0 !important;
              border-color: #e2e8f0 !important;
            }

            .quiz-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 60px 40px;
              background: #f8fafc;
              border: 2px dashed #cbd5e1;
              border-radius: 8px;
              color: #64748b;
              min-height: 300px;
              gap: 16px;
            }

            .placeholder-icon {
              font-size: 48px;
              color: #94a3b8;
            }

            .placeholder-text {
              font-size: 18px;
              font-weight: 500;
              color: #64748b;
            }
          `,
          }}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="slide-container">
      <div className="slide-content">
        <div className="slide-title-section">
          <Title level={2} className="slide-title">
            {slide.title}
          </Title>
          <Divider className="slide-divider" />
        </div>

        <div className="quiz-content">
          {/* Progress Section */}
          <div className="quiz-progress">
            <div className="progress-header">
              <Text className="progress-text">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </Text>
              <Text className="progress-text">
                Отвечено: {answeredCount} из {questions.length}
              </Text>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor="#3b82f6"
              trailColor="#e2e8f0"
              strokeWidth={6}
            />
          </div>

          {/* Question Card */}
          <div className="question-card">
            <div className="question-header">
              <QuestionCircleOutlined className="question-icon" />
              <Title level={3} className="question-title">
                {currentQuestion.question}
              </Title>
            </div>

            {/* Answer Options */}
            <div className="answer-options">
              <Radio.Group
                value={userAnswer}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                className="radio-group"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className={`answer-option ${userAnswer === index ? 'selected' : ''}`}>
                    <Radio value={index} className="radio-button">
                      <span className="option-text">
                        {String.fromCharCode(65 + index)}) {option}
                      </span>
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>

            {/* Explanation - Only show after quiz completion */}
            {isCompleted && showExplanation && currentQuestion.explanation && (
              <div className="explanation">
                <Text className="explanation-text">💡 {currentQuestion.explanation}</Text>
              </div>
            )}
          </div>

          {/* Result Card */}
          {isCompleted && (
            <div className="result-card">
              <div className="result-header">
                <TrophyOutlined className="trophy-icon" />
                <Title level={2} className="result-title">
                  Результат: {score}%
                </Title>
              </div>
              <Text className="result-message">
                {score >= 90 && 'Отлично! Вы отлично справились с викториной! 🎉'}
                {score >= 70 && score < 90 && 'Хорошо! Есть небольшие ошибки, но в целом хорошо! 👍'}
                {score < 70 && 'Попробуйте еще раз! Обратите внимание на ошибки. 💪'}
              </Text>
            </div>
          )}

          {/* Navigation Buttons */}
          {!isCompleted && (
            <div className="quiz-navigation">
              <Button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="nav-button"
              >
                ← Предыдущий
              </Button>

              <Button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="nav-button"
              >
                Следующий →
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="quiz-actions">
            {!isCompleted ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleComplete}
                disabled={Object.keys(userAnswers).length < questions.length}
                className="action-button"
              >
                Завершить викторину
              </Button>
            ) : (
              <Button icon={<ReloadOutlined />} onClick={handleReset} className="action-button secondary">
                Попробовать снова
              </Button>
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .slide-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: none;
          }

          .slide-header {
            background: #f8fafc;
            padding: 16px 24px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .slide-number {
            background: #3b82f6;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
          }



          .slide-content {
            padding: 32px 40px;
          }

          .slide-title-section {
            margin-bottom: 32px;
          }

          .slide-title {
            color: #1e293b !important;
            font-size: 28px !important;
            font-weight: 700 !important;
            margin: 0 0 16px 0 !important;
            line-height: 1.3 !important;
          }

          .slide-divider {
            margin: 0 !important;
            border-color: #e2e8f0 !important;
          }

          .quiz-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .quiz-progress {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: none;
          }

          .progress-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .progress-text {
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
          }

          .question-card {
            background: white;
            border: none;
            border-radius: 8px;
            padding: 24px;
          }

          .question-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }

          .question-icon {
            font-size: 24px;
            color: #3b82f6;
          }

          .question-title {
            color: #1e293b !important;
            font-size: 20px !important;
            font-weight: 600 !important;
            margin: 0 !important;
            line-height: 1.4 !important;
          }

          .answer-options {
            margin-bottom: 20px;
          }

          .radio-group {
            width: 100%;
          }

          .answer-option {
            padding: 16px;
            margin-bottom: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: white;
          }

          .answer-option:hover {
            border-color: #3b82f6;
            background: #f8fafc;
          }

                     .answer-option.selected {
             border-color: #3b82f6;
             background: rgba(59, 130, 246, 0.05);
           }

          .radio-button {
            width: 100%;
          }

          .option-text {
            font-size: 16px;
            color: #374151;
            font-weight: 500;
          }

                     .answer-option.selected .option-text {
             color: #3b82f6;
             font-weight: 600;
           }

          .explanation {
            margin-top: 16px;
            padding: 16px;
            background: rgba(16, 185, 129, 0.1);
            border: none;
            border-radius: 8px;
          }

          .explanation-text {
            color: #10b981;
            font-size: 14px;
            font-style: italic;
          }

          .result-card {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 32px;
            border-radius: 8px;
            text-align: center;
          }

          .result-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .trophy-icon {
            font-size: 32px;
            color: #fbbf24;
          }

          .result-title {
            color: white !important;
            font-size: 24px !important;
            font-weight: 700 !important;
            margin: 0 !important;
          }

          .result-message {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 500;
          }

                     .quiz-navigation {
             display: flex;
             align-items: center;
             justify-content: space-between;
             gap: 16px;
             padding: 20px;
             background: #f8fafc;
             border: none;
             border-radius: 8px;
           }

           .nav-button {
             height: 40px;
             padding: 0 16px;
             font-size: 14px;
             font-weight: 500;
             border-radius: 6px;
             border: none;
             background: white;
             color: #374151;
             transition: all 0.2s ease;
           }

           .nav-button:hover:not(:disabled) {
             border-color: #3b82f6;
             color: #3b82f6;
             transform: translateY(-1px);
           }

           .nav-button:disabled {
             opacity: 0.5;
             cursor: not-allowed;
           }



           .quiz-actions {
             display: flex;
             justify-content: center;
           }

          .action-button {
            height: 48px;
            padding: 0 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            transition: all 0.2s ease;
          }

          .action-button.ant-btn-primary {
            background: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .action-button.ant-btn-primary:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          }

          .action-button.secondary {
            background: white;
            color: #3b82f6;
            border: 2px solid #3b82f6;
          }

          .action-button.secondary:hover {
            background: #f8fafc;
            transform: translateY(-1px);
          }

          @media (max-width: 768px) {
            .slide-content {
              padding: 24px 20px;
            }

            .slide-title {
              font-size: 24px !important;
            }

            .question-title {
              font-size: 18px !important;
            }

            .option-text {
              font-size: 15px;
            }

            .action-button {
              width: 100%;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default QuizSlide;
