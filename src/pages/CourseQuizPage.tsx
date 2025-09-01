import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  message,
  Typography,
  Divider,
  List,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';
import { useApiCall } from '@app/hooks/useApiCall';
import { TestQuestionCreator } from '@app/components/TestQuestionCreator';
import { MultipleChoiceCreator } from '@app/components/MultipleChoiceCreator';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/** KB article returned by /kb/articles/{id}/ */
type KBArticle = {
  id: number;
  name: string | null;
  description: string | null;
  content: string | null;
  publisher: string | null;
  space: number | string | null;
  tags: string[] | string | null;
};

type UIQuizItem = {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'test';
  question: string;
  options?: string[]; // for multiple_choice
  answerKey: string[] | string | boolean; // array for multi, string for single, boolean for true/false
  explanation?: string;
  // для нового типа 'test'
  answers?: Array<{
    text: string;
    correct: boolean;
    feedback: string;
  }>;
  multiple?: boolean;
  feedback?: {
    correct: string;
    incorrect: string;
  };
};

type CreateTrainingResponse = {
  id: number;
  name: string;
};

/** helpers */
const toTagsArray = (t: KBArticle['tags']): string[] => {
  if (Array.isArray(t)) return t.filter(Boolean).map(String);
  if (typeof t === 'string' && t.trim()) return [t.trim()];
  return [];
};

const CourseQuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<KBArticle | null>(null);
  const [items, setItems] = useState<UIQuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<UIQuizItem | null>(null);
  const [form] = Form.useForm();

  // meta for training
  const [trainingId, setTrainingId] = useState<number | null>(null);
  const [trainingName, setTrainingName] = useState<string>('');
  const [trainingDesc, setTrainingDesc] = useState<string>('');
  const [overallGood, setOverallGood] = useState<string>('Отлично! Все ответы правильные!');
  const [overallOk, setOverallOk] = useState<string>('Хорошо, но есть ошибки.');
  const [overallBad, setOverallBad] = useState<string>('Нужно повторить материал.');

  const [searchParams, setSearchParams] = useSearchParams();
  const lsKey = (cid: string) => `trainingByCourse:${cid}`;

  // Create deduplicated API functions
  const getKbArticle = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });
  const getTrainings = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });

  useEffect(() => {
    (async () => {
      if (!courseId) return;
      try {
        const { data } = await getKbArticle<KBArticle>(`/kb/articles/${courseId}/`);
        setCourse(data);
        // default training meta from article
        const base = (data.name || 'Викторина').trim();
        setTrainingName(`${base} — тест`);
        setTrainingDesc(data.description || '');
      } catch (e) {
        console.error(e);
        message.error('Не удалось загрузить курс');
      }
    })();
  }, [courseId, getKbArticle]);

  useEffect(() => {
    (async () => {
      if (!courseId) return;

      // 1) из query ?trainingId=...
      const fromQuery = searchParams.get('trainingId');
      if (fromQuery) {
        await loadTrainingById(Number(fromQuery));
        return;
      }

      // 2) из localStorage
      const fromLS = localStorage.getItem(lsKey(courseId));
      if (fromLS) {
        await loadTrainingById(Number(fromLS));
        return;
      }

      // 3) fallback: возьмём первую викторину, привязанную к статье
      try {
        const { data } = await getTrainings('/trainings/trainings/', {
          params: { kb_article: courseId, page_size: 1 },
        });
        const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        if (list[0]?.id) {
          await loadTrainingById(Number(list[0].id));
        }
      } catch (err) {
        // тишина — викторина может ещё не быть создана
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, getTrainings]);

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'multiple_choice',
      question: '',
      options: [],
      answerKey: [],
      explanation: '',
    });
    setModalVisible(true);
  };

  const onEditQuestion = (q: UIQuizItem) => {
    setEditingItem(q);
    form.resetFields();
    form.setFieldsValue({
      type: q.type,
      question: q.question,
      options: q.options || [],
      answerKey: q.type === 'true_false' ? (q.answerKey as boolean) : q.answerKey,
      explanation: q.explanation || '',
    });
    setModalVisible(true);
  };

  const onDeleteQuestion = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    message.success('Вопрос удален');
  };

  const onSaveQuestion = async () => {
    try {
      const values = await form.validateFields();
      const type = values.type as UIQuizItem['type'];

      let newItem: UIQuizItem;

      if (type === 'multiple_choice') {
        const multipleChoiceData = values.multipleChoiceData;
        newItem = {
          id: editingItem ? editingItem.id : String(Date.now()),
          type,
          question: values.question,
          options: multipleChoiceData.options || [],
          answerKey: multipleChoiceData.answerKey || [],
          explanation: values.explanation || '',
        };
      } else if (type === 'test') {
        const testData = values.testData;
        const correctAnswers = testData.answers?.filter((a: any) => a.correct).map((a: any) => a.text) || [];
        newItem = {
          id: editingItem ? editingItem.id : String(Date.now()),
          type,
          question: values.question,
          answers: testData.answers || [],
          multiple: testData.multiple || false,
          feedback: testData.feedback || { correct: '', incorrect: '' },
          answerKey: correctAnswers,
          explanation: values.explanation || '',
        };
      } else {
        // true_false
        newItem = {
          id: editingItem ? editingItem.id : String(Date.now()),
          type,
          question: values.question,
          answerKey: Boolean(values.answerKey),
          explanation: values.explanation || '',
        };
      }

      setItems((prev) => (editingItem ? prev.map((x) => (x.id === editingItem.id ? newItem : x)) : [...prev, newItem]));
      setModalVisible(false);
      form.resetFields();
      message.success(editingItem ? 'Вопрос обновлен' : 'Вопрос добавлен');
    } catch {
      /* validation errors shown by antd */
    }
  };

  const mapFromTrainingQuestions = (apiQs: any[]): UIQuizItem[] => {
    return (apiQs || []).map((q: any, i: number) => {
      const answers = Array.isArray(q?.answers) ? q.answers : [];
      const isTF =
        answers.length === 2 &&
        /^(true|false)$/i.test(String(answers[0]?.text)) &&
        /^(true|false)$/i.test(String(answers[1]?.text));

      if (isTF) {
        const correctTrue = !!answers.find((a: any) => String(a?.text).toLowerCase() === 'true' && a?.correct);
        return {
          id: `${Date.now()}_${i}`,
          type: 'true_false',
          question: q?.question || '',
          answerKey: correctTrue,
          explanation: q?.feedback?.correct || q?.feedback?.incorrect || '',
        };
      }

      // Проверяем, является ли это вопросом типа 'test' (с обратной связью для каждого ответа)
      const hasIndividualFeedback = answers.some(
        (a: any) => a?.feedback && a.feedback !== 'Правильно!' && a.feedback !== 'Неверно.',
      );

      if (hasIndividualFeedback) {
        return {
          id: `${Date.now()}_${i}`,
          type: 'test',
          question: q?.question || '',
          answers: answers,
          multiple: q?.multiple || false,
          feedback: q?.feedback || { correct: '', incorrect: '' },
          answerKey: answers.filter((a: any) => a?.correct).map((a: any) => String(a?.text || '')),
          explanation: q?.feedback?.correct || q?.feedback?.incorrect || '',
        };
      }

      const options = answers.map((a: any) => String(a?.text || ''));
      const keys = answers.filter((a: any) => a?.correct).map((a: any) => String(a?.text || ''));
      return {
        id: `${Date.now()}_${i}`,
        type: 'multiple_choice',
        question: q?.question || '',
        options,
        answerKey: keys,
        explanation: q?.feedback?.correct || q?.feedback?.incorrect || '',
      };
    });
  };

  /** Map UI items -> API /trainings/create/ content.questions */
  const mapToTrainingQuestions = (arr: UIQuizItem[]) => {
    return arr.map((it) => {
      if (it.type === 'true_false') {
        const correctTrue = Boolean(it.answerKey) === true;
        return {
          question: it.question,
          answers: [
            { text: 'True', correct: correctTrue, feedback: correctTrue ? 'Верно' : 'Неверно' },
            { text: 'False', correct: !correctTrue, feedback: !correctTrue ? 'Верно' : 'Неверно' },
          ],
          multiple: false,
          feedback: {
            correct: 'Отлично! Вы ответили правильно.',
            incorrect: 'Есть ошибки, попробуйте еще раз.',
          },
        };
      }

      if (it.type === 'test') {
        return {
          question: it.question,
          answers: it.answers || [],
          multiple: it.multiple || false,
          feedback: it.feedback || {
            correct: 'Отлично! Вы ответили правильно.',
            incorrect: 'Есть ошибки, попробуйте еще раз.',
          },
        };
      }

      // multiple_choice
      const options = it.options || [];
      const keys = Array.isArray(it.answerKey) ? it.answerKey : [it.answerKey].filter(Boolean);
      const multi = keys.length > 1;

      return {
        question: it.question,
        answers: options.map((opt: string) => ({
          text: opt,
          correct: keys.includes(opt),
          feedback: keys.includes(opt) ? 'Правильно!' : 'Неверно.',
        })),
        multiple: multi,
        feedback: {
          correct: 'Отлично! Вы ответили правильно.',
          incorrect: 'Есть ошибки, попробуйте еще раз.',
        },
      };
    });
  };

  /** POST /api/trainings/create/ */
  const createTraining = async () => {
    if (!courseId) return;
    if (!items.length) {
      message.warning('Добавьте хотя бы один вопрос');
      return;
    }

    const payload = {
      name: trainingName || 'Викторина',
      description: trainingDesc || '',
      tags: toTagsArray(course?.tags ?? null) || [],
      content: {
        questions: mapToTrainingQuestions(items),
        overallFeedback: {
          perfect: overallGood,
          good: overallOk,
          bad: overallBad,
        },
      },
      category: 1, // при необходимости дайте выбрать из селекта
      kb_article: Number(courseId), // ← связь с курсом
      publisher: (course?.publisher || 'Test').toString(),
    };

    try {
      const { data } = await httpApi.post<CreateTrainingResponse>('/trainings/create/', payload);
      const newId = data?.id ?? null;
      setTrainingId(newId);
      if (newId && courseId) {
        localStorage.setItem(lsKey(courseId), String(newId));
        setSearchParams({ trainingId: String(newId) }, { replace: true } as any);
      }
      message.success('Викторина создана и связана с курсом');
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.detail || 'Ошибка при создании викторины');
    } finally {
      setLoading(false);
    }
  };

  const gotoPlayer = () => {
    if (!trainingId) return;
    // если у тебя есть этот роут (см. твой Django views раньше), откроем его
    window.open(`/training-player/${trainingId}/`, '_blank');
  };

  const loadTrainingById = async (id: number) => {
    try {
      setLoading(true);
      // основной эндпоинт показа тренинга (со слэшем!)
      const { data } = await httpApi.get(`/trainings/${id}/`);

      // сохраним id в состоянии
      setTrainingId(data?.id ?? id);

      // мета
      setTrainingName(data?.name || 'Викторина');
      setTrainingDesc(data?.description || '');

      // восстановим вопросы в UI
      const apiQs = data?.content?.questions || [];
      setItems(mapFromTrainingQuestions(apiQs));

      // общий фидбек (если есть)
      const ofb = data?.content?.overallFeedback || {};
      if (ofb.perfect) setOverallGood(ofb.perfect);
      if (ofb.good) setOverallOk(ofb.good);
      if (ofb.bad) setOverallBad(ofb.bad);

      // запомним id — и в адресной строке, и локально, чтобы пережить перезагрузку
      if (courseId) {
        localStorage.setItem(lsKey(courseId), String(data?.id ?? id));
        setSearchParams({ trainingId: String(data?.id ?? id) }, { replace: true } as any);
      }
    } catch (e) {
      console.error('loadTrainingById error', e);
      message.error('Не удалось загрузить существующую викторину');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Викторина для курса</PageTitle>

      <Card style={{ marginBottom: 16 }}>
        <Space align="baseline" wrap>
          <Title level={4} style={{ margin: 0 }}>
            {course?.name || 'Курс'} — тест
          </Title>
          <Tag color="green">{typeof course?.space === 'string' ? course?.space : 'Space'}</Tag>
          {course?.publisher && <Tag>{course.publisher}</Tag>}
        </Space>

        <Divider />

        <Space direction="vertical" style={{ width: 600, maxWidth: '100%' }}>
          <Input
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
            placeholder="Название викторины"
            prefix={<ThunderboltOutlined />}
          />
          <TextArea
            value={trainingDesc}
            onChange={(e) => setTrainingDesc(e.target.value)}
            placeholder="Краткое описание"
            rows={2}
          />
          {/* <Input
            value={overallGood}
            onChange={(e) => setOverallGood(e.target.value)}
            placeholder="Feedback при идеальном результате"
          />
          <Input
            value={overallOk}
            onChange={(e) => setOverallOk(e.target.value)}
            placeholder="Feedback при хорошем результате"
          />
          <Input
            value={overallBad}
            onChange={(e) => setOverallBad(e.target.value)}
            placeholder="Feedback при слабом результате"
          /> */}
        </Space>

        <Divider />

        <Space style={{ marginBottom: 16 }} wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Назад
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            Добавить вопрос
          </Button>
          <Button icon={<SaveOutlined />} onClick={createTraining} loading={loading} type="primary">
            Создать викторину
          </Button>
          <Button icon={<EyeOutlined />} onClick={gotoPlayer} disabled={!trainingId}>
            Открыть плеер
          </Button>
        </Space>

        <Divider />

        {items.length ? (
          <List
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEditQuestion(item)}>
                    Редактировать
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Удалить вопрос?"
                    okText="Да"
                    cancelText="Нет"
                    onConfirm={() => onDeleteQuestion(item.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Удалить
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{item.question}</Text>
                      <Tag color="blue">{item.type}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      {item.type === 'multiple_choice' && item.options?.length ? (
                        <>
                          <Text type="secondary">Варианты:</Text>
                          <ul style={{ margin: '4px 0 0 20px' }}>
                            {item.options.map((opt) => (
                              <li key={opt}>
                                {opt}{' '}
                                {Array.isArray(item.answerKey) && item.answerKey.includes(opt) ? (
                                  <Tag color="green">✓</Tag>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : item.type === 'true_false' ? (
                        <Text type="secondary">
                          Правильный ответ: <Text code>{String(Boolean(item.answerKey))}</Text>
                        </Text>
                      ) : item.type === 'test' && item.answers?.length ? (
                        <>
                          <Text type="secondary">Варианты:</Text>
                          <ul style={{ margin: '4px 0 0 20px' }}>
                            {item.answers.map((answer, index) => (
                              <li key={index}>
                                {answer.text} {answer.correct ? <Tag color="green">✓</Tag> : <Tag color="red">✗</Tag>}
                              </li>
                            ))}
                          </ul>
                          {item.multiple && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Множественный выбор
                            </Text>
                          )}
                        </>
                      ) : null}
                      {item.explanation && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">Объяснение: </Text>
                          <Text>{item.explanation}</Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Вопросы еще не добавлены</Text>
            <br />
            <Button type="primary" onClick={openAddModal} style={{ marginTop: 16 }}>
              Создать первый вопрос
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title={editingItem ? 'Редактировать вопрос' : 'Добавить вопрос'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={onSaveQuestion}
        okText={editingItem ? 'Обновить' : 'Добавить'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Тип вопроса" rules={[{ required: true, message: 'Выберите тип вопроса' }]}>
            <Select>
              <Option value="multiple_choice">Множественный выбор</Option>
              <Option value="true_false">Правда / Ложь</Option>
              <Option value="test">Тест</Option>
            </Select>
          </Form.Item>

          <Form.Item name="question" label="Вопрос" rules={[{ required: true, message: 'Введите вопрос' }]}>
            <TextArea rows={3} placeholder="Введите вопрос" />
          </Form.Item>

          {/* Поля зависят от типа */}
          <Form.Item noStyle shouldUpdate={(p, c) => p.type !== c.type}>
            {({ getFieldValue }) => {
              const questionType = getFieldValue('type');

              if (questionType === 'multiple_choice') {
                return (
                  <Form.Item
                    name="multipleChoiceData"
                    label="Настройки множественного выбора"
                    rules={[{ required: true, message: 'Настройте варианты ответов' }]}
                  >
                    <MultipleChoiceCreator />
                  </Form.Item>
                );
              } else if (questionType === 'true_false') {
                return (
                  <Form.Item
                    name="answerKey"
                    label="Правильный ответ"
                    rules={[{ required: true, message: 'Выберите правильный ответ' }]}
                  >
                    <Select>
                      <Option value={true as any}>True</Option>
                      <Option value={false as any}>False</Option>
                    </Select>
                  </Form.Item>
                );
              } else if (questionType === 'test') {
                return (
                  <Form.Item
                    name="testData"
                    label="Настройки теста"
                    rules={[{ required: true, message: 'Настройте варианты ответов' }]}
                  >
                    <TestQuestionCreator />
                  </Form.Item>
                );
              }

              return null;
            }}
          </Form.Item>

          <Form.Item name="explanation" label="Объяснение">
            <TextArea rows={2} placeholder="Объяснение правильного ответа (опционально)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CourseQuizPage;
