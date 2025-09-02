import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Tabs, Switch, Slider, Row, Col, message, Card } from 'antd';
import { SaveOutlined, CloseOutlined, PlusOutlined, MinusCircleOutlined, EditOutlined } from '@ant-design/icons';
import RichEditor from '@app/components/common/RichEditor';
import FillWordsPreview from './FillWordsPreview';
import FlashcardsPreview from './FlashcardsPreview';
import QuizPreview from './QuizPreview';
import ImageTextEditor from '@app/components/common/ImageTextEditor/ImageTextEditor';
import ImageDragDropEditor from './ImageDragDropEditor';
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
  const [previewText, setPreviewText] = useState('');
  const [previewHints, setPreviewHints] = useState('');
  const [imageEditorVisible, setImageEditorVisible] = useState(false);
  const [imageEditorData, setImageEditorData] = useState<{ imageData: string; textElements: any[] } | null>(null);
  const [imageDragDropEditorVisible, setImageDragDropEditorVisible] = useState(false);
  const [imageDragDropData, setImageDragDropData] = useState<{
    imageUrl: string;
    dropZones: any[];
    draggableItems: any[];
  } | null>(null);

  useEffect(() => {
    let content = slide.content;
    let fillWordsText = '';
    let fillWordsHints = '';

    // Обработка загрузки данных для простых типов слайдов
    if (slide.type === SlideType.TEXT && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        content = parsed.text || slide.content;
      } catch (error) {
        // Если не JSON, используем как есть
        content = slide.content;
      }
    }

    if (slide.type === SlideType.IMAGE && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        if (parsed.imageData && parsed.textElements) {
          // Если есть данные из ImageTextEditor
          content = parsed.imageUrl || '';
          setImageEditorData({
            imageData: parsed.imageData,
            textElements: parsed.textElements,
          });
        } else {
          // Простое изображение
          content = parsed.url || slide.content;
        }
      } catch (error) {
        // Если не JSON, используем как есть
        content = slide.content;
      }
    }

    if (slide.type === SlideType.IMAGE_TEXT_OVERLAY && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        content = parsed.url || slide.content;
        // Устанавливаем текст для наложения
        form.setFieldsValue({
          overlayText: parsed.text || '',
        });
        // Если есть расширенные текстовые элементы
        if (parsed.textElements) {
          setImageEditorData({
            imageData: parsed.url || '',
            textElements: parsed.textElements,
          });
        }
      } catch (error) {
        // Если не JSON, используем как есть
        content = slide.content;
      }
    }

    if (slide.type === SlideType.VIDEO && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        content = parsed.url || slide.content;
      } catch (error) {
        // Если не JSON, используем как есть
        content = slide.content;
      }
    }

    if (slide.type === SlideType.CODE && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        content = parsed.code || slide.content;
        // Устанавливаем язык программирования
        form.setFieldsValue({
          codeLanguage: parsed.language || 'javascript',
        });
      } catch (error) {
        // Если не JSON, используем как есть
        content = slide.content;
      }
    }

    if (slide.type === SlideType.EMBED && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        content = parsed.url || slide.content;
      } catch (error) {
        // Если не JSON, используем как есть
        content = slide.content;
      }
    }

    // Обработка загрузки данных для специальных типов
    if (slide.type === SlideType.FILL_WORDS && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        if (parsed.fillWords) {
          content = parsed.fillWords.text || '';
          fillWordsText = parsed.fillWords.text || '';

          // Преобразуем подсказки обратно в текстовый формат
          fillWordsHints = (parsed.fillWords.blanks || [])
            .map((blank: any) => `${blank.word}: ${blank.hint || ''}`)
            .join('\n');
        }
      } catch (error) {
        console.error('Error parsing fill words content:', error);
      }
    }

    if (slide.type === SlideType.FLASHCARDS && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        if (parsed.flashcards) {
          content = '';

          // Преобразуем карточки обратно в текстовый формат
          const cardsText = (parsed.flashcards.cards || [])
            .map((card: any) => `${card.front} | ${card.back} | ${card.category} | ${card.difficulty}`)
            .join('\n');

          content = cardsText;
          setPreviewText(cardsText);
        }
      } catch (error) {
        console.error('Error parsing flashcards content:', error);
      }
    }

    if (slide.type === SlideType.QUIZ && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        if (parsed.quiz) {
          content = '';

          // Преобразуем вопросы в формат для формы
          const quizQuestions = (parsed.quiz.questions || []).map((question: any) => ({
            question: question.question || '',
            options: question.options.map((option: string, index: number) => ({
              text: option,
              correct: index === question.correctAnswer,
            })),
            explanation: question.explanation || '',
          }));

          // Устанавливаем данные для формы
          form.setFieldsValue({
            quizQuestions: quizQuestions,
            quizShuffle: parsed.quiz.shuffle || false,
            quizShowExplanation: parsed.quiz.showExplanation || false,
          });
        }
      } catch (error) {
        console.error('Error parsing quiz content:', error);
      }
    }

    if (slide.type === SlideType.IMAGE && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        if (parsed.imageData && parsed.textElements) {
          // Если есть данные из ImageTextEditor
          content = parsed.imageUrl || '';
          setImageEditorData({
            imageData: parsed.imageData,
            textElements: parsed.textElements,
          });
        } else {
          // Простое изображение
          content = slide.content;
        }
      } catch (error) {
        // Если не JSON, значит просто URL
        content = slide.content;
      }
    }

    if (slide.type === SlideType.IMAGE_DRAG_DROP && slide.content) {
      try {
        const parsed = JSON.parse(slide.content);
        if (parsed.imageDragDrop) {
          content = parsed.imageDragDrop.imageUrl || '';
          setImageDragDropData({
            imageUrl: parsed.imageDragDrop.imageUrl,
            dropZones: parsed.imageDragDrop.dropZones || [],
            draggableItems: parsed.imageDragDrop.draggableItems || [],
          });
        } else {
          content = parsed.imageUrl || slide.content;
        }
      } catch (error) {
        content = slide.content;
      }
    }

    form.setFieldsValue({
      title: slide.title,
      type: slide.type,
      content: content,
      fillWordsText: fillWordsText,
      fillWordsHints: fillWordsHints,
      fillWordsShowHints: slide.content
        ? (() => {
            try {
              return JSON.parse(slide.content)?.fillWords?.showHints || false;
            } catch {
              return false;
            }
          })()
        : false,
      fillWordsCaseSensitive: slide.content
        ? (() => {
            try {
              return JSON.parse(slide.content)?.fillWords?.caseSensitive || false;
            } catch {
              return false;
            }
          })()
        : false,
      ...slide.settings,
    });

    // Обновляем предварительный просмотр
    setPreviewText(fillWordsText);
    setPreviewHints(fillWordsHints);
  }, [slide, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Обработка специальных типов слайдов
      let processedContent = values.content;

      if (values.type === SlideType.TEXT) {
        // Для текстовых слайдов сохраняем как JSON с полем text
        processedContent = JSON.stringify({ text: values.content || '' });
      }

      if (values.type === SlideType.IMAGE) {
        // Для изображений сохраняем как JSON с полем url
        if (imageEditorData) {
          processedContent = JSON.stringify({
            imageUrl: values.content, // URL изображения
            imageData: imageEditorData.imageData, // Данные изображения с текстом
            textElements: imageEditorData.textElements, // Текстовые элементы
          });
        } else {
          // Простое изображение без текста
          processedContent = JSON.stringify({ url: values.content || '' });
        }
      }

      if (values.type === SlideType.IMAGE_TEXT_OVERLAY) {
        // Для изображений с текстом сохраняем как JSON с полями url и text
        if (imageEditorData) {
          processedContent = JSON.stringify({
            url: values.content, // URL изображения
            text: values.overlayText || '', // Простой текст для наложения
            textElements: imageEditorData.textElements, // Расширенные текстовые элементы
          });
        } else {
          // Простое изображение с текстом
          processedContent = JSON.stringify({
            url: values.content || '',
            text: values.overlayText || '',
          });
        }
      }

      if (values.type === SlideType.VIDEO) {
        // Для видео сохраняем как JSON с полем url
        processedContent = JSON.stringify({ url: values.content || '' });
      }

      if (values.type === SlideType.CODE) {
        // Для кода сохраняем как JSON с полями language и code
        processedContent = JSON.stringify({
          language: values.codeLanguage || 'javascript',
          code: values.content || '',
        });
      }

      if (values.type === SlideType.EMBED) {
        // Для встраиваемого контента сохраняем как JSON с полем url
        processedContent = JSON.stringify({ url: values.content || '' });
      }

      if (values.type === SlideType.FILL_WORDS) {
        const text = values.fillWordsText || '';
        const hintsText = values.fillWordsHints || '';
        const showHints = values.fillWordsShowHints || false;
        const caseSensitive = values.fillWordsCaseSensitive || false;

        // Парсим подсказки из текста
        const hints = hintsText
          .split('\n')
          .filter((line: string) => line.trim())
          .map((line: string, index: number) => {
            const [word, hint] = line.split(':').map((s: string) => s.trim());
            return {
              id: (index + 1).toString(),
              word: word || '',
              hint: hint || '',
              position: text.indexOf('___'),
            };
          })
          .filter((hint: { word: any }) => hint.word);

        // Находим все пропуски в тексте
        const blanks = [];
        let position = 0;
        let blankIndex = 0;

        while (true) {
          const blankPos = text.indexOf('___', position);
          if (blankPos === -1) break;

          const hint = hints[blankIndex] || { word: '', hint: '' };
          blanks.push({
            id: (blankIndex + 1).toString(),
            word: hint.word,
            hint: hint.hint,
            position: blankPos,
          });

          position = blankPos + 3;
          blankIndex++;
        }

        processedContent = JSON.stringify({
          fillWords: {
            text: text,
            blanks: blanks,
            showHints: showHints,
            caseSensitive: caseSensitive,
          },
        });
      }

      if (values.type === SlideType.FLASHCARDS) {
        const content = values.flashcardsContent || '';
        const shuffle = values.flashcardsShuffle || false;
        const showProgress = values.flashcardsShowProgress || false;

        // Парсим карточки из текста
        const cards = content
          .split('\n')
          .filter((line: string) => line.trim() && line.includes('|'))
          .map((line: string, index: number) => {
            const parts = line.split('|').map((part: string) => part.trim());
            return {
              id: (index + 1).toString(),
              front: parts[0] || '',
              back: parts[1] || '',
              category: parts[2] || 'Общее',
              difficulty: parts[3] || 'Легко',
            };
          });

        processedContent = JSON.stringify({
          flashcards: {
            cards: cards,
            shuffle: shuffle,
            showProgress: showProgress,
          },
        });
      }

      if (values.type === SlideType.QUIZ) {
        const questions = values.quizQuestions || [];
        const shuffle = values.quizShuffle || false;
        const showExplanation = values.quizShowExplanation || false;

        // Преобразуем данные формы в нужный формат
        const processedQuestions = questions.map((question: any, index: number) => {
          // Handle multiple correct answers
          const correctIndices = question.options
            .map((option: any, optionIndex: number) => (option.correct ? optionIndex : -1))
            .filter((index: number) => index !== -1);

          return {
            id: (index + 1).toString(),
            question: question.question || '',
            options: question.options.map((option: any) => option.text || ''),
            correctAnswer: correctIndices.length > 0 ? correctIndices[0] : 0, // For backward compatibility
            correct_indices: correctIndices, // For new format
            explanation: question.explanation || '',
          };
        });

        processedContent = JSON.stringify({
          quiz: {
            questions: processedQuestions,
            shuffle: shuffle,
            showExplanation: showExplanation,
          },
        });
      }

      if (values.type === SlideType.IMAGE_DRAG_DROP) {
        // Если есть данные из ImageDragDropEditor, используем их
        if (imageDragDropData) {
          processedContent = JSON.stringify({
            imageDragDrop: {
              imageUrl: values.content, // URL изображения
              dropZones: imageDragDropData.dropZones,
              draggableItems: imageDragDropData.draggableItems,
            },
          });
        } else {
          // Простое изображение без drag and drop
          processedContent = JSON.stringify({ imageUrl: values.content || '' });
        }
      }

      const updatedSlide: Slide = {
        ...currentSlide,
        title: values.title,
        type: values.type,
        content: processedContent,
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
          createdAt: currentSlide.metadata?.createdAt || new Date().toISOString(),
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
          <>
            <Form.Item name="content" label="URL изображения">
              <Input placeholder="Введите URL изображения" />
            </Form.Item>

            <Form.Item label="Редактор изображений с текстом">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setImageEditorVisible(true)}
                  style={{ width: '100%' }}
                >
                  Открыть редактор изображений
                </Button>

                {imageEditorData && (
                  <Card size="small" style={{ marginTop: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={imageEditorData.imageData}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '1px solid #d9d9d9',
                        }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        Изображение с {imageEditorData.textElements.length} текстовыми элементами
                      </div>
                    </div>
                  </Card>
                )}
              </Space>
            </Form.Item>
          </>
        );

      case SlideType.IMAGE_TEXT_OVERLAY:
        return (
          <>
            <div
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🖼️</span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Изображение с текстом</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                Создайте изображение с наложенным текстом для презентаций
              </span>
            </div>

            <Form.Item name="content" label="URL изображения">
              <Input placeholder="Введите URL изображения" />
            </Form.Item>

            <Form.Item name="overlayText" label="Текст для наложения">
              <TextArea rows={3} placeholder="Введите текст, который будет отображаться поверх изображения" />
            </Form.Item>

            <Form.Item label="Редактор изображений с текстом">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setImageEditorVisible(true)}
                  style={{ width: '100%' }}
                >
                  Открыть расширенный редактор изображений
                </Button>

                {imageEditorData && (
                  <Card size="small" style={{ marginTop: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={imageEditorData.imageData}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '1px solid #d9d9d9',
                        }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        Изображение с {imageEditorData.textElements.length} текстовыми элементами
                      </div>
                    </div>
                  </Card>
                )}
              </Space>
            </Form.Item>
          </>
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
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>❓</span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Викторина</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                Создайте интерактивную викторину с вопросами и вариантами ответов
              </span>
            </div>

            <Form.List name="quizQuestions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{
                        marginBottom: '16px',
                        borderRadius: '12px',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      }}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>❓</span>
                          <span style={{ fontWeight: '600' }}>Вопрос {name + 1}</span>
                        </div>
                      }
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          size="small"
                        />
                      }
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'question']}
                        label="Вопрос"
                        rules={[{ required: true, message: 'Введите вопрос' }]}
                      >
                        <Input
                          placeholder="Введите текст вопроса"
                          style={{
                            borderRadius: '8px',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s ease',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#1890ff';
                            e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#f0f0f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </Form.Item>

                      <Form.List name={[name, 'options']}>
                        {(optionFields, { add: addOption, remove: removeOption }) => (
                          <>
                            <div style={{ marginBottom: '12px' }}>
                              <span style={{ fontWeight: '500', color: '#262626' }}>Варианты ответов:</span>
                            </div>
                            {optionFields.map(({ key: optionKey, name: optionName, ...optionRestField }) => (
                              <div
                                key={optionKey}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '8px',
                                  padding: '8px',
                                  background: '#fafafa',
                                  borderRadius: '8px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                  }}
                                >
                                  {String.fromCharCode(65 + optionName)}
                                </div>
                                <Form.Item
                                  {...optionRestField}
                                  name={[optionName, 'text']}
                                  rules={[{ required: true, message: 'Введите вариант ответа' }]}
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder={`Вариант ${String.fromCharCode(65 + optionName)}`}
                                    style={{
                                      borderRadius: '8px',
                                      border: '2px solid #f0f0f0',
                                      transition: 'all 0.3s ease',
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = '#1890ff';
                                      e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = '#f0f0f0';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...optionRestField}
                                  name={[optionName, 'correct']}
                                  valuePropName="checked"
                                  style={{ marginBottom: 0 }}
                                >
                                  <Switch
                                    checkedChildren="✓"
                                    unCheckedChildren="✗"
                                    style={{ backgroundColor: '#52c41a' }}
                                  />
                                </Form.Item>
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeOption(optionName)}
                                  size="small"
                                  disabled={optionFields.length <= 2}
                                />
                              </div>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => addOption()}
                              block
                              icon={<PlusOutlined />}
                              style={{
                                borderRadius: '8px',
                                border: '2px dashed #d9d9d9',
                                marginTop: '8px',
                              }}
                              disabled={optionFields.length >= 6}
                            >
                              Добавить вариант ответа
                            </Button>
                          </>
                        )}
                      </Form.List>

                      <Form.Item {...restField} name={[name, 'explanation']} label="Объяснение (необязательно)">
                        <TextArea
                          rows={2}
                          placeholder="Объяснение правильного ответа"
                          style={{
                            borderRadius: '8px',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s ease',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#1890ff';
                            e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#f0f0f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{
                      borderRadius: '12px',
                      border: '2px dashed #d9d9d9',
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: '500',
                    }}
                  >
                    Добавить вопрос
                  </Button>
                </>
              )}
            </Form.List>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <Form.Item name="quizShuffle" label="Перемешивать вопросы" valuePropName="checked" style={{ flex: 1 }}>
                <Switch checkedChildren="Да" unCheckedChildren="Нет" style={{ backgroundColor: '#52c41a' }} />
              </Form.Item>

              <Form.Item
                name="quizShowExplanation"
                label="Показывать объяснения"
                valuePropName="checked"
                style={{ flex: 1 }}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" style={{ backgroundColor: '#1890ff' }} />
              </Form.Item>
            </div>

            {/* Предварительный просмотр не нужен для интерактивной формы */}
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
                <Option value="memory">Игра &quot;Память&quot;</Option>
                <Option value="puzzle">Пазл &quot;15&quot;</Option>
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

      case SlideType.FLASHCARDS:
        return (
          <>
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>📚</span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Флеш-карточки</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                Создайте интерактивные карточки для изучения материала
              </span>
            </div>

            <Form.Item
              name="flashcardsContent"
              label={
                <span style={{ fontWeight: '600', color: '#262626' }}>📝 Карточки (каждая строка = одна карточка)</span>
              }
            >
              <TextArea
                rows={8}
                placeholder="Вопрос | Ответ | Категория | Сложность

Примеры:
Что такое React? | JavaScript библиотека для UI | Программирование | Легко
Столица России | Москва | География | Легко
2 + 2 = ? | 4 | Математика | Легко"
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1890ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#f0f0f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Item>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <Form.Item
                name="flashcardsShuffle"
                label="Перемешивать карточки"
                valuePropName="checked"
                style={{ flex: 1 }}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" style={{ backgroundColor: '#52c41a' }} />
              </Form.Item>

              <Form.Item
                name="flashcardsShowProgress"
                label="Показывать прогресс"
                valuePropName="checked"
                style={{ flex: 1 }}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" style={{ backgroundColor: '#1890ff' }} />
              </Form.Item>
            </div>

            {/* Предварительный просмотр флеш-карточек */}
            <FlashcardsPreview content={previewText} />
          </>
        );

      case SlideType.FILL_WORDS:
        return (
          <>
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>📝</span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Заполнение пропусков</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                Создайте интерактивное упражнение для проверки знаний
              </span>
            </div>

            <Form.Item
              name="fillWordsText"
              label={<span style={{ fontWeight: '600', color: '#262626' }}>📄 Исходный текст</span>}
            >
              <TextArea
                rows={6}
                placeholder="Введите текст с пропусками. Используйте ___ для обозначения пропусков."
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1890ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#f0f0f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Item>

            <Form.Item
              name="fillWordsHints"
              label={
                <span style={{ fontWeight: '600', color: '#262626' }}>💡 Подсказки (каждая строка = одно слово)</span>
              }
            >
              <TextArea
                rows={4}
                placeholder="правильное_слово: Подсказка для этого слова
второе_слово: Подсказка для второго слова
третье_слово: Подсказка для третьего слова"
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1890ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#f0f0f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Item>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <Form.Item
                name="fillWordsShowHints"
                label="Показывать подсказки"
                valuePropName="checked"
                style={{ flex: 1 }}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" style={{ backgroundColor: '#52c41a' }} />
              </Form.Item>

              <Form.Item
                name="fillWordsCaseSensitive"
                label="Учитывать регистр"
                valuePropName="checked"
                style={{ flex: 1 }}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" style={{ backgroundColor: '#1890ff' }} />
              </Form.Item>
            </div>

            {/* Предварительный просмотр */}
            <FillWordsPreview text={previewText} hints={previewHints} />
          </>
        );

      case SlideType.IMAGE_DRAG_DROP:
        return (
          <>
            <Form.Item name="content" label="URL изображения">
              <Input placeholder="Введите URL изображения для drag and drop" />
            </Form.Item>

            <Form.Item label="Редактор Drag and Drop">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setImageDragDropEditorVisible(true)}
                  style={{ width: '100%' }}
                >
                  Открыть редактор Drag and Drop
                </Button>

                {imageDragDropData && (
                  <Card size="small" style={{ marginTop: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={imageDragDropData.imageUrl}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '1px solid #d9d9d9',
                        }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        {imageDragDropData.dropZones.length} зон, {imageDragDropData.draggableItems.length} элементов
                      </div>
                    </div>
                  </Card>
                )}
              </Space>
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
    <>
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

              <Form.Item name="type" label="Тип слайда" rules={[{ required: true, message: 'Выберите тип слайда' }]}>
                <Select onChange={(value) => setCurrentSlide({ ...currentSlide, type: value })}>
                  <Option value={SlideType.TEXT}>Текст</Option>
                  <Option value={SlideType.IMAGE}>Изображение</Option>
                  <Option value={SlideType.VIDEO}>Видео</Option>
                  <Option value={SlideType.IMAGE_TEXT_OVERLAY}>Изображение с текстом</Option>
                  {/* <Option value={SlideType.CODE}>Код</Option> */}
                  {/* <Option value={SlideType.CHART}>График</Option> */}
                  <Option value={SlideType.QUIZ}>Викторина</Option>
                  {/* <Option value={SlideType.EMBED}>Встраивание</Option> */}
                  {/* <Option value={SlideType.GAME}>Игра</Option> */}
                  {/* <Option value={SlideType.INTERACTIVE}>Интерактивный</Option> */}
                  {/* <Option value={SlideType.ACHIEVEMENT}>Достижение</Option> */}
                  {/* <Option value={SlideType.PROGRESS}>Прогресс</Option> */}
                  <Option value={SlideType.FLASHCARDS}>Флеш-карточки</Option>
                  {/* <Option value={SlideType.FILL_WORDS}>Заполнить пропуски</Option> */}
                  {/* <Option value={SlideType.IMAGE_DRAG_DROP}>Drag & Drop на изображении</Option> */}
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

      {/* Модальное окно ImageTextEditor */}
      <Modal
        title="Редактор изображений с текстом"
        open={imageEditorVisible}
        onCancel={() => setImageEditorVisible(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <ImageTextEditor
          onSave={(imageData, textElements) => {
            setImageEditorData({ imageData, textElements });
            setImageEditorVisible(false);
            message.success('Изображение с текстом сохранено!');
          }}
          initialImageUrl={form.getFieldValue('content')}
          initialTextElements={imageEditorData?.textElements || []}
        />
      </Modal>

      {/* Модальное окно ImageDragDropEditor */}
      <Modal
        title="Редактор Drag and Drop на изображении"
        open={imageDragDropEditorVisible}
        onCancel={() => setImageDragDropEditorVisible(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <ImageDragDropEditor
          imageUrl={form.getFieldValue('content') || ''}
          dropZones={imageDragDropData?.dropZones || []}
          draggableItems={imageDragDropData?.draggableItems || []}
          onSave={(dropZones, draggableItems) => {
            setImageDragDropData({
              imageUrl: form.getFieldValue('content'),
              dropZones,
              draggableItems,
            });
            setImageDragDropEditorVisible(false);
            message.success('Конфигурация Drag and Drop сохранена!');
          }}
          onCancel={() => setImageDragDropEditorVisible(false)}
        />
      </Modal>
    </>
  );
};

export default SlideEditor;
