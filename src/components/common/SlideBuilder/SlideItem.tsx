import React from 'react';
import { Card, Button, Space, Typography, Tag } from 'antd';
import { DragOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, PictureOutlined, PlayCircleOutlined, CodeOutlined, BarChartOutlined, QuestionCircleOutlined, GlobalOutlined, TrophyOutlined, StarOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Slide, SlideType } from './types';

const { Text, Paragraph } = Typography;

interface SlideItemProps {
  slide: Slide;
  onEdit: (slide: Slide) => void;
  onPreview: (slide: Slide) => void;
  onDelete: (slideId: string) => void;
  readOnly?: boolean;
}

const getSlideIcon = (type: SlideType) => {
  switch (type) {
    case SlideType.TEXT:
      return <FileTextOutlined />;
    case SlideType.IMAGE:
      return <PictureOutlined />;
    case SlideType.VIDEO:
      return <PlayCircleOutlined />;
    case SlideType.CODE:
      return <CodeOutlined />;
    case SlideType.CHART:
      return <BarChartOutlined />;
    case SlideType.QUIZ:
      return <QuestionCircleOutlined />;
    case SlideType.EMBED:
      return <GlobalOutlined />;
    case SlideType.GAME:
      return <TrophyOutlined />;
    case SlideType.INTERACTIVE:
      return <StarOutlined />;
    case SlideType.ACHIEVEMENT:
      return <FireOutlined />;
    case SlideType.PROGRESS:
      return <CheckCircleOutlined />;
    default:
      return <FileTextOutlined />;
  }
};

const getSlideTypeLabel = (type: SlideType) => {
  switch (type) {
    case SlideType.TEXT:
      return 'Текст';
    case SlideType.IMAGE:
      return 'Изображение';
    case SlideType.VIDEO:
      return 'Видео';
    case SlideType.CODE:
      return 'Код';
    case SlideType.CHART:
      return 'График';
    case SlideType.QUIZ:
      return 'Викторина';
    case SlideType.EMBED:
      return 'Встраивание';
    case SlideType.GAME:
      return 'Игра';
    case SlideType.INTERACTIVE:
      return 'Интерактивный';
    case SlideType.ACHIEVEMENT:
      return 'Достижение';
    case SlideType.PROGRESS:
      return 'Прогресс';
    default:
      return 'Текст';
  }
};

const getSlideTypeColor = (type: SlideType) => {
  switch (type) {
    case SlideType.TEXT:
      return 'blue';
    case SlideType.IMAGE:
      return 'green';
    case SlideType.VIDEO:
      return 'red';
    case SlideType.CODE:
      return 'purple';
    case SlideType.CHART:
      return 'orange';
    case SlideType.QUIZ:
      return 'cyan';
    case SlideType.EMBED:
      return 'magenta';
    case SlideType.GAME:
      return 'gold';
    case SlideType.INTERACTIVE:
      return 'lime';
    case SlideType.ACHIEVEMENT:
      return 'volcano';
    case SlideType.PROGRESS:
      return 'geekblue';
    default:
      return 'blue';
  }
};

const SlideItem: React.FC<SlideItemProps> = ({ slide, onEdit, onPreview, onDelete, readOnly = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(slide.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(slide);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(slide);
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        size="small"
        hoverable
        style={{ 
          marginBottom: 8,
          cursor: readOnly ? 'default' : 'grab',
          border: isDragging ? '2px dashed #1890ff' : undefined,
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {!readOnly && (
              <div
                {...listeners}
                style={{ 
                  cursor: 'grab', 
                  marginRight: 8,
                  padding: '4px',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <DragOutlined style={{ color: '#999' }} />
              </div>
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Space size={8}>
                  {getSlideIcon(slide.type)}
                  <Text strong style={{ fontSize: '14px' }}>
                    {slide.title}
                  </Text>
                  <Tag color={getSlideTypeColor(slide.type)} size="small">
                    {getSlideTypeLabel(slide.type)}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    #{slide.order + 1}
                  </Text>
                </Space>
              </div>
              
              {slide.content && (
                <Paragraph 
                  style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}
                >
                  {truncateContent(slide.content)}
                </Paragraph>
              )}
            </div>
          </div>

          {!readOnly && (
            <Space size={4}>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={handlePreview}
                title="Предварительный просмотр"
              />
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={handleEdit}
                title="Редактировать"
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                title="Удалить"
              />
            </Space>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SlideItem;
