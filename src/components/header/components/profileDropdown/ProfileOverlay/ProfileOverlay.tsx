import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store/store';
import * as S from './ProfileOverlay.styles';

export const ProfileOverlay: React.FC = ({ ...props }) => {
  const { t } = useTranslation();
  const userPortalUrl = useSelector((state: RootState) => state.user.user?.user_portal_url);

  return (
    <div {...props}>
      <S.Text>
        <Link to={userPortalUrl ?? '/'}>
          User портал
        </Link>
      </S.Text>
      <S.ItemsDivider />
      <S.Text>
        <Link to="/logout">Выйти</Link>
      </S.Text>
    </div>
  );
};
