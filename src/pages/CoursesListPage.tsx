import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  message,
  Empty,
  Input,
  Select,
  Divider,
  Tooltip,
  Pagination,
} from 'antd';
import { PlusOutlined, SearchOutlined, BookOutlined, UserOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

/** Raw shape coming from https://aigent.kz/api/kb/articles (DRF pagination) */
interface RawArticle {
  id?: number | string | null;
  slug?: string | null;
  uuid?: string | null;
  pk?: number | string | null;
  article_id?: number | string | null;
  name: string | null;
  description: string | null;
  content: string | null;
  publisher: string | number | { name?: string; title?: string; label?: string; id?: number; slug?: string } | null;
  space: string | number | { name?: string; title?: string; label?: string; id?: number; slug?: string } | null;
  tags:
    | Array<string | number | { name?: string; title?: string; label?: string; id?: number; slug?: string }>
    | string
    | null;
}

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

interface ArticleItem {
  id: string | null; // теперь строка или null (если вовсе нет идентификатора)
  title: string;
  description: string;
  contentHtml: string;
  publisher: string;
  space: string;
  tags: string[];
}

const resolveRouteId = (a: RawArticle): string | null => {
  const v = a.id ?? a.slug ?? a.uuid ?? a.pk ?? a.article_id ?? null;
  return v == null ? null : String(v);
};

const normalizeTags = (t: RawArticle['tags']): string[] => {
  if (Array.isArray(t)) return t.filter(Boolean).map(String);
  if (typeof t === 'string' && t.trim()) return [t.trim()];
  return [];
};

const normalizeArticle = (a: RawArticle): ArticleItem => ({
  id: resolveRouteId(a),
  title: a.name?.trim() || 'Без названия',
  description: a.description?.trim() || '',
  contentHtml: a.content || '',
  publisher:
    typeof a.publisher === 'string'
      ? a.publisher.trim()
      : typeof a.publisher === 'number'
      ? String(a.publisher)
      : a.publisher && typeof a.publisher === 'object'
      ? a.publisher.name?.trim() ||
        a.publisher.title?.trim() ||
        a.publisher.label?.trim() ||
        (typeof a.publisher.id === 'number' ? String(a.publisher.id) : '') ||
        a.publisher.slug?.toString().trim() ||
        '—'
      : '—',
  space:
    typeof a.space === 'string'
      ? a.space.trim()
      : typeof a.space === 'number'
      ? String(a.space)
      : a.space && typeof a.space === 'object'
      ? a.space.name?.trim() ||
        a.space.title?.trim() ||
        a.space.label?.trim() ||
        (typeof a.space.id === 'number' ? String(a.space.id) : '') ||
        a.space.slug?.toString().trim() ||
        'Без пространства'
      : 'Без пространства',
  tags: normalizeTags(a.tags),
});

const toArray = (payload: any): RawArticle[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
};

const getTotal = (payload: any): number => Number(payload?.count ?? payload?.total ?? toArray(payload).length);

const CoursesListPage: React.FC = () => {
  const navigate = useNavigate();

  // load state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // data
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  // filters (по-прежнему клиентские — на текущей странице)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<string>('all');

  // pagination (server-side)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // DRF-style pagination
      const { data } = await httpApi.get('/kb/articles/', {
        params: { page, page_size: pageSize },
      });

      const arr = toArray(data);
      const items = arr.map(normalizeArticle);
      setArticles(items);
      setTotal(getTotal(data));
    } catch (e: any) {
      console.error('Ошибка при загрузке статей:', e);
      setError('Не удалось загрузить список статей');
      message.error('Ошибка при загрузке статей');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const spaces = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.space && set.add(a.space));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [articles]);

  // Фильтрация по текущей странице (серверная фильтрация не включена умышленно —
  // если на бэке появятся параметры search/space — добавим их в httpApi.get params)
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesSpace = selectedSpace === 'all' || a.space === selectedSpace;
      if (!q) return matchesSpace;
      const hay = [a.title, a.description, a.space, a.publisher, a.tags.join(' ')].join(' ').toLowerCase();
      return matchesSpace && hay.includes(q);
    });
  }, [articles, searchTerm, selectedSpace]);

  const handleCreate = () => navigate('/almas-course-create');
  const handleView = (id: string | null) => {
    if (!id) {
      message.warning('Не найден идентификатор статьи');
      return;
    }
    navigate(`/course/${encodeURIComponent(id)}`);
  };
  const handleEdit = (id: string | null) => {
    if (!id) {
      message.warning('Не найден идентификатор статьи');
      return;
    }
    navigate(`/almas-course-create/${encodeURIComponent(id)}`);
  };

  const onPageChange = (p: number, ps?: number) => {
    setPage(p);
    if (ps && ps !== pageSize) {
      setPageSize(ps);
      setPage(1); // при смене размера возвращаемся на первую
    }
    // load() вызовется автоматом через useEffect
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div>Загрузка статей…</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty description={error} />
      </Card>
    );
  }

  return (
    <>
      <PageTitle>База знаний</PageTitle>

      {/* Header with actions and filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Title level={3} style={{ margin: 0 }}>
              Статьи: {total}
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
              Создать курс
            </Button>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          <Col xs={24} sm={12} md={10} lg={8}>
            <Search
              placeholder="Поиск по названию, описанию, тегам, издателю (в пределах страницы)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Все пространства"
              value={selectedSpace}
              onChange={(v) => {
                setSelectedSpace(v);
              }}
              style={{ width: '100%' }}
            >
              <Option value="all">Все пространства</Option>
              {spaces.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Grid */}
      {filtered.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {filtered.map((a) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={a.id}>
                <Card
                  hoverable
                  actions={[
                    <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => handleView(a.id)}>
                      Просмотр
                    </Button>,
                    <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(a.id)}>
                      Редактировать
                    </Button>,
                  ]}
                  cover={
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                      }}
                    >
                      <BookOutlined />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <div style={{ marginBottom: 8 }}>
                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                          {a.title}
                        </Title>
                        <Space wrap>
                          <Tag color="green">{a.space}</Tag>
                          {a.publisher && a.publisher !== '—' && (
                            <Tag>
                              <UserOutlined style={{ marginRight: 6 }} /> {a.publisher}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 16, color: '#adb5bd' }}>
                          {a.description || '—'}
                        </Paragraph>

                        <Space wrap style={{ marginBottom: 16 }}>
                          {a.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag} color="blue" style={{ fontSize: 11 }}>
                              {tag}
                            </Tag>
                          ))}
                          {a.tags.length > 3 && (
                            <Tag color="default" style={{ fontSize: 11 }}>
                              +{a.tags.length - 3}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={['6', '12', '24', '48']}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              showTotal={(t, range) => `${range[0]}–${range[1]} из ${t}`}
            />
          </div>
        </>
      ) : (
        <Card>
          <Empty
            description={
              searchTerm || selectedSpace !== 'all'
                ? 'Статьи не найдены по заданным критериям'
                : 'На этой странице пока пусто'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!searchTerm && selectedSpace === 'all' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Создать первый курс
              </Button>
            )}
          </Empty>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={['6', '12', '24', '48']}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              showTotal={(t, range) => `${range[0]}–${range[1]} из ${t}`}
            />
          </div>
        </Card>
      )}
    </>
  );
};

export default CoursesListPage;
