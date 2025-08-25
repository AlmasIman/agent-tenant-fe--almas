import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Button, Progress, Tag, Divider, Radio, Checkbox, Alert, Result, message } from 'antd';
import { ArrowLeftOutlined, RedoOutlined, CheckOutlined, CloseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';

const { Title, Text, Paragraph } = Typography;

/** ---- API types ---- */
type TrainingAnswer = {
  text: string;
  correct?: boolean;
  feedback?: string;
};
type TrainingQuestion = {
  question: string;
  answers: TrainingAnswer[];
  multiple?: boolean;
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
};
type TrainingContent = {
  questions: TrainingQuestion[];
  overallFeedback?: {
    perfect?: string;
    good?: string;
    bad?: string;
  };
};
type Training = {
  id: number;
  name: string;
  description?: string;
  content: TrainingContent;
  kb_article?: number;
  publisher?: string;
};

/** ---- Page ---- */
const TrainingPlayerPage: React.FC = () => {
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<Training | null>(null);

  // navigation state
  const [step, setStep] = useState(0); // index of current question
  // selections: Map questionIndex -> Set of answerIndexes
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  // per-question “checked” state to reveal feedback
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions: TrainingQuestion[] = useMemo(() => training?.content?.questions || [], [training]);

  const total = questions.length;

  /** Load training:
   * Preferred: GET /trainings/create/?id=:trainingId   (как просили)
   * Fallback:  GET /trainings/:id/
   */
  // before: tried GET /trainings/create/?id=... (and a fallback)
  // after: use GET /trainings/trainings/{id}/

  const loadTraining = useCallback(async () => {
    if (!trainingId) return;
    try {
      setLoading(true);
      const { data } = await httpApi.get(`/trainings/trainings/${trainingId}/`);
      setTraining(data as Training);
    } catch (e) {
      console.error(e);
      message.error('Не удалось загрузить викторину');
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  useEffect(() => {
    loadTraining();
  }, [loadTraining]);

  const progressPct = useMemo(() => {
    if (!total) return 0;
    const answered = Object.keys(selections).filter((k) => (selections as any)[k]?.length).length;
    return Math.round((answered / total) * 100);
  }, [selections, total]);

  const current = questions[step];

  /** evaluation helpers */
  const isCorrect = (q: TrainingQuestion, sel: number[]): boolean => {
    const correctIdx = q.answers
      .map((a, i) => (a.correct ? i : -1))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);

    const chosen = [...sel].sort((a, b) => a - b);
    if ((q.multiple || false) === true) {
      // must match exact set
      return correctIdx.length === chosen.length && correctIdx.every((v, i) => v === chosen[i]);
    } else {
      // single: exactly one selected and matches the only correct
      if (correctIdx.length !== 1 || chosen.length !== 1) return false;
      return chosen[0] === correctIdx[0];
    }
  };

  const summary = useMemo(() => {
    if (!total) return { correct: 0, total: 0, score: 0 };
    let ok = 0;
    questions.forEach((q, i) => {
      const sel = selections[i] || [];
      if (sel.length && isCorrect(q, sel)) ok += 1;
    });
    return { correct: ok, total, score: Math.round((ok / total) * 100) };
  }, [questions, selections, total]);

  const overallText = useMemo(() => {
    const fb = training?.content?.overallFeedback || {};
    if (summary.correct === total) return fb.perfect || 'Отлично! Все ответы правильные!';
    if (summary.correct >= Math.ceil(total * 0.6)) return fb.good || 'Хорошо, но есть ошибки.';
    return fb.bad || 'Нужно повторить материал.';
  }, [summary, training, total]);

  const handleSelectSingle = (idx: number) => {
    setSelections((prev) => ({ ...prev, [step]: [idx] }));
  };
  const handleToggleMulti = (idx: number) => {
    setSelections((prev) => {
      const cur = new Set(prev[step] || []);
      if (cur.has(idx)) cur.delete(idx);
      else cur.add(idx);
      return { ...prev, [step]: Array.from(cur) };
    });
  };
  const handleCheck = () => setChecked((p) => ({ ...p, [step]: true }));

  const handleNext = () => setStep((s) => Math.min(s + 1, total - 1));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));
  const handleSubmit = () => {
    if (!total) return;
    setSubmitted(true);
    // раскрыть все фиды
    const all: Record<number, boolean> = {};
    for (let i = 0; i < total; i++) all[i] = true;
    setChecked(all);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleRestart = () => {
    setSelections({});
    setChecked({});
    setSubmitted(false);
    setStep(0);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Загрузка викторины…</div>;
  }

  if (!training || !questions.length) {
    return (
      <>
        <PageTitle>Викторина</PageTitle>
        <Card>
          <Result
            status="warning"
            title="Викторина не найдена или не содержит вопросов"
            extra={
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Назад
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle>{training.name}</PageTitle>

      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space align="baseline" wrap>
            <Title level={3} style={{ margin: 0 }}>
              {training.name}
            </Title>
            {training.publisher && <Tag>{training.publisher}</Tag>}
            {typeof training.kb_article === 'number' && (
              <Button type="link" onClick={() => navigate(`/course/${training.kb_article}`)}>
                Открыть курс
              </Button>
            )}
          </Space>
          {training.description && (
            <Paragraph type="secondary" style={{ margin: 0 }}>
              {training.description}
            </Paragraph>
          )}
          <Progress percent={progressPct} showInfo />
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Назад
            </Button>
            <Button icon={<RedoOutlined />} onClick={handleRestart}>
              Начать заново
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Question Card */}
      {!submitted && current && (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space align="baseline" wrap>
              <Tag color="blue">
                Вопрос {step + 1} / {total}
              </Tag>
              {checked[step] &&
                (isCorrect(current, selections[step] || []) ? (
                  <Tag color="green" icon={<CheckOutlined />}>
                    Верно
                  </Tag>
                ) : (
                  <Tag color="red" icon={<CloseOutlined />}>
                    Неверно
                  </Tag>
                ))}
            </Space>

            <Title level={4} style={{ marginTop: 0 }}>
              {current.question}
            </Title>

            {/* Answers */}
            {current.multiple ? (
              <Checkbox.Group
                value={selections[step] || []}
                onChange={(vals) => setSelections((p) => ({ ...p, [step]: vals as number[] }))}
              >
                <Space direction="vertical" size="middle">
                  {current.answers.map((a, idx) => (
                    <Checkbox key={idx} value={idx} onChange={() => handleToggleMulti(idx)}>
                      {a.text}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            ) : (
              <Radio.Group value={(selections[step] || [])[0]} onChange={(e) => handleSelectSingle(e.target.value)}>
                <Space direction="vertical" size="middle">
                  {current.answers.map((a, idx) => (
                    <Radio key={idx} value={idx}>
                      {a.text}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}

            {/* Per-question feedback (when checked) */}
            {checked[step] && (
              <>
                <Divider />
                {current.answers.map((a, idx) => {
                  const chosen = (selections[step] || []).includes(idx);
                  if (!chosen && !a.correct) return null;
                  const ok = !!a.correct;
                  return (
                    <Alert
                      key={idx}
                      type={ok ? 'success' : 'error'}
                      showIcon
                      message={ok ? 'Правильно' : 'Неверно'}
                      description={a.feedback || (ok ? current.feedback?.correct : current.feedback?.incorrect)}
                      style={{ marginBottom: 8 }}
                    />
                  );
                })}
              </>
            )}

            <Space wrap>
              <Button onClick={handlePrev} disabled={step === 0}>
                Назад
              </Button>
              {!checked[step] && (
                <Button type="primary" onClick={handleCheck} disabled={!selections[step]?.length}>
                  Проверить
                </Button>
              )}
              <Button onClick={handleNext} disabled={step === total - 1}>
                Далее
              </Button>
              <Button type="primary" onClick={handleSubmit} disabled={Object.keys(selections).length === 0}>
                Завершить тест
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      {/* Summary */}
      {submitted && (
        <Card>
          <Result
            status={
              summary.correct === total ? 'success' : summary.correct >= Math.ceil(total * 0.6) ? 'info' : 'warning'
            }
            title={`Результат: ${summary.correct} из ${total} (${summary.score}%)`}
            subTitle={overallText}
            extra={
              <Space wrap>
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRestart}>
                  Пройти ещё раз
                </Button>
                {typeof training.kb_article === 'number' && (
                  <Button onClick={() => navigate(`/course/${training.kb_article}`)}>Вернуться к курсу</Button>
                )}
              </Space>
            }
          />
        </Card>
      )}
    </>
  );
};

export default TrainingPlayerPage;
