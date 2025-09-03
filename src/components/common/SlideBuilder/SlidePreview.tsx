import React from 'react';
import { Modal, Typography, Space, Tag, Button } from 'antd';
import {
  CloseOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  CheckCircleOutlined,
  BookOutlined,
  FormOutlined,
  DragOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Slide, SlideType } from './types';
import GameSlide from './GameSlide';
import AchievementSlide from './AchievementSlide';
import FlashcardsSlide from './FlashcardsSlide';
import FillWordsSlide from './FillWordsSlide';
import QuizSlide from './QuizSlide';
import TrueFalseSlide from './TrueFalseSlide';

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
      case SlideType.TRUE_FALSE:
        return <CheckOutlined />;
      case SlideType.IMAGE_DRAG_DROP:
        return <DragOutlined />;
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
      case SlideType.TRUE_FALSE:
        return 'Вопрос True/False';
      case SlideType.IMAGE_DRAG_DROP:
        return 'Drag & Drop на изображении';
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
      case SlideType.TRUE_FALSE:
        return 'green';
      case SlideType.IMAGE_DRAG_DROP:
        return 'orange';
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
      border: slide.settings.border
        ? `${slide.settings.borderWidth || 1}px solid ${slide.settings.borderColor || '#d9d9d9'}`
        : 'none',
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

            {/* Проверяем, есть ли данные из ImageTextEditor */}
            {(() => {
              try {
                const parsed = JSON.parse(slide.content);
                if (parsed.imageData && parsed.textElements) {
                  // Отображаем изображение с текстом
                  return (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={parsed.imageData}
                        alt={slide.title}
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: `${slide.settings.borderRadius || 0}px`,
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                      <div style={{ display: 'none', textAlign: 'center', color: '#999' }}>
                        Изображение не загружено
                      </div>

                      {/* Отображаем текстовые элементы поверх изображения */}
                      {parsed.textElements.map((element: any) => (
                        <div
                          key={element.id}
                          style={{
                            position: 'absolute',
                            left: element.x,
                            top: element.y,
                            fontSize: element.fontSize,
                            color: element.color,
                            fontFamily: element.fontFamily,
                            transform: `rotate(${element.rotation}deg)`,
                            opacity: element.opacity,
                            textAlign: element.textAlign,
                            fontWeight: element.fontWeight,
                            fontStyle: element.fontStyle,
                            textDecoration: element.textDecoration,
                            textShadow: element.shadow?.enabled
                              ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`
                              : 'none',
                            WebkitTextStroke: element.stroke?.enabled
                              ? `${element.stroke.width}px ${element.stroke.color}`
                              : 'none',
                            backgroundColor: element.backgroundColor?.enabled
                              ? `${element.backgroundColor.color}${Math.round(element.backgroundColor.opacity * 255)
                                  .toString(16)
                                  .padStart(2, '0')}`
                              : 'transparent',
                            padding: '4px',
                            borderRadius: '4px',
                            pointerEvents: 'none', // Чтобы текст не мешал взаимодействию
                          }}
                        >
                          {element.text}
                        </div>
                      ))}
                    </div>
                  );
                }
              } catch (error) {
                // Если не JSON, значит просто URL изображения
              }

              // Обычное изображение без текста
              return (
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
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
              );
            })()}

            <div style={{ display: 'none', textAlign: 'center', color: '#999' }}>Изображение не загружено</div>
          </div>
        );

      case SlideType.IMAGE_TEXT_OVERLAY:
        // Не выравниваем по центру контейнер, чтобы координаты x/y работали как есть
        const containerStyle: React.CSSProperties = {
          ...slideStyle,
          display: 'block',
          textAlign: 'left',
          padding: 0,
        };
        return (
          <div style={containerStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            {(() => {
              try {
                const parsed = JSON.parse(slide.content);
                const url = parsed.url || slide.content;
                const text = parsed.text || '';
                // Берём координаты из первого textElements
                let x = 20;
                let y = 20;
                if (Array.isArray(parsed.textElements) && parsed.textElements.length) {
                  const t0 = parsed.textElements[0];
                  if (typeof t0?.x === 'number') x = t0.x;
                  if (typeof t0?.y === 'number') y = t0.y;
                }
                return (
                  <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                    <img
                      src={url}
                      alt={slide.title}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: `${slide.settings.borderRadius || 0}px`,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        color: slide.settings.textColor || '#000',
                        fontSize: `${slide.settings.fontSize || 24}px`,
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                        background: 'rgba(255,255,255,0.2)',
                        padding: 4,
                        borderRadius: 4,
                      }}
                    >
                      {text}
                    </div>
                  </div>
                );
              } catch {
                return <Paragraph>Неверный формат контента</Paragraph>;
              }
            })()}
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
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
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
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '4px',
                textAlign: 'center',
                color: '#666',
              }}
            >
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
              <Paragraph style={{ fontSize: '18px', marginBottom: '24px' }}>Прогресс прохождения курса</Paragraph>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '32px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666',
                }}
              >
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
              <Paragraph style={{ fontSize: '18px', marginBottom: '24px' }}>Интерактивный контент</Paragraph>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '32px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666',
                }}
              >
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

      case SlideType.TRUE_FALSE:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <TrueFalseSlide slide={slide} />
          </div>
        );

      case SlideType.IMAGE_DRAG_DROP:
        return (
          <div style={slideStyle}>
            {slide.settings.showTitle && (
              <Title level={2} style={{ marginBottom: 16, textAlign: slide.settings.alignment }}>
                {slide.title}
              </Title>
            )}
            <div style={{ textAlign: slide.settings.alignment }}>
              <Paragraph style={{ fontSize: '18px', marginBottom: '24px' }}>Drag and Drop на изображении</Paragraph>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '32px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666',
                }}
              >
                Интерактивные элементы drag and drop будут отображаться здесь
              </div>
            </div>
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
          <Tag color={getSlideTypeColor(slide.type)}>{getSlideTypeLabel(slide.type)}</Tag>
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
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#fafafa',
        }}
      >
        {renderContent()}
      </div>
    </Modal>
  );
};

export default SlidePreview;
