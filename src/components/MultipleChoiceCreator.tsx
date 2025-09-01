import React, { useState } from 'react';
import { Form, Input, Button, Space, Card, Typography, Checkbox, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface MultipleChoiceCreatorProps {
  value?: {
    options: string[];
    answerKey: string[];
  };
  onChange?: (value: any) => void;
}

export const MultipleChoiceCreator: React.FC<MultipleChoiceCreatorProps> = ({ value, onChange }) => {
  const [options, setOptions] = useState<string[]>(value?.options || ['', '', '', '']);
  const [answerKey, setAnswerKey] = useState<string[]>(value?.answerKey || []);

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange?.({ options: newOptions, answerKey });
  };

  const addOption = () => {
    const newOptions = [...options, ''];
    setOptions(newOptions);
    onChange?.({ options: newOptions, answerKey });
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Удаляем из правильных ответов, если этот вариант был выбран
      const newAnswerKey = answerKey.filter((answer) => answer !== options[index]);
      setOptions(newOptions);
      setAnswerKey(newAnswerKey);
      onChange?.({ options: newOptions, answerKey: newAnswerKey });
    }
  };

  const toggleAnswer = (option: string) => {
    const newAnswerKey = answerKey.includes(option) ? answerKey.filter((a) => a !== option) : [...answerKey, option];
    setAnswerKey(newAnswerKey);
    onChange?.({ options, answerKey: newAnswerKey });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Варианты ответов:</Text>
        {options.map((option, index) => (
          <Card
            key={index}
            size="small"
            style={{ marginTop: 8 }}
            extra={
              options.length > 2 ? (
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeOption(index)} />
              ) : null
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder={`Вариант ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox
                  checked={answerKey.includes(option)}
                  onChange={() => toggleAnswer(option)}
                  disabled={!option.trim()}
                >
                  <Text style={{ fontSize: '12px' }}>Правильный ответ</Text>
                </Checkbox>
              </div>
            </Space>
          </Card>
        ))}

        <Button type="dashed" icon={<PlusOutlined />} onClick={addOption} style={{ marginTop: 8, width: '100%' }}>
          Добавить вариант
        </Button>
      </div>

      {answerKey.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: '8px 12px',
            backgroundColor: '#f6ffed',
            borderRadius: '6px',
            border: '1px solid #b7eb8f',
          }}
        >
          <Text strong style={{ color: '#52c41a' }}>
            Выбранные правильные ответы:
          </Text>
          <div style={{ marginTop: 4 }}>
            {answerKey.map((answer, index) => (
              <Tag key={index} color="green" style={{ margin: '2px' }}>
                {answer}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
