import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface CircularSliderProps {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  onValueChanged: (low: number, high: number) => void;
  step?: number;
  size?: number;
  thickness?: number;
}

interface Point {
  x: number;
  y: number;
}

const SliderContainer = styled.div<{ size: number }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
`;

const Track = styled.circle`
  fill: none;
  stroke: #def0ff;
  stroke-width: ${props => props.strokeWidth || 4};
`;

const Progress = styled.circle`
  fill: none;
  stroke: var(--primary-color);
  stroke-width: ${props => props.strokeWidth || 4};
  stroke-linecap: round;
  transition: stroke-dasharray 0.1s ease;
`;

const Handle = styled.circle<{ isDragging: boolean }>`
  fill: #fff;
  stroke: var(--primary-color);
  stroke-width: 2;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  transition: r 0.1s ease;
  
  &:hover {
    r: 8px;
  }
`;

export const CircularSlider: React.FC<CircularSliderProps> = ({
  min,
  max,
  low,
  high,
  onChange,
  onValueChanged,
  step = 1,
  size = 200,
  thickness = 4,
}) => {
  const [isDragging, setIsDragging] = useState<'low' | 'high' | null>(null);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const radius = (size - thickness) / 2;
  const center = size / 2;

  const valueToAngle = (value: number): number => {
    const normalizedValue = (value - min) / (max - min);
    return normalizedValue * 360 - 90; // Start from top (-90 degrees)
  };

  const angleToValue = (angle: number): number => {
    const normalizedAngle = ((angle + 90) % 360 + 360) % 360;
    const normalizedValue = normalizedAngle / 360;
    const value = normalizedValue * (max - min) + min;
    return Math.round(value / step) * step;
  };

  const getPointFromAngle = (angle: number): Point => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const getAngleFromPoint = (point: Point): number => {
    const dx = point.x - center;
    const dy = point.y - center;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    angle = (angle + 90) % 360;
    return angle < 0 ? angle + 360 : angle;
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'low' | 'high') => {
    e.preventDefault();
    setIsDragging(handle);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const angle = getAngleFromPoint(point);
      setDragStartAngle(angle);
      setDragStartValue(handle === 'low' ? low : high);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const angle = getAngleFromPoint(point);
    const newValue = angleToValue(angle);

    if (isDragging === 'low') {
      const clampedValue = Math.max(min, Math.min(high - step, newValue));
      onChange(clampedValue, high);
    } else {
      const clampedValue = Math.max(low + step, Math.min(max, newValue));
      onChange(low, clampedValue);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onValueChanged(low, high);
      setIsDragging(null);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, low, high]);

  const lowAngle = valueToAngle(low);
  const highAngle = valueToAngle(high);
  const lowPoint = getPointFromAngle(lowAngle);
  const highPoint = getPointFromAngle(highAngle);

  // Calculate arc path for progress
  const startAngle = Math.min(lowAngle, highAngle);
  const endAngle = Math.max(lowAngle, highAngle);
  const arcLength = endAngle - startAngle;

  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;
  
  const startX = center + radius * Math.cos(startRadians);
  const startY = center + radius * Math.sin(startRadians);
  const endX = center + radius * Math.cos(endRadians);
  const endY = center + radius * Math.sin(endRadians);

  const largeArcFlag = arcLength > 180 ? 1 : 0;

  const progressPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return (
    <SliderContainer size={size}>
      <SVG ref={svgRef} width={size} height={size}>
        {/* Background track */}
        <Track
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
        />
        
        {/* Progress arc */}
        <path
          d={progressPath}
          fill="none"
          stroke="var(--primary-color)"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        
        {/* Low handle */}
        <Handle
          cx={lowPoint.x}
          cy={lowPoint.y}
          r={6}
          isDragging={isDragging === 'low'}
          onMouseDown={(e) => handleMouseDown(e, 'low')}
        />
        
        {/* High handle */}
        <Handle
          cx={highPoint.x}
          cy={highPoint.y}
          r={6}
          isDragging={isDragging === 'high'}
          onMouseDown={(e) => handleMouseDown(e, 'high')}
        />
      </SVG>
    </SliderContainer>
  );
};
