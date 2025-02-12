import React, { useState, useEffect, useCallback } from 'react';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { Key, DefaultRecordType } from 'rc-table/lib/interface';
import { TreeTableRow, Pagination, getTreeTableData } from 'api/table.api';
import { useTranslation } from 'react-i18next';
import { useMounted } from '@app/hooks/useMounted';

import * as S from '@app/components/tables/Tables/Tables.styles';
import { httpApi } from '@app/api/http.api';

interface DepartmentDataRow {
  id: number;
  name: string;
  employees_count: number;
}

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const DepartmentsPage: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: DepartmentDataRow[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { t } = useTranslation();
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<DepartmentDataRow[]>('my/departments/').then(({ data }) => {
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

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    onSelect: (record: DefaultRecordType, selected: boolean, selectedRows: DefaultRecordType[]) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: DefaultRecordType[]) => {
      console.log(selected, selectedRows);
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
      dataIndex: 'employees_count',
      key: 'employees_count',
      width: '20%',
    }
  ];

  return (
    <>
      <PageTitle>Департаменты</PageTitle>
      <S.TablesWrapper>
        <S.Card id="departments-table" title="Департаменты" padding="1.25rem 1.25rem 0">
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
    </>
  );
};

export default DepartmentsPage;
