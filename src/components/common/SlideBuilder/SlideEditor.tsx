import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Tabs, Switch, Slider, Row, Col, Upload, message } from 'antd';
import { SaveOutlined, CloseOutlined, UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import RichEditor from '@app/components/common/RichEditor';
import { Slide, SlideType, SlideSettings } from './types';

const { TextArea } = Input;
const { Option } = Select;

interface SlideEditorProps {
  slide: Slide;
  onSave: (slide: Slide) => void;
  onCancel: () => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [currentSlide, setCurrentSlide] = useState<Slide>(slide);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    form.setFieldsValue({
      title: slide.title,
      type: slide.type,
      content: slide.content,
      ...slide.settings,
    });
  }, [slide, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedSlide: Slide = {
        ...currentSlide,
        title: values.title,
        type: values.type,
        content: values.content,
        settings: {
          backgroundColor: values.backgroundColor,
          textColor: values.textColor,
          fontSize: values.fontSize,
          alignment: values.alignment,
          padding: values.padding,
          showTitle: values.showTitle,
          showNumber: values.showNumber,
          autoPlay: values.autoPlay,
          loop: values.loop,
          muted: values.muted,
          controls: values.controls,
          width: values.width,
          height: values.height,
          borderRadius: values.borderRadius,
          shadow: values.shadow,
          border: values.border,
          borderColor: values.borderColor,
          borderWidth: values.borderWidth,
        },
        metadata: {
          ...currentSlide.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      onSave(updatedSlide);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderContentEditor = () => {
    switch (currentSlide.type) {
      case SlideType.TEXT:
        return (
          <Form.Item name="content" label="Текст слайда">
            <RichEditor
              value={form.getFieldValue('content') || ''}
              onChange={(html) => form.setFieldsValue({ content: html })}
            />
          </Form.Item>
        );

      case SlideType.IMAGE:
        return (
          <Form.Item name="content" label="URL изображения">
            <Input placeholder="Введите URL изображения" />
          </Form.Item>
        );

      case SlideType.VIDEO:
        return (
          <Form.Item name="content" label="URL видео">
            <Input placeholder="Введите URL видео (YouTube, Vimeo и т.д.)" />
          </Form.Item>
        );

      case SlideType.CODE:
        return (
          <>
            <Form.Item name="codeLanguage" label="Язык программирования">
              <Select placeholder="Выберите язык">
                <Option value="javascript">JavaScript</Option>
                <Option value="typescript">TypeScript</Option>
                <Option value="python">Python</Option>
                <Option value="java">Java</Option>
                <Option value="cpp">C++</Option>
                <Option value="csharp">C#</Option>
                <Option value="php">PHP</Option>
                <Option value="ruby">Ruby</Option>
                <Option value="go">Go</Option>
                <Option value="rust">Rust</Option>
                <Option value="html">HTML</Option>
                <Option value="css">CSS</Option>
                <Option value="sql">SQL</Option>
                <Option value="json">JSON</Option>
                <Option value="xml">XML</Option>
                <Option value="yaml">YAML</Option>
                <Option value="markdown">Markdown</Option>
              </Select>
            </Form.Item>
            <Form.Item name="content" label="Код">
              <TextArea rows={10} placeholder="Введите код" />
            </Form.Item>
          </>
        );

      case SlideType.QUIZ:
        return (
          <>
            <Form.Item name="question" label="Вопрос">
              <Input placeholder="Введите вопрос" />
            </Form.Item>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'text']}
                        rules={[{ required: true, message: 'Введите вариант ответа' }]}
                      >
                        <Input placeholder="Вариант ответа" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'correct']}
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Правильный" unCheckedChildren="Неправильный" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Добавить вариант ответа
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item name="explanation" label="Объяснение">
              <TextArea rows={3} placeholder="Объяснение правильного ответа" />
            </Form.Item>
          </>
        );

      case SlideType.CHART:
        return (
          <>
            <Form.Item name="chartType" label="Тип графика">
              <Select placeholder="Выберите тип графика">
                <Option value="bar">Столбчатый</Option>
                <Option value="line">Линейный</Option>
                <Option value="pie">Круговой</Option>
                <Option value="scatter">Точечный</Option>
              </Select>
            </Form.Item>
            <Form.Item name="content" label="Данные графика (JSON)">
              <TextArea rows={8} placeholder="Введите данные в формате JSON" />
            </Form.Item>
          </>
        );

      case SlideType.EMBED:
        return (
          <Form.Item name="content" label="URL для встраивания">
            <Input placeholder="Введите URL для встраивания" />
          </Form.Item>
        );

      case SlideType.GAME:
        return (
          <>
            <Form.Item name="gameType" label="Тип игры">
              <Select placeholder="Выберите тип игры">
                <Option value="memory">Игра "Память"</Option>
                <Option value="puzzle">Пазл "15"</Option>
                <Option value="dragdrop">Перетаскивание</Option>
                <Option value="matching">Сопоставление</Option>
              </Select>
            </Form.Item>
            <Form.Item name="gameRewards" label="Очки за победу">
              <Input type="number" placeholder="100" />
            </Form.Item>
            <Form.Item name="gameTime" label="Время игры (секунды)">
              <Input type="number" placeholder="60" />
            </Form.Item>
          </>
        );

      case SlideType.INTERACTIVE:
        return (
          <>
            <Form.Item name="interactiveType" label="Тип интерактивности">
              <Select placeholder="Выберите тип">
                <Option value="hotspot">Горячие точки</Option>
                <Option value="timeline">Временная шкала</Option>
                <Option value="simulation">Симуляция</Option>
              </Select>
            </Form.Item>
            <Form.Item name="interactiveConfig" label="Конфигурация (JSON)">
              <TextArea rows={6} placeholder="Введите конфигурацию в формате JSON" />
            </Form.Item>
          </>
        );

      case SlideType.ACHIEVEMENT:
        return (
          <>
            <Form.Item name="achievementTitle" label="Название достижения">
              <Input placeholder="Введите название достижения" />
            </Form.Item>
            <Form.Item name="achievementDescription" label="Описание">
              <TextArea rows={3} placeholder="Описание достижения" />
            </Form.Item>
            <Form.Item name="achievementIcon" label="Иконка">
              <Input placeholder="Эмодзи или URL иконки" />
            </Form.Item>
            <Form.Item name="achievementPoints" label="Очки">
              <Input type="number" placeholder="100" />
            </Form.Item>
          </>
        );

      case SlideType.PROGRESS:
        return (
          <>
            <Form.Item name="progressCurrent" label="Текущий прогресс">
              <Input type="number" placeholder="0" />
            </Form.Item>
            <Form.Item name="progressTotal" label="Общий прогресс">
              <Input type="number" placeholder="100" />
            </Form.Item>
            <Form.Item name="progressMilestones" label="Вехи (через запятую)">
              <Input placeholder="25%, 50%, 75%, 100%" />
            </Form.Item>
          </>
        );

      default:
        return (
          <Form.Item name="content" label="Контент">
            <TextArea rows={6} placeholder="Введите контент слайда" />
          </Form.Item>
        );
    }
  };

  const renderSettingsEditor = () => (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name="backgroundColor" label="Цвет фона">
          <Input type="color" style={{ width: '100%', height: '40px' }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="textColor" label="Цвет текста">
          <Input type="color" style={{ width: '100%', height: '40px' }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="fontSize" label="Размер шрифта">
          <Slider min={12} max={48} defaultValue={16} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="alignment" label="Выравнивание">
          <Select>
            <Option value="left">По левому краю</Option>
            <Option value="center">По центру</Option>
            <Option value="right">По правому краю</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="padding" label="Отступы">
          <Slider min={0} max={50} defaultValue={16} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="borderRadius" label="Скругление углов">
          <Slider min={0} max={20} defaultValue={0} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="showTitle" label="Показывать заголовок" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="showNumber" label="Показывать номер" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="shadow" label="Тень" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="border" label="Рамка" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Col>
      {(currentSlide.type === SlideType.VIDEO || currentSlide.type === SlideType.EMBED) && (
        <>
          <Col span={12}>
            <Form.Item name="autoPlay" label="Автовоспроизведение" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="loop" label="Зацикливание" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="muted" label="Без звука" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="controls" label="Элементы управления" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );

  return (
    <Modal
      title={`Редактирование слайда: ${slide.title}`}
      open={true}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
          Отмена
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} icon={<SaveOutlined />}>
          Сохранить
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Основное" key="content">
            <Form.Item
              name="title"
              label="Заголовок слайда"
              rules={[{ required: true, message: 'Введите заголовок слайда' }]}
            >
              <Input placeholder="Введите заголовок слайда" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Тип слайда"
              rules={[{ required: true, message: 'Выберите тип слайда' }]}
            >
              <Select onChange={(value) => setCurrentSlide({ ...currentSlide, type: value })}>
                <Option value={SlideType.TEXT}>Текст</Option>
                <Option value={SlideType.IMAGE}>Изображение</Option>
                <Option value={SlideType.VIDEO}>Видео</Option>
                <Option value={SlideType.CODE}>Код</Option>
                <Option value={SlideType.CHART}>График</Option>
                <Option value={SlideType.QUIZ}>Викторина</Option>
                <Option value={SlideType.EMBED}>Встраивание</Option>
                <Option value={SlideType.GAME}>Игра</Option>
                <Option value={SlideType.INTERACTIVE}>Интерактивный</Option>
                <Option value={SlideType.ACHIEVEMENT}>Достижение</Option>
                <Option value={SlideType.PROGRESS}>Прогресс</Option>
              </Select>
            </Form.Item>

            {renderContentEditor()}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Настройки" key="settings">
            {renderSettingsEditor()}
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default SlideEditor;
