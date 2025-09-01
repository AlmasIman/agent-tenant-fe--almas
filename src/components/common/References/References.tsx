import React from 'react';
import * as S from './References.styles';
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';

export const References: React.FC = () => {
  return (
    <S.ReferencesWrapper>
      <S.Text>
        Команда{' '}
        <a href="https://aigent.kz" target="_blank" rel="noreferrer">
          A<sup>i</sup>gent{' '}
        </a>
        &copy; 2025. Мы улучшаем.
      </S.Text>
      <S.Icons>
        <a href="https://twitter.com/aigent_team" target="_blank" rel="noreferrer">
          <TwitterOutlined />
        </a>
        <a href="https://instagram.com/aigent_team" target="_blank" rel="noreferrer">
          <InstagramOutlined />
        </a>
        <a href="https://www.facebook.com/groups/aigent_team" target="_blank" rel="noreferrer">
          <FacebookOutlined />
        </a>
        <a href="https://linkedin.com/company/aigent_team" target="_blank" rel="noreferrer">
          <LinkedinOutlined />
        </a>
      </S.Icons>
    </S.ReferencesWrapper>
  );
};
