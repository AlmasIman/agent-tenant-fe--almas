import React, { useState, useEffect, Key } from 'react';
import { httpApi } from '@app/api/http.api';
import { DefaultRecordType } from 'rc-table/lib/interface';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { Pagination } from '@app/api/table.api';
import * as S from '@app/components/tables/Tables/Tables.styles';

interface UserData {
    id: number;
    full_name: string;
    department_name: string;
    groups: string[];
}

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

interface SelectUsersStepProps {
  trainingId: number;
  onSelectUsers: (selectedUserIds: number[]) => void;
}

const SelectUsersStep: React.FC<SelectUsersStepProps> = ({ onSelectUsers, trainingId }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    httpApi.get<UserData[]>('my/users/').then(({ data }) => {
      setUsers(data);
      setLoading(false);
    });
  }, [trainingId]);

  const rowSelection = {
      onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
        onSelectUsers(selectedRowKeys as number[]);
      },
    };

  const columns = [
    {
      title: 'ФИО',
      dataIndex: 'full_name',
      key: 'full_name',
      filters: Array.from(new Set(users.map(user => ({
        text: user.full_name,
        value: user.full_name,
      })))),
      filterSearch: true,
      onFilter: (value: string | number | boolean, record: UserData) =>
         record.full_name.toLowerCase().includes((value as string).toLowerCase())
    },
    {
      title: 'Департамент',
      dataIndex: 'department_name',
      key: 'department_name',
      filters: Array.from(new Set(users.map(user => user.department_name))).map(department => ({
        text: department,
        value: department,
      })),
      onFilter: (value: string | number | boolean, record: UserData) => record.department_name === value,
    },
    {
      title: 'Группы',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: string[]) => groups.join(', '),
      filters: Array.from(new Set(users.flatMap(user => user.groups))).map(group => ({
        text: group,
        value: group,
      })),
      onFilter: (value: string | number | boolean, record: UserData) => typeof value === 'string' && record.groups.includes(value),
    },
  ];

  return (
    <S.TablesWrapper>
        <S.Card title="Пользователи" padding="1.25rem 1.25rem 0">
            <BaseTable
            rowSelection={rowSelection}
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={initialPagination}
            />
        </S.Card>
    </S.TablesWrapper>
  );
};

export default SelectUsersStep;
