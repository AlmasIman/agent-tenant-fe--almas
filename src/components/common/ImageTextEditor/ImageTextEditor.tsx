import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Input, Upload, Modal, Space, Typography, Slider, Select, Row, Col, Switch, InputNumber } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined, RotateLeftOutlined, RotateRightOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isDragging: boolean;
  rotation: number;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
  backgroundColor: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

interface ImageTextEditorProps {
  onSave?: (imageData: string, textElements: TextElement[]) => void;
  initialImageUrl?: string;
  initialTextElements?: TextElement[];
}

const EditorContainer = styled.div`
  display: flex;
  gap: 20px;
  height: 600px;
`;

const CanvasContainer = styled.div`
  flex: 1;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Canvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  cursor: crosshair;
`;

const ControlsPanel = styled.div`
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: 600px;
`;

const TextElement = styled.div<{
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isDragging: boolean;
  rotation: number;
  opacity: number;
  textAlign: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  shadow: any;
  stroke: any;
  backgroundColor: any;
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  font-family: ${props => props.fontFamily};
  cursor: move;
  user-select: none;
  padding: 4px;
  border: ${props => props.isDragging ? '2px solid #1890ff' : '2px solid transparent'};
  border-radius: 4px;
  background: ${props => props.isDragging ? 'rgba(24, 144, 255, 0.1)' : 'transparent'};
  z-index: 10;
  transform: rotate(${props => props.rotation}deg);
  opacity: ${props => props.opacity};
  text-align: ${props => props.textAlign};
  font-weight: ${props => props.fontWeight};
  font-style: ${props => props.fontStyle};
  text-decoration: ${props => props.textDecoration};
  text-shadow: ${props => props.shadow.enabled ? 
    `${props.shadow.offsetX}px ${props.shadow.offsetY}px ${props.shadow.blur}px ${props.shadow.color}` : 'none'};
  -webkit-text-stroke: ${props => props.stroke.enabled ? 
    `${props.stroke.width}px ${props.stroke.color}` : 'none'};
  background-color: ${props => props.backgroundColor.enabled ? 
    `${props.backgroundColor.color}${Math.round(props.backgroundColor.opacity * 255).toString(16).padStart(2, '0')}` : 'transparent'};
  
  &:hover {
    border: 2px solid #1890ff;
    background: rgba(24, 144, 255, 0.1);
  }
`;

const ImageTextEditor: React.FC<ImageTextEditorProps> = ({
  onSave,
  initialImageUrl,
  initialTextElements = []
}) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>(initialTextElements);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedText = textElements.find(el => el.id === selectedTextId);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleImageLoad = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        }
      }
    };
    img.src = url;
  }, []);

  const handleUrlSubmit = (url: string) => {
    setImageUrl(url);
    handleImageLoad(url);
  };

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    handleImageLoad(url);
    return false; // Prevent default upload
  };

  const addTextElement = () => {
    const newTextElement: TextElement = {
      id: generateId(),
      text: 'Новый текст',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      isDragging: false,
      rotation: 0,
      opacity: 1,
      textAlign: 'left',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      shadow: {
        enabled: false,
        color: '#000000',
        blur: 2,
        offsetX: 1,
        offsetY: 1
      },
      stroke: {
        enabled: false,
        color: '#ffffff',
        width: 1
      },
      backgroundColor: {
        enabled: false,
        color: '#ffffff',
        opacity: 0.5
      }
    };
    setTextElements(prev => [...prev, newTextElement]);
    setSelectedTextId(newTextElement.id);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, textId: string) => {
    const element = textElements.find(el => el.id === textId);
    if (element) {
      setIsDragging(true);
      setSelectedTextId(textId);
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      setDragOffset({ x: offsetX, y: offsetY });
      updateTextElement(textId, { isDragging: true });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectedTextId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      
      updateTextElement(selectedTextId, { x, y });
    }
  }, [isDragging, selectedTextId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && selectedTextId) {
      setIsDragging(false);
      updateTextElement(selectedTextId, { isDragging: false });
    }
  }, [isDragging, selectedTextId]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, element: TextElement) => {
    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.globalAlpha = element.opacity;
    ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
    ctx.textAlign = element.textAlign as CanvasTextAlign;
    ctx.textBaseline = 'top';

    // Draw background if enabled
    if (element.backgroundColor.enabled) {
      const textMetrics = ctx.measureText(element.text);
      const textWidth = textMetrics.width;
      const textHeight = element.fontSize;
      
      ctx.fillStyle = element.backgroundColor.color;
      ctx.globalAlpha = element.backgroundColor.opacity;
      ctx.fillRect(-textWidth / 2, 0, textWidth, textHeight);
      ctx.globalAlpha = element.opacity;
    }

    // Draw shadow if enabled
    if (element.shadow.enabled) {
      ctx.shadowColor = element.shadow.color;
      ctx.shadowBlur = element.shadow.blur;
      ctx.shadowOffsetX = element.shadow.offsetX;
      ctx.shadowOffsetY = element.shadow.offsetY;
    }

    // Draw stroke if enabled
    if (element.stroke.enabled) {
      ctx.strokeStyle = element.stroke.color;
      ctx.lineWidth = element.stroke.width;
      ctx.strokeText(element.text, 0, 0);
    }

    // Draw main text
    ctx.fillStyle = element.color;
    ctx.fillText(element.text, 0, 0);

    // Draw text decoration
    if (element.textDecoration === 'underline' || element.textDecoration === 'line-through') {
      const textWidth = ctx.measureText(element.text).width;
      ctx.strokeStyle = element.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      if (element.textDecoration === 'underline') {
        ctx.moveTo(-textWidth / 2, element.fontSize + 2);
        ctx.lineTo(textWidth / 2, element.fontSize + 2);
      } else {
        ctx.moveTo(-textWidth / 2, element.fontSize / 2);
        ctx.lineTo(textWidth / 2, element.fontSize / 2);
      }
      
      ctx.stroke();
    }

    ctx.restore();
  };

  const exportImage = () => {
    if (canvasRef.current && imageUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          textElements.forEach(element => {
            drawTextOnCanvas(ctx, element);
          });
          
          const dataUrl = canvas.toDataURL('image/png');
          onSave?.(dataUrl, textElements);
        };
        img.src = imageUrl;
      }
    }
  };

  const downloadImage = () => {
    if (canvasRef.current && imageUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          textElements.forEach(element => {
            drawTextOnCanvas(ctx, element);
          });
          
          const link = document.createElement('a');
          link.download = 'image-with-text.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = imageUrl;
      }
    }
  };

  const rotateText = (direction: 'left' | 'right') => {
    if (selectedTextId) {
      const currentRotation = selectedText?.rotation || 0;
      const newRotation = direction === 'left' ? currentRotation - 15 : currentRotation + 15;
      updateTextElement(selectedTextId, { rotation: newRotation });
    }
  };

  return (
    <Card title="Редактор изображений с текстом">
      <EditorContainer>
        <CanvasContainer 
          ref={containerRef}
          onMouseMove={handleMouseMove}
        >
          {imageUrl ? (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Background"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              {textElements.map(element => (
                <TextElement
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  fontSize={element.fontSize}
                  color={element.color}
                  fontFamily={element.fontFamily}
                  isDragging={element.isDragging}
                  rotation={element.rotation}
                  opacity={element.opacity}
                  textAlign={element.textAlign}
                  fontWeight={element.fontWeight}
                  fontStyle={element.fontStyle}
                  textDecoration={element.textDecoration}
                  shadow={element.shadow}
                  stroke={element.stroke}
                  backgroundColor={element.backgroundColor}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={() => setSelectedTextId(element.id)}
                >
                  {element.text}
                </TextElement>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <UploadOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>Загрузите изображение для начала работы</div>
            </div>
          )}
        </CanvasContainer>

        <ControlsPanel>
          <div>
            <Title level={5}>Загрузка изображения</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Введите URL изображения"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onPressEnter={(e) => handleUrlSubmit((e.target as HTMLInputElement).value)}
              />
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} block>
                  Загрузить с компьютера
                </Button>
              </Upload>
            </Space>
          </div>

          <div>
            <Title level={5}>Текстовые элементы</Title>
            <Button 
              icon={<PlusOutlined />} 
              onClick={addTextElement}
              block
              style={{ marginBottom: 16 }}
            >
              Добавить текст
            </Button>

            {textElements.map(element => (
              <Card 
                key={element.id} 
                size="small" 
                style={{ 
                  marginBottom: 8,
                  border: selectedTextId === element.id ? '2px solid #1890ff' : undefined
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    value={element.text}
                    onChange={(e) => updateTextElement(element.id, { text: e.target.value })}
                    rows={2}
                  />
                  
                  <Row gutter={8}>
                    <Col span={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Input
                          type="color"
                          value={element.color}
                          onChange={(e) => updateTextElement(element.id, { color: e.target.value })}
                          style={{ width: '40px', height: '32px', padding: '2px' }}
                        />
                        <Text>Цвет</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Select
                        value={element.fontSize}
                        onChange={(size) => updateTextElement(element.id, { fontSize: size })}
                        style={{ width: '100%' }}
                      >
                        <Option value={12}>12px</Option>
                        <Option value={16}>16px</Option>
                        <Option value={20}>20px</Option>
                        <Option value={24}>24px</Option>
                        <Option value={32}>32px</Option>
                        <Option value={48}>48px</Option>
                        <Option value={64}>64px</Option>
                        <Option value={96}>96px</Option>
                      </Select>
                    </Col>
                  </Row>

                  <Select
                    value={element.fontFamily}
                    onChange={(font) => updateTextElement(element.id, { fontFamily: font })}
                    style={{ width: '100%' }}
                  >
                    <Option value="Arial, sans-serif">Arial</Option>
                    <Option value="Times New Roman, serif">Times New Roman</Option>
                    <Option value="Courier New, monospace">Courier New</Option>
                    <Option value="Georgia, serif">Georgia</Option>
                    <Option value="Verdana, sans-serif">Verdana</Option>
                    <Option value="Impact, sans-serif">Impact</Option>
                    <Option value="Comic Sans MS, cursive">Comic Sans MS</Option>
                  </Select>

                  <Row gutter={8}>
                    <Col span={8}>
                      <Select
                        value={element.textAlign}
                        onChange={(align) => updateTextElement(element.id, { textAlign: align })}
                        style={{ width: '100%' }}
                      >
                        <Option value="left">По левому краю</Option>
                        <Option value="center">По центру</Option>
                        <Option value="right">По правому краю</Option>
                      </Select>
                    </Col>
                    <Col span={8}>
                      <Button
                        icon={<RotateLeftOutlined />}
                        size="small"
                        onClick={() => rotateText('left')}
                        disabled={selectedTextId !== element.id}
                      />
                    </Col>
                    <Col span={8}>
                      <Button
                        icon={<RotateRightOutlined />}
                        size="small"
                        onClick={() => rotateText('right')}
                        disabled={selectedTextId !== element.id}
                      />
                    </Col>
                  </Row>

                  <Row gutter={8}>
                    <Col span={12}>
                      <Switch
                        checked={element.fontWeight === 'bold'}
                        onChange={(checked) => updateTextElement(element.id, { fontWeight: checked ? 'bold' : 'normal' })}
                      />
                      <Text style={{ marginLeft: 8 }}>Жирный</Text>
                    </Col>
                    <Col span={12}>
                      <Switch
                        checked={element.fontStyle === 'italic'}
                        onChange={(checked) => updateTextElement(element.id, { fontStyle: checked ? 'italic' : 'normal' })}
                      />
                      <Text style={{ marginLeft: 8 }}>Курсив</Text>
                    </Col>
                  </Row>

                  <Select
                    value={element.textDecoration}
                    onChange={(decoration) => updateTextElement(element.id, { textDecoration: decoration })}
                    style={{ width: '100%' }}
                  >
                    <Option value="none">Без подчеркивания</Option>
                    <Option value="underline">Подчеркнутый</Option>
                    <Option value="line-through">Зачеркнутый</Option>
                  </Select>

                  {/* Shadow Settings */}
                  <Card size="small" title="Тень">
                    <Row gutter={8}>
                      <Col span={12}>
                        <Switch
                          checked={element.shadow.enabled}
                          onChange={(checked) => updateTextElement(element.id, { 
                            shadow: { ...element.shadow, enabled: checked }
                          })}
                        />
                        <Text style={{ marginLeft: 8 }}>Включить</Text>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Input
                            type="color"
                            value={element.shadow.color}
                            onChange={(e) => updateTextElement(element.id, { 
                              shadow: { ...element.shadow, color: e.target.value }
                            })}
                            disabled={!element.shadow.enabled}
                            style={{ width: '40px', height: '32px', padding: '2px' }}
                          />
                          <Text>Цвет тени</Text>
                        </div>
                      </Col>
                    </Row>
                    {element.shadow.enabled && (
                      <>
                        <div>
                          <Text>Размытие: {element.shadow.blur}px</Text>
                          <Slider
                            min={0}
                            max={20}
                            value={element.shadow.blur}
                            onChange={(value) => updateTextElement(element.id, { 
                              shadow: { ...element.shadow, blur: value }
                            })}
                          />
                        </div>
                        <Row gutter={8}>
                          <Col span={12}>
                            <Text>X: {element.shadow.offsetX}px</Text>
                            <Slider
                              min={-20}
                              max={20}
                              value={element.shadow.offsetX}
                              onChange={(value) => updateTextElement(element.id, { 
                                shadow: { ...element.shadow, offsetX: value }
                              })}
                            />
                          </Col>
                          <Col span={12}>
                            <Text>Y: {element.shadow.offsetY}px</Text>
                            <Slider
                              min={-20}
                              max={20}
                              value={element.shadow.offsetY}
                              onChange={(value) => updateTextElement(element.id, { 
                                shadow: { ...element.shadow, offsetY: value }
                              })}
                            />
                          </Col>
                        </Row>
                      </>
                    )}
                  </Card>

                  {/* Stroke Settings */}
                  <Card size="small" title="Обводка">
                    <Row gutter={8}>
                      <Col span={12}>
                        <Switch
                          checked={element.stroke.enabled}
                          onChange={(checked) => updateTextElement(element.id, { 
                            stroke: { ...element.stroke, enabled: checked }
                          })}
                        />
                        <Text style={{ marginLeft: 8 }}>Включить</Text>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Input
                            type="color"
                            value={element.stroke.color}
                            onChange={(e) => updateTextElement(element.id, { 
                              stroke: { ...element.stroke, color: e.target.value }
                            })}
                            disabled={!element.stroke.enabled}
                            style={{ width: '40px', height: '32px', padding: '2px' }}
                          />
                          <Text>Цвет обводки</Text>
                        </div>
                      </Col>
                    </Row>
                    {element.stroke.enabled && (
                      <div>
                        <Text>Толщина: {element.stroke.width}px</Text>
                        <Slider
                          min={1}
                          max={10}
                          value={element.stroke.width}
                          onChange={(value) => updateTextElement(element.id, { 
                            stroke: { ...element.stroke, width: value }
                          })}
                        />
                      </div>
                    )}
                  </Card>

                  {/* Background Settings */}
                  <Card size="small" title="Фон">
                    <Row gutter={8}>
                      <Col span={12}>
                        <Switch
                          checked={element.backgroundColor.enabled}
                          onChange={(checked) => updateTextElement(element.id, { 
                            backgroundColor: { ...element.backgroundColor, enabled: checked }
                          })}
                        />
                        <Text style={{ marginLeft: 8 }}>Включить</Text>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Input
                            type="color"
                            value={element.backgroundColor.color}
                            onChange={(e) => updateTextElement(element.id, { 
                              backgroundColor: { ...element.backgroundColor, color: e.target.value }
                            })}
                            disabled={!element.backgroundColor.enabled}
                            style={{ width: '40px', height: '32px', padding: '2px' }}
                          />
                          <Text>Цвет фона</Text>
                        </div>
                      </Col>
                    </Row>
                    {element.backgroundColor.enabled && (
                      <div>
                        <Text>Прозрачность: {Math.round(element.backgroundColor.opacity * 100)}%</Text>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={element.backgroundColor.opacity}
                          onChange={(value) => updateTextElement(element.id, { 
                            backgroundColor: { ...element.backgroundColor, opacity: value }
                          })}
                        />
                      </div>
                    )}
                  </Card>

                  <div>
                    <Text>Прозрачность: {Math.round(element.opacity * 100)}%</Text>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={element.opacity}
                      onChange={(value) => updateTextElement(element.id, { opacity: value })}
                    />
                  </div>

                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    size="small"
                    onClick={() => deleteTextElement(element.id)}
                    block
                  >
                    Удалить
                  </Button>
                </Space>
              </Card>
            ))}
          </div>

          <div>
            <Title level={5}>Экспорт</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={downloadImage}
                block
                disabled={!imageUrl}
              >
                Скачать изображение
              </Button>
              <Button 
                onClick={exportImage}
                block
                disabled={!imageUrl}
              >
                Сохранить
              </Button>
            </Space>
          </div>
        </ControlsPanel>
      </EditorContainer>
    </Card>
  );
};

export default ImageTextEditor;
