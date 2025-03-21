import React, { useState, useEffect } from 'react';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { httpApi } from '@app/api/http.api';
import { EnrollmentData } from '../../userManagementModels';
import { Pagination } from '@app/api/table.api';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { Link } from 'react-router-dom';
import { BookOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';

interface UserEnrollmentsProps {
  userId: number;
}

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const UserEnrollments: React.FC<UserEnrollmentsProps> = ({ userId }) => {
  const [tableData, setTableData] = useState<{ data: EnrollmentData[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<EnrollmentData[]>([]);

  useEffect(() => {
    setTableData((tableData) => ({ ...tableData, loading: true }));
    httpApi.get<EnrollmentData[]>(`my/users/${userId}/enrollments/`).then(({ data }) => {
      setTableData({ data: data, pagination: initialPagination, loading: false });
    });
  }, [userId]);

  const handleTableChange = (pagination: Pagination) => {
    setTableData((tableData) => ({ ...tableData, loading: true }));
    httpApi
      .get<EnrollmentData[]>(`my/users/${userId}/enrollments/`, {
        params: { page: pagination.current, pageSize: pagination.pageSize },
      })
      .then(({ data }) => {
        setTableData({ data: data, pagination: pagination, loading: false });
      });
  };

  const handleRemoveSelected = () => {
    Modal.confirm({
      title: 'Снять с тренингов?',
      icon: <ExclamationCircleOutlined />,
      content: `Вы действительно хотите снять пользователя из выбранных тренингов?`,
      okText: 'Да, снять',
      okType: 'danger',
      cancelText: 'Отмена',
      centered: true,
      onOk() {
        selectedRows.forEach((enrollment) => {
          httpApi.delete(`my/users/${userId}/enrollments/${enrollment.id}/`).then(() => {
            handleTableChange(tableData.pagination);
          });
        });
      },
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: EnrollmentData[]) => {
      setSelectedRows(selectedRows);
    },
  };

  const columns = [
    {
      title: 'Наименование тренинга',
      dataIndex: 'training_name',
      key: 'training_name',
      render: (text: string, record: EnrollmentData) => (
        <Link to={`/trainings/${record.training}`}>
          <BookOutlined style={{ marginRight: 8 }} /> {text}
        </Link>
      ),
    },
    {
      title: 'Срок',
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: 'Статус',
      dataIndex: 'status_display',
      key: 'status_display',
    },
    {
      title: 'Фактическая дата начала',
      dataIndex: 'fact_start_date',
      key: 'fact_start_date',
    },
    {
      title: 'Фактическая дата окончания',
      dataIndex: 'fact_end_date',
      key: 'fact_end_date',
    },
  ];

  return (
    <S.TablesWrapper>
      <S.ButtonsWrapper>
        <Button type="link" danger onClick={handleRemoveSelected} disabled={!selectedRows.length}>
          <DeleteOutlined /> Снять с тренинга
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
    </S.TablesWrapper>
  );
};

export default UserEnrollments;
