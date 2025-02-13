import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';
import { UserDataDetailed } from '../userManagementModels';
import { Spin, Card, Descriptions, Tag } from 'antd';
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { RootState } from '@app/store/store';

const UserItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDataDetailed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUserId = useSelector((state: RootState) => state.user.user?.id);

  useEffect(() => {
    if (id) {
      httpApi.get<UserDataDetailed>(`my/users/${id}/`).then(({ data }) => {
        setUser(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <Spin />;
  }

  return (
    <>
      <PageTitle>Информация о пользователе</PageTitle>
      <Card>
        <Descriptions title="Информация о пользователе">
          <Descriptions.Item label="ФИО">{user?.full_name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Логин">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="Департамент">{user?.department_name}</Descriptions.Item>
          <Descriptions.Item label="Должность">{user?.position_name}</Descriptions.Item>
          <Descriptions.Item label="Статус">
            {user?.is_active ? "Активен" : "Неактивен"}
          </Descriptions.Item>
          <Descriptions.Item label="Роли">
            {user?.id === currentUserId ? <Tag color="blue">Администратор</Tag> : ''}
            <Tag color="green">Пользователь</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Дата регистрации">
            {user?.date_joined ? new Date(user.date_joined).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Последняя активность">
            {user?.last_login ? new Date(user.last_login).toLocaleString() : 'еще не входил в систему'}
          </Descriptions.Item>
          <Descriptions.Item label="Группы">
            {user?.groups.map((group: string) => {
                return (<Tag>{group}</Tag>);
            })}
          </Descriptions.Item>

        </Descriptions>
      </Card>

      <Card style={{ marginTop: '20px' }}>
        <Descriptions title="Тренинги"></Descriptions>
      </Card>

      <Card style={{ marginTop: '20px' }}>
        <Descriptions title="Доступ к базам знаний"></Descriptions>
      </Card>
    </>
  );
};

export default UserItemPage;
