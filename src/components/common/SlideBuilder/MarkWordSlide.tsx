import React, { useMemo, useState } from 'react';
import { Card, Typography, Tag, Button, Space } from 'antd';
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
  const [checked, setChecked] = useState<boolean>(false);

  const toggle = (idx: number) => {
    if (checked) return;
    setSelected((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isCorrect = (token: string): boolean => {
    const norm = normalize(token);
    if (!norm) return false;
    return correctWords.map(normalize).includes(norm);
  };

  const correctSelectedCount = useMemo(() => {
    return Object.entries(selected).reduce((acc, [i, on]) => {
      if (!on) return acc;
      const token = tokens[Number(i)] || '';
      return acc + (isCorrect(token) ? 1 : 0);
    }, 0);
  }, [selected, tokens]);

  const totalCorrect = correctWords.length;

  const handleCheck = () => setChecked(true);
  const handleReset = () => {
    setSelected({});
    setChecked(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'left' }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Отметьте правильные слова в тексте ниже
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
            let borderColor = '#91caff';
            let textColor = '#262626';
            if (active && !checked) {
              borderColor = '#1677ff';
              textColor = '#1677ff';
            }
            if (checked) {
              if (active && correct) {
                borderColor = '#52c41a';
                textColor = '#52c41a';
              } else if (active && !correct) {
                borderColor = '#ff4d4f';
                textColor = '#ff4d4f';
              } else if (!active && correct) {
                borderColor = '#faad14';
              }
            }
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
                  border: `2px solid ${borderColor}`,
                  color: textColor,
                }}
              >
                {tk}
              </span>
            );
          })}
        </Paragraph>
      </Card>

      <Space align="center" style={{ justifyContent: 'center' }}>
        {!checked ? (
          <Button type="primary" onClick={handleCheck}>Проверить</Button>
        ) : (
          <Button onClick={handleReset}>Попробовать снова</Button>
        )}
        <Tag color={checked ? (correctSelectedCount === totalCorrect ? 'green' : 'orange') : 'blue'}>
          Правильных слов: {totalCorrect}
        </Tag>
      </Space>
    </div>
  );
};

export default MarkWordSlide;
