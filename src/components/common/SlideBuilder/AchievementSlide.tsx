import React, { useState, useEffect } from 'react';
import { Card, Typography, Badge, Progress } from 'antd';
import { TrophyOutlined, StarOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AchievementSlideProps {
  slide: any;
}

const AchievementSlide: React.FC<AchievementSlideProps> = ({ slide }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setShowConfetti(true);
    
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const achievement = slide.content ? JSON.parse(slide.content).achievement : {
    title: 'Достижение',
    description: 'Описание достижения',
    icon: '🏆',
    points: 100,
    unlocked: true
  };

  const renderConfetti = () => {
    if (!showConfetti) return null;

    const confetti = [];
    for (let i = 0; i < 50; i++) {
      confetti.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '8px',
            height: '8px',
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)],
            borderRadius: '50%',
            animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
            zIndex: 1000,
          }}
        />
      );
    }
    return confetti;
  };

  return (
    <div style={{ 
      position: 'relative', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {renderConfetti()}
      
      <Card
        style={{
          textAlign: 'center',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.5s ease-in-out',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '2px solid #faad14',
          borderRadius: '16px',
        }}
      >
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '20px',
          animation: showConfetti ? 'bounce 1s ease-in-out infinite' : 'none',
        }}>
          {achievement.icon}
        </div>

        <Badge.Ribbon 
          text="НОВОЕ!" 
          color="gold"
          style={{ 
            fontSize: '12px',
            opacity: showConfetti ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <Title level={2} style={{ marginBottom: '16px', color: '#faad14' }}>
            {achievement.title}
          </Title>
        </Badge.Ribbon>

        <Text style={{ 
          fontSize: '16px', 
          color: '#666',
          display: 'block',
          marginBottom: '24px',
        }}>
          {achievement.description}
        </Text>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}>
          <FireOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
            +{achievement.points} очков
          </Text>
        </div>

        <Progress 
          percent={100} 
          showInfo={false}
          strokeColor={{
            '0%': '#faad14',
            '100%': '#ff4d4f',
          }}
          style={{ marginBottom: '20px' }}
        />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px',
          marginTop: '20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
            <br />
            <Text type="secondary">Редкое достижение</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: '24px', color: '#faad14' }} />
            <br />
            <Text type="secondary">Разблокировано</Text>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementSlide;
