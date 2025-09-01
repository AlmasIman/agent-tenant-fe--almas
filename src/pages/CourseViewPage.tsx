import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  Spin,
} from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { httpApi } from '@app/api/http.api';
import { PresentationViewerModal } from '@app/components/common/PresentationViewer';
import { useApiCall } from '@app/hooks/useApiCall';
import { PresentationApi, Presentation, PresentationSlide } from '@app/api/presentation.api';
import TextSlide from '@app/components/common/SlideBuilder/TextSlide';
import ImageSlide from '@app/components/common/SlideBuilder/ImageSlide';
import VideoSlide from '@app/components/common/SlideBuilder/VideoSlide';
import QuizSlide from '@app/components/common/SlideBuilder/QuizSlide';
import FlashcardsSlide from '@app/components/common/SlideBuilder/FlashcardsSlide';
import FillWordsSlide from '@app/components/common/SlideBuilder/FillWordsSlide';
import CodeSlide from '@app/components/common/SlideBuilder/CodeSlide';
import ChartSlide from '@app/components/common/SlideBuilder/ChartSlide';
import EmbedSlide from '@app/components/common/SlideBuilder/EmbedSlide';
import GameSlide from '@app/components/common/SlideBuilder/GameSlide';
import InteractiveSlide from '@app/components/common/SlideBuilder/InteractiveSlide';
import AchievementSlide from '@app/components/common/SlideBuilder/AchievementSlide';
import ProgressSlide from '@app/components/common/SlideBuilder/ProgressSlide';
import ImageDragDropSlide from '@app/components/common/SlideBuilder/ImageDragDropSlide';
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
  PlayCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TOP_OFFSET = 90;

interface RawTraining {
  id: number | string | null;
  name: string | null;
  description: string | null;
  publisher:
    | string
    | number
    | { name?: string; title?: string; label?: string; id?: number | string; slug?: string }
    | null;
  category:
    | string
    | number
    | { name?: string; title?: string; label?: string; id?: number | string; slug?: string }
    | null;
  presentation?: number | null;
  kb_article?: number | null;
  tags: Array<string> | string | null;
}

interface TrainingVM {
  id: string;
  title: string;
  description: string;
  publisher: string;
  category: string;
  tags: string[];
  contentHtml: string;
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

const normalizeTags = (t: RawTraining['tags']): string[] => {
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

const normalizeTrainingVm = (t: RawTraining, contentHtml = ''): TrainingVM => ({
  id: String(t.id ?? ''),
  title: toLabel(t.name, 'Без названия'),
  description: toLabel(t.description, ''),
  publisher: toLabel(t.publisher, '—'),
  category: toLabel(t.category, 'Без категории'),
  tags: normalizeTags(t.tags),
  contentHtml,
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
  const [article, setArticle] = useState<TrainingVM | null>(null);

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

  // Presentation state
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [readSlides, setReadSlides] = useState<Set<string>>(new Set());
  const [deletingSlide, setDeletingSlide] = useState<string | null>(null);

  // Track slide visibility for reading progress
  const handleSlideVisibility = useCallback((slideId: string, isVisible: boolean) => {
    if (isVisible) {
      setReadSlides((prev) => new Set([...Array.from(prev), slideId]));
    }
  }, []);

  // Create deduplicated API functions
  const getTraining = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });
  const getKbArticle = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });
  const getPresentation = useApiCall(PresentationApi.getPresentation, { deduplicate: true, deduplicateTime: 2000 });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: t } = await getTraining<RawTraining>(`/trainings/${courseId}/`);

        let contentHtml = '';
        if (t.kb_article) {
          try {
            const { data: kb } = await getKbArticle(`/kb/articles/${t.kb_article}/`);
            contentHtml = kb?.content || '';
          } catch (e) {
            console.warn('KB article content not available:', e);
          }
        }

        setArticle(normalizeTrainingVm(t, contentHtml));
        setTraining({
          id: Number(t.id),
          name: toLabel(t.name),
          description: toLabel(t.description, ''),
          kb_article: (t.kb_article as number | null) ?? undefined,
          publisher: toLabel(t.publisher, '—'),
        });

        // Set presentation ID if available
        if (t.presentation) {
          setPresentationId(t.presentation);
        }
      } catch (e) {
        console.error(e);
        message.error('Не удалось загрузить тренинг');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) load();
  }, [courseId, getTraining, getKbArticle]);

  // Load presentation slides when presentationId is available
  useEffect(() => {
    const loadPresentation = async () => {
      if (!presentationId) {
        setPresentation(null);
        return;
      }

      try {
        setSlidesLoading(true);
        const data = await getPresentation(presentationId);

        // Sort slides by order field
        const sortedData = {
          ...data,
          slides: data.slides ? [...data.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [],
        };

        setPresentation(sortedData);
      } catch (err: any) {
        console.error('Error loading presentation:', err);
        message.error('Не удалось загрузить презентацию');
        setPresentation(null);
      } finally {
        setSlidesLoading(false);
      }
    };

    loadPresentation();
  }, [presentationId, getPresentation]);

  // Intersection Observer for tracking slide visibility
  useEffect(() => {
    if (!presentation?.slides) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slideId = entry.target.getAttribute('data-slide-id');
            if (slideId) {
              handleSlideVisibility(slideId, true);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of slide is visible
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before slide is fully visible
      },
    );

    // Observe all slide containers
    const slideContainers = document.querySelectorAll('.slide-container');
    slideContainers.forEach((container) => {
      observer.observe(container);
    });

    return () => {
      slideContainers.forEach((container) => {
        observer.unobserve(container);
      });
    };
  }, [presentation?.slides, handleSlideVisibility]);

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
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      .slide-container {
        position: relative;
      }
      .slide-container:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        transform: translateY(-2px) !important;
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

  const increaseFont = () => setFontScale((v) => Math.min(1.4, +(v + 0.1).toFixed(2)));
  const decreaseFont = () => setFontScale((v) => Math.max(0.9, +(v - 0.1).toFixed(2)));

  // Convert API slide to internal slide format for inline display
  const convertSlide = (apiSlide: PresentationSlide) => {
    let content = apiSlide.data;

    // Special handling for quiz slides - wrap in quiz object
    if (apiSlide.type.toLowerCase() === 'quiz') {
      content = {
        quiz: {
          questions: apiSlide.data.questions || [],
          shuffle: false,
          showExplanation: false,
        },
      };
    }

    // Special handling for flashcards - wrap in flashcards object
    if (apiSlide.type.toLowerCase() === 'flashcards') {
      // Handle nested data structure where data might contain another object
      let cardsData = apiSlide.data.cards || [];

      // If data is a nested object with its own data field, extract from there
      if (apiSlide.data && typeof apiSlide.data === 'object' && apiSlide.data.data) {
        cardsData = apiSlide.data.data.cards || [];
      }

      content = {
        flashcards: {
          cards: cardsData,
          shuffle: false,
          showProgress: false,
        },
      };
    }

    return {
      id: apiSlide.id.toString(),
      title: apiSlide.name,
      type: apiSlide.type.toUpperCase(),
      content: JSON.stringify(content),
      order: apiSlide.order,
      settings: {},
    };
  };

  // Render slide component based on type
  const renderSlide = (slide: any) => {
    const slideProps = {
      slide,
      onComplete: undefined, // No completion callback needed for inline display
      readOnly: true,
    };

    switch (slide.type) {
      case 'TEXT':
        return <TextSlide {...slideProps} />;
      case 'IMAGE':
        return <ImageSlide {...slideProps} />;
      case 'VIDEO':
        return <VideoSlide {...slideProps} />;
      case 'QUIZ':
        return <QuizSlide {...slideProps} />;
      case 'FLASHCARDS':
        return <FlashcardsSlide {...slideProps} />;
      case 'FILL_WORDS':
        return <FillWordsSlide {...slideProps} />;
      case 'CODE':
        return <CodeSlide {...slideProps} />;
      case 'CHART':
        return <ChartSlide {...slideProps} />;
      case 'EMBED':
        return <EmbedSlide {...slideProps} />;
      case 'GAME':
        return <GameSlide {...slideProps} />;
      case 'INTERACTIVE':
        return <InteractiveSlide {...slideProps} />;
      case 'ACHIEVEMENT':
        return <AchievementSlide {...slideProps} />;
      case 'PROGRESS':
        return <ProgressSlide {...slideProps} />;
      case 'IMAGE_DRAG_DROP':
        return <ImageDragDropSlide {...slideProps} />;
      default:
        return <div>Неизвестный тип слайда: {slide.type}</div>;
    }
  };

  // Delete slide function
  const handleDeleteSlide = useCallback(
    async (slideId: string) => {
      if (!slideId) return;

      try {
        setDeletingSlide(slideId);
        await httpApi.delete(`/api/slides/${slideId}/`);

        // Remove slide from local state
        if (presentation) {
          const updatedSlides = presentation.slides.filter((slide) => slide.id.toString() !== slideId);
          setPresentation({
            ...presentation,
            slides: updatedSlides,
          });
        }

        // Remove from read slides if it was there
        setReadSlides((prev) => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(slideId);
          return newSet;
        });

        message.success('Слайд успешно удален');
      } catch (error: any) {
        console.error('Error deleting slide:', error);
        message.error(error?.response?.data?.detail || 'Не удалось удалить слайд');
      } finally {
        setDeletingSlide(null);
      }
    },
    [presentation],
  );

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
        <Empty description="Тренинг не найден" />
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
                  {article.category}
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
              {presentationId && (
                <Tooltip title="Слайды загружаются автоматически">
                  <Tag color="green" icon={<PlayCircleOutlined />}>
                    Презентация доступна
                  </Tag>
                </Tooltip>
              )}
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
            title="Содержание тренинга"
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
              <Empty description="Контент отсутствует (не привязана статья БЗ)" />
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

        {/* Presentation Slides Section */}
        {presentation && (
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <PlayCircleOutlined />
                  Презентация: {presentation.name}
                  <Tag color="blue">{presentation.slides?.length || 0} слайдов</Tag>
                  {presentation.slides && presentation.slides.length > 0 && (
                    <Tag color="green">
                      Прочитано: {readSlides.size} из {presentation.slides.length}
                    </Tag>
                  )}
                </Space>
              }
              style={{ marginTop: 24 }}
            >
              {slidesLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>Загрузка слайдов...</div>
                </div>
              ) : presentation.slides && presentation.slides.length > 0 ? (
                <Row gutter={[24, 0]}>
                  {/* Left Column - Reading Progress */}
                  <Col xs={24} md={6}>
                    <div
                      style={{
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        padding: '20px',
                        position: 'sticky',
                        top: '100px',
                      }}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        <Text strong style={{ fontSize: '16px' }}>
                          Прогресс чтения
                        </Text>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <Text type="secondary">
                          {readSlides.size} из {presentation.slides.length} слайдов
                        </Text>
                      </div>
                      <Progress
                        percent={
                          presentation.slides.length > 0
                            ? Math.round((readSlides.size / presentation.slides.length) * 100)
                            : 0
                        }
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        showInfo={false}
                        style={{ marginBottom: '16px' }}
                      />
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {presentation.slides.map((slide, index) => {
                          const isRead = readSlides.has(slide.id.toString());
                          return (
                            <div
                              key={slide.id}
                              style={{
                                marginBottom: '8px',
                                padding: '8px',
                                borderRadius: '4px',
                                backgroundColor: isRead ? '#e6f7ff' : '#fff',
                                border: isRead ? '1px solid #1890ff' : '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <div
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  backgroundColor: isRead ? '#52c41a' : '#d9d9d9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              >
                                {index + 1}
                              </div>
                              <Text
                                style={{
                                  fontSize: '12px',
                                  color: isRead ? '#1890ff' : '#666',
                                  fontWeight: isRead ? 'bold' : 'normal',
                                }}
                              >
                                {slide.name || `Слайд ${index + 1}`}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column - Slides Content */}
                  <Col xs={24} md={18}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {presentation.slides.map((apiSlide, index) => {
                        const slide = convertSlide(apiSlide);
                        const isRead = readSlides.has(slide.id);

                        return (
                          <div
                            key={slide.id}
                            data-slide-id={slide.id}
                            style={{
                              border: '1px solid #e8e8e8',
                              borderRadius:
                                index === 0
                                  ? '12px 12px 0 0'
                                  : index === presentation.slides.length - 1
                                  ? '0 0 12px 12px'
                                  : '0',
                              padding: '0',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              transition: 'all 0.3s ease',
                              transform: isRead ? 'scale(1.01)' : 'scale(1)',
                              opacity: isRead ? 0.95 : 1,
                              marginBottom: index === presentation.slides.length - 1 ? '0' : '-1px', // Connect slides
                            }}
                            className="slide-container"
                          >
                            {/* Slide Header */}
                            <div
                              style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: '#fafafa',
                                borderTopLeftRadius: index === 0 ? '12px' : '0',
                                borderTopRightRadius: index === 0 ? '12px' : '0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: isRead ? '#52c41a' : '#1890ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <Text strong style={{ fontSize: '15px', margin: 0 }}>
                                    {slide.title || `Слайд ${index + 1}`}
                                  </Text>
                                  <div style={{ marginTop: '4px' }}>
                                    <Tag color="blue">{slide.type}</Tag>
                                    {isRead && <Tag color="green">✓ Прочитано</Tag>}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isRead && (
                                  <div
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: '#52c41a',
                                      animation: 'pulse 2s infinite',
                                    }}
                                  />
                                )}
                                <Tooltip title="Удалить слайд">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    loading={deletingSlide === slide.id}
                                    danger
                                    style={{ padding: '4px 8px' }}
                                  />
                                </Tooltip>
                              </div>
                            </div>

                            {/* Slide Content */}
                            <div
                              style={{
                                padding: '20px',
                                minHeight: '250px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <div style={{ width: '100%', maxWidth: '100%' }}>{renderSlide(slide)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Col>
                </Row>
              ) : (
                <Empty description="В презентации нет слайдов" />
              )}
            </Card>
          </Col>
        )}

        {/* CTA викторины */}
        {/* <Card style={{ marginTop: 24 }} title="Викторина по материалу">
          {' '}
          {trainingLoading ? (
            <div>Загрузка…</div>
          ) : training ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Tag color="blue">{training.content?.questions?.length ?? 0} вопрос(ов)</Tag>{' '}
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
                <Button onClick={() => navigate(`/course/${training.id}/quiz`)}>Редактировать вопросы</Button>{' '}
              </Space>
            </Space>
          ) : (
            <Empty description="Для этого курса викторина пока не создана" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={() => navigate(`/course/${article.id}/quiz`)}>
                Создать викторину
              </Button>{' '}
            </Empty>
          )}
        </Card> */}
      </Row>
    </>
  );
};

export default CourseViewPage;
