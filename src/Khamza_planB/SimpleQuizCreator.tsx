import React, { useState } from 'react';
import { Card, Button, Input, Form, Space, Divider, Select, Switch, InputNumber, Row, Col, message } from 'antd';
import { H5PQuiz, H5PQuizQuestion } from './types';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;

interface SimpleQuizCreatorProps {
  onSave: (quiz: H5PQuiz) => void;
  initialQuiz?: H5PQuiz;
}

export const SimpleQuizCreator: React.FC<SimpleQuizCreatorProps> = ({ onSave, initialQuiz }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<H5PQuizQuestion[]>(initialQuiz?.questions || []);
  const [currentQuestionType, setCurrentQuestionType] = useState<'multiple-choice' | 'true-false' | 'fill-in-the-blank' | 'mark-the-words' | 'image-hotspot' | 'drag-the-words'>('multiple-choice');

  const questionTypes = [
    { value: 'multiple-choice', label: t('quiz.multipleChoice') },
    { value: 'true-false', label: t('quiz.trueFalse') },
    { value: 'fill-in-the-blank', label: t('quiz.fillInTheBlank') },
    { value: 'mark-the-words', label: t('quiz.markTheWords') },
    { value: 'image-hotspot', label: t('quiz.imageHotspot') },
    { value: 'drag-the-words', label: t('quiz.dragTheWords') },
  ];

  const addQuestion = () => {
    const newQuestion: H5PQuizQuestion = {
      id: `question_${Date.now()}`,
      type: currentQuestionType,
      question: '',
      options: currentQuestionType === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: currentQuestionType === 'multiple-choice' ? '' : '',
      points: 1,
      text: currentQuestionType === 'mark-the-words' ? '' : undefined,
      correctWords: currentQuestionType === 'mark-the-words' ? [] : undefined,
      imageUrl: currentQuestionType === 'image-hotspot' ? '' : undefined,
      hotspots: currentQuestionType === 'image-hotspot' ? [] : undefined,
      dragText: currentQuestionType === 'drag-the-words' ? '' : undefined,
      dragWords: currentQuestionType === 'drag-the-words' ? [] : undefined,
      dragTargets: currentQuestionType === 'drag-the-words' ? [] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof H5PQuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const updateCorrectWords = (questionIndex: number, words: string[]) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctWords = words;
    setQuestions(updatedQuestions);
  };

  const addHotspot = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].hotspots) {
      updatedQuestions[questionIndex].hotspots = [];
    }
    updatedQuestions[questionIndex].hotspots!.push({
      id: `hotspot_${Date.now()}`,
      x: 50,
      y: 50,
      radius: 20,
      label: '',
    });
    setQuestions(updatedQuestions);
  };

  const removeHotspot = (questionIndex: number, hotspotIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].hotspots!.splice(hotspotIndex, 1);
    setQuestions(updatedQuestions);
  };

  const updateHotspot = (questionIndex: number, hotspotIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].hotspots![hotspotIndex] = {
      ...updatedQuestions[questionIndex].hotspots![hotspotIndex],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const updateDragWords = (questionIndex: number, words: string[]) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].dragWords = words;
    setQuestions(updatedQuestions);
  };

  const addDragTarget = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].dragTargets) {
      updatedQuestions[questionIndex].dragTargets = [];
    }
    updatedQuestions[questionIndex].dragTargets!.push({
      id: `target_${Date.now()}`,
      placeholder: '___',
      correctWord: '',
    });
    setQuestions(updatedQuestions);
  };

  const removeDragTarget = (questionIndex: number, targetIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].dragTargets!.splice(targetIndex, 1);
    setQuestions(updatedQuestions);
  };

  const updateDragTarget = (questionIndex: number, targetIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].dragTargets![targetIndex] = {
      ...updatedQuestions[questionIndex].dragTargets![targetIndex],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const quiz: H5PQuiz = {
        id: initialQuiz?.id || `quiz_${Date.now()}`,
        title: values.title,
        description: values.description,
        questions,
        timeLimit: values.timeLimit,
        passingScore: values.passingScore,
        shuffleQuestions: values.shuffleQuestions,
        showResults: values.showResults,
        allowRetry: values.allowRetry,
        maxAttempts: values.maxAttempts,
      };
      onSave(quiz);
      message.success(t('quiz.quizSaved'));
    } catch (error) {
      message.error(t('quiz.validationError'));
    }
  };

  const renderQuestionForm = (question: H5PQuizQuestion, index: number) => {
    return (
      <Card
        key={question.id}
        title={`${t('quiz.question')} ${index + 1}`}
        extra={
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeQuestion(index)}
          />
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder={t('quiz.enterQuestion')}
            value={question.question}
            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
          />
          
          {question.type === 'multiple-choice' && (
            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                {question.options?.map((option, optionIndex) => (
                  <Input
                    key={optionIndex}
                    placeholder={`${t('quiz.option')} ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                    addonBefore={`${String.fromCharCode(65 + optionIndex)}.`}
                  />
                ))}
                <Input
                  placeholder={t('quiz.correctAnswer')}
                  value={question.correctAnswer as string}
                  onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                />
              </Space>
            </div>
          )}

          {question.type === 'true-false' && (
            <Select
              placeholder={t('quiz.selectCorrectAnswer')}
              value={question.correctAnswer as string}
              onChange={(value) => updateQuestion(index, 'correctAnswer', value)}
              style={{ width: '100%' }}
            >
              <Option value="true">{t('quiz.true')}</Option>
              <Option value="false">{t('quiz.false')}</Option>
            </Select>
          )}

          {question.type === 'fill-in-the-blank' && (
            <Input
              placeholder={t('quiz.correctAnswer')}
              value={question.correctAnswer as string}
              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
            />
          )}

          {question.type === 'mark-the-words' && (
            <div>
              <TextArea
                placeholder={t('quiz.enterTextWithWords')}
                value={question.text}
                onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                rows={4}
                style={{ marginBottom: 16 }}
              />
              <Input
                placeholder={t('quiz.enterCorrectWords')}
                value={question.correctWords?.join(', ') || ''}
                onChange={(e) => updateCorrectWords(index, e.target.value.split(',').map(w => w.trim()).filter(w => w))}
                addonBefore={t('quiz.correctWords')}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
                {t('quiz.markTheWordsHint')}
              </div>
            </div>
          )}

          {question.type === 'image-hotspot' && (
            <div>
              <Input
                placeholder={t('quiz.enterImageUrl')}
                value={question.imageUrl}
                onChange={(e) => updateQuestion(index, 'imageUrl', e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addHotspot(index)}
                  style={{ marginBottom: 8 }}
                >
                  {t('quiz.addHotspot')}
                </Button>
                {question.hotspots?.map((hotspot, hotspotIndex) => (
                  <Card
                    key={hotspot.id}
                    size="small"
                    title={`${t('quiz.hotspot')} ${hotspotIndex + 1}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeHotspot(index, hotspotIndex)}
                      />
                    }
                    style={{ marginBottom: 8 }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input
                        placeholder={t('quiz.hotspotLabel')}
                        value={hotspot.label}
                        onChange={(e) => updateHotspot(index, hotspotIndex, 'label', e.target.value)}
                      />
                      <Row gutter={8}>
                        <Col span={12}>
                          <InputNumber
                            placeholder="X %"
                            value={hotspot.x}
                            onChange={(value) => updateHotspot(index, hotspotIndex, 'x', value)}
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                            addonBefore="X"
                          />
                        </Col>
                        <Col span={12}>
                          <InputNumber
                            placeholder="Y %"
                            value={hotspot.y}
                            onChange={(value) => updateHotspot(index, hotspotIndex, 'y', value)}
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                            addonBefore="Y"
                          />
                        </Col>
                      </Row>
                      <InputNumber
                        placeholder={t('quiz.radius')}
                        value={hotspot.radius}
                        onChange={(value) => updateHotspot(index, hotspotIndex, 'radius', value)}
                        min={5}
                        max={100}
                        style={{ width: '100%' }}
                        addonBefore={t('quiz.radius')}
                      />
                    </Space>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {question.type === 'drag-the-words' && (
            <div>
              <TextArea
                placeholder={t('quiz.enterTextWithPlaceholders')}
                value={question.dragText}
                onChange={(e) => updateQuestion(index, 'dragText', e.target.value)}
                rows={4}
                style={{ marginBottom: 16 }}
              />
              <Input
                placeholder={t('quiz.enterDragWords')}
                value={question.dragWords?.join(', ') || ''}
                onChange={(e) => updateDragWords(index, e.target.value.split(',').map(w => w.trim()).filter(w => w))}
                addonBefore={t('quiz.dragWords')}
                style={{ marginBottom: 16 }}
              />
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => addDragTarget(index)}
                  style={{ marginBottom: 8 }}
                >
                  {t('quiz.addDragTarget')}
                </Button>
                {question.dragTargets?.map((target, targetIndex) => (
                  <Card
                    key={target.id}
                    size="small"
                    title={`${t('quiz.target')} ${targetIndex + 1}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeDragTarget(index, targetIndex)}
                      />
                    }
                    style={{ marginBottom: 8 }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input
                        placeholder={t('quiz.placeholder')}
                        value={target.placeholder}
                        onChange={(e) => updateDragTarget(index, targetIndex, 'placeholder', e.target.value)}
                        addonBefore={t('quiz.placeholder')}
                      />
                      <Input
                        placeholder={t('quiz.correctWord')}
                        value={target.correctWord}
                        onChange={(e) => updateDragTarget(index, targetIndex, 'correctWord', e.target.value)}
                        addonBefore={t('quiz.correctWord')}
                      />
                    </Space>
                  </Card>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t('quiz.dragTheWordsHint')}
              </div>
            </div>
          )}

          <InputNumber
            placeholder={t('quiz.points')}
            value={question.points}
            onChange={(value) => updateQuestion(index, 'points', value)}
            min={1}
            max={10}
          />

          <TextArea
            placeholder={t('quiz.explanation')}
            value={question.explanation}
            onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
            rows={2}
          />
        </Space>
      </Card>
    );
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialQuiz}>
      <Card title={t('quiz.createQuiz')}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="title"
            label={t('quiz.title')}
            rules={[{ required: true, message: t('quiz.titleRequired') }]}
          >
            <Input placeholder={t('quiz.enterTitle')} />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('quiz.description')}
            rules={[{ required: true, message: t('quiz.descriptionRequired') }]}
          >
            <TextArea placeholder={t('quiz.enterDescription')} rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="timeLimit" label={t('quiz.timeLimit')}>
                <InputNumber
                  placeholder={t('quiz.minutes')}
                  min={1}
                  max={120}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="passingScore"
                label={t('quiz.passingScore')}
                rules={[{ required: true, message: t('quiz.passingScoreRequired') }]}
              >
                <InputNumber
                  placeholder="%"
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="shuffleQuestions" valuePropName="checked">
                <Switch checkedChildren={t('quiz.yes')} unCheckedChildren={t('quiz.no')} />
              </Form.Item>
              <span>{t('quiz.shuffleQuestions')}</span>
            </Col>
            <Col span={8}>
              <Form.Item name="showResults" valuePropName="checked">
                <Switch checkedChildren={t('quiz.yes')} unCheckedChildren={t('quiz.no')} />
              </Form.Item>
              <span>{t('quiz.showResults')}</span>
            </Col>
            <Col span={8}>
              <Form.Item name="allowRetry" valuePropName="checked">
                <Switch checkedChildren={t('quiz.yes')} unCheckedChildren={t('quiz.no')} />
              </Form.Item>
              <span>{t('quiz.allowRetry')}</span>
            </Col>
          </Row>

          <Form.Item name="maxAttempts" label={t('quiz.maxAttempts')}>
            <InputNumber
              placeholder={t('quiz.unlimited')}
              min={1}
              max={10}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Space>
      </Card>

      <Divider />

      <Card title={t('quiz.questions')}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16} align="middle">
            <Col span={16}>
              <Select
                value={currentQuestionType}
                onChange={(value: 'multiple-choice' | 'true-false' | 'fill-in-the-blank') => setCurrentQuestionType(value)}
                style={{ width: '100%' }}
              >
                {questionTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addQuestion}
                style={{ width: '100%' }}
              >
                {t('quiz.addQuestion')}
              </Button>
            </Col>
          </Row>

          {questions.map((question, index) => renderQuestionForm(question, index))}

          {questions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              {t('quiz.noQuestionsYet')}
            </div>
          )}
        </Space>
      </Card>

      <Divider />

      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={handleSubmit}
        size="large"
        disabled={questions.length === 0}
      >
        {t('quiz.saveQuiz')}
      </Button>
    </Form>
  );
};
