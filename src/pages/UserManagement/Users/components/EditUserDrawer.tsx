import { Button, Col, Drawer, Form, Input, Row, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { UserDataDetailed, DepartmentData } from '../../userManagementModels';
import { httpApi } from '@app/api/http.api';

const { useForm } = Form;

export interface EditUserDrawerProps {
  open: boolean;
  onClose: () => void;
  user: UserDataDetailed | null;
  onUpdate: (updatedUser: UserDataDetailed) => void;
}

const EditUserDrawer: React.FC<EditUserDrawerProps> = ({ open, onClose, user, onUpdate }) => {
  const [form] = useForm();
  const [departments, setDepartments] = useState<DepartmentData[]>([]);

  useEffect(() => {
    if (open) {
      httpApi.get<DepartmentData[]>('my/departments/').then(({ data }) => {
        setDepartments(data);
      });
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        department: user.department,
        position_name: user.position_name,
      });
    }
  }, [user, form]);

  const handleUpdate = async () => {
    form.validateFields().then((values) => {
      const updatedUser = { ...user, ...values };
      httpApi.patch(`my/users/${user?.id}/`, values).then(() => {
        onUpdate(updatedUser as UserDataDetailed);
      });
    });
  };

  return (
    <>
      <Drawer
        title="Редактировать пользователя"
        width={720}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Отмена</Button>
            <Button onClick={handleUpdate} type="primary">
              Сохранить
            </Button>
          </Space>
        }
      >
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
          </Row>
          <Row gutter={16}>
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
        </Form>
      </Drawer>
    </>
  );
};

export default EditUserDrawer;
