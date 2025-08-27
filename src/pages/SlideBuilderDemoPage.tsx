import React, { useState } from 'react';
import { Card, Button, Space, Typography, message } from 'antd';
import { PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { SlideBuilder, Slide, SlideType, SlidePresentation } from '@app/components/common/SlideBuilder';

const { Title, Paragraph } = Typography;

const SlideBuilderDemoPage: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      type: SlideType.TEXT,
      title: 'Добро пожаловать в курс',
      content: '<h2>Добро пожаловать!</h2><p>Это первый слайд нашего курса. Здесь вы можете добавить любой текстовый контент.</p>',
      order: 0,
      settings: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: 16,
        alignment: 'center',
        showTitle: true,
        showNumber: true,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: '2',
      type: SlideType.GAME,
      title: 'Игра "Память"',
      content: JSON.stringify({
        game: {
          type: 'memory',
          config: {},
          rewards: 100
        }
      }),
      order: 1,
      settings: {
        backgroundColor: '#f0f8ff',
        showTitle: true,
        showNumber: true,
        width: 600,
        height: 500,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: '3',
      type: SlideType.ACHIEVEMENT,
      title: 'Достижение разблокировано!',
      content: JSON.stringify({
        achievement: {
          title: 'Первые шаги',
          description: 'Вы успешно завершили первый модуль курса',
          icon: '🏆',
          points: 50,
          unlocked: true
        }
      }),
      order: 2,
      settings: {
        backgroundColor: '#fff7e6',
        showTitle: true,
        showNumber: true,
        alignment: 'center',
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: '4',
      type: SlideType.PROGRESS,
      title: 'Ваш прогресс',
      content: JSON.stringify({
        progress: {
          current: 3,
          total: 10,
          milestones: ['25%', '50%', '75%', '100%'],
          rewards: ['Бейдж новичка', 'Сертификат', 'Доступ к продвинутым курсам']
        }
      }),
      order: 3,
      settings: {
        backgroundColor: '#f6ffed',
        showTitle: true,
        showNumber: true,
        alignment: 'center',
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ]);

  const [isPresentationVisible, setIsPresentationVisible] = useState(false);

  const handleSlidesChange = (newSlides: Slide[]) => {
    setSlides(newSlides);
    message.success(`Обновлено слайдов: ${newSlides.length}`);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(slides, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'slides-export.json';
    link.click();
    URL.revokeObjectURL(url);
    message.success('Слайды экспортированы');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSlides = JSON.parse(e.target?.result as string);
          setSlides(importedSlides);
          message.success('Слайды импортированы');
        } catch (error) {
          message.error('Ошибка при импорте файла');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStartPresentation = () => {
    if (slides.length === 0) {
      message.warning('Создайте хотя бы один слайд для запуска презентации');
      return;
    }
    setIsPresentationVisible(true);
  };

  const handleQuickPreview = () => {
    if (slides.length === 0) {
      message.warning('Создайте хотя бы один слайд для просмотра');
      return;
    }
    setIsPresentationVisible(true);
  };

  return (
    <>
      <PageTitle>Демонстрация конструктора слайдов</PageTitle>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3}>Конструктор слайдов для курсов</Title>
              <Paragraph>
                Создавайте интерактивные слайды с различными типами контента: текст, изображения, видео, код, графики, викторины и встраивания.
              </Paragraph>
            </div>
            <Space>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={handleStartPresentation}
                disabled={slides.length === 0}
              >
                Запустить презентацию
              </Button>
              <Button 
                type="default" 
                icon={<EyeOutlined />} 
                onClick={handleQuickPreview}
                disabled={slides.length === 0}
              >
                Быстрый просмотр
              </Button>
              <Button onClick={handleExport}>
                Экспорт слайдов
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-slides"
              />
              <Button onClick={() => document.getElementById('import-slides')?.click()}>
                Импорт слайдов
              </Button>
            </Space>
          </div>

          <SlideBuilder
            slides={slides}
            onSlidesChange={handleSlidesChange}
            readOnly={false}
          />
        </Space>
      </Card>

      <SlidePresentation
        slides={slides}
        visible={isPresentationVisible}
        onClose={() => setIsPresentationVisible(false)}
      />
    </>
  );
};

export default SlideBuilderDemoPage;
