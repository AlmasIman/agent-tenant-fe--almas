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
import CreateGroupDrawer from './components/CreateGroupDrawer';
import { Link } from 'react-router-dom';
import { TeamOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { GroupData } from '../components/userManagementModels';
import { RootState } from '@app/store/store';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const GroupsListPage: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: GroupData[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<GroupData[]>([]);
  const { t } = useTranslation();
  const { isMounted } = useMounted();
  const tenantId = useSelector((state: RootState) => state.user.user?.tenant_id);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<GroupData[]>('my/user-groups/').then(({ data }) => {
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

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const handleCreateDrawerOpen = () => setCreateDrawerOpen(true);
  const handleCreateNewClose = () => setCreateDrawerOpen(false);
  
  const handleCreate = (name: string) => {
    if (tenantId) {
      httpApi.post<GroupData[]>('my/user-groups/', { name: name, tenant: tenantId }).then(({ data }) => {
        fetch(initialPagination);
      });
    }
  }

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: "Удалить выбранные группы?",
      icon: <ExclamationCircleOutlined />,
      content: `Вы действительно хотите удалить выбранные группы?`,
      okText: "Да, удалить",
      okType: "danger",
      cancelText: "Отмена",
      centered: true,
      onOk() {
        selectedRows.forEach(group => {
          httpApi.delete(`my/user-groups/${group.id}/`).then(() => {
            fetch(initialPagination);
          });
        });
      },
      onCancel() {
      },
    });
  }

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      setSelectedRows(selectedRows as GroupData[]);
    }
  };

  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Link to={`/user-management/groups/${record.id}`}>
          <TeamOutlined style={{ marginRight: 8 }} />
          {text}
        </Link>
      ),
    },
    {
      title: 'Количество пользователей',
      dataIndex: 'users_count',
      key: 'users_count',
      width: '20%',
    }
  ];

  return (
    <>
      <PageTitle>Группы</PageTitle>
      <S.TablesWrapper>
        <S.Card id="groups-table" title="Группы" padding="1.25rem 1.25rem 0">
        <S.ButtonsWrapper>
          <Button type="primary" onClick={handleCreateDrawerOpen}>Создать новую группу</Button>
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

      <CreateGroupDrawer
        open={createDrawerOpen}
        onClose={handleCreateNewClose}
        onCreate={handleCreate}
      />
    </>
  );
};

export default GroupsListPage;
