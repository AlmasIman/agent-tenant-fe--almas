import React from 'react';
import { Card, Typography } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface InteractiveSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const InteractiveSlide: React.FC<InteractiveSlideProps> = ({ slide, onComplete }) => {
  let interactiveData = null;
  let interactiveType = 'hotspot';

  try {
    const parsedContent = JSON.parse(slide.content);
    interactiveData = parsedContent.config || {};
    interactiveType = parsedContent.type || 'hotspot';
  } catch {
    interactiveData = {};
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
      <div
        style={{
          background: '#f5f5f5',
          borderRadius: '8px',
          padding: '40px',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
          Интерактивный контент: {interactiveType}
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Интерактивный элемент будет отображаться здесь
        </div>
      </div>
    </Card>
  );
};

export default InteractiveSlide;
