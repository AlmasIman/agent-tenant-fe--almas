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
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CreateDepartmentDrawer from './components/CreateDepartmentDrawer';
import { DepartmentData } from '../userManagementModels';
import { RootState } from '@app/store/store';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const DepartmentsPage: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: DepartmentData[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedRows, setSelectedRows] = useState<DepartmentData[]>([]);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { isMounted } = useMounted();
  const tenantId = useSelector((state: RootState) => state.user.user?.tenant_id);

  const restructureData = (data: DepartmentData[]): DepartmentData[] => {
    const map = new Map<number, DepartmentData>();
    const result: DepartmentData[] = [];

    data.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    data.forEach((item) => {
      if (item.parent) {
        const parent = map.get(item.parent);
        if (parent) {
          parent.children.push(map.get(item.id)!);
        }
      } else {
        result.push(map.get(item.id)!);
      }
    });

    return result;
  };

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<DepartmentData[]>('my/departments/').then(({ data }) => {
        if (isMounted.current) {
          const restructuredData = restructureData(data);
          setDepartments(data);
          setTableData({ data: restructuredData, pagination: pagination, loading: false });
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

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: "Удалить выбранные департаменты?",
      icon: <ExclamationCircleOutlined />,
      content: `Вы действительно хотите удалить выбранные департаменты?`,
      okText: "Да, удалить",
      okType: "danger",
      cancelText: "Отмена",
      centered: true,
      onOk() {
        selectedRows.forEach(department => {
          httpApi.delete(`my/departments/${department.id}/`).then(() => {
            fetch(initialPagination);
          });
        });
      },
      onCancel() {},
    });
  };

  const handleCreateDrawerOpen = () => setCreateDrawerOpen(true);
  const handleCreateDrawerClose = () => setCreateDrawerOpen(false);

  const handleCreate = async (name: string, parent?: number) => {
    httpApi.post('my/departments/', { name, parent, tenant: tenantId }).then(() => {
      fetch(initialPagination);
      handleCreateDrawerClose();
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      setSelectedRows(selectedRows as DepartmentData[]);
    },
  };

  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
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
      <PageTitle>Департаменты</PageTitle>
      <S.TablesWrapper>
        <S.Card id="departments-table" title="Департаменты" padding="1.25rem 1.25rem 0">
        <S.ButtonsWrapper>
          <Button type="link" onClick={handleCreateDrawerOpen}>Добавить департамент</Button>
          <Button type="link" danger onClick={handleDeleteSelected} disabled={!selectedRows.length}>
            Удалить
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

      <CreateDepartmentDrawer
        open={createDrawerOpen}
        onClose={handleCreateDrawerClose}
        onCreate={handleCreate}
        departments={departments}
      />
    </>
  );
};

export default DepartmentsPage;
