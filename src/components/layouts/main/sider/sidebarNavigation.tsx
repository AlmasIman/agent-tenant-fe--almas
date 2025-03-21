import React from 'react';
import { TeamOutlined, ReadOutlined, PieChartOutlined, FileDoneOutlined } from '@ant-design/icons';

export interface SidebarNavigationItem {
  title: string;
  key: string;
  url?: string;
  children?: SidebarNavigationItem[];
  icon?: React.ReactNode;
}

export const sidebarNavigation: SidebarNavigationItem[] = [
  {
    title: 'Моя компания',
    key: 'overview',
    url: '/overview',
    icon: <PieChartOutlined />,
  },
  {
    title: 'Пользователи',
    key: 'user-management',
    icon: <TeamOutlined />,
    children: [
      {
        title: 'Все пользователи',
        key: 'users',
        url: '/user-management/users',
      },
      {
        title: 'Департаменты',
        key: 'departments',
        url: '/user-management/departments',
      },
      {
        title: 'Группы',
        key: 'groups',
        url: '/user-management/groups',
      },
    ],
  },
  {
    title: 'Тренинги',
    key: 'trainings',
    url: '/trainings',
    icon: <FileDoneOutlined />,
  },
  {
    title: 'База знаний',
    key: 'kb',
    url: '/kb',
    icon: <ReadOutlined />,
  },
];
