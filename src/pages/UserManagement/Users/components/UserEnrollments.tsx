import React, { useState, useEffect } from 'react';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { httpApi } from '@app/api/http.api';
import { EnrollmentData } from '../../userManagementModels';
import { Pagination } from '@app/api/table.api';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { Link } from 'react-router-dom';
import { BookOutlined } from '@ant-design/icons';

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

  useEffect(() => {
    setTableData((tableData) => ({ ...tableData, loading: true }));
    httpApi.get<EnrollmentData[]>(`my/users/${userId}/enrollments/`).then(({ data }) => {
      setTableData({ data: data, pagination: initialPagination, loading: false });
    });
  }, [userId]);

  const handleTableChange = (pagination: Pagination) => {
    setTableData((tableData) => ({ ...tableData, loading: true }));
    httpApi.get<EnrollmentData[]>(`my/users/${userId}/enrollments/`, { params: { page: pagination.current, pageSize: pagination.pageSize } }).then(({ data }) => {
      setTableData({ data: data, pagination: pagination, loading: false });
    });
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
      <BaseTable
        columns={columns}
        dataSource={tableData.data}
        pagination={tableData.pagination}
        loading={tableData.loading}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />
    </S.TablesWrapper>
  );
};

export default UserEnrollments;
