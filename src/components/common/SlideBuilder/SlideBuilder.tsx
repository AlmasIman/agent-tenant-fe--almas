import React, { useState, useCallback } from 'react';
import { Card, Button, Space, Typography, Row, Col, Empty, message } from 'antd';
import { PlusOutlined, DragOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
}

const SlideBuilder: React.FC<SlideBuilderProps> = ({ slides, onSlidesChange, readOnly = false }) => {
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isAllSlidesPreviewVisible, setIsAllSlidesPreviewVisible] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSlide = useCallback(() => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: SlideType.TEXT,
      title: 'Новый слайд',
      content: '',
      order: slides.length,
      settings: {},
    };
    onSlidesChange([...slides, newSlide]);
  }, [slides, onSlidesChange]);

  const handleEditSlide = useCallback((slide: Slide) => {
    setEditingSlide(slide);
  }, []);

  const handlePreviewSlide = useCallback((slide: Slide) => {
    setPreviewSlide(slide);
    setIsPreviewVisible(true);
  }, []);

  const handleDeleteSlide = useCallback((slideId: string) => {
    const updatedSlides = slides.filter(slide => slide.id !== slideId);
    // Обновляем порядок
    const reorderedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      order: index,
    }));
    onSlidesChange(reorderedSlides);
    message.success('Слайд удален');
  }, [slides, onSlidesChange]);

  const handleSaveSlide = useCallback((updatedSlide: Slide) => {
    const updatedSlides = slides.map(slide => 
      slide.id === updatedSlide.id ? updatedSlide : slide
    );
    onSlidesChange(updatedSlides);
    setEditingSlide(null);
    message.success('Слайд сохранен');
  }, [slides, onSlidesChange]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = slides.findIndex(slide => slide.id === active.id);
      const newIndex = slides.findIndex(slide => slide.id === over.id);
      
      const reorderedSlides = arrayMove(slides, oldIndex, newIndex).map((slide, index) => ({
        ...slide,
        order: index,
      }));
      
      onSlidesChange(reorderedSlides);
    }
  }, [slides, onSlidesChange]);

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
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  Слайды курса 
                  <Text type="secondary" style={{ fontSize: '14px', marginLeft: '8px' }}>
                    ({slides.length} слайдов)
                  </Text>
                </Title>
                {!readOnly && (
                  <>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddSlide}
                    >
                      Добавить слайд
                    </Button>
                    <Button 
                      type="default" 
                      icon={<PlayCircleOutlined />} 
                      onClick={handleViewAllSlides}
                      disabled={slides.length === 0}
                      style={{ marginLeft: '8px' }}
                      title="Просмотреть все слайды в режиме презентации"
                    >
                      Посмотреть все
                    </Button>
                  </>
                )}
              </Space>
            }
          >
            {slides.length === 0 ? (
              <Empty 
                description="Нет слайдов" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                {!readOnly && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSlide}>
                    Создать первый слайд
                  </Button>
                )}
              </Empty>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={slides.map(slide => slide.id)} strategy={verticalListSortingStrategy}>
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
                    {Object.values(SlideType).map(type => {
                      const count = slides.filter(slide => slide.type === type).length;
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
      {editingSlide && (
        <SlideEditor
          slide={editingSlide}
          onSave={handleSaveSlide}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Предварительный просмотр */}
      {isPreviewVisible && previewSlide && (
        <SlidePreview
          slide={previewSlide}
          onClose={handleClosePreview}
        />
      )}

      {/* Просмотр всех слайдов */}
      {isAllSlidesPreviewVisible && (
        <SlidePresentation
          slides={slides}
          visible={isAllSlidesPreviewVisible}
          onClose={handleCloseAllSlidesPreview}
        />
      )}
    </div>
  );
};

export default SlideBuilder;
