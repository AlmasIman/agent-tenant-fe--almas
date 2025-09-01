import React from 'react';
import { Card, Typography, Space, Tag, Badge } from 'antd';
import { EyeOutlined, BulbOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface FillWordsPreviewProps {
  text: string;
  hints: string;
}

const FillWordsPreview: React.FC<FillWordsPreviewProps> = ({ text, hints }) => {
  const renderPreview = () => {
    if (!text) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#8c8c8c',
          }}
        >
          <EyeOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
          <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>Введите текст с пропусками (используйте ___)</Text>
        </div>
      );
    }

    // Парсим подсказки
    const hintsMap = new Map();
    hints
      .split('\n')
      .filter((line) => line.trim())
      .forEach((line) => {
        const [word, hint] = line.split(':').map((s) => s.trim());
        if (word) {
          hintsMap.set(word, hint || '');
        }
      });

    // Находим все пропуски и заменяем их на поля
    const result = [];
    let lastIndex = 0;
    let blankIndex = 0;

    while (true) {
      const blankPos = text.indexOf('___', lastIndex);
      if (blankPos === -1) {
        result.push(text.slice(lastIndex));
        break;
      }

      // Добавляем текст до пропуска
      result.push(text.slice(lastIndex, blankPos));

      // Добавляем поле для пропуска
      const hintWords = Array.from(hintsMap.keys());
      const currentWord = hintWords[blankIndex] || 'слово';
      const hint = hintsMap.get(currentWord) || '';

      result.push(
        <span
          key={`blank-${blankIndex}`}
          style={{
            display: 'inline-block',
            margin: '0 6px',
            position: 'relative',
          }}
        >
          <Tag
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              borderRadius: '16px',
              border: '2px dashed #1890ff',
              backgroundColor: '#f0f8ff',
              color: '#1890ff',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.15)';
            }}
          >
            <span style={{ marginRight: '4px' }}>📝</span>
            {currentWord}
            {hint && (
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '12px',
                  opacity: 0.8,
                }}
              >
                💡 {hint}
              </span>
            )}
          </Tag>
        </span>,
      );

      lastIndex = blankPos + 3;
      blankIndex++;
    }

    return result;
  };

  const blankCount = text ? text.split('___').length - 1 : 0;
  const hintCount = hints ? hints.split('\n').filter((line) => line.trim()).length : 0;

  return (
    <Card
      size="small"
      title={
        <Space>
          <EyeOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: '600', color: '#262626' }}>Предварительный просмотр</span>
        </Space>
      }
      style={{
        marginTop: '16px',
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
      headStyle={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderBottom: '1px solid #f0f0f0',
        padding: '12px 16px',
      }}
      bodyStyle={{
        padding: '20px',
        background: 'white',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #f0f0f0',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Paragraph
          style={{
            fontSize: '16px',
            lineHeight: '2.2',
            margin: 0,
            textAlign: 'justify',
            color: '#2c3e50',
            fontWeight: '400',
          }}
        >
          {renderPreview()}
        </Paragraph>
      </div>

      {(blankCount > 0 || hintCount > 0) && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Badge
              count={blankCount}
              showZero
              style={{
                backgroundColor: blankCount > 0 ? '#52c41a' : '#d9d9d9',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                📝 Пропусков
              </span>
            </Badge>

            <Badge
              count={hintCount}
              showZero
              style={{
                backgroundColor: hintCount > 0 ? '#faad14' : '#d9d9d9',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                💡 Подсказок
              </span>
            </Badge>
          </div>

          {blankCount > 0 && hintCount > 0 && (
            <div
              style={{
                padding: '4px 12px',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              ✅ Готово к использованию
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default FillWordsPreview;
