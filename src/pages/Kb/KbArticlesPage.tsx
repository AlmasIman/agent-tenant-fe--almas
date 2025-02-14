import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Col, Row, Tree, Select, Spin, Card } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { httpApi } from '@app/api/http.api';
import { TenantArticleData } from './kbModels';
import { RootState } from '@app/store/store';
import { DownOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import KbArticleContent from './components/KbArticleContent';

const KbArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const tenantId = useSelector((state: RootState) => state.user.user?.tenant_id);
  const [articles, setArticles] = useState<TenantArticleData[]>([]);
  const [spaces, setSpaces] = useState<{ id: number; name: string; description: string }[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

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
      data.forEach(article => {
        spacesMap.set(article.space, { id: article.space, name: article.space_name, description: article.space_description });
      });
      const spaces = Array.from(spacesMap.values());
      
      setSpaces(spaces);
      setArticles(data);
      if (spaces.length > 0) {
        setSelectedSpace(spaces[0].id);
        setTreeData(restructureData(data.filter(article => article.space === spaces[0].id)));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSpaceChange = (value: number) => {
    setSelectedSpace(value);
    setTreeData(restructureData(articles.filter(article => article.space === value)));
  };

  return (
    <>
      <PageTitle>База знаний</PageTitle>
      <Card id="departments-table" title="База знаний" >
        <Row gutter={16}>
          <Col span={6}>
            {loading ? (
              <Spin />
            ) : (
              <Select
                style={{ width: '100%' }}
                value={selectedSpace}
                onChange={handleSpaceChange}
                placeholder="Выберите пространство"
              >
                {spaces.map(space => (
                  <Select.Option key={space.id} value={space.id}>
                    {space.name}
                  </Select.Option>
                ))}
              </Select>
            )}

            <Typography.Paragraph style={{ margin: '10px', fontStyle: 'italic' }}>
              {spaces.filter(sp => sp.id == selectedSpace)[0]?.description}
            </Typography.Paragraph>

            <Tree
              style={{ marginTop: '10px' }}
              showLine
              defaultExpandAll={false}
              titleRender={(node: DataNode) => <a href="#">{node.title?.toString()}</a>}
              onSelect={(selectedKeys, { selectedNodes }) => {
                const selectedNode = selectedNodes[0];
                if (selectedNode) {
                  setSelectedArticleId(Number(selectedNode.key));
                }
              }}
              switcherIcon={<DownOutlined />} 
              treeData={treeData} />
          </Col>
          <Col span={18}>
              <div style={{ padding: '0 15px', borderLeft: '1px solid #f0f0f0' }}>
              {selectedArticleId && <KbArticleContent articleId={selectedArticleId} />}
              </div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default KbArticlesPage;
