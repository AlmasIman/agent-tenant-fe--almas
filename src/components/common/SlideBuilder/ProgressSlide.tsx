import React from 'react';
import { Card, Typography, Progress } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface ProgressSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const ProgressSlide: React.FC<ProgressSlideProps> = ({ slide, onComplete }) => {
  let progressData = null;

  try {
    const parsedContent = JSON.parse(slide.content);
    progressData = parsedContent;
  } catch {
    progressData = { current: 0, total: 100 };
  }

  const { current = 0, total = 100, milestones = [] } = progressData;

  const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;

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
      <div style={{ marginBottom: '32px' }}>
        <Progress
          type="circle"
          percent={progressPercent}
          size={120}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </div>
      <div style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
        Прогресс: {current} из {total}
      </div>
      {milestones.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>
            Вехи:
          </div>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            {milestones.map((milestone: string, index: number) => (
              <li key={index} style={{ marginBottom: '8px', color: '#666' }}>
                {milestone}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ProgressSlide;
