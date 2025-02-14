import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, Tree, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { httpApi } from '@app/api/http.api';
import { TenantArticleData } from '../kbModels';
import type { DataNode } from 'antd/es/tree';
import { useNavigate } from 'react-router-dom';

interface KbNavigationProps {
  articleId: number | null;
}

const KbNavigation: React.FC<KbNavigationProps> = ({ articleId }) => {
  const [articles, setArticles] = useState<TenantArticleData[]>([]);
  const [spaces, setSpaces] = useState<{ id: number; name: string; description: string }[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const restructureData = (data: TenantArticleData[]): DataNode[] => {
    const map = new Map<number, DataNode>();
    const result: DataNode[] = [];

    data.forEach((item) => {
      map.set(item.article, { key: item.article, title: item.article_name, children: [] });
    });

    data.forEach((item) => {
      if (item.article_parent) {
        const parent = map.get(item.article_parent);
        if (parent) {
          parent.children?.push(map.get(item.article)!);
        }
      } else {
        result.push(map.get(item.article)!);
      }
    });

    return result;
  };

  const fetchArticles = useCallback(() => {
    setLoading(true);
    httpApi.get<TenantArticleData[]>('my/articles/').then(({ data }) => {
      const spacesMap = new Map<number, { id: number; name: string; description: string }>();
      data.forEach((article) => {
        spacesMap.set(article.space, {
          id: article.space,
          name: article.space_name,
          description: article.space_description,
        });
      });
      const spaces = Array.from(spacesMap.values());

      setSpaces(spaces);
      setArticles(data);
      if (articleId) {
        const article = data.find((it) => it.article == articleId);
        if (article) {
          setSelectedArticle(article.space, articleId, data);
          setLoading(false);
          return;
        }
      }
      if (spaces.length > 0) {
        setSelectedArticle(spaces[0].id, null, data);
      }
      setLoading(false);
    });
  }, [articleId]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const setSelectedArticle = (spaceId: number, articleId: number | null, articlesData: TenantArticleData[]) => {
    setSelectedSpace(spaceId);
    setTreeData(restructureData(articlesData.filter((article) => article.space == spaceId)));
  };

  const handleSpaceChange = (value: number) => {
    setSelectedArticle(value, null, articles);
  };

  return (
    <>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin />
        </div>
      ) : (
        <>
          <Select
            style={{ width: '100%' }}
            value={selectedSpace}
            onChange={handleSpaceChange}
            placeholder="Выберите пространство"
          >
            {spaces.map((space) => (
              <Select.Option key={space.id} value={space.id}>
                {space.name}
              </Select.Option>
            ))}
          </Select>

          <Typography.Paragraph style={{ margin: '10px', fontStyle: 'italic' }}>
            {spaces.filter((sp) => sp.id == selectedSpace)[0]?.description}
          </Typography.Paragraph>

          <Tree
            style={{ marginTop: '10px' }}
            showLine
            defaultExpandAll={true}
            titleRender={(node: DataNode) => <a href="#">{node.title?.toString()}</a>}
            onSelect={(selectedKeys, { selectedNodes }) => {
              const selectedNode = selectedNodes[0];
              if (selectedNode) {
                navigate(`/kb/articles/${selectedNode.key}`);
              }
            }}
            switcherIcon={<DownOutlined />}
            treeData={treeData}
          />
        </>
      )}
    </>
  );
};

export default KbNavigation;
