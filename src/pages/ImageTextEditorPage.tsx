import React, { useState } from 'react';
import { Card, Space, Button, message } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import ImageTextEditor from '@app/components/common/ImageTextEditor/ImageTextEditor';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isDragging: boolean;
}

const ImageTextEditorPage: React.FC = () => {
  const [savedImageData, setSavedImageData] = useState<string>('');
  const [savedTextElements, setSavedTextElements] = useState<TextElement[]>([]);

  const handleSave = (imageData: string, textElements: TextElement[]) => {
    setSavedImageData(imageData);
    setSavedTextElements(textElements);
    message.success('Изображение успешно сохранено!');
  };

  return (
    <>
      <PageTitle>Редактор изображений с текстом</PageTitle>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <ImageTextEditor 
          onSave={handleSave}
          initialImageUrl="https://picsum.photos/800/600"
        />
        
        {savedImageData && (
          <Card title="Сохраненное изображение">
            <Space direction="vertical" style={{ width: '100%' }}>
              <img 
                src={savedImageData} 
                alt="Saved" 
                style={{ maxWidth: '100%', border: '1px solid #d9d9d9', borderRadius: '8px' }}
              />
              <div>
                <h4>Текстовые элементы:</h4>
                <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
                  {JSON.stringify(savedTextElements, null, 2)}
                </pre>
              </div>
            </Space>
          </Card>
        )}
      </Space>
    </>
  );
};

export default ImageTextEditorPage;
