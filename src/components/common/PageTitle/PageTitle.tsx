import { WithChildrenProps } from '@app/types/generalTypes';
import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PageTitle: React.FC<WithChildrenProps> = ({ children }) => {
  // Убеждаемся, что children - это строка
  const titleText = typeof children === 'string' ? children : String(children || '');
  
  return (
    <Helmet>
      <title>{titleText} | Aigent admin портал</title>
    </Helmet>
  );
};
