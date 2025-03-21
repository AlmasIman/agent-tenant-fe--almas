import { Button, Col, Drawer, Form, Input, Row, Select, Space } from 'antd';
import React from 'react';

const { useForm } = Form;

export interface CreateDepartmentDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, parent?: number) => void;
  departments: { id: number; name: string }[];
}

const CreateDepartmentDrawer: React.FC<CreateDepartmentDrawerProps> = ({ open, onClose, onCreate, departments }) => {
  const [form] = useForm();

  const handleCreate = async () => {
    form.validateFields().then((values) => {
      console.log(values);
      onCreate(values.name, values.parent);
      form.resetFields();
    });
  };

  return (
    <>
      <Drawer
        title="Новый департамент"
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
                label="Название департамента"
                rules={[{ required: true, message: 'Название департамента обязательно' }]}
              >
                <Input placeholder="Название департамента" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="parent" label="Родительский департамент">
                <Select placeholder="-">
                  {departments.map((department) => (
                    <Select.Option key={department.id} value={department.id}>
                      {department.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default CreateDepartmentDrawer;
