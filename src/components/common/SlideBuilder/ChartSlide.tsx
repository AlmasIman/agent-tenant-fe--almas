import React from 'react';
import { Card, Typography } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface ChartSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const ChartSlide: React.FC<ChartSlideProps> = ({ slide, onComplete }) => {
  let chartData = null;
  let chartType = 'bar';

  try {
    const parsedContent = JSON.parse(slide.content);
    chartData = parsedContent.data || {};
    chartType = parsedContent.type || 'bar';
  } catch {
    chartData = {};
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
          График: {chartType}
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Данные графика будут отображаться здесь
        </div>
        <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
          {JSON.stringify(chartData, null, 2)}
        </div>
      </div>
    </Card>
  );
};

export default ChartSlide;
