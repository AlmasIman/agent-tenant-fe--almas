import React from 'react';
import { Card, Typography, Image } from 'antd';
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
        <Image
          src={imageUrl}
          alt={slide.title}
          style={{
            maxWidth: '100%',
            maxHeight: '500px',
            borderRadius: '8px',
          }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        />
      )}
    </Card>
  );
};

export default ImageSlide;
