import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Checkbox, InputNumber, Select } from 'antd';
import * as S from '@app/components/tables/Tables/Tables.styles';
import { TrainingEnrollmentData } from '../trainingsModels';

interface SelectParametersStepProps {
  trainingId: number;
  onChange: (data: Partial<TrainingEnrollmentData>) => void;
}

const SelectParametersStep: React.FC<SelectParametersStepProps> = ({ trainingId, onChange }) => {
  const [periodic, setPeriodic] = useState<boolean>(false);

  useEffect(() => {
    onChange({ periodic });
  }, [trainingId]);

  const handleStartDateChange = (date: any, dateString: string) => {
    onChange({ start_date: dateString });
  };

  const handleDueDateChange = (date: any, dateString: string) => {
    onChange({ due_date: dateString });
  };

  const handlePeriodicChange = (e: any) => {
    setPeriodic(e.target.checked);
    onChange({ periodic: e.target.checked });
  };

  const handlePeriodicNumberChange = (value: number | null) => {
    onChange({ period_number: value });
  };

  const handlePeriodicTypeChange = (value: string) => {
    onChange({ period_type: value as 'days' | 'weeks' | 'months' | 'year' });
  };

  const handleCheckboxChange = (e: any, field: keyof TrainingEnrollmentData) => {
    onChange({ [field]: e.target.checked });
  };

  return (
    <S.TablesWrapper>
      <S.Card title="Параметры" padding="1.25rem 1.25rem 0">
        <Form layout="vertical">
          <Form.Item label="Дата начала" required>
            <DatePicker onChange={handleStartDateChange} />
          </Form.Item>
          <Form.Item label="Срок">
            <DatePicker onChange={handleDueDateChange} />
          </Form.Item>
          <Form.Item>
            <Checkbox checked={periodic} onChange={handlePeriodicChange}>
              Периодический
            </Checkbox>
            <InputNumber
              disabled={!periodic}
              style={{ margin: '0 8px' }}
              onChange={handlePeriodicNumberChange}
            />
            <Select
              disabled={!periodic}
              defaultValue="days"
              style={{ width: 120 }}
              onChange={handlePeriodicTypeChange}
            >
              <Select.Option value="days">Дни</Select.Option>
              <Select.Option value="weeks">Недели</Select.Option>
              <Select.Option value="months">Месяцы</Select.Option>
              <Select.Option value="years">Годы</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Checkbox
              defaultChecked={true}
              onChange={(e) => handleCheckboxChange(e, 'skip_if_passed')}
            >
              Не записывать на тренинг, если пользователь уже прошел его 
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox
              defaultChecked={true}
              onChange={(e) => handleCheckboxChange(e, 'update_due_date_if_assigned')}
            >
              Обновить дату окончания, если пользователю ранее был назначен это тренинг
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox checked disabled>
              Уведомлять по электронной почте, когда приближаются даты начала и окончания
            </Checkbox>
          </Form.Item>
        </Form>
      </S.Card>
    </S.TablesWrapper>
  );
};

export default SelectParametersStep;
