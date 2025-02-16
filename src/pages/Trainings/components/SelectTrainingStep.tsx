import React, { useState, useEffect, Key } from 'react';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { Typography } from 'antd';

interface SelectTrainingStepProps {
  trainingId: number;
  name: string;
  description: string;
}

const SelectTrainingStep: React.FC<SelectTrainingStepProps> = ({ name, description, trainingId }) => {
  return (
    <S.TablesWrapper>
      <S.Card title="Тренинг" padding="1.25rem 1.25rem 0">
        <Typography.Paragraph strong>{name}</Typography.Paragraph>
        <Typography.Paragraph>{description}</Typography.Paragraph>
      </S.Card>
    </S.TablesWrapper>
  );
};

export default SelectTrainingStep;
