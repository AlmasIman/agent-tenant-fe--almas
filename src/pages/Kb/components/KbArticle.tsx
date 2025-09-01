import React, { useState, useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { httpApi } from '@app/api/http.api';
import { useApiCall } from '@app/hooks/useApiCall';
import { ArticleData } from '../kbModels';

interface KbArticleProps {
  articleId: number;
}

const KbArticle: React.FC<KbArticleProps> = ({ articleId }) => {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Create deduplicated API function
  const getArticle = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });

  useEffect(() => {
    setLoading(true);
    getArticle<ArticleData>(`kb/articles/${articleId}/`).then(({ data }) => {
      setArticle(data);
      setLoading(false);
    });
  }, [articleId, getArticle]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div>
      <Typography.Title level={2}>{article.name}</Typography.Title>
      <Typography.Paragraph>{article.description}</Typography.Paragraph>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
};

export default KbArticle;
