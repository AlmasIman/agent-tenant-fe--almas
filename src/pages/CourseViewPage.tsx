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
  Progress,
  Divider,
  Spin,
  Layout,
  Menu,
  Avatar,
  Badge,
  List,
  Collapse,
  Breadcrumb,
} from 'antd';
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
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  HeartOutlined,
  MessageOutlined,
} from '@ant-design/icons';
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
import ImageTextOverlaySlide from '@app/components/common/SlideBuilder/ImageTextOverlaySlide';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;
const { Panel } = Collapse;

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

interface CourseTopic {
  id: string;
  title: string;
  type: 'content' | 'video' | 'quiz' | 'assignment' | 'resource';
  duration?: number; // in minutes
  completed: boolean;
  current: boolean;
  children?: CourseTopic[];
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

const CourseViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<TrainingVM | null>(null);

  // UI state
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [readingStats, setReadingStats] = useState<{ words: number; minutes: number }>({
    words: 0,
    minutes: 0,
  });

  // Course topics state
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>('intro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Presentation state
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [readSlides, setReadSlides] = useState<Set<string>>(new Set());

  // Create deduplicated API functions
  const getTraining = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });
  const getKbArticle = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });
  const getPresentation = useApiCall(PresentationApi.getPresentation, { deduplicate: true, deduplicateTime: 2000 });

  // Convert slides to course topics
  const convertSlidesToTopics = useCallback(
    (slides: PresentationSlide[]): CourseTopic[] => {
      const topics: CourseTopic[] = [
        {
          id: 'intro',
          title: 'Введение в курс',
          type: 'content',
          completed: true,
          current: true,
        },
      ];

      slides.forEach((slide, index) => {
        const topic: CourseTopic = {
          id: slide.id.toString(),
          title: slide.name || `Слайд ${index + 1}`,
          type: getSlideType(slide.type),
          duration: 5, // Default 5 minutes per slide
          completed: readSlides.has(slide.id.toString()),
          current: false,
        };
        topics.push(topic);
      });

      return topics;
    },
    [readSlides],
  );

  const getSlideType = (slideType: string): CourseTopic['type'] => {
    switch (slideType.toLowerCase()) {
      case 'quiz':
        return 'quiz';
      case 'video':
        return 'video';
      case 'text':
      case 'image':
      case 'image_text_overlay':
      case 'flashcards':
      case 'fill_in_blank':
      case 'code':
      case 'chart':
      case 'embed':
      case 'game':
      case 'interactive':
      case 'achievement':
      case 'progress':
      case 'image_drag_drop':
        return 'content';
      default:
        return 'content';
    }
  };

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
        setPresentationId(t.presentation || null);
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

        const sortedData = {
          ...data,
          slides: data.slides ? [...data.slides].sort((a, b) => (a.order || 0) - (b.order || 0)) : [],
        };

        setPresentation(sortedData);
        const topicsFromSlides = convertSlidesToTopics(sortedData.slides);
        setTopics(topicsFromSlides);
      } catch (err: any) {
        console.error('Error loading presentation:', err);
        message.error('Не удалось загрузить презентацию');
        setPresentation(null);
      } finally {
        setSlidesLoading(false);
      }
    };

    loadPresentation();
  }, [presentationId, getPresentation, convertSlidesToTopics]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (topics.length === 0) return 0;
    const completedTopics = topics.filter((topic) => topic.completed).length;
    return Math.round((completedTopics / topics.length) * 100);
  }, [topics]);

  // Get current topic
  const currentTopic = useMemo(() => {
    return topics.find((topic) => topic.id === currentTopicId) || topics[0];
  }, [topics, currentTopicId]);

  // Convert API slide to internal slide format
  const convertSlide = (apiSlide: PresentationSlide) => {
    let content = apiSlide.data;

    if (apiSlide.type.toLowerCase() === 'quiz') {
      content = {
        quiz: {
          questions: apiSlide.data.questions || [],
          shuffle: false,
          showExplanation: false,
        },
      };
    }

    if (apiSlide.type.toLowerCase() === 'flashcards') {
      let cardsData = apiSlide.data.cards || [];

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

    if (apiSlide.type.toLowerCase() === 'image_text_overlay') {
      content = {
        url: apiSlide.data.url || '',
        text: apiSlide.data.text || '',
        textElements: apiSlide.data.textElements || [],
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
      onComplete: undefined,
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
      case 'IMAGE_TEXT_OVERLAY':
        return <ImageTextOverlaySlide {...slideProps} />;
      default:
        return <div>Неизвестный тип слайда: {slide.type}</div>;
    }
  };

  // Render course content
  const renderCourseContent = () => {
    if (currentTopicId === 'intro') {
      return (
        <div className="course-content">
          <div className="course-intro">
            <Title level={1} className="course-title">
              {article?.title}
            </Title>
            <Paragraph className="course-description">{article?.description}</Paragraph>

            <div className="course-meta">
              <Space wrap>
                <Tag color="blue" icon={<UserOutlined />}>
                  {article?.publisher}
                </Tag>
                <Tag color="green" icon={<BookOutlined />}>
                  {article?.category}
                </Tag>
                {article?.tags.map((tag) => (
                  <Tag key={tag} color="default">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        </div>
      );
    }

    // Render slide content
    const slide = presentation?.slides.find((s) => s.id.toString() === currentTopicId);
    if (slide) {
      const convertedSlide = convertSlide(slide);
      return (
        <div className="course-slide-content">
          <div className="slide-header">
            {/* <Title level={2} className="slide-title">
              {slide.name}
            </Title> */}
            <div className="slide-meta">
              {/* <Tag color="blue">{slide.type}</Tag> */}
              {/* <Text type="secondary">
                Слайд {slide.order + 1} из {presentation?.slides.length}
              </Text> */}
            </div>
          </div>
          <div className="slide-content">{renderSlide(convertedSlide)}</div>
        </div>
      );
    }

    return <Empty description="Контент не найден" />;
  };

  // Handle topic click
  const handleTopicClick = (topicId: string) => {
    setCurrentTopicId(topicId);
    // Mark as completed if it's a slide
    if (topicId !== 'intro' && presentation?.slides.find((s) => s.id.toString() === topicId)) {
      setReadSlides((prev) => new Set([...Array.from(prev), topicId]));
    }
  };

  if (loading) {
    return (
      <div className="course-loading">
        <Spin size="large" />
        <div>Загрузка курса...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="course-error">
        <Empty description="Курс не найден" />
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="course-view-page">
      <PageTitle>{article.title}</PageTitle>

      {/* Course Header */}
      <div className="course-header">
        <div className="course-header-content">
          <div className="course-info">
            <Breadcrumb className="course-breadcrumbs">
              <Breadcrumb.Item>Курсы</Breadcrumb.Item>
              <Breadcrumb.Item>{article.category}</Breadcrumb.Item>
              <Breadcrumb.Item>{article.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Title level={1} className="course-title">
              {article.title}
            </Title>

            <Paragraph className="course-subtitle">{article.description}</Paragraph>

            <div className="course-stats">
              <div className="stat">
                <div className="stat-label">Создатель</div>
                <div className="stat-value">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text strong>{article.publisher}</Text>
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Категория</div>
                <div className="stat-value">
                  <Tag>{article.category}</Tag>
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Прогресс</div>
                <div className="stat-value">
                  <Progress percent={overallProgress} size="small" showInfo={false} strokeColor="#52c41a" />
                  <Text strong>{overallProgress}%</Text>
                </div>
              </div>
            </div>
          </div>

          <div className="course-actions">
            {/* <Button icon={<HeartOutlined />} type="text">
              Нравится
            </Button> */}
            <Button icon={<EditOutlined />} onClick={() => navigate(`/almas-course-create/${article.id}`)}>
              Редактировать
            </Button>
          </div>
        </div>
      </div>

      {/* Main Course Layout */}
      <Layout className="course-layout">
        {/* Sidebar */}
        <Sider width={320} className="course-sidebar" collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed}>
          <div className="sidebar-content">
            {/* <div className="course-progress">
              <Title level={4}>Прогресс курса</Title>
              <Progress percent={overallProgress} strokeColor="#52c41a" format={(percent) => `${percent}% завершено`} />
              <div className="progress-stats">
                <Text type="secondary">
                  {topics.filter((t) => t.completed).length} из {topics.length} тем завершено
                </Text>
              </div>
            </div> */}

            <Divider />

            <div className="course-topics">
              <Title level={4}>Содержание курса</Title>

              <List
                className="topics-list"
                dataSource={topics}
                renderItem={(topic) => (
                  <List.Item
                    className={`topic-item ${topic.current ? 'current' : ''} ${topic.completed ? 'completed' : ''}`}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <div className="topic-content">
                      <div className="topic-icon">
                        {topic.completed ? (
                          <CheckCircleOutlined className="completed-icon" />
                        ) : topic.current ? (
                          <PlayCircleOutlined className="current-icon" />
                        ) : (
                          <div className="topic-type-icon">
                            {topic.type === 'video' && <VideoCameraOutlined />}
                            {topic.type === 'quiz' && <QuestionCircleOutlined />}
                            {topic.type === 'content' && <FileTextOutlined />}
                            {topic.type === 'assignment' && <TrophyOutlined />}
                            {topic.type === 'resource' && <DownloadOutlined />}
                          </div>
                        )}
                      </div>

                      <div className="topic-info">
                        <Text className="topic-title">{topic.title}</Text>
                        {topic.duration && (
                          <Text type="secondary" className="topic-duration">
                            <ClockCircleOutlined /> {topic.duration} мин
                          </Text>
                        )}
                      </div>

                      {topic.completed && <CheckCircleOutlined className="completion-check" />}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Sider>

        {/* Main Content */}
        <Content className="course-content-area">
          <div className="content-wrapper">
            <div className="content-header">
              <div className="content-navigation">
                {/* <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text">
                  Назад к курсам
                </Button> */}
              </div>
            </div>

            <div className="content-body">
              {slidesLoading ? (
                <div className="content-loading">
                  <Spin size="large" />
                  <div>Загрузка контента...</div>
                </div>
              ) : (
                renderCourseContent()
              )}
            </div>
          </div>
        </Content>
      </Layout>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .course-view-page {
              min-height: 100vh;
              background: #f5f5f5;
            }

            .course-loading,
            .course-error {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              gap: 16px;
            }

                      .course-header {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
            color: #1e293b;
            padding: 48px 0;
            margin-bottom: 0;
            position: relative;
            border-bottom: 1px solid #e2e8f0;
          }

          .course-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
          }

          .course-header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            z-index: 2;
          }

          .course-info {
            flex: 1;
            max-width: 70%;
          }

          .course-breadcrumbs {
            margin-bottom: 20px;
          }

          .course-breadcrumbs .ant-breadcrumb-link {
            color: #64748b !important;
            font-size: 14px;
            font-weight: 400;
          }

          .course-breadcrumbs .ant-breadcrumb-separator {
            color: #94a3b8 !important;
          }

          .course-title {
            color: #1e293b !important;
            margin: 0 0 16px 0 !important;
            font-size: 42px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
            letter-spacing: -0.02em;
          }

          .course-subtitle {
            color: #475569 !important;
            font-size: 18px !important;
            margin-bottom: 32px !important;
            font-weight: 400;
            line-height: 1.6;
            max-width: 600px;
          }

          .course-stats {
            margin-top: 32px;
            display: flex;
            gap: 48px;
            flex-wrap: wrap;
          }

          .stat {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 140px;
          }

          .stat-label {
            color: #64748b;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .stat-value {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 500;
            color: #1e293b;
          }

          .stat-value .ant-avatar {
            background: #3b82f6;
            border: 1px solid #3b82f6;
            color: white;
          }

          .stat-value .ant-tag {
            background: #3b82f6;
            border: 1px solid #3b82f6;
            color: white;
            font-weight: 500;
            font-size: 13px;
          }

          .stat-value .ant-progress {
            margin-right: 8px;
            width: 60px;
          }

          .stat-value .ant-progress-bg {
            background: #10b981;
          }

          .course-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-end;
            min-width: 180px;
          }

          .course-actions .ant-btn {
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
            height: 36px;
            padding: 0 16px;
            font-size: 14px;
          }

          .course-actions .ant-btn-text {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }

          .course-actions .ant-btn-text:hover {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.3);
          }

          .course-actions .ant-btn-default {
            background: #3b82f6;
            color: white;
            font-weight: 600;
            border-color: #3b82f6;
          }

          .course-actions .ant-btn-default:hover {
            background: #2563eb;
            border-color: #2563eb;
          }

            .course-layout {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }

            .course-sidebar {
              background: #fafafa;
              border-right: 1px solid #f0f0f0;
            }

            .sidebar-content {
              padding: 24px;
              height: 100%;
              overflow-y: auto;
            }

            .course-progress {
              margin-bottom: 24px;
            }

            .progress-stats {
              margin-top: 12px;
              text-align: center;
            }

            .course-topics {
              flex: 1;
            }

            .topics-list {
              background: transparent;
            }

            .topic-item {
              padding: 12px 16px !important;
              margin: 4px 0;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s ease;
              border: none !important;
            }

            .topic-item:hover {
              background: #f0f0f0;
            }

            .topic-item.current {
              background: #e6f7ff;
              border-left: 4px solid #1890ff;
            }

            .topic-item.completed {
              background: #f6ffed;
            }

            .topic-content {
              display: flex;
              align-items: center;
              gap: 12px;
              width: 100%;
            }

            .topic-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
            }

            .completed-icon {
              color: #52c41a;
              font-size: 16px;
            }

            .current-icon {
              color: #1890ff;
              font-size: 16px;
            }

            .topic-type-icon {
              color: #666;
              font-size: 14px;
            }

            .topic-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }

            .topic-title {
              font-weight: 500;
              color: #262626;
            }

            .topic-duration {
              font-size: 12px;
            }

            .completion-check {
              color: #52c41a;
              font-size: 16px;
            }

            .course-content-area {
              background: white;
            }

            .content-wrapper {
              padding: 24px;
            }

            .content-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 1px solid #f0f0f0;
            }

            .content-controls {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .content-body {
              min-height: 600px;
            }

            .content-loading {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 400px;
              gap: 16px;
            }

            .course-content {
              max-width: 800px;
              margin: 0 auto;
            }

            .course-intro {
              text-align: center;
              padding: 40px 0;
            }

            .course-content-html {
              text-align: left;
              margin-top: 40px;
              line-height: 1.8;
            }

            .course-slide-content {
              max-width: 900px;
              margin: 0 auto;
            }

            .slide-header {
              margin-bottom: 16px;
              text-align: center;
            }

            .slide-title {
              margin-bottom: 16px !important;
            }

            .slide-meta {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 16px;
            }

            .slide-content {
              background: transparent;
              border-radius: 0;
              padding: 0;
              box-shadow: none;
            }

            @media (max-width: 768px) {
              .course-header-content {
                flex-direction: column;
                gap: 24px;
              }

              .course-actions {
                flex-direction: row;
                justify-content: center;
              }

              .content-header {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
              }

              .content-controls {
                width: 100%;
                justify-content: space-between;
              }
            }
          `,
        }}
      />
    </div>
  );
};

export default CourseViewPage;
