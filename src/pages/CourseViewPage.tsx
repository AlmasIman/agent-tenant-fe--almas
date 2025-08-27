import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Tooltip,
  Anchor,
  Progress,
  Divider,
} from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';
import {
  BookOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
  FontSizeOutlined,
  MinusOutlined,
  PlusOutlined,
  ToTopOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TOP_OFFSET = 90;

/** Сырое API: /kb/articles/{id} */
interface RawArticle {
  id: number | string | null;
  name: string | null;
  description: string | null;
  content: string | null; // HTML
  publisher:
    | string
    | number
    | { name?: string; title?: string; label?: string; id?: number | string; slug?: string }
    | null;
  space:
    | string
    | number
    | { name?: string; title?: string; label?: string; id?: number | string; slug?: string }
    | null;
  tags:
    | Array<string | number | { name?: string; title?: string; label?: string; id?: number | string; slug?: string }>
    | string
    | null;
}

interface Article {
  id: string; // приводим к строке, чтобы безболезненно подставлять в URL
  title: string;
  description: string;
  contentHtml: string;
  publisher: string;
  space: string;
  tags: string[];
}

const toLabel = (v: unknown, fallback = '—'): string => {
  if (v == null) return fallback;
  if (typeof v === 'string') return v.trim() || fallback;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const cand = o.name ?? o.title ?? o.label ?? o.slug ?? o.id;
    return cand != null ? String(cand).trim() || fallback : fallback;
  }
  return fallback;
};

const normalizeTags = (t: RawArticle['tags']): string[] => {
  if (!t) return [];
  if (typeof t === 'string') return t.trim() ? [t.trim()] : [];
  if (Array.isArray(t)) {
    return t.flatMap((x) => {
      if (x == null) return [];
      if (typeof x === 'string') return x.trim() ? [x.trim()] : [];
      if (typeof x === 'number') return [String(x)];
      if (typeof x === 'object') {
        const o = x as Record<string, unknown>;
        const cand = o.name ?? o.title ?? o.label ?? o.slug ?? o.id;
        return cand != null ? [String(cand).trim()] : [];
      }
      return [];
    });
  }
  return [];
};

const normalize = (a: RawArticle): Article => ({
  id: String(a.id ?? ''), // при желании можно подставлять courseId как фоллбек
  title: toLabel(a.name, 'Без названия'),
  description: toLabel(a.description, ''),
  contentHtml: a.content || '',
  publisher: toLabel(a.publisher, '—'),
  space: toLabel(a.space, 'Без пространства'),
  tags: normalizeTags(a.tags),
});

/** Простой slug для id заголовков, с поддержкой кириллицы */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0400-\u04FF]+/g, '-') // буквы/цифры/подчеркивание/кириллица
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

type AnchorItem = {
  key: string;
  href: string;
  title: React.ReactNode;
  children?: AnchorItem[];
};

const CourseViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);

  // UI state
  const [fontScale, setFontScale] = useState(1); // 0.9–1.4
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [toc, setToc] = useState<AnchorItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [readingStats, setReadingStats] = useState<{ words: number; minutes: number }>({
    words: 0,
    minutes: 0,
  });

  type TrainingAnswer = { text: string; correct?: boolean; feedback?: string };
  type TrainingQuestion = {
    question: string;
    answers: TrainingAnswer[];
    multiple?: boolean;
    feedback?: { correct?: string; incorrect?: string };
  };
  type TrainingContent = {
    questions: TrainingQuestion[];
    overallFeedback?: { perfect?: string; good?: string; bad?: string };
  };
  type Training = {
    id: number;
    name: string;
    description?: string;
    content?: TrainingContent;
    kb_article?: number;
    publisher?: string;
  };

  const [trainingLoading, setTrainingLoading] = useState(false);
  const [training, setTraining] = useState<Training | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await httpApi.get<RawArticle>(`/kb/articles/${courseId}/`);
        setArticle(normalize(data));
      } catch (e) {
        console.error(e);
        message.error('Не удалось загрузить курс');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) load();
  }, [courseId]);

  // Добавляем стили для «красивого» контента ровно один раз
  useEffect(() => {
    const id = 'kb-content-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      .kb-content { font-size: 16px; line-height: 1.8; }
      .kb-content h1, .kb-content h2, .kb-content h3 {
        scroll-margin-top: 96px;
        font-weight: 700;
      }
      .kb-content h1 { font-size: 28px; margin: 24px 0 12px; }
      .kb-content h2 { font-size: 22px; margin: 28px 0 12px; border-left: 4px solid rgba(0,0,0,0.1); padding-left: 10px; }
      .kb-content h3 { font-size: 18px; margin: 20px 0 8px; }
      .kb-content p { margin: 0 0 12px; color: rgba(0,0,0,0.85); }
      .kb-content ul, .kb-content ol { padding-left: 1.2em; margin: 0 0 16px; }
      .kb-content li { margin: 6px 0; }
      .kb-content blockquote {
        margin: 16px 0; padding: 12px 16px; background: #fafafa; border-left: 4px solid #d9d9d9; color: rgba(0,0,0,0.75);
      }
      .kb-content table { border-collapse: collapse; margin: 16px 0; width: 100%; }
      .kb-content th, .kb-content td { border: 1px solid #f0f0f0; padding: 8px 10px; }
      .kb-content img { max-width: 100%; border-radius: 8px; display: block; margin: 12px auto; }
      .kb-aside { position: sticky; top: 80px; }
      .kb-toolbar { display: flex; gap: 8px; flex-wrap: wrap; }
      .kb-meta { color: rgba(0,0,0,0.45); }
      @media (max-width: 991px) { .kb-aside { position: static; } }
      .kb-video {
        position: relative;
        width: 100%;
        padding-top: 56.25%; 
        background: #000;
        border-radius: 8px;
        overflow: hidden;
        margin: 16px 0;
      }
      .kb-video iframe, .kb-video video {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        border: 0;
      }

    `;
    document.head.appendChild(style);
  }, []);

  // Пост-рендер обработка контента: id для заголовков, оглавление, статистика чтения
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // 1. Собираем все заголовки
    const headings = Array.from(el.querySelectorAll<HTMLHeadingElement>('h1, h2, h3'));

    // 2. Проставляем id (slug) и следим за уникальностью
    const used: Record<string, number> = {};
    headings.forEach((h) => {
      const text = h.textContent?.trim() || '';
      let base = slugify(text);
      if (!base) base = `sec-${Math.random().toString(36).slice(2, 7)}`;
      const count = (used[base] = (used[base] || 0) + 1);
      const id = count > 1 ? `${base}-${count}` : base;
      if (!h.id) h.id = id;
    });

    // 3. Строим TOC: h2 — разделы, h3 — подпункты под последним h2
    const items: AnchorItem[] = [];
    let currentH2: AnchorItem | null = null;

    headings.forEach((h) => {
      const level = Number(h.tagName.slice(1)); // 1/2/3
      const item = {
        key: h.id,
        href: `#${h.id}`,
        title: h.textContent || '',
      };

      if (level === 2) {
        const node: AnchorItem = { ...item, children: [] };
        items.push(node);
        currentH2 = node;
      } else if (level === 3 && currentH2) {
        currentH2.children!.push(item);
      }
    });

    // Фоллбек: если нет h2, покажем h1
    if (items.length === 0) {
      headings
        .filter((h) => h.tagName === 'H1')
        .forEach((h) => items.push({ key: h.id, href: `#${h.id}`, title: h.textContent || '' }));
    }

    setToc(items);

    // 4. Оценка времени чтения
    const plain = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const words = plain ? plain.split(' ').length : 0;
    const minutes = Math.max(1, Math.round(words / 180));
    setReadingStats({ words, minutes });

    // 5. Прогресс чтения
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = el.scrollHeight - vh + 80; // поправка на шапку
      const passed = Math.min(Math.max(-rect.top + 80, 0), total);
      setProgress(total > 0 ? Math.round((passed / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [article?.contentHtml]);

  useEffect(() => {
    const fetchTraining = async () => {
      if (!courseId) return;
      try {
        setTrainingLoading(true);

        // 1) находим викторину по KB-статье
        // если ваш httpApi.baseURL уже содержит /api → путь ниже корректен
        const { data } = await httpApi.get(`/trainings/by-kb-article/${courseId}/`);

        // поддержка разных форм ответа
        let found: any = data;
        if (Array.isArray(data)) found = data[0];
        else if (data && Array.isArray((data as any).results)) found = (data as any).results[0];

        if (!found?.id) {
          setTraining(null);
          return;
        }

        // 2) если контент не пришёл целиком — дотягиваем детали
        if (!found.content || !found.content?.questions) {
          const { data: detail } = await httpApi.get(`/trainings/trainings/${found.id}/`);
          setTraining(detail as any);
        } else {
          setTraining(found as any);
        }
      } catch (e) {
        console.error(e);
        setTraining(null);
      } finally {
        setTrainingLoading(false);
      }
    };

    fetchTraining();
  }, [courseId]);

  const increaseFont = () => setFontScale((v) => Math.min(1.4, +(v + 0.1).toFixed(2)));
  const decreaseFont = () => setFontScale((v) => Math.max(0.9, +(v - 0.1).toFixed(2)));

  // где-то рядом с остальными хелперами/хуками
  const scrollToTop = () => {
    // если контент смонтирован — прокрутим первый блок вверх
    const c = contentRef.current;
    if (c) {
      const firstBlock =
        (c.querySelector('h1, h2, h3, p, ul, ol, table, img, blockquote') as HTMLElement | null) ||
        (c.firstElementChild as HTMLElement | null) ||
        c;

      firstBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // запасной вариант — прокрутить окно
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Загрузка курса…</div>;
  }

  if (!article) {
    return (
      <Card>
        <Empty description="Курс не найден" />
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />} style={{ marginTop: 16 }}>
          Назад
        </Button>
      </Card>
    );
  }

  return (
    <>
      <PageTitle>{article.title}</PageTitle>

      {/* Шапка */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={16}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={1} style={{ margin: 0 }}>
                  {article.title}
                </Title>
                {article.description && (
                  <Paragraph style={{ fontSize: 16, color: '#666', margin: '8px 0 0' }}>
                    {article.description}
                  </Paragraph>
                )}
              </div>
              <Space wrap>
                <Tag color="green" icon={<BookOutlined />}>
                  {article.space}
                </Tag>
                {article.publisher && article.publisher !== '—' && (
                  <Tag>
                    <UserOutlined style={{ marginRight: 6 }} />
                    {article.publisher}
                  </Tag>
                )}
                {article.tags.map((t) => (
                  <Tag key={t} color="blue" style={{ fontSize: 12 }}>
                    {t}
                  </Tag>
                ))}
              </Space>
              <Space size="large">
                <Space>
                  <EyeOutlined />
                  <Text type="secondary">Просмотры: 0</Text>
                </Space>
                <Text className="kb-meta">
                  ~{readingStats.minutes} мин чтения • {readingStats.words} слов
                </Text>
              </Space>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space wrap className="kb-toolbar" style={{ justifyContent: 'flex-end' }}>
              <Tooltip title="Меньше шрифт">
                <Button icon={<MinusOutlined />} onClick={decreaseFont} />
              </Tooltip>
              <Tooltip title="Больше шрифт">
                <Button icon={<PlusOutlined />} onClick={increaseFont} />
              </Tooltip>
              <Tooltip title="Печать / PDF">
                <Button icon={<PrinterOutlined />} onClick={() => window.print()} />
              </Tooltip>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Назад
              </Button>
              <Tooltip title="Редактировать статью">
                <Button icon={<EditOutlined />} onClick={() => navigate(`/almas-course-create/${article.id}`)}>
                  Редактировать
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* Полоса прогресса чтения */}
        <Progress percent={progress} showInfo={false} />
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Card
            title="Содержание курса"
            extra={
              <Space>
                <FontSizeOutlined />
                <Text className="kb-meta">{Math.round(fontScale * 100)}%</Text>
              </Space>
            }
          >
            {article.contentHtml ? (
              <div
                ref={contentRef}
                className="kb-content"
                style={{ fontSize: `${16 * fontScale}px` }}
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            ) : (
              <Empty description="Контент отсутствует" />
            )}

            <Divider />
            <Space>
              <Button icon={<ToTopOutlined />} onClick={scrollToTop}>
                Наверх
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <div className="kb-aside">
            <Card title="Оглавление">
              {toc.length ? (
                <Anchor affix={false} offsetTop={90}>
                  {toc.map((h2) => (
                    <Anchor.Link key={h2.key} href={h2.href} title={h2.title}>
                      {h2.children?.map((h3) => (
                        <Anchor.Link key={h3.key} href={h3.href} title={h3.title} />
                      ))}
                    </Anchor.Link>
                  ))}
                </Anchor>
              ) : (
                <Text type="secondary">Заголовки не найдены</Text>
              )}
            </Card>
          </div>
        </Col>

        {/* CTA викторины */}
        <Card style={{ marginTop: 24 }} title="Викторина по материалу">
          {trainingLoading ? (
            <div>Загрузка…</div>
          ) : training ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Tag color="blue">{training.content?.questions?.length ?? 0} вопрос(ов)</Tag>
                {training.publisher && <Tag>{training.publisher}</Tag>}
              </Space>
              {training.description && (
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {training.description}
                </Paragraph>
              )}
              <Space wrap style={{ marginTop: 8 }}>
                <Button type="primary" onClick={() => navigate(`/training-player/${training.id}`)}>
                  Пройти викторину
                </Button>
                <Button onClick={() => navigate(`/course/${training.id}/quiz`)}>Редактировать вопросы</Button>
              </Space>
            </Space>
          ) : (
            <Empty description="Для этого курса викторина пока не создана" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={() => navigate(`/course/${article.id}/quiz`)}>
                Создать викторину
              </Button>
            </Empty>
          )}
        </Card>
      </Row>
    </>
  );
};

export default CourseViewPage;
