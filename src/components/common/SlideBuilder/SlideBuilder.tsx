import React, { useState, useCallback } from 'react';
import { Card, Button, Space, Typography, Row, Col, Empty, message, Select } from 'antd';
import { PlusOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SlideItem from './SlideItem';
import SlideEditor from './SlideEditor';
import SlidePreview from './SlidePreview';
import SlidePresentation from './SlidePresentation';
import { Slide, SlideType } from './types';

const { Title, Text } = Typography;

interface SlideBuilderProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  readOnly?: boolean;
  onPersistSlide?: (slide: Slide) => Promise<void> | void;
  onDeleteSlide?: (slideId: string) => Promise<void> | void;
}

const SlideBuilder: React.FC<SlideBuilderProps> = ({
  slides,
  onSlidesChange,
  readOnly = false,
  onPersistSlide,
  onDeleteSlide,
}) => {
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isAllSlidesPreviewVisible, setIsAllSlidesPreviewVisible] = useState(false);
  const [selectedSlideType, setSelectedSlideType] = useState<SlideType>(SlideType.TEXT);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getDefaultContentForType = (type: SlideType): string => {
    switch (type) {
      case SlideType.TEXT:
        return 'Введите текст слайда здесь...';
      case SlideType.IMAGE:
        return '';
      case SlideType.IMAGE_TEXT_OVERLAY:
        return '';
      case SlideType.VIDEO:
        return 'https://www.youtube.com/watch?v=';
      case SlideType.QUIZ:
        return '';
      case SlideType.FLASHCARDS:
        return '';
      case SlideType.FILL_WORDS:
        return '';
      case SlideType.IMAGE_DRAG_DROP:
        return '';
      case SlideType.CODE:
        return '// Введите ваш код здесь\nconsole.log("Hello, World!");';
      case SlideType.CHART:
        return '';
      case SlideType.EMBED:
        return 'https://example.com';
      case SlideType.GAME:
        return '';
      case SlideType.INTERACTIVE:
        return '';
      case SlideType.ACHIEVEMENT:
        return '';
      case SlideType.PROGRESS:
        return '';
      default:
        return 'Введите текст слайда здесь...';
    }
  };

  const handleAddSlide = useCallback(() => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: selectedSlideType,
      title: 'Новый слайд',
      content: getDefaultContentForType(selectedSlideType),
      order: slides.length,
      settings: {},
    };
    onSlidesChange([...slides, newSlide]);
  }, [slides, onSlidesChange, selectedSlideType]);

  const handleEditSlide = useCallback((slide: Slide) => {
    setEditingSlide(slide);
  }, []);

  const handlePreviewSlide = useCallback((slide: Slide) => {
    setPreviewSlide(slide);
    setIsPreviewVisible(true);
  }, []);

  const handleDeleteSlide = useCallback(
    async (slideId: string) => {
      try {
        await onDeleteSlide?.(slideId);
      } catch {}
    },
    [onDeleteSlide],
  );

  const handleSaveSlide = useCallback(
    async (updatedSlide: Slide) => {
      const updatedSlides = slides.map((slide) => (slide.id === updatedSlide.id ? updatedSlide : slide));
      onSlidesChange(updatedSlides);
      setEditingSlide(null);
      message.success('Слайд сохранён');
      try {
        await onPersistSlide?.(updatedSlide);
      } catch {
        // message already shown by parent; no-op here
      }
    },
    [slides, onSlidesChange, onPersistSlide],
  );

  const handleDragEnd = useCallback(
    async (event: any) => {
      const { active, over } = event;

      if (!over) return;
      if (active.id !== over.id) {
        const oldIndex = slides.findIndex((slide) => slide.id === active.id);
        const newIndex = slides.findIndex((slide) => slide.id === over.id);

        const reorderedSlides = arrayMove(slides, oldIndex, newIndex).map((slide, index) => ({
          ...slide,
          order: index,
        }));

        onSlidesChange(reorderedSlides);
        try {
          await Promise.allSettled(reorderedSlides.map((s) => onPersistSlide?.(s)));
        } catch {
          /* parent handles errors */
        }
      }
    },
    [slides, onSlidesChange, onPersistSlide],
  );

  const handleCloseEditor = useCallback(() => {
    setEditingSlide(null);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewSlide(null);
  }, []);

  const handleViewAllSlides = useCallback(() => {
    if (slides.length === 0) {
      message.warning('Нет слайдов для просмотра');
      return;
    }
    setIsAllSlidesPreviewVisible(true);
  }, [slides.length]);

  const handleCloseAllSlidesPreview = useCallback(() => {
    setIsAllSlidesPreviewVisible(false);
  }, []);

  return (
    <div className="slide-builder">
      <Row gutter={[16, 16]}>
        <Col span={readOnly ? 24 : 16}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#262626' }}>
                      Слайды курса
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      {slides.length} слайдов
                    </Text>
                  </div>
                </div>
                {!readOnly && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      icon={<PlayCircleOutlined />}
                      onClick={handleViewAllSlides}
                      disabled={slides.length === 0}
                      style={{
                        borderRadius: '8px',
                        border: '2px solid #8F9BA6FF',
                        color: '#8092A2FF',
                        background: 'white',
                        fontWeight: '500',
                        height: '40px',
                      }}
                      title="Просмотреть все слайды в режиме презентации"
                    >
                      Посмотреть все
                    </Button>
                    <Space>
                      <Select
                        value={selectedSlideType}
                        onChange={setSelectedSlideType}
                        style={{ width: 200 }}
                        placeholder="Выберите тип слайда"
                      >
                        <Select.Option value={SlideType.TEXT}>Текст</Select.Option>
                        <Select.Option value={SlideType.IMAGE}>Изображение</Select.Option>
                        <Select.Option value={SlideType.VIDEO}>Видео</Select.Option>
                        <Select.Option value={SlideType.IMAGE_TEXT_OVERLAY}>Изображение с текстом</Select.Option>
                        <Select.Option value={SlideType.QUIZ}>Викторина</Select.Option>
                        <Select.Option value={SlideType.FLASHCARDS}>Флеш-карточки</Select.Option>
                      </Select>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSlide}
                        style={{
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #818594FF 0%, #706B74FF 100%)',
                          border: 'none',
                          fontWeight: '500',
                          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                          height: '40px',
                        }}
                      >
                        Добавить слайд
                      </Button>
                    </Space>
                  </div>
                )}
              </div>
            }
            style={{
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}
            headStyle={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderBottom: '1px solid #f0f0f0',
              borderRadius: '12px 12px 0 0',
              padding: '16px 24px',
            }}
          >
            {slides.length === 0 ? (
              <Empty description="Нет слайдов" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                {!readOnly && (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Select
                      value={selectedSlideType}
                      onChange={setSelectedSlideType}
                      style={{ width: 200 }}
                      placeholder="Выберите тип слайда"
                    >
                      <Select.Option value={SlideType.TEXT}>Текст</Select.Option>
                      <Select.Option value={SlideType.IMAGE}>Изображение</Select.Option>
                      <Select.Option value={SlideType.VIDEO}>Видео</Select.Option>
                      <Select.Option value={SlideType.IMAGE_TEXT_OVERLAY}>Изображение с текстом</Select.Option>
                      <Select.Option value={SlideType.QUIZ}>Викторина</Select.Option>
                      <Select.Option value={SlideType.FILL_WORDS}>Заполнить пропуски</Select.Option>
                      <Select.Option value={SlideType.FILL_WORDS}>Заполнить пропуски</Select.Option>
                      <Select.Option value={SlideType.FLASHCARDS}>Флеш-карточки</Select.Option>
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSlide}>
                      Создать первый слайд
                    </Button>
                  </Space>
                )}
              </Empty>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={slides.map((slide) => slide.id)} strategy={verticalListSortingStrategy}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {slides.map((slide) => (
                      <SlideItem
                        key={slide.id}
                        slide={slide}
                        onEdit={handleEditSlide}
                        onPreview={handlePreviewSlide}
                        onDelete={handleDeleteSlide}
                        readOnly={readOnly}
                      />
                    ))}
                  </Space>
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </Col>

        {!readOnly && (
          <Col span={8}>
            <Card title="Информация" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Всего слайдов:</strong> {slides.length}
                </div>
                <div>
                  <strong>Типы слайдов:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {Object.values(SlideType).map((type) => {
                      const count = slides.filter((slide) => slide.type === type).length;
                      return count > 0 ? (
                        <li key={type}>
                          {type}: {count}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      {/* Редактор слайда */}
      {editingSlide && <SlideEditor slide={editingSlide} onSave={handleSaveSlide} onCancel={handleCloseEditor} />}

      {/* Предварительный просмотр */}
      {isPreviewVisible && previewSlide && <SlidePreview slide={previewSlide} onClose={handleClosePreview} />}

      {/* Просмотр всех слайдов */}
      {isAllSlidesPreviewVisible && (
        <SlidePresentation slides={slides} visible={isAllSlidesPreviewVisible} onClose={handleCloseAllSlidesPreview} />
      )}
    </div>
  );
};

export default SlideBuilder;
