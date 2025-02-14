import React, { useState, useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { httpApi } from '@app/api/http.api';
import { ArticleData } from '../kbModels';

interface KbArticleContentProps {
  articleId: number;
}

const KbArticleContent: React.FC<KbArticleContentProps> = ({ articleId }) => {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    httpApi.get<ArticleData>(`kb/articles/${articleId}/`).then(({ data }) => {
      setArticle(data);
      setLoading(false);
    });
  }, [articleId]);

  if (loading) {
    return <Spin />;
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

export default KbArticleContent;
