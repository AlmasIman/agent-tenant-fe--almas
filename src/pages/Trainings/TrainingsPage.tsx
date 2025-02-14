import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { Key, DefaultRecordType } from 'rc-table/lib/interface';
import { Pagination } from 'api/table.api';
import { useTranslation } from 'react-i18next';
import { useMounted } from '@app/hooks/useMounted';

import * as S from '@app/components/tables/Tables/Tables.styles';
import { httpApi } from '@app/api/http.api';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { BookOutlined, PlayCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import { RootState } from '@app/store/store';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

const TrainingsPage: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: TrainingData[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<TrainingData[]>([]);
  const { t } = useTranslation();
  const { isMounted } = useMounted();
  const tenantId = useSelector((state: RootState) => state.user.user?.tenant_id);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      httpApi.get<TrainingData[]>('my/trainings/').then(({ data }) => {
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

  const handleEnroll = () => {
    const selectedTraining = selectedRows[0];
    if (selectedTraining) {
      // Enroll logic here
      console.log(`Enrolling in training: ${selectedTraining.training_name}`);
    }
  };

  const handlePreview = () => {
    const selectedTraining = selectedRows[0];
    if (selectedTraining) {
      // Preview logic here
      console.log(`Previewing training: ${selectedTraining.training_name}`);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      setSelectedRows(selectedRows as TrainingData[]);
    },
  };

  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'training_name',
      key: 'training_name',
      render: (text: string, record: any) => (
        <Link to={`/trainings/${record.id}`}>
          <BookOutlined style={{ marginRight: 8 }} />
          {text}
        </Link>
      ),
    },
    {
      title: 'Категория',
      dataIndex: 'category_name',
      key: 'category_name',
      width: '20%',
    },
    {
      title: 'Издатель',
      dataIndex: 'training_publisher',
      key: 'training_publisher',
      width: '20%',
    },
    {
      title: 'Записано',
      dataIndex: 'enrolled_count',
      key: 'enrolled_count',
      width: '10%',
    },
    {
      title: 'Прошли обучение',
      dataIndex: 'completed_count',
      key: 'completed_count',
      width: '10%',
    },
  ];

  return (
    <>
      <PageTitle>Тренинги</PageTitle>
      <S.TablesWrapper>
        <S.Card id="trainings-table" title="Тренинги" padding="1.25rem 1.25rem 0">
          <S.ButtonsWrapper>
            <Button type="link" onClick={handleEnroll} disabled={!(selectedRows.length === 1)}>
              <UserAddOutlined /> Записать пользователей
            </Button>
            <Button type="link" onClick={handlePreview} disabled={!(selectedRows.length === 1)}>
              <PlayCircleOutlined /> Предварительный просмотр
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
    </>
  );
};

export default TrainingsPage;
