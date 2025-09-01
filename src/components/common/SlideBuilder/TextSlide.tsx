import React from 'react';
import { Card, Typography } from 'antd';
import { Slide } from './types';

const { Title, Paragraph } = Typography;

interface TextSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const TextSlide: React.FC<TextSlideProps> = ({ slide, onComplete }) => {
  let content = '';

  try {
    const parsedContent = JSON.parse(slide.content);
    content = parsedContent.text || slide.content || '';
  } catch {
    content = slide.content || '';
  }

  // Remove HTML tags for display if needed
  const plainText = content.replace(/<[^>]*>/g, '');

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '800px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
      bodyStyle={{ padding: '60px 40px' }}
    >
      <Title level={2} style={{ color: 'white', marginBottom: '32px' }}>
        {slide.title}
      </Title>
      <div
        style={{
          fontSize: '18px',
          lineHeight: '1.8',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Card>
  );
};

export default TextSlide;
