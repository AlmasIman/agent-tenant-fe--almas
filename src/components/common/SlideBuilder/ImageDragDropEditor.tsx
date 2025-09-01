import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Input, InputNumber, Form, Row, Col, Typography, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  correctItems: string[];
}

interface DraggableItem {
  id: string;
  text: string;
  correctZoneId: string;
}

interface ImageDragDropEditorProps {
  imageUrl: string;
  dropZones: DropZone[];
  draggableItems: DraggableItem[];
  onSave: (dropZones: DropZone[], draggableItems: DraggableItem[]) => void;
  onCancel: () => void;
}

const ImageDragDropEditor: React.FC<ImageDragDropEditorProps> = ({
  imageUrl,
  dropZones: initialDropZones,
  draggableItems: initialDraggableItems,
  onSave,
  onCancel,
}) => {
  const [dropZones, setDropZones] = useState<DropZone[]>(initialDropZones);
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>(initialDraggableItems);

  const addDropZone = () => {
    const newZone: DropZone = {
      id: `zone_${Date.now()}`,
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      label: `Зона ${dropZones.length + 1}`,
      correctItems: [],
    };
    setDropZones([...dropZones, newZone]);
  };

  const removeDropZone = (id: string) => {
    setDropZones(dropZones.filter((zone) => zone.id !== id));
    // Удаляем ссылки на эту зону из элементов
    setDraggableItems(
      draggableItems.map((item) => (item.correctZoneId === id ? { ...item, correctZoneId: '' } : item)),
    );
  };

  const updateDropZone = (id: string, field: keyof DropZone, value: any) => {
    setDropZones(dropZones.map((zone) => (zone.id === id ? { ...zone, [field]: value } : zone)));
  };

  const addDraggableItem = () => {
    const newItem: DraggableItem = {
      id: `item_${Date.now()}`,
      text: `Элемент ${draggableItems.length + 1}`,
      correctZoneId: '',
    };
    setDraggableItems([...draggableItems, newItem]);
  };

  const removeDraggableItem = (id: string) => {
    setDraggableItems(draggableItems.filter((item) => item.id !== id));
  };

  const updateDraggableItem = (id: string, field: keyof DraggableItem, value: any) => {
    setDraggableItems(draggableItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSave = () => {
    // Проверяем, что все элементы имеют правильные зоны
    const itemsWithoutZones = draggableItems.filter((item) => !item.correctZoneId);
    if (itemsWithoutZones.length > 0) {
      message.warning('Некоторые элементы не имеют назначенных зон');
    }

    onSave(dropZones, draggableItems);
    message.success('Конфигурация сохранена!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Редактор Drag and Drop</Title>

      {/* Предварительный просмотр изображения */}
      <Card title="Изображение" style={{ marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
            }}
          />
        </div>
      </Card>

      <Row gutter={16}>
        {/* Зоны для перетаскивания */}
        <Col span={12}>
          <Card
            title="Зоны для перетаскивания"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={addDropZone}>
                Добавить зону
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {dropZones.map((zone, index) => (
                <Card key={zone.id} size="small" style={{ border: '1px solid #d9d9d9' }}>
                  <Row gutter={8}>
                    <Col span={24}>
                      <Text strong>Зона {index + 1}</Text>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeDropZone(zone.id)}
                        style={{ float: 'right' }}
                      />
                    </Col>
                  </Row>

                  <Row gutter={8} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                      <Text>X (%):</Text>
                      <InputNumber
                        value={zone.x}
                        onChange={(value) => updateDropZone(zone.id, 'x', value)}
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Text>Y (%):</Text>
                      <InputNumber
                        value={zone.y}
                        onChange={(value) => updateDropZone(zone.id, 'y', value)}
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Row>

                  <Row gutter={8} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                      <Text>Ширина:</Text>
                      <InputNumber
                        value={zone.width}
                        onChange={(value) => updateDropZone(zone.id, 'width', value)}
                        min={20}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Text>Высота:</Text>
                      <InputNumber
                        value={zone.height}
                        onChange={(value) => updateDropZone(zone.id, 'height', value)}
                        min={20}
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Row>

                  <Row style={{ marginTop: '8px' }}>
                    <Col span={24}>
                      <Text>Подпись:</Text>
                      <Input
                        value={zone.label}
                        onChange={(e) => updateDropZone(zone.id, 'label', e.target.value)}
                        placeholder="Подпись зоны"
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Перетаскиваемые элементы */}
        <Col span={12}>
          <Card
            title="Перетаскиваемые элементы"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={addDraggableItem}>
                Добавить элемент
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {draggableItems.map((item, index) => (
                <Card key={item.id} size="small" style={{ border: '1px solid #d9d9d9' }}>
                  <Row gutter={8}>
                    <Col span={24}>
                      <Text strong>Элемент {index + 1}</Text>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeDraggableItem(item.id)}
                        style={{ float: 'right' }}
                      />
                    </Col>
                  </Row>

                  <Row style={{ marginTop: '8px' }}>
                    <Col span={24}>
                      <Text>Текст:</Text>
                      <Input
                        value={item.text}
                        onChange={(e) => updateDraggableItem(item.id, 'text', e.target.value)}
                        placeholder="Текст элемента"
                      />
                    </Col>
                  </Row>

                  <Row style={{ marginTop: '8px' }}>
                    <Col span={24}>
                      <Text>Правильная зона:</Text>
                      <select
                        value={item.correctZoneId}
                        onChange={(e) => updateDraggableItem(item.id, 'correctZoneId', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #d9d9d9',
                        }}
                      >
                        <option value="">Выберите зону</option>
                        {dropZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.label || `Зона ${zone.id}`}
                          </option>
                        ))}
                      </select>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Кнопки управления */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Space>
          <Button onClick={onCancel}>Отмена</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Сохранить конфигурацию
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ImageDragDropEditor;
