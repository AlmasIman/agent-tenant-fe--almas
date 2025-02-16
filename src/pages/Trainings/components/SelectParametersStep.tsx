import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Radio, InputNumber, Select, Checkbox } from 'antd';
import * as S from '@app/components/tables/Tables/Tables.styles';

const { RangePicker } = DatePicker;

interface SelectParametersStepProps {
  trainingId: number;
  onChange: (data: Partial<TrainingEnrollmentData>) => void;
}

const SelectParametersStep: React.FC<SelectParametersStepProps> = ({ trainingId, onChange }) => {
  const [endDateOption, setEndDateOption] = useState<'none' | 'periodic' | 'due_date'>('none');
  
  useEffect(() => {
    onChange({ due_date_type: endDateOption });
  }, [trainingId]);

  const handleEndDateChange = (e: any) => {
    setEndDateOption(e.target.value);
    if (e.target.value === 'none') {
      onChange({ due_date: '' });
    }
  };

  const handleStartDateChange = (date: any, dateString: string) => {
    onChange({ start_date: dateString });
  };

  const handleEndDatePickerChange = (date: any, dateString: string) => {
    onChange({ due_date: dateString });
  };

  const handlePeriodicChange = (value: number, unit: string) => {
    const periodicEndDate = `${value} ${unit}`;
    onChange({ due_date: periodicEndDate, period_number: value, period_type: unit });
  };

  return (
    <S.TablesWrapper>
      <S.Card title="Параметры" padding="1.25rem 1.25rem 0">
        <Form layout="vertical">
          <Form.Item label="Дата начала" required>
            <DatePicker onChange={handleStartDateChange} />
          </Form.Item>
          <Form.Item label="Дата окончания">
            <Radio.Group onChange={handleEndDateChange} value={endDateOption}>
              <Radio value="none" style={{ display: 'block', marginBottom: 8 }}>Без срока</Radio>
              <Radio value="due_date" style={{ display: 'block', marginBottom: 8 }}>
                По сроку <DatePicker disabled={endDateOption !== 'due_date'} onChange={handleEndDatePickerChange} />
              </Radio>
              <Radio value="periodic" style={{ display: 'block', marginBottom: 8 }}>
                Периодический
                <InputNumber disabled={endDateOption !== 'periodic'} style={{ margin: '0 8px' }} onChange={(value) => handlePeriodicChange(value as number, 'days')} />
                <Select disabled={endDateOption !== 'periodic'} defaultValue="days" style={{ width: 120 }} onChange={(value) => handlePeriodicChange(1, value)}>
                  <Select.Option value="days">Дни</Select.Option>
                  <Select.Option value="weeks">Недели</Select.Option>
                  <Select.Option value="months">Месяцы</Select.Option>
                  <Select.Option value="years">Годы</Select.Option>
                </Select>
              </Radio>
            </Radio.Group>
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
