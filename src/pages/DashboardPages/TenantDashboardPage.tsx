import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { MapCard } from '@app/components/medical-dashboard/mapCard/MapCard';
import { ScreeningsCard } from '@app/components/medical-dashboard/screeningsCard/ScreeningsCard/ScreeningsCard';
import { ActivityCard } from '@app/components/medical-dashboard/activityCard/ActivityCard';
import { TreatmentCard } from '@app/components/medical-dashboard/treatmentCard/TreatmentCard';
import { CovidCard } from '@app/components/medical-dashboard/covidCard/CovidCard';
import { HealthCard } from '@app/components/medical-dashboard/HealthCard/HealthCard';
import { FavoritesDoctorsCard } from '@app/components/medical-dashboard/favoriteDoctors/FavoriteDoctorsCard/FavoritesDoctorsCard';
import { PatientResultsCard } from '@app/components/medical-dashboard/PatientResultsCard/PatientResultsCard';
import { StatisticsCards } from '@app/components/medical-dashboard/statisticsCards/StatisticsCards';
import { BloodScreeningCard } from '@app/components/medical-dashboard/bloodScreeningCard/BloodScreeningCard/BloodScreeningCard';
import { NewsCard } from '@app/components/medical-dashboard/NewsCard/NewsCard';
import { References } from '@app/components/common/References/References';
import { useResponsive } from '@app/hooks/useResponsive';
import { httpApi } from '@app/api/http.api';
import { DepartmentData } from '../UserManagement/userManagementModels';
import * as S from './DashboardPage.styles';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';

const TenantDashboardPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();
  const { t } = useTranslation();

  const [departmentCount, setDepartmentCount] = useState<number>(0);

  useEffect(() => {
    httpApi.get<DepartmentData[]>('my/departments/').then(({ data }) => {
      setDepartmentCount(data.length);
    });
  }, []);

  const desktopLayout = (
    <BaseRow>
      <S.LeftSideCol xl={16} xxl={17}>
        <BaseRow gutter={[30, 30]}>
          <BaseCol span={24}>
            <BaseRow gutter={[30, 30]}>
              <StatisticsCards />
            </BaseRow>
          </BaseCol>

          <BaseCol id="treatment-plan" xl={24}>
            <TreatmentCard />
          </BaseCol>

          <BaseCol id="activity" xl={24} xxl={12}>
            <ActivityCard />
          </BaseCol>

          <BaseCol id="news" span={24}>
            <NewsCard />
          </BaseCol>
        </BaseRow>
        <References />
      </S.LeftSideCol>

      <S.RightSideCol xl={8} xxl={7}>
        <S.Space />
        <S.ScrollWrapper id="patient-timeline">
          <PatientResultsCard />
        </S.ScrollWrapper>
      </S.RightSideCol>
    </BaseRow>
  );

  const mobileAndTabletLayout = (
    <BaseRow gutter={[20, 20]}>
      <StatisticsCards />

      <BaseCol id="activity" xs={24} md={12} order={(isTablet && 8) || 0}>
        <ActivityCard />
      </BaseCol>

      <BaseCol id="news" xs={24} md={24} order={(isTablet && 14) || 0}>
        <NewsCard />
      </BaseCol>
    </BaseRow>
  );

  return (
    <>
      <PageTitle>Моя компания</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};

export default TenantDashboardPage;
