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
  Pagination,
} from 'antd';
import { PlusOutlined, SearchOutlined, BookOutlined, UserOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

/** Raw shape coming from https://aigent.kz/api/kb/articles (DRF pagination) */
interface RawTraining {
  id?: number | string | null;
  slug?: string | null;
  uuid?: string | null;
  pk?: number | string | null;
  name: string | null;
  publisher: string | number | { name?: string; title?: string; label?: string; id?: number; slug?: string } | null;
  description: string | null;
  category: string | number | { name?: string; title?: string; label?: string; id?: number; slug?: string } | null;
  tags: Array<string> | string | null;
}

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

interface TrainingItem {
  id: string | null; // теперь строка или null (если вовсе нет идентификатора)
  title: string;
  description: string;
  publisher: string;
  category: string;
  tags: string[];
}

const resolveRouteId = (a: RawTraining): string | null => {
  const v = a.id ?? a.slug ?? a.uuid ?? a.pk ?? null;
  return v == null ? null : String(v);
};

const normalizeTags = (t: RawTraining['tags']): string[] => {
  if (Array.isArray(t)) return t.filter(Boolean).map(String);
  if (typeof t === 'string' && t.trim()) return [t.trim()];
  return [];
};

const normalizeTraining = (a: RawTraining): TrainingItem => ({
  id: resolveRouteId(a),
  title: a.name?.trim() || 'Без названия',
  description: a.description?.trim() || '',
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
  category:
    typeof a.category === 'string'
      ? a.category.trim()
      : typeof a.category === 'number'
      ? String(a.category)
      : a.category && typeof a.category === 'object'
      ? a.category.name?.trim() ||
        a.category.title?.trim() ||
        a.category.label?.trim() ||
        (typeof a.category.id === 'number' ? String(a.category.id) : '') ||
        a.category.slug?.toString().trim() ||
        'Без категории'
      : 'Без категории',
  tags: normalizeTags(a.tags),
});

const toArray = (payload: any): RawTraining[] => {
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
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  // filters (по-прежнему клиентские — на текущей странице)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // pagination (server-side)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // DRF-style pagination
      const { data } = await httpApi.get('/trainings/', {
        params: { page, page_size: pageSize },
      });

      const arr = toArray(data);
      const items = arr.map(normalizeTraining);
      setTrainings(items);
      setTotal(getTotal(data));
    } catch (e: any) {
      console.error('Ошибка при загрузке тренингов:', e);
      setError('Не удалось загрузить список тренингов');
      message.error('Ошибка при загрузке тренингов');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    trainings.forEach((t) => t.category && set.add(t.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [trainings]);

  // Фильтрация по текущей странице (серверная фильтрация не включена умышленно —
  // если на бэке появятся параметры search/space — добавим их в httpApi.get params)
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return trainings.filter((t) => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      if (!q) return matchesCat;
      const hay = [t.title, t.description, t.category, t.publisher, t.tags.join(' ')].join(' ').toLowerCase();
      return matchesCat && hay.includes(q);
    });
  }, [trainings, searchTerm, selectedCategory]);

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
        <div>Загрузка тренингов…</div>{' '}
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
      <PageTitle>Тренинги</PageTitle>

      {/* Header with actions and filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Title level={3} style={{ margin: 0 }}>
              Тренинги: {total}
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
              placeholder="Все категории"
              value={selectedCategory}
              onChange={(v) => {
                setSelectedCategory(v);
              }}
              style={{ width: '100%' }}
            >
              <Option value="all">Все категории</Option>
              {categories.map((c) => (
                <Option key={c} value={c}>
                  {c}
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
            {filtered.map((t) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={t.id}>
                {' '}
                <Card
                  hoverable
                  actions={[
                    <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => handleView(t.id)}>
                      Просмотр
                    </Button>,
                    <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(t.id)}>
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
                          {t.title}
                        </Title>
                        <Space wrap>
                          <Tag color="green">{t.category}</Tag>
                          {t.publisher && t.publisher !== '—' && (
                            <Tag>
                              <UserOutlined style={{ marginRight: 6 }} /> {t.publisher}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 16, color: '#adb5bd' }}>
                          {t.description || '—'}
                        </Paragraph>

                        <Space wrap style={{ marginBottom: 16 }}>
                          {t.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag} color="blue" style={{ fontSize: 11 }}>
                              {tag}
                            </Tag>
                          ))}
                          {t.tags.length > 3 && (
                            <Tag color="default" style={{ fontSize: 11 }}>
                              +{t.tags.length - 3}{' '}
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
              searchTerm || selectedCategory !== 'all'
                ? 'Тренинги не найдены по заданным критериям'
                : 'На этой странице пока пусто'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!searchTerm && selectedCategory === 'all' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Создать первый тренинг{' '}
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
