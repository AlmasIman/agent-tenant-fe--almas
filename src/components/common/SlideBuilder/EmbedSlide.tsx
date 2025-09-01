import React from 'react';
import { Card, Typography } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface EmbedSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const EmbedSlide: React.FC<EmbedSlideProps> = ({ slide, onComplete }) => {
  let embedUrl = '';
  let embedHtml = '';

  try {
    const parsedContent = JSON.parse(slide.content);
    embedUrl = parsedContent.url || '';
    embedHtml = parsedContent.html || '';
  } catch {
    embedUrl = slide.content || '';
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
      {embedHtml ? (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '300px',
          }}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      ) : embedUrl ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 aspect ratio
            background: '#f5f5f5',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <iframe
            src={embedUrl}
            title={slide.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
            allowFullScreen
          />
        </div>
      ) : (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '40px',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '16px', color: '#666' }}>
            Встраиваемый контент не найден
          </div>
        </div>
      )}
    </Card>
  );
};

export default EmbedSlide;
