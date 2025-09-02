import React from 'react';
import { Card, Typography, Image, Divider } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface ImageTextOverlaySlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const ImageTextOverlaySlide: React.FC<ImageTextOverlaySlideProps> = ({ slide, onComplete }) => {
  let imageUrl = '';
  let overlayText = '';
  let textElements: any[] = [];

  try {
    const parsedContent = JSON.parse(slide.content);
    imageUrl = parsedContent.url || parsedContent.imageUrl || '';
    overlayText = parsedContent.text || '';
    textElements = parsedContent.textElements || [];
  } catch {
    // If content is not JSON, try to extract from slide data directly
    if (slide.content && typeof slide.content === 'string') {
      try {
        const simpleParsed = JSON.parse(slide.content);
        imageUrl = simpleParsed.url || '';
        overlayText = simpleParsed.text || '';
      } catch {
        // If still not JSON, use content as URL
        imageUrl = slide.content;
      }
    }
  }

  return (
    <div className="slide-container">
      <div className="slide-header">
        <div className="slide-number">03</div>
      </div>

      <div className="slide-content">
        <div className="slide-title-section">
          <Title level={2} className="slide-title">
            {slide.title}
          </Title>
          <Divider className="slide-divider" />
        </div>

        <div className="slide-image-overlay-content">
          {imageUrl ? (
            <div className="image-overlay-wrapper">
              <Image
                src={imageUrl}
                alt={slide.title}
                className="slide-image"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />

              {textElements.length > 0 && (
                <div className="text-overlay-elements">
                  {textElements.map((element) => (
                    <div
                      key={element.id}
                      className="text-element"
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        fontSize: `${element.fontSize}px`,
                        color: element.color,
                        fontFamily: element.fontFamily,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        textDecoration: element.textDecoration,
                        textAlign: element.textAlign,
                        opacity: element.opacity,
                        textShadow: element.shadow?.enabled
                          ? `${element.shadow.offsetX}px ${element.shadow.offsetY}px ${element.shadow.blur}px ${element.shadow.color}`
                          : 'none',
                        WebkitTextStroke: element.stroke?.enabled
                          ? `${element.stroke.width}px ${element.stroke.color}`
                          : 'none',
                        backgroundColor: element.backgroundColor?.enabled
                          ? `${element.backgroundColor.color}`
                          : 'transparent',
                        padding: element.backgroundColor?.enabled ? '4px 8px' : '0',
                        borderRadius: element.backgroundColor?.enabled ? '4px' : '0',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                    >
                      {element.text}
                    </div>
                  ))}
                </div>
              )}

              {overlayText && textElements.length === 0 && <div className="simple-text-overlay">{overlayText}</div>}
            </div>
          ) : (
            <div className="image-placeholder">
              <div className="placeholder-text">Изображение не загружено</div>
              <div className="placeholder-url">URL: {imageUrl || 'не указан'}</div>
            </div>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .slide-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: 1px solid #f0f0f0;
          }

          .slide-header {
            background: #f8fafc;
            padding: 16px 24px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .slide-number {
            background: #3b82f6;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
          }

          

          .slide-content {
            padding: 32px 40px;
          }

          .slide-title-section {
            margin-bottom: 32px;
          }

          .slide-title {
            color: #1e293b !important;
            font-size: 28px !important;
            font-weight: 700 !important;
            margin: 0 0 16px 0 !important;
            line-height: 1.3 !important;
          }

          .slide-divider {
            margin: 0 !important;
            border-color: #e2e8f0 !important;
          }

          .slide-image-overlay-content {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
          }

          .image-overlay-wrapper {
            position: relative;
            display: inline-block;
            max-width: 100%;
          }

          .slide-image {
            max-width: 100%;
            max-height: 500px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }

          .text-overlay-elements {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }

          .text-element {
            position: absolute;
            font-weight: 500;
          }

          .simple-text-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            max-width: 80%;
            text-align: center;
            z-index: 10;
            backdrop-filter: blur(4px);
          }

          .image-placeholder {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 60px 40px;
            text-align: center;
            color: #64748b;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 12px;
          }

          .placeholder-text {
            font-size: 18px;
            font-weight: 500;
            color: #64748b;
          }

          .placeholder-url {
            font-size: 14px;
            color: #94a3b8;
            font-family: monospace;
          }

          @media (max-width: 768px) {
            .slide-content {
              padding: 24px 20px;
            }

            .slide-title {
              font-size: 24px !important;
            }

            .slide-image {
              max-height: 300px;
            }

            .image-placeholder {
              padding: 40px 20px;
              min-height: 200px;
            }

            .simple-text-overlay {
              font-size: 16px;
              padding: 12px 20px;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default ImageTextOverlaySlide;
