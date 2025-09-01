import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Progress, Radio, Input, Alert, Result, Modal, message, Image } from 'antd';
import { H5PQuiz, H5PQuizQuestion, H5PQuizState, H5PQuizResult } from './types';
import { useTranslation } from 'react-i18next';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ImageDragDropQuestion from './ImageDragDropQuestion';

interface SimpleQuizPlayerProps {
  quiz: H5PQuiz;
  onComplete: (result: H5PQuizResult) => void;
  onExit: () => void;
}

export const SimpleQuizPlayer: React.FC<SimpleQuizPlayerProps> = ({ quiz, onComplete, onExit }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<H5PQuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeSpent: 0,
    isCompleted: false,
    score: 0,
    attempts: 0,
  });

  const [showResults, setShowResults] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [clickedHotspots, setClickedHotspots] = useState<string[]>([]);
  const [dragAnswers, setDragAnswers] = useState<Record<string, string>>({});
  const imageRef = useRef<HTMLDivElement>(null);

  const questions = quiz.shuffleQuestions ? [...quiz.questions].sort(() => Math.random() - 0.5) : quiz.questions;

  const currentQuestion = questions[state.currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

  // Таймер
  useEffect(() => {
    if (!state.isCompleted && quiz.timeLimit) {
      const timer = setInterval(() => {
        setState((prev) => {
          const newTimeSpent = prev.timeSpent + 1;
          if (newTimeSpent >= quiz.timeLimit! * 60) {
            clearInterval(timer);
            return { ...prev, isCompleted: true, timeSpent: newTimeSpent };
          }
          return { ...prev, timeSpent: newTimeSpent };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.isCompleted, quiz.timeLimit]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string | string[] | Record<string, string>) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer },
    }));
  };

  const handleWordToggle = (word: string) => {
    setSelectedWords((prev) => {
      const newSelection = prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word];

      // Обновляем ответ для mark-the-words
      setState((prevState) => ({
        ...prevState,
        answers: { ...prevState.answers, [currentQuestion.id]: newSelection },
      }));

      return newSelection;
    });
  };

  const handleHotspotClick = (hotspotId: string) => {
    setClickedHotspots((prev) => {
      const newSelection = prev.includes(hotspotId) ? prev.filter((id) => id !== hotspotId) : [...prev, hotspotId];

      // Обновляем ответ для image-hotspot
      setState((prevState) => ({
        ...prevState,
        answers: { ...prevState.answers, [currentQuestion.id]: newSelection },
      }));

      return newSelection;
    });
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (currentQuestion.type !== 'image-hotspot' || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Находим ближайший hotspot
    const hotspots = currentQuestion.hotspots || [];
    const clickedHotspot = hotspots.find((hotspot) => {
      const distance = Math.sqrt(Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2));
      return distance <= (hotspot.radius / rect.width) * 100;
    });

    if (clickedHotspot) {
      handleHotspotClick(clickedHotspot.id);
    }
  };

  const handleDragWord = (targetId: string, word: string) => {
    setDragAnswers((prev) => {
      const newAnswers = { ...prev, [targetId]: word };

      // Обновляем ответ для drag-the-words
      setState((prevState) => ({
        ...prevState,
        answers: { ...prevState.answers, [currentQuestion.id]: newAnswers },
      }));

      return newAnswers;
    });
  };

  const handleDragStart = (event: React.DragEvent, word: string) => {
    event.dataTransfer.setData('text/plain', word);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    const word = event.dataTransfer.getData('text/plain');
    handleDragWord(targetId, word);
  };

  const checkAnswer = (question: H5PQuizQuestion, answer: string | string[] | Record<string, string>): boolean => {
    if (question.type === 'mark-the-words') {
      const correctWords = question.correctWords || [];
      const selectedWords = Array.isArray(answer) ? answer : [];
      return correctWords.length === selectedWords.length && correctWords.every((word) => selectedWords.includes(word));
    }

    if (question.type === 'image-hotspot') {
      const correctHotspots = question.hotspots?.filter((h) => h.label) || [];
      const clickedHotspots = Array.isArray(answer) ? answer : [];
      return (
        correctHotspots.length === clickedHotspots.length &&
        correctHotspots.every((hotspot) => clickedHotspots.includes(hotspot.id))
      );
    }

    if (question.type === 'drag-the-words') {
      const dragAnswers = typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
      const targets = question.dragTargets || [];
      return targets.every((target) => dragAnswers[target.id] === target.correctWord);
    }

    if (question.type === 'image-drag-drop') {
      const dragDropAnswers = typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
      const draggableItems = question.imageDragDrop?.draggableItems || [];
      return draggableItems.every((item) => dragDropAnswers[item.id] === item.correctZoneId);
    }

    if (question.type === 'test') {
      const answers = question.answers || [];
      const correctAnswers = answers.filter((a) => a.correct).map((a) => a.text);
      const selectedAnswers = Array.isArray(answer) ? answer : [answer];

      if (question.multiple) {
        // Для множественного выбора все правильные ответы должны быть выбраны
        return (
          correctAnswers.length === selectedAnswers.length &&
          correctAnswers.every((correct) => selectedAnswers.includes(correct))
        );
      } else {
        // Для одиночного выбора должен быть выбран один правильный ответ
        return selectedAnswers.length === 1 && correctAnswers.includes(selectedAnswers[0] as string);
      }
    }

    if (Array.isArray(question.correctAnswer)) {
      return (
        Array.isArray(answer) &&
        answer.length === question.correctAnswer.length &&
        answer.every((a) => question.correctAnswer.includes(a as string))
      );
    }

    // Для обычных вопросов answer должен быть строкой
    if (typeof answer === 'string') {
      return answer === question.correctAnswer;
    }

    return false;
  };

  const calculateScore = (): number => {
    let totalScore = 0;
    let earnedScore = 0;

    questions.forEach((question) => {
      totalScore += question.points;
      const answer = state.answers[question.id];
      if (answer && checkAnswer(question, answer)) {
        earnedScore += question.points;
      }
    });

    return Math.round((earnedScore / totalScore) * 100);
  };

  const handleNext = () => {
    if (state.currentQuestionIndex < totalQuestions - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      const finalScore = calculateScore();
      const passed = finalScore >= quiz.passingScore;

      setState((prev) => ({
        ...prev,
        isCompleted: true,
        score: finalScore,
      }));

      const result: H5PQuizResult = {
        quizId: quiz.id,
        score: finalScore,
        totalQuestions,
        correctAnswers: questions.filter((q) => {
          const answer = state.answers[q.id];
          return answer && checkAnswer(q, answer);
        }).length,
        timeSpent: state.timeSpent,
        passed,
        attempts: state.attempts + 1,
        completedAt: new Date(),
      };

      onComplete(result);

      if (quiz.showResults) {
        setShowResults(true);
      }
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const handleRetry = () => {
    setState({
      currentQuestionIndex: 0,
      answers: {},
      timeSpent: 0,
      isCompleted: false,
      score: 0,
      attempts: state.attempts + 1,
    });
    setShowResults(false);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentAnswer = state.answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <Radio.Group value={currentAnswer as string} onChange={(e) => handleAnswerChange(e.target.value)}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentQuestion.options?.map((option, index) => (
                <Radio key={index} value={option}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );

      case 'true-false':
        return (
          <Radio.Group value={currentAnswer as string} onChange={(e) => handleAnswerChange(e.target.value)}>
            <Space direction="vertical">
              <Radio value="true">{t('quiz.true')}</Radio>
              <Radio value="false">{t('quiz.false')}</Radio>
            </Space>
          </Radio.Group>
        );

      case 'fill-in-the-blank':
        return (
          <Input
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={t('quiz.enterYourAnswer')}
            size="large"
          />
        );

      case 'mark-the-words':
        const words = currentQuestion.text?.split(/\s+/) || [];
        const selectedWords = Array.isArray(currentAnswer) ? currentAnswer : [];

        return (
          <div style={{ lineHeight: '2', fontSize: '16px' }}>
            {words.map((word, index) => {
              const cleanWord = word.replace(/[.,!?;:]/g, '');
              const isSelected = selectedWords.includes(cleanWord);
              return (
                <span key={index}>
                  <span
                    style={{
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? '#1890ff' : 'transparent',
                      color: isSelected ? 'white' : 'inherit',
                      marginRight: '4px',
                    }}
                    onClick={() => handleWordToggle(cleanWord)}
                  >
                    {word}
                  </span>
                </span>
              );
            })}
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>{t('quiz.clickWordsToSelect')}</div>
          </div>
        );

      case 'image-hotspot':
        const hotspots = currentQuestion.hotspots || [];
        const clickedHotspots = Array.isArray(currentAnswer) ? currentAnswer : [];

        return (
          <div>
            <div
              ref={imageRef}
              style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }}
              onClick={handleImageClick}
            >
              <Image
                src={currentQuestion.imageUrl}
                alt={currentQuestion.question}
                style={{ maxWidth: '100%', height: 'auto' }}
                preview={false}
              />
              {hotspots.map((hotspot) => {
                const isClicked = clickedHotspots.includes(hotspot.id);
                return (
                  <div
                    key={hotspot.id}
                    style={{
                      position: 'absolute',
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      width: `${hotspot.radius * 2}px`,
                      height: `${hotspot.radius * 2}px`,
                      borderRadius: '50%',
                      border: `2px solid ${isClicked ? '#52c41a' : '#ff4d4f'}`,
                      backgroundColor: isClicked ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 77, 79, 0.3)',
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(hotspot.id);
                    }}
                    title={hotspot.label}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>{t('quiz.clickHotspotsToSelect')}</div>
            {hotspots.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong>{t('quiz.hotspots')}:</strong>
                {hotspots.map((hotspot, index) => (
                  <span
                    key={hotspot.id}
                    style={{
                      display: 'inline-block',
                      margin: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: clickedHotspots.includes(hotspot.id) ? '#52c41a' : '#f0f0f0',
                      color: clickedHotspots.includes(hotspot.id) ? 'white' : 'inherit',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleHotspotClick(hotspot.id)}
                  >
                    {hotspot.label || `${t('quiz.hotspot')} ${index + 1}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'drag-the-words':
        const dragText = currentQuestion.dragText || '';
        const dragWords = currentQuestion.dragWords || [];
        const dragTargets = currentQuestion.dragTargets || [];
        const currentDragAnswers =
          typeof currentAnswer === 'object' && !Array.isArray(currentAnswer) ? currentAnswer : {};

        // Создаем массив слов для отображения (исключаем уже использованные)
        const usedWords = Object.values(currentDragAnswers);
        const availableWords = dragWords.filter((word) => !usedWords.includes(word));

        return (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
                {(() => {
                  let result = dragText;
                  const elements: React.ReactNode[] = [];

                  dragTargets.forEach((target, index) => {
                    const placeholder = target.placeholder;
                    const answer = currentDragAnswers[target.id];
                    const parts = result.split(placeholder);

                    if (parts.length > 1) {
                      result = parts.join(`__TARGET_${index}__`);
                      elements.push(
                        answer ? (
                          <span
                            key={target.id}
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              margin: '0 4px',
                              backgroundColor: '#52c41a',
                              color: 'white',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleDragWord(target.id, '')}
                            title={t('quiz.clickToRemove')}
                          >
                            {answer}
                          </span>
                        ) : (
                          <span
                            key={target.id}
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              margin: '0 4px',
                              backgroundColor: '#f0f0f0',
                              border: '2px dashed #d9d9d9',
                              borderRadius: '4px',
                              minWidth: '60px',
                              textAlign: 'center',
                              color: '#999',
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, target.id)}
                          >
                            {placeholder}
                          </span>
                        ),
                      );
                    }
                  });

                  const finalParts = result.split(/__TARGET_\d+__/);
                  return finalParts.map((part, index) => (
                    <React.Fragment key={index}>
                      {part}
                      {elements[index]}
                    </React.Fragment>
                  ));
                })()}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                {t('quiz.availableWords')}:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableWords.map((word, index) => (
                  <span
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, word)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'grab',
                      userSelect: 'none',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#666' }}>{t('quiz.dragWordsToTargets')}</div>
          </div>
        );

      case 'test':
        const testAnswers = currentQuestion.answers || [];
        const selectedTestAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];

        return (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              {testAnswers.map((answer, index) => {
                const isSelected = currentQuestion.multiple
                  ? selectedTestAnswers.includes(answer.text)
                  : currentAnswer === answer.text;

                return (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      border: `2px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0f8ff' : 'white',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => {
                      if (currentQuestion.multiple) {
                        const newSelection = isSelected
                          ? selectedTestAnswers.filter((a) => a !== answer.text)
                          : [...selectedTestAnswers, answer.text];
                        handleAnswerChange(newSelection);
                      } else {
                        handleAnswerChange(answer.text);
                      }
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {String.fromCharCode(65 + index)}. {answer.text}
                    </div>
                  </div>
                );
              })}
            </Space>
          </div>
        );

      case 'image-drag-drop':
        const imageDragDropData = currentQuestion.imageDragDrop;
        if (!imageDragDropData) return null;

        const currentImageDragDropAnswer =
          typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
            ? (currentAnswer as Record<string, string>)
            : {};

        return (
          <ImageDragDropQuestion
            imageUrl={imageDragDropData.imageUrl}
            dropZones={imageDragDropData.dropZones}
            draggableItems={imageDragDropData.draggableItems}
            onAnswerChange={handleAnswerChange}
            currentAnswer={currentImageDragDropAnswer}
            isAnswered={false}
            showFeedback={false}
          />
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    const correctAnswers = questions.filter((q) => checkAnswer(q, state.answers[q.id] || '')).length;

    return (
      <Result
        status={state.score >= quiz.passingScore ? 'success' : 'error'}
        title={state.score >= quiz.passingScore ? t('quiz.congratulations') : t('quiz.tryAgain')}
        subTitle={`${t('quiz.yourScore')}: ${state.score}% (${correctAnswers}/${totalQuestions} ${t('quiz.correct')})`}
        extra={[
          <Button key="retry" onClick={handleRetry} disabled={!quiz.allowRetry}>
            {t('quiz.retry')}
          </Button>,
          <Button key="exit" type="primary" onClick={onExit}>
            {t('quiz.exit')}
          </Button>,
        ]}
      />
    );
  };

  if (showResults) {
    return renderResults();
  }

  if (state.isCompleted) {
    return renderResults();
  }

  return (
    <Card
      title={quiz.title}
      extra={
        <Space>
          {quiz.timeLimit && (
            <span>
              <ClockCircleOutlined /> {formatTime(quiz.timeLimit * 60 - state.timeSpent)}
            </span>
          )}
          <Button type="text" onClick={() => setShowExitModal(true)}>
            {t('quiz.exit')}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Progress percent={progress} />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            {t('quiz.question')} {state.currentQuestionIndex + 1} {t('quiz.of')} {totalQuestions}
          </div>
        </div>

        <Card title={currentQuestion.question}>{renderQuestion()}</Card>

        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={handlePrevious} disabled={state.currentQuestionIndex === 0}>
            {t('quiz.previous')}
          </Button>

          <Button type="primary" onClick={handleNext} disabled={!state.answers[currentQuestion.id]}>
            {state.currentQuestionIndex === totalQuestions - 1 ? t('quiz.finish') : t('quiz.next')}
          </Button>
        </Space>
      </Space>

      <Modal
        title={t('quiz.confirmExit')}
        open={showExitModal}
        onOk={() => {
          setShowExitModal(false);
          onExit();
        }}
        onCancel={() => setShowExitModal(false)}
      >
        <p>{t('quiz.exitWarning')}</p>
      </Modal>
    </Card>
  );
};
