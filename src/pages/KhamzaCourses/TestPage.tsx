import React from 'react';
import { Card, Typography, Button, Space, Alert } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', background: 'var(--background-color)', minHeight: '100vh' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={2}>Интеграция H5P Викторин</Title>
          <Paragraph>
            Раздел "Хамза курсы план Б" успешно интегрирован в сайдбар.
          </Paragraph>
          
          <Alert
            message="Информация об интеграции"
            description="H5P викторины теперь доступны в разделе 'Хамза курсы план Б'. Система включает в себя создание, редактирование и прохождение интерактивных викторин."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: '24px', textAlign: 'left' }}
          />
          
          <Space>
            <Button type="primary" size="large">
              Перейти к викторинам
            </Button>
            <Button size="large">
              Просмотреть статистику
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default TestPage;
