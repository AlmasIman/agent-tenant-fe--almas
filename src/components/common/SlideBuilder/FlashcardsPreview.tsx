import React from 'react';
import { Card, Typography, Space, Tag, Badge } from 'antd';
import { EyeOutlined, BookOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface FlashcardsPreviewProps {
  content: string;
}

const FlashcardsPreview: React.FC<FlashcardsPreviewProps> = ({ content }) => {
  const parseCards = () => {
    if (!content) return [];

    return content
      .split('\n')
      .filter((line) => line.trim() && line.includes('|'))
      .map((line, index) => {
        const parts = line.split('|').map((part) => part.trim());
        return {
          id: (index + 1).toString(),
          front: parts[0] || '',
          back: parts[1] || '',
          category: parts[2] || 'Общее',
          difficulty: parts[3] || 'Легко',
        };
      });
  };

  const cards = parseCards();
  const categories = [...new Set(cards.map((card) => card.category))];
  const difficulties = [...new Set(cards.map((card) => card.difficulty))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'легко':
      case 'easy':
        return '#52c41a';
      case 'средне':
      case 'medium':
        return '#faad14';
      case 'сложно':
      case 'hard':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  const renderPreview = () => {
    if (!content) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#8c8c8c',
          }}
        >
          <BookOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
          <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
            Введите карточки в формате: Вопрос | Ответ | Категория | Сложность
          </Text>
        </div>
      );
    }

    if (cards.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#faad14',
          }}
        >
          <Text style={{ fontSize: '14px', color: '#faad14' }}>
            Неверный формат. Используйте разделитель "|" между полями
          </Text>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cards.slice(0, 3).map((card, index) => (
          <div
            key={card.id}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {index + 1}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: '#262626',
                  fontSize: '14px',
                }}
              >
                {card.front}
              </div>
              <div
                style={{
                  color: '#666',
                  fontSize: '12px',
                  fontStyle: 'italic',
                }}
              >
                {card.back}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <Tag
                style={{
                  borderRadius: '12px',
                  fontSize: '10px',
                  padding: '2px 6px',
                  margin: 0,
                }}
              >
                {card.category}
              </Tag>
              <Tag
                style={{
                  borderRadius: '12px',
                  fontSize: '10px',
                  padding: '2px 6px',
                  margin: 0,
                  backgroundColor: getDifficultyColor(card.difficulty),
                  color: 'white',
                  border: 'none',
                }}
              >
                {card.difficulty}
              </Tag>
            </div>
          </div>
        ))}

        {cards.length > 3 && (
          <div
            style={{
              textAlign: 'center',
              padding: '8px',
              background: '#f0f0f0',
              borderRadius: '8px',
              color: '#666',
              fontSize: '12px',
            }}
          >
            ... и еще {cards.length - 3} карточек
          </div>
        )}
      </div>
    );
  };

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
        }}
      >
        {renderPreview()}
      </div>

      {cards.length > 0 && (
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
              count={cards.length}
              showZero
              style={{
                backgroundColor: cards.length > 0 ? '#52c41a' : '#d9d9d9',
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
                📚 Карточек
              </span>
            </Badge>

            <Badge
              count={categories.length}
              showZero
              style={{
                backgroundColor: categories.length > 0 ? '#faad14' : '#d9d9d9',
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
                🏷️ Категорий
              </span>
            </Badge>
          </div>

          {cards.length > 0 && (
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

export default FlashcardsPreview;
