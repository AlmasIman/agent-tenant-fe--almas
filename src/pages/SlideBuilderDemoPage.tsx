import React, { useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import SlideBuilder from '@app/components/common/SlideBuilder/SlideBuilder';
import { Slide, SlideType } from '@app/components/common/SlideBuilder/types';

const SlideBuilderDemoPage: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Демо слайд с изображением и текстом',
      type: SlideType.IMAGE,
      content: 'https://picsum.photos/800/600',
      order: 0,
      settings: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: 16,
        alignment: 'center',
        padding: 16,
        showTitle: true,
        showNumber: true,
        borderRadius: 8,
        shadow: true,
        border: false,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ]);

  const handleSlidesChange = (updatedSlides: Slide[]) => {
    setSlides(updatedSlides);
    message.success('Слайды сохранены!');
  };

  return (
    <>
      <PageTitle>Демо SlideBuilder с ImageTextEditor</PageTitle>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3>Инструкция:</h3>
            <ol>
              <li>Нажмите "Редактировать слайды"</li>
              <li>Выберите слайд типа "Изображение"</li>
              <li>Нажмите "Открыть редактор изображений"</li>
              <li>Загрузите изображение по URL или с компьютера</li>
              <li>Добавьте текст и настройте его стили</li>
              <li>Сохраните изменения</li>
            </ol>
          </div>
          
          <SlideBuilder 
            slides={slides}
            onSlidesChange={handleSlidesChange}
          />
        </Space>
      </Card>
    </>
  );
};

export default SlideBuilderDemoPage;
