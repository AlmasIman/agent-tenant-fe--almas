import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';
import { GroupData, UserData } from '../userManagementModels';
import { Spin, Card, Descriptions, Button, Modal } from 'antd';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { Pagination } from '@app/api/table.api';
import { useMounted } from '@app/hooks/useMounted';
import AddUserDrawer from './components/AddUserDrawer';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const GroupItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<{ data: UserData[]; pagination: Pagination; loading: boolean }>({
      data: [],
      pagination: initialPagination,
      loading: false,
    });
  const [selectedRows, setSelectedRows] = useState<UserData[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const handleAddDrawerOpen = () => setAddDrawerOpen(true);
  const handleAddDrawerClose = () => setAddDrawerOpen(false);
  
  const handleDeleteSelected = () => {
    Modal.confirm({
      title: "Удалить выбранные записи?",
      icon: <ExclamationCircleOutlined />,
      content: `Вы действительно хотите удалить выбранные записи?`,
      okText: "Да, удалить",
      okType: "danger",
      cancelText: "Отмена",
      centered: true,
      onOk() {
        selectedRows.forEach(user => {
          httpApi.delete(`my/user-groups/${id}/users/${user.id}/`).then(() => {
            fetchTableData(initialPagination);
          });
        });
      },
      onCancel() {
      },
    });
  }

  const handleAddSelected = (users: UserData[]) => {
    const existingUserIds = new Set(tableData.data.map(user => user.id));
    const newUsers = users.filter(user => !existingUserIds.has(user.id));

    newUsers.forEach(user => {
      httpApi.post(`my/user-groups/${id}/users/`, { user_id: user.id }).then(() => {
        fetchTableData(initialPagination);
      });
    });
  }

  const { isMounted } = useMounted();
  
  const fetchTableData = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<UserData[]>(`my/user-groups/${id}/users/`).then(({ data }) => {
        if (isMounted.current) {
          setTableData({ data: data, pagination: pagination, loading: false });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    if (id) {
      httpApi.get<GroupData>(`my/user-groups/${id}/`).then(({ data }) => {
        setGroup(data);
        setLoading(false);
      });

      fetchTableData(initialPagination);
    }
  }, [id]);


  const handleTableChange = (pagination: Pagination) => {
      fetchTableData(pagination);
  };

  if (loading) {
    return <Spin />;
  }

  const columns = [
    {
      title: 'ФИО',
      dataIndex: 'full_name',
      key: 'full_name'
    },
    {
      title: 'Статус',
      dataIndex: 'status_name',
      key: 'status_name',
    },
    {
      title: 'Департамент',
      dataIndex: 'department_name',
      key: 'department_name',
    }
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: UserData[]) => {
      setSelectedRows(selectedRows);
    },
  };

  return (
    <>
      <PageTitle>Группа</PageTitle>
      <Card>
        <Descriptions title="Группа">
          <Descriptions.Item>{group?.name}</Descriptions.Item>
        </Descriptions>
        {/* <Button type="primary" onClick={() => alert('clicked')}>Редактировать название</Button> */}
      </Card>

      <S.TablesWrapper>
        <S.Card title="Пользователи" padding="1.25rem 1.25rem 0">
        <S.ButtonsWrapper>
          <Button type="primary" onClick={handleAddDrawerOpen}>Добавить пользователей</Button>
          <Button type="default" danger onClick={handleDeleteSelected} disabled={!selectedRows.length}>
            Удалить
          </Button>
        </S.ButtonsWrapper>
        <BaseTable
          columns={columns}
          dataSource={tableData.data}
          pagination={tableData.pagination}
          loading={tableData.loading}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          scroll={{ x: 800 }}
        />
        </S.Card>
      </S.TablesWrapper>

      <AddUserDrawer
        open={addDrawerOpen}
        onClose={handleAddDrawerClose}
        onAddSelected={handleAddSelected}
      />
      
    </>
  );
};

export default GroupItemPage;