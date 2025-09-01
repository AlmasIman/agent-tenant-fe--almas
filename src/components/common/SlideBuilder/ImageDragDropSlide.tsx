import React from 'react';
import { Card, Typography, Image } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface ImageDragDropSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const ImageDragDropSlide: React.FC<ImageDragDropSlideProps> = ({ slide, onComplete }) => {
  let imageUrl = '';
  let dropZones: any[] = [];
  let draggableItems: any[] = [];

  try {
    const parsedContent = JSON.parse(slide.content);
    imageUrl = parsedContent.imageUrl || parsedContent.url || '';
    dropZones = parsedContent.dropZones || [];
    draggableItems = parsedContent.draggableItems || [];
  } catch {
    imageUrl = slide.content || '';
  }

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '900px',
        textAlign: 'center',
        background: 'white',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
      bodyStyle={{ padding: '40px' }}
    >
      <Title level={2} style={{ marginBottom: '32px' }}>
        {slide.title}
      </Title>
      {imageUrl && (
        <div style={{ marginBottom: '24px' }}>
          <Image
            src={imageUrl}
            alt={slide.title}
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: '8px',
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
        </div>
      )}
      <div
        style={{
          background: '#f5f5f5',
          borderRadius: '8px',
          padding: '20px',
          minHeight: '200px',
        }}
      >
        <div style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>
          Drag & Drop на изображении
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Зон для перетаскивания: {dropZones.length}
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Элементов для перетаскивания: {draggableItems.length}
        </div>
      </div>
    </Card>
  );
};

export default ImageDragDropSlide;
