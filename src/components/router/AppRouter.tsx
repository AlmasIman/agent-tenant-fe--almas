import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(() => import('@app/components/layouts/AuthLayout/AuthLayout'));
import LoginPage from '@app/pages/LoginPage';
import SignUpPage from '@app/pages/SignUpPage';
import ForgotPasswordPage from '@app/pages/ForgotPasswordPage';
import SecurityCodePage from '@app/pages/SecurityCodePage';
import NewPasswordPage from '@app/pages/NewPasswordPage';
import LockPage from '@app/pages/LockPage';

import MainLayout from '@app/components/layouts/main/MainLayout/MainLayout';
import ProfileLayout from '@app/components/profile/ProfileLayout';
import RequireAuth from '@app/components/router/RequireAuth';
import { withLoading } from '@app/hocs/withLoading.hoc';
import TenantDashboardPage from '@app/pages/DashboardPages/TenantDashboardPage';
import UsersPage from '@app/pages/UserManagement/Users/UsersPage';
import GroupsPage from '@app/pages/UserManagement/Groups/GroupsPage';
import DepartmentsPage from '@app/pages/UserManagement/Departments/DepartmentsPage';
import TrainingsPage from '@app/pages/Trainings/TrainingsPage';
import KbArticlesPage from '@app/pages/Kb/KbArticlesPage';
import GroupItemPage from '@app/pages/UserManagement/Groups/GroupItemPage';
import UserItemPage from '@app/pages/UserManagement/Users/UserItemPage';

const ServerErrorPage = React.lazy(() => import('@app/pages/ServerErrorPage'));
const Error404Page = React.lazy(() => import('@app/pages/Error404Page'));
const PersonalInfoPage = React.lazy(() => import('@app/pages/PersonalInfoPage'));
const SecuritySettingsPage = React.lazy(() => import('@app/pages/SecuritySettingsPage'));
const NotificationsPage = React.lazy(() => import('@app/pages/NotificationsPage'));
const PaymentsPage = React.lazy(() => import('@app/pages/PaymentsPage'));
const Logout = React.lazy(() => import('./Logout'));

export const TENANT_DASHBOARD_PATH = '/';

const TenantDashboard = withLoading(TenantDashboardPage);

const ServerError = withLoading(ServerErrorPage);
const Error404 = withLoading(Error404Page);

// Profile
const PersonalInfo = withLoading(PersonalInfoPage);
const SecuritySettings = withLoading(SecuritySettingsPage);
const Notifications = withLoading(NotificationsPage);
const Payments = withLoading(PaymentsPage);

const AuthLayoutFallback = withLoading(AuthLayout);
const LogoutFallback = withLoading(Logout);

export const AppRouter: React.FC = () => {
  const protectedLayout = (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path={TENANT_DASHBOARD_PATH} element={protectedLayout}>
          <Route index element={<TenantDashboard />} />
          <Route path="overview" element={<TenantDashboard />} />
          <Route path="user-management">
            <Route path="users" >
              <Route index element={<UsersPage />} />
              <Route path=":id" element={<UserItemPage />} />
            </Route>
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="groups">
              <Route index element={<GroupsPage />} />
              <Route path=":id" element={<GroupItemPage />} />
            </Route>
          </Route>
          <Route path="trainings">
            <Route path="" element={<TrainingsPage />} />
          </Route>
          <Route path="kb">
            <Route path="" element={<KbArticlesPage />} />
          </Route>
          <Route path="setttings">
            
          </Route>
          <Route path="server-error" element={<ServerError />} />
          <Route path="404" element={<Error404 />} />
          <Route path="profile" element={<ProfileLayout />}>
            <Route path="personal-info" element={<PersonalInfo />} />
            <Route path="security-settings" element={<SecuritySettings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Route>
        <Route path="/auth" element={<AuthLayoutFallback />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="sign-up" element={<SignUpPage />} />
          <Route
            path="lock"
            element={
              <RequireAuth>
                <LockPage />
              </RequireAuth>
            }
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="security-code" element={<SecurityCodePage />} />
          <Route path="new-password" element={<NewPasswordPage />} />
        </Route>
        <Route path="/logout" element={<LogoutFallback />} />
      </Routes>
    </BrowserRouter>
  );
};
