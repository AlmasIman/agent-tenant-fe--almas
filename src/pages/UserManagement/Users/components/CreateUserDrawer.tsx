import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Descriptions, Drawer, Form, Input, Row, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { UserDataDetailed } from '../../userManagementModels';
import { httpApi } from '@app/api/http.api';
import { DepartmentData } from '../../userManagementModels';

const { useForm } = Form;

export interface CreateUserDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (newUser: UserDataDetailed) => void;
}

const CreateUserDrawer: React.FC<CreateUserDrawerProps> = ({ open, onClose, onCreate }) => {
  const [form] = useForm();
  const [departments, setDepartments] = useState<DepartmentData[]>([]);

  useEffect(() => {
    if (open) {
      httpApi.get<DepartmentData[]>('my/departments/').then(({ data }) => {
        setDepartments(data);
      });
    }
  }, [open]);

  const handleCreate = async () => {
    form.validateFields().then((values) => {
      onCreate(values);
      form.resetFields();
      onClose();
    });
  };

  return (
    <>
      <Drawer
        title="Новый пользователь"
        width={720}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Отмена</Button>
            <Button onClick={handleCreate} type="primary">
              Зарегистрировать
            </Button>
          </Space>
        }
      >
        <Descriptions>
          <Descriptions.Item style={{ fontStyle: 'italic' }}>
            После регистрации пользователь получит по email инструкцию для входа в систему.
          </Descriptions.Item>
        </Descriptions>
        <Form form={form} layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="Имя" rules={[{ required: true, message: 'Имя обязательно' }]}>
                <Input placeholder="Имя пользователя" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Фамилия" rules={[{ required: true, message: 'Фамилия обязательно' }]}>
                <Input placeholder="Фамилия пользователя" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Email обязателен', type: 'email' }]}
              >
                <Input placeholder="Рабочий email пользователя" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="username" label="Логин" rules={[{ required: false }]}>
                <Input placeholder="Логин создается системой" disabled={true} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Департамент"
                rules={[{ required: true, message: 'Департамент обязателен' }]}
              >
                <Select placeholder="Выберите департамент">
                  {departments.map((department) => (
                    <Select.Option key={department.id} value={department.id}>
                      {department.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position_name"
                label="Должность"
                rules={[{ required: true, message: 'Должность обязательна' }]}
              >
                <Input placeholder="Должность пользователя" />
              </Form.Item>
            </Col>
          </Row>
          {/* Add more fields as necessary */}
        </Form>
      </Drawer>
    </>
  );
};

export default CreateUserDrawer;
