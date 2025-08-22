import React from 'react';
import { useTranslation } from 'react-i18next';
import { H5PQuizManager } from './H5PQuizManager';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const H5PQuizPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle>{t('quiz.quizManager')}</PageTitle>
      <H5PQuizManager />
    </>
  );
};

export default H5PQuizPage;
