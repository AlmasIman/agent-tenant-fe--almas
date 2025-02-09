import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@app/components/tables/Tables/Tables';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle>Пользователи</PageTitle>
      <Tables />
    </>
  );
};

export default UsersPage;
