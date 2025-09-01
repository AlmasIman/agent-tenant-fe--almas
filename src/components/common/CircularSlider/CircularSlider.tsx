import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface CircularSliderProps {
  min: number;
  max: number;
  low: number;
  high: number;
  step?: number;
  handleSize?: number;
  arcLength?: number;
  startAngle?: number;
  onChange?: (event: { detail: { low?: number; high?: number } }) => void;
  onValueChanged?: (event: { detail: { low?: number; high?: number } }) => void;
}

const SliderContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SVG = styled.svg`
  transform: rotate(-90deg);
`;

const Track = styled.circle`
  fill: none;
  stroke: #def0ff;
  stroke-width: 22;
`;

const Progress = styled.circle`
  fill: none;
  stroke: var(--primary-color, #1890ff);
  stroke-width: 22;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
`;

const Handle = styled.circle<{ isDragging: boolean }>`
  fill: #fff;
  stroke: var(--primary-color, #1890ff);
  stroke-width: 2;
  cursor: ${(props) => (props.isDragging ? 'grabbing' : 'grab')};
  transition: r 0.2s ease;

  &:hover {
    r: 8;
  }
`;

const CircularSlider: React.FC<CircularSliderProps> = ({
  min = 0,
  max = 23,
  low,
  high,
  step = 1,
  handleSize = 12,
  arcLength = 360,
  startAngle = -90,
  onChange,
  onValueChanged,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'low' | 'high' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentLow, setCurrentLow] = useState(low);
  const [currentHigh, setCurrentHigh] = useState(high);

  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  useEffect(() => {
    setCurrentLow(low);
    setCurrentHigh(high);
  }, [low, high]);

  const angleToValue = (angle: number): number => {
    const normalizedAngle = (angle - startAngle + 360) % 360;
    const percentage = normalizedAngle / arcLength;
    return Math.round((min + (max - min) * percentage) / step) * step;
  };

  const valueToAngle = (value: number): number => {
    const percentage = (value - min) / (max - min);
    return startAngle + arcLength * percentage;
  };

  const getPointOnCircle = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
    };
  };

  const handleMouseDown = (e: React.MouseEvent, target: 'low' | 'high') => {
    setIsDragging(true);
    setDragTarget(target);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    const value = Math.max(min, Math.min(max, angleToValue(angle)));

    if (dragTarget === 'low') {
      const newLow = Math.min(value, currentHigh - step);
      setCurrentLow(newLow);
      onChange?.({ detail: { low: newLow } });
    } else if (dragTarget === 'high') {
      const newHigh = Math.max(value, currentLow + step);
      setCurrentHigh(newHigh);
      onChange?.({ detail: { high: newHigh } });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragTarget) {
      onValueChanged?.({
        detail: {
          [dragTarget]: dragTarget === 'low' ? currentLow : currentHigh,
        },
      });
    }
    setIsDragging(false);
    setDragTarget(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const lowAngle = valueToAngle(currentLow);
  const highAngle = valueToAngle(currentHigh);

  const lowPoint = getPointOnCircle(lowAngle);
  const highPoint = getPointOnCircle(highAngle);

  const circumference = 2 * Math.PI * radius;
  const progressLength = ((highAngle - lowAngle + 360) % 360) / 360;
  const dashArray = `${circumference * progressLength} ${circumference}`;

  return (
    <SliderContainer>
      <SVG ref={svgRef} width="200" height="200">
        <Track cx={centerX} cy={centerY} r={radius} />
        <Progress
          cx={centerX}
          cy={centerY}
          r={radius}
          strokeDasharray={dashArray}
          strokeDashoffset={(-circumference * (lowAngle - startAngle)) / 360}
        />
        <Handle
          cx={lowPoint.x}
          cy={lowPoint.y}
          r={handleSize}
          isDragging={isDragging && dragTarget === 'low'}
          onMouseDown={(e) => handleMouseDown(e, 'low')}
        />
        <Handle
          cx={highPoint.x}
          cy={highPoint.y}
          r={handleSize}
          isDragging={isDragging && dragTarget === 'high'}
          onMouseDown={(e) => handleMouseDown(e, 'high')}
        />
      </SVG>
    </SliderContainer>
  );
};

export default CircularSlider;
