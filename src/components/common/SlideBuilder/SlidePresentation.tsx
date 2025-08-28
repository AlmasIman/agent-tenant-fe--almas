import React, { useState, useCallback } from 'react';
import { Modal, Button, Space, Typography, Progress } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { Slide, SlideType } from './types';

const { Title, Paragraph } = Typography;

interface SlidePresentationProps {
  slides: Slide[];
  visible: boolean;
  onClose: () => void;
  startFromSlide?: number;
}

const SlidePresentation: React.FC<SlidePresentationProps> = ({ 
  slides, 
  visible, 
  onClose, 
  startFromSlide = 0 
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startFromSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  const handlePrevious = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex]);

  const handleNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        onClose();
        break;
      case 'F11':
        event.preventDefault();
        setIsFullscreen(!isFullscreen);
        break;
    }
  }, [handlePrevious, handleNext, onClose, isFullscreen]);

  React.useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  const getSlideIcon = (type: SlideType) => {
    switch (type) {
      case SlideType.TEXT:
        return '📝';
      case SlideType.IMAGE:
        return '🖼️';
      case SlideType.VIDEO:
        return '🎥';
      case SlideType.CODE:
        return '💻';
      case SlideType.CHART:
        return '📊';
      case SlideType.QUIZ:
        return '❓';
      case SlideType.EMBED:
        return '🌐';
      case SlideType.IMAGE_DRAG_DROP:
        return '🎯';
      default:
        return '📄';
    }
  };

  const renderSlideContent = () => {
    if (!currentSlide) return null;

    const slideStyle: React.CSSProperties = {
      backgroundColor: currentSlide.settings.backgroundColor || '#ffffff',
      color: currentSlide.settings.textColor || '#000000',
      fontSize: `${currentSlide.settings.fontSize || 16}px`,
      textAlign: currentSlide.settings.alignment || 'left',
      padding: `${currentSlide.settings.padding || 16}px`,
      borderRadius: `${currentSlide.settings.borderRadius || 0}px`,
      boxShadow: currentSlide.settings.shadow ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
      border: currentSlide.settings.border ? `${currentSlide.settings.borderWidth || 1}px solid ${currentSlide.settings.borderColor || '#d9d9d9'}` : 'none',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: currentSlide.settings.alignment === 'center' ? 'center' : 'stretch',
      overflow: 'auto',
    };

    switch (currentSlide.type) {
      case SlideType.TEXT:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <div dangerouslySetInnerHTML={{ __html: currentSlide.content }} />
          </div>
        );

      case SlideType.IMAGE:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <img 
              src={currentSlide.content} 
              alt={currentSlide.title}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70%',
                height: 'auto',
                borderRadius: `${currentSlide.settings.borderRadius || 0}px`,
              }}
            />
          </div>
        );

      case SlideType.VIDEO:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <video
              src={currentSlide.content}
              controls={currentSlide.settings.controls !== false}
              autoPlay={currentSlide.settings.autoPlay}
              loop={currentSlide.settings.loop}
              muted={currentSlide.settings.muted}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70%',
                height: 'auto',
                borderRadius: `${currentSlide.settings.borderRadius || 0}px`,
              }}
            />
          </div>
        );

      case SlideType.CODE:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <pre style={{ 
              backgroundColor: '#1e1e1e', 
              color: '#d4d4d4',
              padding: '24px', 
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '18px',
              lineHeight: '1.6',
              maxHeight: '70%',
              width: '100%',
            }}>
              <code>{currentSlide.content}</code>
            </pre>
          </div>
        );

      case SlideType.CHART:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '32px', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
              fontSize: '18px',
            }}>
              График: {currentSlide.content ? 'Данные загружены' : 'Нет данных'}
            </div>
          </div>
        );

      case SlideType.QUIZ:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <div style={{ textAlign: currentSlide.settings.alignment }}>
              <Paragraph style={{ fontSize: '24px', marginBottom: '32px' }}>
                Вопрос викторины
              </Paragraph>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '32px', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666',
                fontSize: '18px',
              }}>
                Варианты ответов будут отображаться здесь
              </div>
            </div>
          </div>
        );

      case SlideType.EMBED:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <iframe
              src={currentSlide.content}
              style={{ 
                width: '100%', 
                height: '70%',
                border: 'none',
                borderRadius: `${currentSlide.settings.borderRadius || 0}px`,
              }}
              title={currentSlide.title}
            />
          </div>
        );

      case SlideType.IMAGE_DRAG_DROP:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <div style={{ textAlign: 'center' }}>
              <Paragraph style={{ fontSize: '20px', marginBottom: '24px' }}>
                Drag and Drop на изображении
              </Paragraph>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '32px', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto',
              }}>
                Интерактивные элементы drag and drop будут отображаться здесь
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={slideStyle}>
            {currentSlide.settings.showTitle && (
              <Title level={1} style={{ marginBottom: 32, textAlign: currentSlide.settings.alignment }}>
                {currentSlide.title}
              </Title>
            )}
            <Paragraph style={{ fontSize: '20px' }}>{currentSlide.content}</Paragraph>
          </div>
        );
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      width="90vw"
      style={{ top: 20 }}
      bodyStyle={{ 
        padding: 0, 
        height: '80vh',
        position: 'relative',
      }}
      footer={null}
      closable={false}
    >
      {/* Прогресс бар */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        padding: '8px 16px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {getSlideIcon(currentSlide?.type)} Слайд {currentSlideIndex + 1} из {slides.length}
          </span>
          <Progress 
            percent={progress} 
            size="small" 
            showInfo={false}
            strokeColor="#1890ff"
            style={{ width: 200 }}
          />
          <Space>
            <Button 
              type="text" 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ color: 'white' }}
            />
            <Button 
              type="text" 
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{ color: 'white' }}
            />
          </Space>
        </div>
      </div>

      {/* Контент слайда */}
      <div style={{ 
        height: '100%', 
        paddingTop: '60px',
        position: 'relative',
      }}>
        {renderSlideContent()}
      </div>

      {/* Навигационные кнопки */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}>
        <Space>
          <Button 
            icon={<LeftOutlined />} 
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
            size="large"
          >
            Предыдущий
          </Button>
          <Button 
            icon={<RightOutlined />} 
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            size="large"
          >
            Следующий
          </Button>
        </Space>
      </div>

      {/* Подсказки */}
      <div style={{ 
        position: 'absolute', 
        bottom: '80px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1000,
        color: '#666',
        fontSize: '12px',
        textAlign: 'center',
      }}>
        Используйте стрелки ← → для навигации, ESC для выхода
      </div>
    </Modal>
  );
};

export default SlidePresentation;
