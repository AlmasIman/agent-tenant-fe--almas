import React, { useState } from 'react';
import { Card, Tabs, Button, Space, Typography, Row, Col } from 'antd';
import { PlusOutlined, PlayCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import H5PQuizWrapper from './H5PQuizWrapper';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const KhamzaCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quizzes');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: '24px', background: 'var(--background-color)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Хамза курсы план Б</Title>
        <Paragraph>Система управления интерактивными викторинами и обучающими материалами</Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane
                tab={
                  <span>
                    <PlayCircleOutlined />
                    Викторины
                  </span>
                }
                key="quizzes"
              >
                <H5PQuizWrapper />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BarChartOutlined />
                    Статистика
                  </span>
                }
                key="statistics"
              >
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Title level={4}>Статистика прохождения викторин</Title>
                  <Paragraph>
                    Здесь будет отображаться статистика по всем викторинам и результатам пользователей
                  </Paragraph>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KhamzaCoursesPage;
