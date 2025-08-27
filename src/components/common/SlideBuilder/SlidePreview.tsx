import React from 'react';
import { Modal, Typography, Space, Tag, Button } from 'antd';
import { CloseOutlined, FileTextOutlined, PictureOutlined, PlayCircleOutlined, CodeOutlined, BarChartOutlined, QuestionCircleOutlined, GlobalOutlined, TrophyOutlined, StarOutlined, FireOutlined, CheckCircleOutlined, BookOutlined, FormOutlined } from '@ant-design/icons';
import { Slide, SlideType } from './types';
import GameSlide from './GameSlide';
import AchievementSlide from './AchievementSlide';
import FlashcardsSlide from './FlashcardsSlide';
import FillWordsSlide from './FillWordsSlide';
import QuizSlide from './QuizSlide';

const { Title, Paragraph } = Typography;

interface SlidePreviewProps {
  slide: Slide;
  onClose: () => void;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, onClose }) => {
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
      case SlideType.FLASHCARDS:
        return <BookOutlined />;
      case SlideType.FILL_WORDS:
        return <FormOutlined />;
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
      case SlideType.FLASHCARDS:
        return 'Флеш-карточки';
      case SlideType.FILL_WORDS:
        return 'Заполнить пропуски';
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
      case SlideType.FLASHCARDS:
        return 'purple';
      case SlideType.FILL_WORDS:
        return 'cyan';
      default:
        return 'blue';
    }
  };

  const renderContent = () => {
    const slideStyle: React.CSSProperties = {
      backgroundColor: slide.settings.backgroundColor || '#ffffff',
      color: slide.settings.textColor || '#000000',
      fontSize: `${slide.settings.fontSize || 16}px`,
      textAlign: slide.settings.alignment || 'left',
      padding: `${slide.settings.padding || 16}px`,
      borderRadius: `${slide.settings.borderRadius || 0}px`,
      boxShadow: slide.settings.shadow ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
      border: slide.settings.border ? `${slide.settings.borderWidth || 1}px solid ${slide.settings.borderColor || '#d9d9d9'}` : 'none',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: slide.settings.alignment === 'center' ? 'center' : 'stretch',
    };

    switch (slide.type) {
      case SlideType.TEXT:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <div dangerouslySetInnerHTML={{ __html: slide.content }} />
          </div>
        );

      case SlideType.IMAGE:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <img 
              src={slide.content} 
              alt={slide.title}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: `${slide.settings.borderRadius || 0}px`,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', textAlign: 'center', color: '#999' }}>
              Изображение не загружено
            </div>
          </div>
        );

      case SlideType.VIDEO:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <video
              src={slide.content}
              controls={slide.settings.controls !== false}
              autoPlay={slide.settings.autoPlay}
              loop={slide.settings.loop}
              muted={slide.settings.muted}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: `${slide.settings.borderRadius || 0}px`,
              }}
            />
          </div>
        );

      case SlideType.CODE:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: '1.5',
            }}>
              <code>{slide.content}</code>
            </pre>
          </div>
        );

      case SlideType.CHART:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              textAlign: 'center',
              color: '#666',
            }}>
              График: {slide.content ? 'Данные загружены' : 'Нет данных'}
            </div>
          </div>
        );

      case SlideType.QUIZ:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <QuizSlide slide={slide} />
          </div>
        );

      case SlideType.EMBED:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <iframe
              src={slide.content}
              style={{ 
                width: '100%', 
                height: '300px',
                border: 'none',
                borderRadius: `${slide.settings.borderRadius || 0}px`,
              }}
              title={slide.title}
            />
          </div>
        );

      case SlideType.GAME:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <GameSlide slide={slide} />
          </div>
        );

      case SlideType.ACHIEVEMENT:
        return (
          <div style={slideStyle}>
            <AchievementSlide slide={slide} />
          </div>
        );

      case SlideType.PROGRESS:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <div style={{ textAlign: slide.settings.alignment }}>
              <Paragraph style={{ fontSize: '18px', marginBottom: '24px' }}>
                Прогресс прохождения курса
              </Paragraph>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '32px', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666',
              }}>
                Индикатор прогресса будет отображаться здесь
              </div>
            </div>
          </div>
        );

      case SlideType.INTERACTIVE:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <div style={{ textAlign: slide.settings.alignment }}>
              <Paragraph style={{ fontSize: '18px', marginBottom: '24px' }}>
                Интерактивный контент
              </Paragraph>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '32px', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666',
              }}>
                Интерактивные элементы будут отображаться здесь
              </div>
            </div>
          </div>
        );

      case SlideType.FLASHCARDS:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <FlashcardsSlide slide={slide} />
          </div>
        );

      case SlideType.FILL_WORDS:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <FillWordsSlide slide={slide} />
          </div>
        );

      default:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <Paragraph>{slide.content}</Paragraph>
          </div>
        );
    }
  };

  return (
    <Modal
      title={
        <Space>
          {getSlideIcon(slide.type)}
          <span>Предварительный просмотр: {slide.title}</span>
          <Tag color={getSlideTypeColor(slide.type)}>
            {getSlideTypeLabel(slide.type)}
          </Tag>
        </Space>
      }
      open={true}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Закрыть
        </Button>,
      ]}
    >
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#fafafa',
      }}>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default SlidePreview;
