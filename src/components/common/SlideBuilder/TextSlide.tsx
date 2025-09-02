import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { Slide } from './types';

const { Title, Paragraph, Text } = Typography;

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

  return (
    <div className="slide-container">
      <div className="slide-content">
        <div className="slide-title-section">
          <Title level={2} className="slide-title">
            {slide.title}
          </Title>
          <Divider className="slide-divider" />
        </div>

        <div className="slide-text-content">
          <div className="slide-text" dangerouslySetInnerHTML={{ __html: content }} />
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
            border: none;
            padding: 40px;
          }

          .slide-content {
            padding: 0;
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

          .slide-text-content {
            max-width: 100%;
          }

          .slide-text {
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            text-align: left;
          }

          .slide-text h1,
          .slide-text h2,
          .slide-text h3,
          .slide-text h4,
          .slide-text h5,
          .slide-text h6 {
            color: #1e293b;
            font-weight: 600;
            margin: 24px 0 12px 0;
          }

          .slide-text h1 { font-size: 24px; }
          .slide-text h2 { font-size: 20px; }
          .slide-text h3 { font-size: 18px; }
          .slide-text h4 { font-size: 16px; }
          .slide-text h5 { font-size: 14px; }
          .slide-text h6 { font-size: 12px; }

          .slide-text p {
            margin: 0 0 16px 0;
            color: #374151;
          }

          .slide-text ul,
          .slide-text ol {
            margin: 16px 0;
            padding-left: 24px;
          }

          .slide-text li {
            margin: 8px 0;
            color: #374151;
          }

          .slide-text blockquote {
            margin: 24px 0;
            padding: 16px 20px;
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            border-radius: 0 6px 6px 0;
            font-style: italic;
            color: #475569;
          }

          .slide-text code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            color: #1e293b;
          }

          .slide-text pre {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            border: none;
            margin: 16px 0;
          }

          .slide-text pre code {
            background: none;
            padding: 0;
            color: #1e293b;
          }

          .slide-text a {
            color: #3b82f6;
            text-decoration: none;
          }

          .slide-text a:hover {
            text-decoration: underline;
          }

          .slide-text strong {
            font-weight: 600;
            color: #1e293b;
          }

          .slide-text em {
            font-style: italic;
            color: #475569;
          }

          @media (max-width: 768px) {
            .slide-content {
              padding: 24px 20px;
            }

            .slide-title {
              font-size: 24px !important;
            }

            .slide-text {
              font-size: 15px;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default TextSlide;
