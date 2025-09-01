import React, { useState } from 'react';
import { Card, Button, Input, Space, Typography, message } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import PresentationViewer from '@app/components/common/PresentationViewer/PresentationViewer';

const { Title, Text } = Typography;

const PresentationViewerDemoPage: React.FC = () => {
  const [presentationId, setPresentationId] = useState<string>('23');
  const [showViewer, setShowViewer] = useState(false);

  const handleViewPresentation = () => {
    const id = parseInt(presentationId);
    if (isNaN(id) || id <= 0) {
      message.error('Введите корректный ID презентации');
      return;
    }
    setShowViewer(true);
  };

  return (
    <>
      <PageTitle>Демо просмотра презентации</PageTitle>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Инструкция:</Title>
            <ol>
              <li>Введите ID презентации (например, 23)</li>
              <li>Нажмите "Просмотреть презентацию"</li>
              <li>Используйте стрелки для навигации между слайдами</li>
              <li>Нажмите кнопку воспроизведения для автоматического переключения</li>
            </ol>
          </div>

          <Space>
            <Input
              placeholder="ID презентации"
              value={presentationId}
              onChange={(e) => setPresentationId(e.target.value)}
              style={{ width: '200px' }}
            />
            <Button type="primary" onClick={handleViewPresentation}>
              Просмотреть презентацию
            </Button>
          </Space>

          <Text type="secondary">
            Пример API запроса: GET /presentations/23
          </Text>
        </Space>
      </Card>

      {showViewer && (
        <PresentationViewer
          presentationId={parseInt(presentationId)}
          onClose={() => setShowViewer(false)}
          autoPlay={false}
          showControls={true}
        />
      )}
    </>
  );
};

export default PresentationViewerDemoPage;
