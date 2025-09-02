import React from 'react';
import { Card, Typography, Image, Divider } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface ImageSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ slide, onComplete }) => {
  let imageUrl = '';

  try {
    const parsedContent = JSON.parse(slide.content);
    imageUrl = parsedContent.url || parsedContent.imageUrl || slide.content || '';
  } catch {
    imageUrl = slide.content || '';
  }

  return (
    <div className="slide-container">
              <div className="slide-header">
          <div className="slide-number">02</div>
        </div>
      
      <div className="slide-content">
        <div className="slide-title-section">
          <Title level={2} className="slide-title">
            {slide.title}
          </Title>
          <Divider className="slide-divider" />
        </div>
        
        <div className="slide-image-content">
          {imageUrl ? (
            <div className="image-wrapper">
              <Image
                src={imageUrl}
                alt={slide.title}
                className="slide-image"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            </div>
          ) : (
            <div className="image-placeholder">
              <div className="placeholder-text">Изображение не загружено</div>
              <div className="placeholder-url">URL: {imageUrl || 'не указан'}</div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
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

          .slide-image-content {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
          }

          .image-wrapper {
            max-width: 100%;
            text-align: center;
          }

          .slide-image {
            max-width: 100%;
            max-height: 500px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
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
          }
        `
      }} />
    </div>
  );
};

export default ImageSlide;
