import React, { useState } from 'react';
import { Drawer, Steps, Button } from 'antd';
import SelectUsersStep from './SelectUsersStep';
import SelectTrainingStep from './SelectTrainingStep';
import SelectParametersStep from './SelectParametersStep';
import { httpApi } from '@app/api/http.api';

interface EnrollUsersDrawerProps {
  open: boolean;
  onClose: () => void;
  training: TrainingData;
}

const { Step } = Steps;

const EnrollUsersDrawer: React.FC<EnrollUsersDrawerProps> = ({ open, onClose, training }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<TrainingEnrollmentData>({
    training: training.training,
    user_ids: [],
    start_date: '',
    due_date_type: 'none',
    period_number: null,
    period_type: 'days',
    due_date: '',
    notify_by_email: true,
  });

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSelectUsers = (userIds: number[]) => {
    setSelectedUserIds(userIds);
    setEnrollmentData({ ...enrollmentData, user_ids: userIds });
  };

  const handleParametersChange = (data: Partial<TrainingEnrollmentData>) => {
    setEnrollmentData({ ...enrollmentData, ...data });
  };

  const handleFinish = () => {
    if (!enrollmentData.start_date || (enrollmentData.due_date_type === 'due_date' && !enrollmentData.due_date)) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    httpApi.post('my/enrollments/', enrollmentData).then(() => {
      onClose();
    });
  };

  return (
    <Drawer
      title={`Записать пользователей на тренинг: ${training.training_name}`}
      width={900}
      onClose={onClose}
      visible={open}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Steps current={currentStep}>
        <Step title="Тренинг" description="Выберите тренинг" />
        <Step title="Пользователи" description="Выберите пользователей" />
        <Step title="Параметры" description="Настройте параметры" />
      </Steps>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <SelectTrainingStep
            name={training.training_name}
            trainingId={training.training}
            description={training.training_description}
          />
        </div>
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <SelectUsersStep onSelectUsers={handleSelectUsers} trainingId={training.training} />
        </div>
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <SelectParametersStep onChange={handleParametersChange} trainingId={training.training} />
        </div>
      </div>
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Назад
          </Button>
        )}
        {currentStep < 2 && (
          <Button type="primary" onClick={next} disabled={currentStep === 1 && selectedUserIds.length === 0}>
            Далее
          </Button>
        )}
        {currentStep === 2 && (
          <Button type="primary" onClick={handleFinish}>
            Завершить
          </Button>
        )}
      </div>
    </Drawer>
  );
};

export default EnrollUsersDrawer;
