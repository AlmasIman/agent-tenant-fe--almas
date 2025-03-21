import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space } from 'antd';
import React, { useState } from 'react';

const { useForm } = Form;

export interface CreateGroupDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateGroupDrawer: React.FC<CreateGroupDrawerProps> = ({ open, onClose, onCreate }) => {
  const [form] = useForm();

  const handleCreate = async () => {
    form.validateFields().then((values) => {
      onCreate(values.name);
      form.resetFields();
      onClose();
    });
  };
  return (
    <>
      <Drawer
        title="Новая группа пользователей"
        width={720}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Отмена</Button>
            <Button onClick={handleCreate} type="primary">
              Создать
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Группа"
                rules={[{ required: true, message: 'Название группы обязательно' }]}
              >
                <Input placeholder="Название группы" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default CreateGroupDrawer;
