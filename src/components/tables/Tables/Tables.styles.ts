import styled from 'styled-components';
import { BaseCard as CommonCard } from '@app/components/common/BaseCard/BaseCard';

export const TablesWrapper = styled.div`
  margin-top: 1.875rem;
`;

export const Card = styled(CommonCard)`
  margin-bottom: 2rem;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  margin-top: -4rem;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;
