import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { Key, DefaultRecordType } from 'rc-table/lib/interface';
import { TreeTableRow, Pagination, getTreeTableData } from 'api/table.api';
import { useTranslation } from 'react-i18next';
import { useMounted } from '@app/hooks/useMounted';

import * as S from '@app/components/tables/Tables/Tables.styles';
import { httpApi } from '@app/api/http.api';
import { Button, Modal } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, UserOutlined } from '@ant-design/icons';
import CreateUserDrawer from './components/CreateUserDrawer';
import { UserDataDetailed } from '../userManagementModels';
import { RootState } from '@app/store/store';
import { Link } from 'react-router-dom';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const UsersPage: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: UserDataDetailed[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<UserDataDetailed[]>([]);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { isMounted } = useMounted();
  const tenantId = useSelector((state: RootState) => state.user.user?.tenant_id);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<UserDataDetailed[]>('my/users/').then(({ data }) => {
        if (isMounted.current) {
          setTableData({ data: data, pagination: pagination, loading: false });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: Pagination) => {
    fetch(pagination);
  };

  const handleCreateDrawerOpen = () => setCreateDrawerOpen(true);
  const handleCreateDrawerClose = () => setCreateDrawerOpen(false);

  const handleCreate = async (newUser: UserDataDetailed) => {
    httpApi.post('my/users/', newUser).then(() => {
      fetch(initialPagination);
      handleCreateDrawerClose();
    });
  };

  const handleDeactivateSelected = () => {
    Modal.confirm({
      title: "Деактивировать выбранных пользователей?",
      icon: <ExclamationCircleOutlined />,
      content: `Вы действительно хотите деактивировать выбранных пользователей?`,
      okText: "Да, деактивировать",
      okType: "danger",
      cancelText: "Отмена",
      centered: true,
      onOk() {
        selectedRows.forEach(user => {
          httpApi.patch(`my/users/${user.id}/`, { is_active: false }).then(() => {
            fetch(initialPagination);
          });
        });
      },
      onCancel() {},
    });
  };

  const handleActivateSelected = () => {
    Modal.confirm({
      title: "Активировать выбранных пользователей?",
      icon: <ExclamationCircleOutlined />,
      content: `Вы действительно хотите активировать выбранных пользователей?`,
      okText: "Да, активировать",
      okType: "primary",
      cancelText: "Отмена",
      centered: true,
      onOk() {
        selectedRows.forEach(user => {
          httpApi.patch(`my/users/${user.id}/`, { is_active: true }).then(() => {
            fetch(initialPagination);
          });
        });
      },
      onCancel() {},
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      setSelectedRows(selectedRows as UserDataDetailed[]);
    },
  };

  const columns = [
    {
      title: 'ФИО',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string, record: any) => (
        <Link to={`/user-management/users/${record.id}`}>
          <UserOutlined style={{ marginRight: 8 }} />
          {text}
        </Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Логин',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Департамент',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: 'Должность',
      dataIndex: 'position_name',
      key: 'position_name',
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean) => (is_active ? 
        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <MinusCircleOutlined style={{ color: '#eb2f96' }}/>),
    }
  ];

  return (
    <>
      <PageTitle>Пользователи</PageTitle>
      <S.TablesWrapper>
        <S.Card id="users-table" title="Пользователи" padding="1.25rem 1.25rem 0">
        <S.ButtonsWrapper>
          <Button type="link" onClick={handleCreateDrawerOpen}>Зарегистрировать нового пользователя</Button>
          <Button type="link" danger onClick={handleDeactivateSelected} disabled={!selectedRows.length}>
            Деактивировать
          </Button>
          <Button type="link" onClick={handleActivateSelected} disabled={!selectedRows.length}>
            Активировать
          </Button>
        </S.ButtonsWrapper>
        <BaseTable
          columns={columns}
          dataSource={tableData.data}
          rowSelection={{ ...rowSelection }}
          pagination={tableData.pagination}
          loading={tableData.loading}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
        </S.Card>
      </S.TablesWrapper>

      <CreateUserDrawer
        open={createDrawerOpen}
        onClose={handleCreateDrawerClose}
        onCreate={handleCreate}
      />
    </>
  );
};

export default UsersPage;
