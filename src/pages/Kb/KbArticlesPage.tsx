import React from 'react';
import { useParams } from 'react-router-dom';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Col, Row, Card } from 'antd';
import KbNavigation from './components/KbNavigation';
import KbArticle from './components/KbArticle';

const KbArticlesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const selectedArticleId = id ? parseInt(id) : null;

  return (
    <>
      <PageTitle>База знаний</PageTitle>
      <Card id="departments-table" title="База знаний">
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ padding: '0 10px', borderRight: '1px solid #f0f0f0' }}>
              <KbNavigation articleId={selectedArticleId} />
            </div>
          </Col>
          <Col span={18}>
            <div style={{ padding: '0 10px' }}>{selectedArticleId && <KbArticle articleId={selectedArticleId} />}</div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default KbArticlesPage;
