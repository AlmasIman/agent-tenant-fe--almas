import React, { useState } from 'react';
import { Form, Input, Switch, Button, Space, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface TestAnswer {
  text: string;
  correct: boolean;
  feedback: string;
}

interface TestQuestionCreatorProps {
  value?: {
    answers: TestAnswer[];
    multiple: boolean;
    feedback: {
      correct: string;
      incorrect: string;
    };
  };
  onChange?: (value: any) => void;
}

export const TestQuestionCreator: React.FC<TestQuestionCreatorProps> = ({ value, onChange }) => {
  const [answers, setAnswers] = useState<TestAnswer[]>(
    value?.answers || [
      { text: '', correct: false, feedback: '' },
      { text: '', correct: false, feedback: '' },
      { text: '', correct: false, feedback: '' },
      { text: '', correct: false, feedback: '' }
    ]
  );
  const [multiple, setMultiple] = useState(value?.multiple || false);
  const [feedback, setFeedback] = useState(value?.feedback || { correct: '', incorrect: '' });

  const updateAnswer = (index: number, field: keyof TestAnswer, value: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
    onChange?.({ answers: newAnswers, multiple, feedback });
  };

  const addAnswer = () => {
    const newAnswers = [...answers, { text: '', correct: false, feedback: '' }];
    setAnswers(newAnswers);
    onChange?.({ answers: newAnswers, multiple, feedback });
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      onChange?.({ answers: newAnswers, multiple, feedback });
    }
  };

  const handleMultipleChange = (checked: boolean) => {
    setMultiple(checked);
    onChange?.({ answers, multiple: checked, feedback });
  };

  const handleFeedbackChange = (field: 'correct' | 'incorrect', value: string) => {
    const newFeedback = { ...feedback, [field]: value };
    setFeedback(newFeedback);
    onChange?.({ answers, multiple, feedback: newFeedback });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Switch
            checked={multiple}
            onChange={handleMultipleChange}
          />
          <Text>Разрешить множественный выбор</Text>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Варианты ответов:</Text>
        {answers.map((answer, index) => (
          <Card
            key={index}
            size="small"
            style={{ marginTop: 8 }}
            extra={
              answers.length > 2 ? (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeAnswer(index)}
                />
              ) : null
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder={`Вариант ${index + 1}`}
                value={answer.text}
                onChange={(e) => updateAnswer(index, 'text', e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch
                  checked={answer.correct}
                  onChange={(checked) => updateAnswer(index, 'correct', checked)}
                  size="small"
                />
                <Text style={{ fontSize: '12px' }}>Правильный ответ</Text>
              </div>
              <TextArea
                placeholder="Обратная связь для этого варианта"
                value={answer.feedback}
                onChange={(e) => updateAnswer(index, 'feedback', e.target.value)}
                rows={2}
                size="small"
              />
            </Space>
          </Card>
        ))}
        
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addAnswer}
          style={{ marginTop: 8, width: '100%' }}
        >
          Добавить вариант
        </Button>
      </div>

      <div>
        <Text strong>Общая обратная связь:</Text>
        <div style={{ marginTop: 8 }}>
          <Input
            placeholder="Обратная связь при правильном ответе"
            value={feedback.correct}
            onChange={(e) => handleFeedbackChange('correct', e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Обратная связь при неправильном ответе"
            value={feedback.incorrect}
            onChange={(e) => handleFeedbackChange('incorrect', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
