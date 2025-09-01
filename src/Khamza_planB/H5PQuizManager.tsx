import React, { useState, useEffect } from 'react';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { BaseModal } from '@app/components/common/BaseModal/BaseModal';
import { BaseTabs } from '@app/components/common/BaseTabs/BaseTabs';
import { BaseTag } from '@app/components/common/BaseTag/BaseTag';
import { BaseProgress } from '@app/components/common/BaseProgress/BaseProgress';
import { Statistic } from 'antd';
import { H5PQuiz, H5PQuizResult } from './types';
import { SimpleQuizCreator } from './SimpleQuizCreator';
import { SimpleQuizPlayer } from './SimpleQuizPlayer';
import { useTranslation } from 'react-i18next';
import { notificationController } from '@app/controllers/notificationController';
import {
  PlusOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

const { TabPane } = BaseTabs as any;

export const H5PQuizManager: React.FC = () => {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState<H5PQuiz[]>([]);
  const [results, setResults] = useState<H5PQuizResult[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<H5PQuiz | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<H5PQuiz | null>(null);

  // Загрузка данных из localStorage при инициализации
  useEffect(() => {
    const savedQuizzes = localStorage.getItem('h5p-quizzes');
    const savedResults = localStorage.getItem('h5p-results');

    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes));
    }
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('h5p-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('h5p-results', JSON.stringify(results));
  }, [results]);

  const handleSaveQuiz = (quiz: H5PQuiz) => {
    if (editingQuiz) {
      setQuizzes(quizzes.map((q) => (q.id === quiz.id ? quiz : q)));
      setEditingQuiz(null);
    } else {
      setQuizzes([...quizzes, quiz]);
    }
    setIsCreatorOpen(false);
    notificationController.success({ message: t('quiz.quizSavedSuccessfully') });
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes(quizzes.filter((q) => q.id !== quizId));
    setResults(results.filter((r) => r.quizId !== quizId));
    notificationController.success({ message: t('quiz.quizDeleted') });
  };

  const handleStartQuiz = (quiz: H5PQuiz) => {
    setSelectedQuiz(quiz);
    setIsPlayerOpen(true);
  };

  const handleQuizComplete = (result: H5PQuizResult) => {
    setResults([...results, result]);
    notificationController.success({
      message: result.passed ? t('quiz.quizPassed') : t('quiz.quizFailed'),
    });
  };

  const handleEditQuiz = (quiz: H5PQuiz) => {
    setEditingQuiz(quiz);
    setIsCreatorOpen(true);
  };

  const getQuizStats = (quizId: string) => {
    const quizResults = results.filter((r) => r.quizId === quizId);
    if (quizResults.length === 0) return null;

    const avgScore = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length;
    const passRate = (quizResults.filter((r) => r.passed).length / quizResults.length) * 100;
    const totalAttempts = quizResults.length;

    return { avgScore, passRate, totalAttempts };
  };

  const quizColumns: ColumnsType<H5PQuiz> = [
    {
      title: t('quiz.title'),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: H5PQuiz) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: t('quiz.questions'),
      dataIndex: 'questions',
      key: 'questions',
      render: (questions: any[]) => questions.length,
    },
    {
      title: t('quiz.timeLimit'),
      dataIndex: 'timeLimit',
      key: 'timeLimit',
      render: (timeLimit: number) => (timeLimit ? `${timeLimit} ${t('quiz.minutes')}` : t('quiz.noLimit')),
    },
    {
      title: t('quiz.passingScore'),
      dataIndex: 'passingScore',
      key: 'passingScore',
      render: (score: number) => `${score}%`,
    },
    {
      title: t('quiz.stats'),
      key: 'stats',
      render: (_, record: H5PQuiz) => {
        const stats = getQuizStats(record.id);
        if (!stats) return <span style={{ color: '#999' }}>{t('quiz.noAttempts')}</span>;

        return (
          <BaseSpace direction="vertical" size="small">
            <div>
              {t('quiz.avgScore')}: {stats.avgScore.toFixed(1)}%
            </div>
            <div>
              {t('quiz.passRate')}: {stats.passRate.toFixed(1)}%
            </div>
            <div>
              {t('quiz.attempts')}: {stats.totalAttempts}
            </div>
          </BaseSpace>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record: H5PQuiz) => (
        <BaseSpace>
          <BaseButton type="primary" icon={<PlayCircleOutlined />} onClick={() => handleStartQuiz(record)}>
            {t('quiz.start')}
          </BaseButton>
          <BaseButton icon={<EditOutlined />} onClick={() => handleEditQuiz(record)}>
            {t('common.edit')}
          </BaseButton>
          <BaseButton danger icon={<DeleteOutlined />} onClick={() => handleDeleteQuiz(record.id)}>
            {t('common.delete')}
          </BaseButton>
        </BaseSpace>
      ),
    },
  ];

  const resultColumns: ColumnsType<H5PQuizResult> = [
    {
      title: t('quiz.quizTitle'),
      key: 'quizTitle',
      render: (_, record: H5PQuizResult) => {
        const quiz = quizzes.find((q) => q.id === record.quizId);
        return quiz?.title || t('quiz.unknownQuiz');
      },
    },
    {
      title: t('quiz.score'),
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <BaseProgress
          percent={score}
          size="small"
          status={score >= 70 ? 'success' : score >= 50 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: t('quiz.correctAnswers'),
      key: 'correctAnswers',
      render: (_, record: H5PQuizResult) => `${record.correctAnswers}/${record.totalQuestions}`,
    },
    {
      title: t('quiz.timeSpent'),
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (timeSpent: number) => {
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      title: t('quiz.status'),
      key: 'status',
      render: (_, record: H5PQuizResult) => (
        <BaseTag color={record.passed ? 'green' : 'red'}>{record.passed ? t('quiz.passed') : t('quiz.failed')}</BaseTag>
      ),
    },
    {
      title: t('quiz.completedAt'),
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <BaseCard
        title={
          <BaseSpace>
            <TrophyOutlined />
            {t('quiz.quizManager')}
          </BaseSpace>
        }
        extra={
          <BaseButton type="primary" icon={<PlusOutlined />} onClick={() => setIsCreatorOpen(true)}>
            {t('quiz.createNewQuiz')}
          </BaseButton>
        }
      >
        <BaseTabs defaultActiveKey="quizzes">
          <TabPane tab={t('quiz.quizzes')} key="quizzes">
            <BaseTable columns={quizColumns} dataSource={quizzes} rowKey="id" pagination={{ pageSize: 10 }} />
          </TabPane>

          <TabPane tab={t('quiz.results')} key="results">
            <BaseTable
              columns={resultColumns}
              dataSource={results}
              rowKey={(record) => `${record.quizId}-${record.completedAt.getTime()}`}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={t('quiz.statistics')} key="statistics">
            <BaseSpace direction="vertical" style={{ width: '100%' }}>
              <BaseCard>
                <Statistic title={t('quiz.totalQuizzes')} value={quizzes.length} prefix={<TrophyOutlined />} />
              </BaseCard>

              <BaseCard>
                <Statistic title={t('quiz.totalAttempts')} value={results.length} prefix={<PlayCircleOutlined />} />
              </BaseCard>

              <BaseCard>
                <Statistic
                  title={t('quiz.avgScore')}
                  value={results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0}
                  suffix="%"
                  precision={1}
                />
              </BaseCard>
            </BaseSpace>
          </TabPane>
        </BaseTabs>
      </BaseCard>

      <BaseModal
        title={editingQuiz ? t('quiz.editQuiz') : t('quiz.createQuiz')}
        open={isCreatorOpen}
        onCancel={() => {
          setIsCreatorOpen(false);
          setEditingQuiz(null);
        }}
        footer={null}
        width={800}
      >
        <SimpleQuizCreator onSave={handleSaveQuiz} initialQuiz={editingQuiz || undefined} />
      </BaseModal>

      <BaseModal
        title={selectedQuiz?.title}
        open={isPlayerOpen}
        onCancel={() => {
          setIsPlayerOpen(false);
          setSelectedQuiz(null);
        }}
        footer={null}
        width={800}
      >
        {selectedQuiz && (
          <SimpleQuizPlayer
            quiz={selectedQuiz}
            onComplete={handleQuizComplete}
            onExit={() => {
              setIsPlayerOpen(false);
              setSelectedQuiz(null);
            }}
          />
        )}
      </BaseModal>
    </div>
  );
};
