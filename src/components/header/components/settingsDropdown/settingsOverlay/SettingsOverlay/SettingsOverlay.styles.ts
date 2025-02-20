import { BaseRadio } from '@app/components/common/BaseRadio/BaseRadio';
import styled from 'styled-components';
import { media } from '@app/styles/themes/constants';
import { BaseTypography } from '@app/components/common/BaseTypography/BaseTypography';
import { BaseDivider } from '@app/components/common/BaseDivider/BaseDivider';

export const Text = styled(BaseTypography.Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  font-size: 0.875rem;
  font-weight: 600;

  & > a {
    display: block;
  }

  @media only screen and ${media.md} {
    font-size: 1rem;
  }
`;

export const ItemsDivider = styled(BaseDivider)`
  margin: 0;
`;

export const SettingsOverlayMenu = styled.div`
  width: 8rem;
`;

export const RadioBtn = styled(BaseRadio)`
  font-size: 0.875rem;
`;

export const PwaInstallWrapper = styled.div`
  padding: 0 1rem 0.75rem;
`;
