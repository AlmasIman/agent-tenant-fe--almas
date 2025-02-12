import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space } from 'antd';
import React, { Key, useCallback, useEffect, useState } from 'react';
import { UserData } from '../../userManagementModels';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { Pagination } from '@app/api/table.api';
import { useMounted } from '@app/hooks/useMounted';
import { httpApi } from '@app/api/http.api';
import { DefaultRecordType } from 'rc-table/lib/interface';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const { useForm } = Form;

export interface AddUserDrawerProps {
    open: boolean;
    onClose: () => void;
    onAddSelected: (users: UserData[]) => void;
  }

const AddUserDrawer: React.FC<AddUserDrawerProps> = ({
    open,
    onClose,
    onAddSelected,
}) => {
  const [tableData, setTableData] = useState<{ data: UserData[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<UserData[]>([]);

  const { isMounted } = useMounted();
  
  const fetchTableData = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<UserData[]>(`my/users/`).then(({ data }) => {
        if (isMounted.current) {
          setTableData({ data: data, pagination: pagination, loading: false });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    if (open) {
      fetchTableData(initialPagination);
    }
  }, [open]);

  const handleAdd = async () => {
    onAddSelected(selectedRows);
    onClose();    
  };

  const handleTableChange = (pagination: Pagination) => {
      fetchTableData(pagination);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      setSelectedRows(selectedRows as UserData[]);
    }
  };

  const columns = [
    {
      title: 'ФИО',
      dataIndex: 'full_name',
      key: 'full_name'
    },
    {
      title: 'Департамент',
      dataIndex: 'department_name',
      key: 'department_name',
    }
  ];
  
  return (
    <>      
      <Drawer
        title="Добавить пользователей"
        width={720}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Отмена</Button>
            <Button onClick={handleAdd} disabled={!selectedRows.length} type="primary">
              Добавить
            </Button>
          </Space>
        }
      >
        <S.TablesWrapper>
          <S.Card title="Пользователи" padding="1.25rem 1.25rem 0">
          <BaseTable
            columns={columns}
            dataSource={tableData.data}
            rowSelection={{ ...rowSelection }}
            pagination={tableData.pagination}
            loading={tableData.loading}
            onChange={handleTableChange}
            scroll={{ x: 400 }}
          />
          </S.Card>
        </S.TablesWrapper>
      </Drawer>
    </>
  );
};

export default AddUserDrawer;