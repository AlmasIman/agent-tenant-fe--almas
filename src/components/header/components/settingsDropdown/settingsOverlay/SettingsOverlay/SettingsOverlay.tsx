import React from 'react';
import { ThemePicker } from '../ThemePicker/ThemePicker';
import * as S from './SettingsOverlay.styles';
import { Link } from 'react-router-dom';

export const SettingsOverlay: React.FC = ({ ...props }) => {

  return (
    <S.SettingsOverlayMenu {...props}>
      <S.Text>
        <ThemePicker />
      </S.Text>
      <S.ItemsDivider />
      <S.Text>
        <Link to="/settings">Настройки</Link>
      </S.Text>
    </S.SettingsOverlayMenu>
  );
};
