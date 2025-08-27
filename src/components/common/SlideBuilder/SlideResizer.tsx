import React, { useState, useRef, useCallback } from 'react';
import { ResizeHandle } from '@dnd-kit/sortable';
import { Slide } from './types';

interface SlideResizerProps {
  slide: Slide;
  onResize: (slideId: string, newSettings: any) => void;
  children: React.ReactNode;
}

const SlideResizer: React.FC<SlideResizerProps> = ({ slide, onResize, children }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [currentSize, setCurrentSize] = useState({
    width: slide.settings.width || 800,
    height: slide.settings.height || 600,
  });
  const resizeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartSize({
      width: e.clientX,
      height: e.clientY,
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startSize.width;
    const deltaY = e.clientY - startSize.height;

    const newWidth = Math.max(300, currentSize.width + deltaX);
    const newHeight = Math.max(200, currentSize.height + deltaY);

    setCurrentSize({ width: newWidth, height: newHeight });
    setStartSize({ width: e.clientX, height: e.clientY });
  }, [isResizing, startSize, currentSize]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      onResize(slide.id, {
        ...slide.settings,
        width: currentSize.width,
        height: currentSize.height,
      });
    }
  }, [isResizing, slide.id, slide.settings, currentSize, onResize]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={resizeRef}
      style={{
        position: 'relative',
        width: currentSize.width,
        height: currentSize.height,
        border: isResizing ? '2px dashed #1890ff' : '1px solid #d9d9d9',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: isResizing ? 'nw-resize' : 'default',
      }}
    >
      {children}
      
      {/* Ручка для изменения размера */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          backgroundColor: '#1890ff',
          cursor: 'nw-resize',
          borderRadius: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderTop: '6px solid white',
            transform: 'rotate(45deg)',
          }}
        />
      </div>

      {/* Индикатор размера */}
      {isResizing && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          {Math.round(currentSize.width)} × {Math.round(currentSize.height)}
        </div>
      )}
    </div>
  );
};

export default SlideResizer;
