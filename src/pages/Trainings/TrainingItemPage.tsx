import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';
import { Spin, Card, Descriptions, Tag, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import TrainingEnrollments from './components/TrainingEnrollments';
import { TrainingData } from './trainingsModels';

const TrainingItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      httpApi.get<TrainingData>(`trainings/${id}/`).then(({ data }) => {
        setTraining(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <Spin />;
  }

  return (
    <>
      <PageTitle>Информация о тренинге</PageTitle>
      <Card>
        <Descriptions title="Информация о тренинге">
          <Descriptions.Item label="Наименование">{training?.training_name}</Descriptions.Item>
          <Descriptions.Item label="Описание">{training?.training_description}</Descriptions.Item>
          <Descriptions.Item label="Издатель">{training?.training_publisher}</Descriptions.Item>
          <Descriptions.Item label="Категория">{training?.category_name}</Descriptions.Item>
          <Descriptions.Item label="Теги">
            {training?.training_tags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="Записано">{training?.enrolled_count}</Descriptions.Item>
          <Descriptions.Item label="Прошли тренинг">{training?.completed_count}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card style={{ marginTop: '20px' }}>
        <Descriptions title="Записанные пользователи" />
        {training && <TrainingEnrollments trainingId={training.training} />}
      </Card>
    </>
  );
};

export default TrainingItemPage;
