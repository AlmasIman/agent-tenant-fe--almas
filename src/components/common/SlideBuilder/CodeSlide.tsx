import React from 'react';
import { Card, Typography } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface CodeSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const CodeSlide: React.FC<CodeSlideProps> = ({ slide, onComplete }) => {
  let code = '';
  let language = 'javascript';

  try {
    const parsedContent = JSON.parse(slide.content);
    code = parsedContent.code || slide.content || '';
    language = parsedContent.language || 'javascript';
  } catch {
    code = slide.content || '';
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
          background: '#1e1e1e',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'left',
          overflow: 'auto',
          maxHeight: '400px',
        }}
      >
        <div style={{ color: '#569cd6', marginBottom: '8px', fontSize: '14px' }}>
          {language}
        </div>
        <pre
          style={{
            color: '#d4d4d4',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {code}
        </pre>
      </div>
    </Card>
  );
};

export default CodeSlide;
