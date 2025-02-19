import React, { useState, useEffect } from 'react';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { httpApi } from '@app/api/http.api';
import { Pagination } from '@app/api/table.api';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

interface TrainingEnrollmentsProps {
  trainingId: number;
}

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const TrainingEnrollments: React.FC<TrainingEnrollmentsProps> = ({ trainingId }) => {
  const [tableData, setTableData] = useState<{ data: UserTrainingEnrollmentData[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  useEffect(() => {
    setTableData((tableData) => ({ ...tableData, loading: true }));
    httpApi.get<UserTrainingEnrollmentData[]>(`my/trainings/${trainingId}/enrollments/`).then(({ data }) => {
      setTableData({ data: data, pagination: initialPagination, loading: false });
    });
  }, [trainingId]);

  const handleTableChange = (pagination: Pagination) => {
    setTableData((tableData) => ({ ...tableData, loading: true }));
    httpApi.get<UserTrainingEnrollmentData[]>(`my/trainings/${trainingId}/enrollments/`, { params: { page: pagination.current, pageSize: pagination.pageSize } }).then(({ data }) => {
      setTableData({ data: data, pagination: pagination, loading: false });
    });
  };

  const columns = [
    {
      title: 'ФИО пользователя',
      dataIndex: 'user_full_name',
      key: 'user_full_name',
      render: (text: string, record: UserTrainingEnrollmentData) => (
        <Link to={`/user-management/users/${record.user}`}>
          <UserOutlined style={{ marginRight: 8 }} /> {text}
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

export default TrainingEnrollments;
