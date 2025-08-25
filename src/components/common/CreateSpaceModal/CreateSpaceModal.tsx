import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { CourseApi } from '@app/api/course.api';
import { Space as SpaceType } from '@app/types/course.types';

interface CreateSpaceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (space: SpaceType) => void;
}

const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string; description: string }) => {
    setLoading(true);
    try {
      const newSpace = await CourseApi.createSpace(values);
      message.success('Пространство успешно создано');
      form.resetFields();
      onSuccess(newSpace);
    } catch (error) {
      message.error('Ошибка при создании пространства');
      console.error('Error creating space:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Создать новое пространство"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: 'Введите название пространства' }]}
        >
          <Input placeholder="Введите название" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Введите описание пространства' }]}
        >
          <Input.TextArea rows={3} placeholder="Введите описание" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Создать
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSpaceModal; 