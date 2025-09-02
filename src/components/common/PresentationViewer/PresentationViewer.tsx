import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, Typography, Spin, message, Empty } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { PresentationApi, Presentation, PresentationSlide } from '@app/api/presentation.api';
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

interface PresentationViewerProps {
  presentationId: number;
  onClose?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({
  presentationId,
  onClose,
  autoPlay = false,
  showControls = true,
}) => {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load presentation
  useEffect(() => {
    const loadPresentation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PresentationApi.getPresentation(presentationId);
        
        // Sort slides by order field
        const sortedData = {
          ...data,
          slides: data.slides ? [...data.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : []
        };
        
        setPresentation(sortedData);
      } catch (err: any) {
        console.error('Error loading presentation:', err);
        setError(err?.response?.data?.detail || 'Не удалось загрузить презентацию');
        message.error('Ошибка при загрузке презентации');
      } finally {
        setLoading(false);
      }
    };

    if (presentationId) {
      loadPresentation();
    }
  }, [presentationId]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !presentation || currentSlideIndex >= presentation.slides.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => prev + 1);
    }, 5000); // 5 seconds per slide

    return () => clearTimeout(timer);
  }, [isPlaying, currentSlideIndex, presentation]);

  const handlePrevious = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (presentation) {
      setCurrentSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
    }
  }, [presentation]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleSlideComplete = useCallback(
    (score?: number) => {
      // Auto-advance to next slide when interactive slide is completed
      if (presentation && currentSlideIndex < presentation.slides.length - 1) {
        setTimeout(() => {
          setCurrentSlideIndex((prev) => prev + 1);
        }, 2000);
      }
    },
    [presentation, currentSlideIndex],
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <Card>
        <Empty description={error || 'Презентация не найдена'} />
      </Card>
    );
  }

  if (presentation.slides.length === 0) {
    return (
      <Card>
        <Empty description="В презентации нет слайдов" />
      </Card>
    );
  }

  const currentSlide = presentation.slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / presentation.slides.length) * 100;

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

  const slide = convertSlide(currentSlide);

  const renderSlide = () => {
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {presentation.name}
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Слайд {currentSlideIndex + 1} из {presentation.slides.length}
          </Text>
        </div>

        {showControls && (
          <Space>
            <Button
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              type="text"
              style={{ color: 'white' }}
            />
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={handleFullscreen}
              type="text"
              style={{ color: 'white' }}
            />
            {onClose && (
              <Button onClick={onClose} type="text" style={{ color: 'white' }}>
                Закрыть
              </Button>
            )}
          </Space>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '4px' }}>
        <div
          style={{
            background: '#1890ff',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Slide content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {renderSlide()}
        </div>
      </div>

      {/* Navigation controls */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              disabled={currentSlideIndex === 0}
              type="text"
              style={{ color: 'white' }}
            />
            <Text style={{ color: 'white', minWidth: '80px', textAlign: 'center' }}>
              {currentSlideIndex + 1} / {presentation.slides.length}
            </Text>
            <Button
              icon={<RightOutlined />}
              onClick={handleNext}
              disabled={currentSlideIndex === presentation.slides.length - 1}
              type="text"
              style={{ color: 'white' }}
            />
          </Space>
        </div>
      )}
    </div>
  );
};

export default PresentationViewer;
