import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@app/components/tables/Tables/Tables';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const KbArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle>База знаний</PageTitle>
      <Tables />
    </>
  );
};

export default KbArticlesPage;
