import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

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

interface ImageDragDropQuestionProps {
  imageUrl: string;
  dropZones: DropZone[];
  draggableItems: DraggableItem[];
  onAnswerChange: (answers: Record<string, string>) => void;
  currentAnswer?: Record<string, string>;
  isAnswered?: boolean;
  showFeedback?: boolean;
}

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
`;

const DropZoneStyled = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
  isHighlighted: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
}>`
  position: absolute;
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border: 2px dashed
    ${(props) => {
      if (props.isCorrect) return '#52c41a';
      if (props.isIncorrect) return '#ff4d4f';
      if (props.isHighlighted) return '#1890ff';
      return '#d9d9d9';
    }};
  border-radius: 4px;
  background-color: ${(props) => {
    if (props.isCorrect) return 'rgba(82, 196, 26, 0.1)';
    if (props.isIncorrect) return 'rgba(255, 77, 79, 0.1)';
    if (props.isHighlighted) return 'rgba(24, 144, 255, 0.1)';
    return 'transparent';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => {
      if (props.isCorrect || props.isIncorrect) return props.backgroundColor;
      return 'rgba(24, 144, 255, 0.2)';
    }};
  }
`;

const DropZoneLabel = styled.div<{
  isCorrect: boolean;
  isIncorrect: boolean;
}>`
  font-size: 12px;
  font-weight: bold;
  color: ${(props) => {
    if (props.isCorrect) return '#52c41a';
    if (props.isIncorrect) return '#ff4d4f';
    return '#666';
  }};
  text-align: center;
  padding: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  pointer-events: none;
`;

const DraggableItemStyled = styled.div<{
  isDragging: boolean;
  isPlaced: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
}>`
  padding: 8px 12px;
  margin: 4px;
  background-color: ${(props) => {
    if (props.isCorrect) return '#f6ffed';
    if (props.isIncorrect) return '#fff2f0';
    if (props.isPlaced) return '#f0f8ff';
    return '#1890ff';
  }};
  color: ${(props) => {
    if (props.isCorrect) return '#52c41a';
    if (props.isIncorrect) return '#ff4d4f';
    if (props.isPlaced) return '#1890ff';
    return 'white';
  }};
  border: 2px solid
    ${(props) => {
      if (props.isCorrect) return '#52c41a';
      if (props.isIncorrect) return '#ff4d4f';
      if (props.isPlaced) return '#1890ff';
      return '#1890ff';
    }};
  border-radius: 6px;
  cursor: ${(props) => (props.isDragging ? 'grabbing' : 'grab')};
  user-select: none;
  font-weight: 500;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.isPlaced ? 0.6 : 1)};

  &:hover {
    transform: ${(props) => (props.isDragging ? 'none' : 'translateY(-2px)')};
    box-shadow: ${(props) => (props.isDragging ? 'none' : '0 4px 8px rgba(0,0,0,0.1)')};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PlacedItem = styled.div<{
  x: number;
  y: number;
  isCorrect: boolean;
  isIncorrect: boolean;
}>`
  position: absolute;
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  transform: translate(-50%, -50%);
  padding: 6px 10px;
  background-color: ${(props) => {
    if (props.isCorrect) return '#f6ffed';
    if (props.isIncorrect) return '#fff2f0';
    return '#f0f8ff';
  }};
  color: ${(props) => {
    if (props.isCorrect) return '#52c41a';
    if (props.isIncorrect) return '#ff4d4f';
    return '#1890ff';
  }};
  border: 2px solid
    ${(props) => {
      if (props.isCorrect) return '#52c41a';
      if (props.isIncorrect) return '#ff4d4f';
      return '#1890ff';
    }};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
`;

const ImageDragDropQuestion: React.FC<ImageDragDropQuestionProps> = ({
  imageUrl,
  dropZones,
  draggableItems,
  onAnswerChange,
  currentAnswer = {},
  isAnswered = false,
  showFeedback = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [placedItems, setPlacedItems] =
    useState<Record<string, { item: DraggableItem; zoneId: string }>>(currentAnswer);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: DraggableItem) => {
    setIsDragging(true);
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setHighlightedZone(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleZoneDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHighlightedZone(zoneId);
  }, []);

  const handleZoneDragLeave = useCallback(() => {
    setHighlightedZone(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      const item = draggableItems.find((di) => di.id === itemId);

      if (item) {
        const newPlacedItems = { ...placedItems, [itemId]: { item, zoneId } };
        setPlacedItems(newPlacedItems);

        // Преобразуем в формат для onAnswerChange
        const answers: Record<string, string> = {};
        Object.entries(newPlacedItems).forEach(([itemId, { zoneId }]) => {
          answers[itemId] = zoneId;
        });

        onAnswerChange(answers);
      }

      setIsDragging(false);
      setDraggedItem(null);
      setHighlightedZone(null);
    },
    [placedItems, draggableItems, onAnswerChange],
  );

  const handleZoneClick = useCallback(
    (zoneId: string) => {
      if (draggedItem) {
        const newPlacedItems = { ...placedItems, [draggedItem.id]: { item: draggedItem, zoneId } };
        setPlacedItems(newPlacedItems);

        const answers: Record<string, string> = {};
        Object.entries(newPlacedItems).forEach(([itemId, { zoneId }]) => {
          answers[itemId] = zoneId;
        });

        onAnswerChange(answers);
        setIsDragging(false);
        setDraggedItem(null);
        setHighlightedZone(null);
      }
    },
    [draggedItem, placedItems, onAnswerChange],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const newPlacedItems = { ...placedItems };
      delete newPlacedItems[itemId];
      setPlacedItems(newPlacedItems);

      const answers: Record<string, string> = {};
      Object.entries(newPlacedItems).forEach(([itemId, { zoneId }]) => {
        answers[itemId] = zoneId;
      });

      onAnswerChange(answers);
    },
    [placedItems, onAnswerChange],
  );

  const handleReset = useCallback(() => {
    setPlacedItems({});
    onAnswerChange({});
  }, [onAnswerChange]);

  const isItemCorrect = (itemId: string, zoneId: string) => {
    const item = draggableItems.find((di) => di.id === itemId);
    return item?.correctZoneId === zoneId;
  };

  const getAvailableItems = () => {
    const placedItemIds = Object.keys(placedItems);
    return draggableItems.filter((item) => !placedItemIds.includes(item.id));
  };

  return (
    <div>
      <ImageContainer>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Question"
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
          draggable={false}
        />

        {/* Drop zones */}
        {dropZones.map((zone) => (
          <DropZoneStyled
            key={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            isHighlighted={highlightedZone === zone.id}
            isCorrect={
              showFeedback &&
              Object.entries(placedItems).some(
                ([itemId, { zoneId }]) => zoneId === zone.id && isItemCorrect(itemId, zoneId),
              )
            }
            isIncorrect={
              showFeedback &&
              Object.entries(placedItems).some(
                ([itemId, { zoneId }]) => zoneId === zone.id && !isItemCorrect(itemId, zoneId),
              )
            }
            onDragOver={(e) => handleZoneDragOver(e, zone.id)}
            onDragLeave={handleZoneDragLeave}
            onDrop={(e) => handleDrop(e, zone.id)}
            onClick={() => handleZoneClick(zone.id)}
          >
            {zone.label && (
              <DropZoneLabel
                isCorrect={
                  showFeedback &&
                  Object.entries(placedItems).some(
                    ([itemId, { zoneId }]) => zoneId === zone.id && isItemCorrect(itemId, zoneId),
                  )
                }
                isIncorrect={
                  showFeedback &&
                  Object.entries(placedItems).some(
                    ([itemId, { zoneId }]) => zoneId === zone.id && !isItemCorrect(itemId, zoneId),
                  )
                }
              >
                {zone.label}
              </DropZoneLabel>
            )}
          </DropZoneStyled>
        ))}

        {/* Placed items */}
        {Object.entries(placedItems).map(([itemId, { item, zoneId }]) => {
          const zone = dropZones.find((z) => z.id === zoneId);
          if (!zone) return null;

          return (
            <PlacedItem
              key={itemId}
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2}
              isCorrect={showFeedback && isItemCorrect(itemId, zoneId)}
              isIncorrect={showFeedback && !isItemCorrect(itemId, zoneId)}
            >
              {item.text}
              {!isAnswered && (
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(itemId);
                  }}
                  style={{ marginLeft: 4, padding: 0, minWidth: 'auto' }}
                />
              )}
            </PlacedItem>
          );
        })}
      </ImageContainer>

      {/* Available items */}
      <Card title="Доступные элементы" style={{ marginBottom: 16 }}>
        <Space wrap>
          {getAvailableItems().map((item) => (
            <DraggableItemStyled
              key={item.id}
              isDragging={isDragging && draggedItem?.id === item.id}
              isPlaced={false}
              isCorrect={false}
              isIncorrect={false}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
            >
              {item.text}
            </DraggableItemStyled>
          ))}
        </Space>
      </Card>

      {/* Controls */}
      <Space>
        <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={Object.keys(placedItems).length === 0}>
          Сбросить
        </Button>

        {showFeedback && (
          <div style={{ marginTop: 16 }}>
            <Space>
              {Object.entries(placedItems).map(([itemId, { item, zoneId }]) => {
                const isCorrect = isItemCorrect(itemId, zoneId);
                return (
                  <span key={itemId} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isCorrect ? (
                      <CheckOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <span style={{ color: isCorrect ? '#52c41a' : '#ff4d4f' }}>{item.text}</span>
                  </span>
                );
              })}
            </Space>
          </div>
        )}
      </Space>
    </div>
  );
};

export default ImageDragDropQuestion;
