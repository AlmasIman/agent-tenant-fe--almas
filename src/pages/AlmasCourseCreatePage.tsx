import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Space, message, Tag, Typography, Row, Col, Divider, Tabs } from 'antd';
import { PlusOutlined, SaveOutlined, SendOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import CreateSpaceModal from '@app/components/common/CreateSpaceModal';
import RichEditor from '@app/components/common/RichEditor';
import { SlideBuilder, Slide, SlideType } from '@app/components/common/SlideBuilder';
import { httpApi } from '@app/api/http.api';
import { useAppSelector } from '@app/hooks/reduxHooks';

const { Text } = Typography;
const { TextArea } = Input;

/** KB types */
type SpaceType = { id: number; name: string };
type KBArticle = {
  id: number;
  name: string | null;
  description: string | null;
  content: string | null;
  publisher: string | null;
  // В GET может прийти строка с названием, в POST/PATCH ожидается id (число)
  space: number | string | null;
  tags: string[] | string | null;
  slides?: Slide[];
};

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
};

const AlmasCourseCreatePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [spaces, setSpaces] = useState<SpaceType[]>([]);
  const [createSpaceModalVisible, setCreateSpaceModalVisible] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const user = useAppSelector((state) => state.user.user);
  const fullName = `${user?.firstName} ${user?.lastName}`;
  const [publisherName, setPublisherName] = useState<string>(fullName?.trim() || '');

  /** 1) Загрузка пространств */
  const loadSpaces = useCallback(async () => {
    try {
      const { data } = await httpApi.get('/kb/spaces/', { params: { page_size: 100 } });
      const items = toArray(data) as SpaceType[];
      setSpaces(items);
    } catch (error) {
      console.error('Error loading spaces:', error);
      message.error('Ошибка при загрузке пространств');
    }
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  /** 2) Помощники для space/tags */
  const resolveSpaceId = (space: KBArticle['space']): number | undefined => {
    if (typeof space === 'number') return space;
    if (typeof space === 'string' && space.trim()) {
      const found = spaces.find((s) => s.name.trim() === space.trim());
      return found?.id;
    }
    return undefined;
  };

  const toTagsArray = (t: KBArticle['tags']): string[] => {
    if (Array.isArray(t)) return t.filter(Boolean).map(String);
    if (typeof t === 'string' && t.trim()) return [t.trim()];
    return [];
  };

  /** 3) Если режим редактирования — грузим статью */
  const loadArticle = useCallback(async () => {
    if (!isEdit || !id) return;
    try {
      setLoading(true);
      const { data } = await httpApi.get<KBArticle>(`/kb/articles/${id}/`);
      // заполняем форму
      const pub = (data.publisher || '').trim();
      setPublisherName(pub);
      setCourseId(data.id);
      setTags(toTagsArray(data.tags));
      // Загружаем слайды если они есть
      if (data.slides && Array.isArray(data.slides)) {
        setSlides(data.slides);
      }
      const spaceId = resolveSpaceId(data.space);
      form.setFieldsValue({
        title: data.name || '',
        description: data.description || '',
        content: data.content || '',
        publisher: pub || fullName || '',
        spaceId: spaceId,
      });
    } catch (err) {
      console.error('Error loading article:', err);
      message.error('Не удалось загрузить курс');
    } finally {
      setLoading(false);
    }
  }, [form, id, isEdit, spaces]);

  // подождём пока подгрузятся spaces, чтобы смочь сопоставить space name -> id
  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  useEffect(() => {
    if (!isEdit) {
      form.setFieldsValue({ publisher: (fullName || '').trim() });
      setPublisherName((fullName || '').trim());
    }
  }, [isEdit, fullName, form]);

  /** 4) Создание пространства из модалки */
  const handleCreateSpace = (newSpace: SpaceType) => {
    setSpaces((prev) => [...prev, newSpace]);
    form.setFieldsValue({ spaceId: newSpace.id });
    setCreateSpaceModalVisible(false);
  };

  /** 5) Теги */
  const handleAddTag = () => {
    const val = inputTag.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setInputTag('');
    }
  };
  const handleRemoveTag = (removed: string) => setTags(tags.filter((t) => t !== removed));

  /** 6) Маппинг формы -> контракт API */
  const buildPayload = (values: any) => ({
    name: values.title as string,
    description: values.description as string,
    content: (values.content as string) || '',
    slides: slides, // добавляем слайды
    publisher: fullName, // при необходимости возьми из профиля
    space: values.spaceId as number, // числовой id
    parent: null as number | null,
    tags,
  });

  /** 7) Create / Update */
  const createArticle = async (): Promise<KBArticle> => {
    const values = await form.validateFields();
    const payload = buildPayload(values);
    const { data } = await httpApi.post<KBArticle>('/kb/articles/create/', payload);
    return data;
  };

  const updateArticle = async (): Promise<KBArticle> => {
    if (!id) throw new Error('no id');
    const values = await form.validateFields();
    const payload = buildPayload(values);
    // частичное обновление — PATCH
    const { data } = await httpApi.patch<KBArticle>(`/kb/articles/${id}/`, payload);
    return data;
  };

  /** 8) Кнопки действий */
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const article = isEdit ? await updateArticle() : await createArticle();
      setCourseId(article.id);
      message.success(isEdit ? 'Изменения сохранены' : 'Черновик курса сохранён');
    } catch (error: any) {
      console.error('save error:', error);
      message.error(error?.response?.data?.detail || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const article = isEdit ? await updateArticle() : await createArticle();
      setCourseId(article.id);
      message.success(isEdit ? 'Курс обновлён' : 'Курс создан и опубликован');
     // navigate(`/course/${article.id}`);
    } catch (error: any) {
      console.error('publish error:', error);
     // message.error(error?.response?.data?.detail || 'Ошибка при публикации');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToQuiz = () => {
    const idToUse = courseId || (id ? Number(id) : null);
    if (idToUse) navigate(`/course/${idToUse}/quiz`);
  };

  const canGoToQuiz = !!(courseId || id) && !!form.getFieldValue('title') && !!form.getFieldValue('description');

  /** 9) UI */
  return (
    <>
      <PageTitle>{isEdit ? 'Редактирование курса' : 'Алмас Создание Курса'}</PageTitle>

      <Card loading={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Основная информация" key="basic">
            <Form form={form} layout="vertical" initialValues={{ spaceId: undefined, content: '' }}>
              <Row gutter={24}>
                <Col span={16}>
                  <Form.Item
                    name="title"
                    label="Название курса"
                    rules={[{ required: true, message: 'Введите название курса' }]}
                  >
                    <Input placeholder="Введите название курса" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Описание"
                    rules={[{ required: true, message: 'Введите описание курса' }]}
                  >
                    <TextArea rows={3} placeholder="Краткое описание курса" showCount maxLength={500} />
                  </Form.Item>

                  <Form.Item name="content" label="Контент курса">
                    <RichEditor
                      value={form.getFieldValue('content') || ''}
                      onChange={(html) => form.setFieldsValue({ content: html })}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Card size="small" title="Настройки курса" style={{ marginBottom: 16 }}>
                    <Form.Item
                      name="spaceId"
                      label="Пространство"
                      rules={[{ required: true, message: 'Выберите пространство' }]}
                    >
                      <Select
                        placeholder="Выберите пространство"
                        showSearch
                        optionFilterProp="children"
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={() => setCreateSpaceModalVisible(true)}
                              block
                            >
                              Создать новое пространство
                            </Button>
                          </>
                        )}
                      >
                        {spaces.map((space) => (
                          <Select.Option key={space.id} value={space.id}>
                            {space.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="Теги">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Input
                            value={inputTag}
                            onChange={(e) => setInputTag(e.target.value)}
                            placeholder="Добавить тег"
                            onPressEnter={handleAddTag}
                            style={{ width: 160 }}
                          />
                          <Button type="dashed" onClick={handleAddTag} icon={<PlusOutlined />}>
                            Добавить
                          </Button>
                        </Space>
                        <div>
                          {tags.map((tag) => (
                            <Tag key={tag} closable onClose={() => handleRemoveTag(tag)} style={{ marginBottom: 8 }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    </Form.Item>

                    <Form.Item label="Создатель" name="publisher">
                      <Input disabled />
                    </Form.Item>
                  </Card>

                  <Card size="small" title={isEdit ? 'Действия (редактирование)' : 'Действия'}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading} block>
                        {isEdit ? 'Сохранить изменения' : 'Сохранить черновик'}
                      </Button>

                      <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={loading} block>
                        {isEdit ? 'Обновить и открыть' : 'Опубликовать'}
                      </Button>

                      <Button type="default" icon={<BookOutlined />} onClick={handleGoToQuiz} disabled={!canGoToQuiz} block>
                        Перейти к викторине
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Слайды курса" key="slides">
            <SlideBuilder
              slides={slides}
              onSlidesChange={setSlides}
              readOnly={false}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <CreateSpaceModal
        visible={createSpaceModalVisible}
        onCancel={() => setCreateSpaceModalVisible(false)}
        onSuccess={(space) => handleCreateSpace(space as any)}
      />
    </>
  );
};

export default AlmasCourseCreatePage;
