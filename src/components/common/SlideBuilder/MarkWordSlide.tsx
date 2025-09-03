import React, { useMemo, useState } from 'react';
import { Card, Typography, Tag } from 'antd';
import { Slide } from './types';

const { Title, Paragraph } = Typography;

interface MarkWordSlideProps {
  slide: Slide;
}

const splitWords = (text: string): string[] => {
  return text
    .replace(/\n/g, ' \n ')
    .split(/(\s+)/)
    .filter((token) => token.length > 0);
};

const normalize = (s: string): string => s.replace(/[.,;:!?]/g, '').trim();

const MarkWordSlide: React.FC<MarkWordSlideProps> = ({ slide }) => {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(slide.content || '{}');
    } catch {
      return {} as any;
    }
  }, [slide.content]);

  const text: string = parsed?.text || parsed?.markWord?.text || '';
  const correctWords: string[] = Array.isArray(parsed?.correctWords)
    ? parsed.correctWords
    : Array.isArray(parsed?.markWord?.correctWords)
    ? parsed.markWord.correctWords
    : [];

  const tokens = useMemo(() => splitWords(text), [text]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) => setSelected((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const isCorrect = (token: string): boolean => {
    const norm = normalize(token);
    if (!norm) return false;
    return correctWords.map(normalize).includes(norm);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'left' }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Click the various types of berries mentioned in the text below!
        </Title>
      </div>

      <Card style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <Paragraph style={{ fontSize: 16, lineHeight: 2, margin: 0 }}>
          {tokens.map((tk, idx) => {
            if (tk === '\n') return <br key={`br-${idx}`} />;
            const space = tk.match(/^\s+$/);
            if (space) return <span key={`sp-${idx}`}>{tk}</span>;
            const active = !!selected[idx];
            const correct = isCorrect(tk);
            const color = active ? (correct ? '#1677ff' : '#d9d9d9') : 'transparent';
            const textColor = active ? (correct ? '#1677ff' : '#595959') : '#262626';
            return (
              <span
                key={idx}
                onClick={() => toggle(idx)}
                style={{
                  display: 'inline-block',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  margin: '2px 2px',
                  borderRadius: 6,
                  border: `2px solid ${active ? color : '#91caff'}`,
                  color: textColor,
                }}
              >
                {tk}
              </span>
            );
          })}
        </Paragraph>
      </Card>

      <div>
        <Tag color="blue">Правильных слов: {correctWords.length}</Tag>
      </div>
    </div>
  );
};

export default MarkWordSlide;
