import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Space, Typography, Spin, message, Empty } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { PresentationApi, Presentation, PresentationSlide } from '@app/api/presentation.api';
import { useApiCall } from '@app/hooks/useApiCall';
import TextSlide from '@app/components/common/SlideBuilder/TextSlide';
import ImageSlide from '@app/components/common/SlideBuilder/ImageSlide';
import VideoSlide from '@app/components/common/SlideBuilder/VideoSlide';
import QuizSlide from '@app/components/common/SlideBuilder/QuizSlide';
import FlashcardsSlide from '@app/components/common/SlideBuilder/FlashcardsSlide';
import FillWordsSlide from '@app/components/common/SlideBuilder/FillWordsSlide';
import CodeSlide from '@app/components/common/SlideBuilder/CodeSlide';
import ChartSlide from '@app/components/common/SlideBuilder/ChartSlide';
import EmbedSlide from '@app/components/common/SlideBuilder/EmbedSlide';
import GameSlide from '@app/components/common/SlideBuilder/GameSlide';
import InteractiveSlide from '@app/components/common/SlideBuilder/InteractiveSlide';
import AchievementSlide from '@app/components/common/SlideBuilder/AchievementSlide';
import ProgressSlide from '@app/components/common/SlideBuilder/ProgressSlide';
import ImageDragDropSlide from '@app/components/common/SlideBuilder/ImageDragDropSlide';
import ImageTextOverlaySlide from '@app/components/common/SlideBuilder/ImageTextOverlaySlide';

const { Title, Text } = Typography;

interface PresentationViewerModalProps {
  presentationId: number;
  visible: boolean;
  onClose: () => void;
  autoPlay?: boolean;
}

const PresentationViewerModal: React.FC<PresentationViewerModalProps> = ({
  presentationId,
  visible,
  onClose,
  autoPlay = false,
}) => {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [error, setError] = useState<string | null>(null);

  // Create deduplicated API function
  const getPresentation = useApiCall(PresentationApi.getPresentation, { deduplicate: true, deduplicateTime: 2000 });

  // Load presentation
  useEffect(() => {
    if (!visible || !presentationId) return;

    const loadPresentation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPresentation(presentationId);
        
        // Sort slides by order field
        const sortedData = {
          ...data,
          slides: data.slides ? [...data.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : []
        };
        
        setPresentation(sortedData);
        setCurrentSlideIndex(0); // Reset to first slide
      } catch (err: any) {
        console.error('Error loading presentation:', err);
        setError(err?.response?.data?.detail || 'Не удалось загрузить презентацию');
        message.error('Ошибка при загрузке презентации');
      } finally {
        setLoading(false);
      }
    };

    loadPresentation();
  }, [presentationId, visible, getPresentation]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !presentation || currentSlideIndex >= presentation.slides.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSlideIndex(prev => prev + 1);
    }, 5000); // 5 seconds per slide

    return () => clearTimeout(timer);
  }, [isPlaying, currentSlideIndex, presentation]);

  const handlePrevious = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (presentation) {
      setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1));
    }
  }, [presentation]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    setCurrentSlideIndex(0);
    onClose();
  }, [onClose]);

  const handleSlideComplete = useCallback((score?: number) => {
    // Auto-advance to next slide when interactive slide is completed
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setTimeout(() => {
        setCurrentSlideIndex(prev => prev + 1);
      }, 2000);
    }
  }, [presentation, currentSlideIndex]);

  if (!presentationId) return null;

  const currentSlide = presentation?.slides[currentSlideIndex];
  const progress = presentation ? ((currentSlideIndex + 1) / presentation.slides.length) * 100 : 0;

  // Convert API slide to internal slide format
  const convertSlide = (apiSlide: PresentationSlide) => {
    let content = apiSlide.data;
    
    // Special handling for quiz slides - wrap in quiz object
    if (apiSlide.type.toLowerCase() === 'quiz') {
      content = {
        quiz: {
          questions: apiSlide.data.questions || [],
          shuffle: false,
          showExplanation: false,
        }
      };
    }
    
    // Special handling for flashcards - wrap in flashcards object
    if (apiSlide.type.toLowerCase() === 'flashcards') {
      // Handle nested data structure where data might contain another object
      let cardsData = apiSlide.data.cards || [];
      
      // If data is a nested object with its own data field, extract from there
      if (apiSlide.data && typeof apiSlide.data === 'object' && apiSlide.data.data) {
        cardsData = apiSlide.data.data.cards || [];
      }
      
      content = {
        flashcards: {
          cards: cardsData,
          shuffle: false,
          showProgress: false,
        },
      };
    }

    // Special handling for image_text_overlay - wrap in imageTextOverlay object
    if (apiSlide.type.toLowerCase() === 'image_text_overlay') {
      content = {
        imageTextOverlay: {
          url: apiSlide.data.url || '',
          text: apiSlide.data.text || '',
          textElements: apiSlide.data.textElements || [],
        },
      };
    }
    
    return {
      id: apiSlide.id.toString(),
      title: apiSlide.name,
      type: apiSlide.type.toUpperCase(),
      content: JSON.stringify(content),
      order: apiSlide.order,
      settings: {},
    };
  };

  const renderSlide = () => {
    if (!currentSlide) return null;

    const slide = convertSlide(currentSlide);

    switch (currentSlide.type.toLowerCase()) {
      case 'text':
        return <TextSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'image':
        return <ImageSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'video':
        return <VideoSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'quiz':
        return <QuizSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'flashcards':
        return <FlashcardsSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'fill_in_blank':
        return <FillWordsSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'code':
        return <CodeSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'chart':
        return <ChartSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'embed':
        return <EmbedSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'game':
        return <GameSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'interactive':
        return <InteractiveSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'achievement':
        return <AchievementSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'progress':
        return <ProgressSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'image_drag_drop':
        return <ImageDragDropSlide slide={slide} onComplete={handleSlideComplete} />;
      case 'image_text_overlay':
        return <ImageTextOverlaySlide slide={slide} onComplete={handleSlideComplete} />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Title level={3}>Неизвестный тип слайда: {currentSlide.type}</Title>
            <Text type="secondary">Данный тип слайда не поддерживается</Text>
          </div>
        );
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {presentation?.name || 'Презентация'}
            </Title>
            {presentation && (
              <Text type="secondary">
                Слайд {currentSlideIndex + 1} из {presentation.slides.length}
              </Text>
            )}
          </div>
          <Space>
            <Button
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              type="text"
            />
          </Space>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ 
        height: '70vh', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              disabled={currentSlideIndex === 0}
            >
              Предыдущий
            </Button>
            <Button
              icon={<RightOutlined />}
              onClick={handleNext}
              disabled={!presentation || currentSlideIndex === presentation.slides.length - 1}
            >
              Следующий
            </Button>
          </Space>
          <Text type="secondary">
            {presentation ? `${currentSlideIndex + 1} / ${presentation.slides.length}` : '0 / 0'}
          </Text>
        </div>
      }
    >
      {/* Progress bar */}
      <div style={{ background: '#f0f0f0', height: '4px', marginBottom: '20px' }}>
        <div
          style={{
            background: '#1890ff',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Empty description={error} />
        ) : !presentation ? (
          <Empty description="Презентация не найдена" />
        ) : presentation.slides.length === 0 ? (
          <Empty description="В презентации нет слайдов" />
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '400px'
          }}>
            {renderSlide()}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PresentationViewerModal;
