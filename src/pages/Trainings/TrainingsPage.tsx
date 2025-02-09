import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@app/components/tables/Tables/Tables';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const TrainingsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle>Тренинги</PageTitle>
      <Tables />
    </>
  );
};

export default TrainingsPage;
