import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Form, Input, message, Modal, Row, Select, Space, Tabs, Tag, Typography } from 'antd';
import { PlusOutlined, SaveOutlined, SendOutlined, BookOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
// import CreateSpaceModal from '@app/components/common/CreateSpaceModal';
import RichEditor from '@app/components/common/RichEditor';
import { SlideBuilder, Slide, SlideType } from '@app/components/common/SlideBuilder';
import { httpApi } from '@app/api/http.api';
import { useAppSelector } from '@app/hooks/reduxHooks';
import CreateSpaceModal from '@app/components/common/CreateSpaceModal';

const { Text } = Typography;
const { TextArea } = Input;

/** KB types */
// type SpaceType = { id: number; name: string };
// type KBArticle = {
//   id: number;
//   name: string | null;
//   description: string | null;
//   content: string | null;
//   publisher: string | null;
//   // В GET может прийти строка с названием, в POST/PATCH ожидается id (число)
//   space: number | string | null;
//   tags: string[] | string | null;
//   slides?: Slide[];
// };

type CategoryType = { id: number; name: string; parent?: string | null };

type TrainingDto = {
  id: number;
  name: string | null;
  description: string | null;
  publisher: string | null;
  category: number | string | null;
  presentation: number | null;
  kb_article?: number | null;
  tags: string | string[] | null;
};

// type ApiSlidePayload = {
//   name: string;
//   type:
//     | 'text'
//     | 'image'
//     | 'video'
//     | 'video_timecodes'
//     | 'image_text_overlay'
//     | 'embed'
//     | 'flashcards'
//     | 'fill_in_blank';
//   data: any;
//   order?: number;
// };

const mapSlideTypeToApi = (t: SlideType | string | undefined | null) => {
  // поддерживаем и enum, и строковые значения из редакторов
  const v = String(t ?? '').toLowerCase();
  switch (v) {
    case 'text':
      return 'text';
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'video_timecodes':
      return 'video_timecodes';
    case 'image_text_overlay':
      return 'image_text_overlay';
    case 'embed':
      return 'embed';
    case 'flashcards':
      return 'flashcards';
    case 'fill_in_blank':
      return 'fill_in_blank';
    case 'quiz':
      return 'quiz';
    default:
      return null;
  }
};

type ApiSlidePayload = {
  name: string;
  type: ReturnType<typeof mapSlideTypeToApi>;
  data: any;
  order?: number;
};

const toArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
};

const AlmasCourseCreatePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [catForm] = Form.useForm();
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [kbArticles, setKbArticles] = useState<Array<{ id: number; name: string }>>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [slides, setSlides] = useState<Array<Slide & { serverId?: number }>>([]);
  const [updatingSlides, setUpdatingSlides] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const user = useAppSelector((state) => state.user.user);
  const fullName = `${user?.firstName} ${user?.lastName}`;
  const [publisherName, setPublisherName] = useState<string>(fullName?.trim() || '');

  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [presentationName, setPresentationName] = useState<string>('');
  const [creatingPresentation, setCreatingPresentation] = useState(false);
  const [creatingSlides, setCreatingSlides] = useState(false);
  const [loadingSlides, setLoadingSlides] = useState(false);

  // const mapSlideTypeToApi = (t: SlideType) => {
  //   switch (t) {
  //     case SlideType.TEXT:
  //       return 'text';
  //     case SlideType.IMAGE:
  //       return 'image';
  //     case SlideType.VIDEO:
  //       return 'video';
  //     case SlideType.EMBED:
  //       return 'embed';
  //     case SlideType.FLASHCARDS:
  //       return 'flashcards';
  //     case SlideType.FILL_WORDS:
  //       return 'fill_in_blank';
  //     default:
  //       return null; // later: video_timecodes, image_text_overlay explicit, etc.
  //   }
  // };

  /** 1) Загрузка пространств */
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const { data } = await httpApi.get('/training-categories/', { params: { page_size: 500 } });
      let list: any[] = [];
      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.results)) list = data.results;
      else if (data && Array.isArray(data.items)) list = data.items;

      const items: CategoryType[] = list.map((x: any) => ({
        id: Number(x?.id),
        name: String(x?.name ?? 'Без названия'),
        parent: x?.parent ?? null,
      }));
      setCategories(items);
      if (!items.length) {
        // Подскажем в dev, чтобы не казалось, что оно «сломалось»
        console.info('[training-categories] пусто: бекенд вернул 0 элементов');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      message.error('Ошибка при загрузке категорий');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  /** 1.1) Загрузка статей БЗ для селекта */
  const loadKbArticles = useCallback(async () => {
    try {
      const { data } = await httpApi.get('/kb/articles/', { params: { page_size: 100 } });
      const items = toArray(data).map((x: any) => ({ id: Number(x?.id), name: String(x?.name || 'Без названия') }));
      setKbArticles(items);
    } catch (e) {
      console.error('Error loading KB articles:', e);
      message.warning('Не удалось загрузить статьи БЗ');
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadKbArticles();
  }, [loadCategories, loadKbArticles]);

  const toTagsArray = (t: TrainingDto['tags']): string[] => {
    if (Array.isArray(t)) return t.filter(Boolean).map(String);
    if (typeof t === 'string' && t.trim()) return [t.trim()];
    return [];
  };

  const loadTraining = useCallback(async () => {
    if (!isEdit || !id) return;
    try {
      setLoading(true);
      const { data } = await httpApi.get<TrainingDto>(`/trainings/${id}/`);
      const pub = (data.publisher || '').trim?.() || String(data.publisher || '');
      setPublisherName(pub || fullName || '');
      setCourseId(data.id);
      setTags(toTagsArray(data.tags));
      setPresentationId(data.presentation ?? null);

      form.setFieldsValue({
        title: data.name || '',
        description: data.description || '',
        publisher: pub || fullName || '',
        categoryId:
          typeof data.category === 'number'
            ? data.category
            : typeof data.category === 'string'
            ? categories.find((c) => c.name.trim() === String(data.category).trim())?.id
            : undefined,
        kbArticleId: typeof data.kb_article === 'number' ? data.kb_article : undefined,
      });
    } catch (err) {
      console.error('Error loading training:', err);
      message.error('Не удалось загрузить тренинг');
    } finally {
      setLoading(false);
    }
  }, [form, id, isEdit, categories, fullName]);

  useEffect(() => {
    loadTraining();
  }, [loadTraining]);

  useEffect(() => {
    if (!isEdit) {
      form.setFieldsValue({ publisher: (fullName || '').trim() });
      setPublisherName((fullName || '').trim());
    }
  }, [isEdit, fullName, form]);

  // Load slides when presentationId changes (either from creating new or loading existing)
  useEffect(() => {
    if (presentationId) {
      loadExistingSlides(presentationId);
    } else {
      setSlides([]);
    }
  }, [presentationId]);

  /** 5) Теги */
  const handleAddTag = () => {
    const val = inputTag.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setInputTag('');
    }
  };

  const handleRemoveTag = (removed: string) => setTags(tags.filter((t) => t !== removed));

  /** 6) Маппинг формы -> контракт Training API (presentation подставим позже) */
  const buildPayload = (values: any) => {
    const name = String(values.title ?? '').trim();
    const description = String(values.description ?? '').trim();
    if (!name || !description) {
      message.error('Заполните название и описание тренинга');
      throw new Error('validation');
    }
    return {
      name,
      description,
      presentation: null, // важно: выставим корректный ID после ensurePresentationAndSlides()
      publisher: fullName,
      category: values.categoryId as number,
      kb_article: values.kbArticleId ?? null,
      tags: tags.join(','),
    };
  };

  const syncSlidesWithExistingPresentationOrFail = async (): Promise<number> => {
    const pid = presentationId;
    if (!pid) {
      // message.error('Сначала создайте презентацию и добавьте слайды (ID презентации отсутствует).');
      throw new Error('presentation_required');
    }
    // Обновляем/добавляем слайды в уже существующую презентацию
    const sorted = [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setCreatingSlides(true);
    try {
      for (const s of sorted) {
        const payload = serializeSlideForApi(s);
        if (!payload) continue;
        if (s.serverId) {
          await httpApi.patch(`/slides/${s.serverId}/`, payload);
        } else {
          const { data } = await httpApi.post(`/presentations/${pid}/slides/`, payload);
          const sid = Number(data?.id);
          setSlides((prev) => prev.map((x) => (x.id === s.id ? { ...x, serverId: sid } : x)));
        }
      }
    } finally {
      setCreatingSlides(false);
    }
    return pid;
  };

  /** 7.3 Create / Update Training (после ensurePresentationAndSlides) */
  const createTraining = async (): Promise<TrainingDto> => {
    const values = await form.validateFields();
    const base = buildPayload(values);
    const pid = await syncSlidesWithExistingPresentationOrFail();
    const payload = { ...base, presentation: pid };
    const { data } = await httpApi.post<TrainingDto>('/trainings/', payload);
    return data;
  };

  const updateTraining = async (): Promise<TrainingDto> => {
    if (!id) throw new Error('no id');
    const values = await form.validateFields();
    const base = buildPayload(values);
    const pid = await syncSlidesWithExistingPresentationOrFail();
    const payload = { ...base, presentation: pid };
    const { data } = await httpApi.patch<TrainingDto>(`/trainings/${id}/`, payload);
    return data;
  };

  /** 8) Кнопки действий */
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const training = isEdit ? await updateTraining() : await createTraining();
      setCourseId(training.id);
      message.success(isEdit ? 'Изменения сохранены' : 'Черновик тренинга сохранён');
    } catch (error: any) {
      console.error('save error:', error);
      const data = error?.response?.data;
      if (data && typeof data === 'object') {
        const firstField = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstField]) ? data[firstField][0] : data[firstField];
        message.error(`${firstField}: ${firstMsg}`);
      } else {
        message.error(error?.message || 'Ошибка при сохранении');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const training = isEdit ? await updateTraining() : await createTraining();
      setCourseId(training.id);
      message.success(isEdit ? 'Тренинг обновлён' : 'Тренинг создан');
    } catch (error: any) {
      console.error('publish error:', error);
      const data = error?.response?.data;
      if (data && typeof data === 'object') {
        const firstField = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstField]) ? data[firstField][0] : data[firstField];
        message.error(`${firstField}: ${firstMsg}`);
      } else if (String(error?.message) === 'presentation_required') {
        message.error('Невозможно опубликовать: отсутствует презентация. Создайте презентацию и добавьте слайды.');
      } else {
        message.error(error?.message || 'Ошибка при публикации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToQuiz = () => {
    const idToUse = courseId || (id ? Number(id) : null);
    if (idToUse) navigate(`/course/${idToUse}/quiz`);
  };

  const loadExistingSlides = async (presentationId: number) => {
    try {
      setLoadingSlides(true);
      const { data: presentation } = await httpApi.get(`/presentations/${presentationId}/`);
      const existingSlides = presentation?.slides || [];
      if (existingSlides.length > 0) {
        const convertedSlides = existingSlides.map((slide: any) => ({
          id: slide.id.toString(),
          type: slide.type.toUpperCase(),
          title: slide.name,
          content: JSON.stringify(slide.data),
          order: slide.order,
          settings: {},
          serverId: slide.id,
        }));
        setSlides(convertedSlides);
        message.success(`Загружено ${existingSlides.length} слайдов`);
      } else {
        setSlides([]);
        message.info('В презентации пока нет слайдов');
      }
    } catch (error) {
      console.warn('Could not load existing slides:', error);
      setSlides([]);
      message.warning('Не удалось загрузить слайды презентации');
    } finally {
      setLoadingSlides(false);
    }
  };

  const handleCreatePresentation = async () => {
    const fallback = (form.getFieldValue('title') || 'Новая презентация').trim();
    const name = (presentationName || fallback).trim();
    if (!name) return message.warning('Введите название презентации');

    try {
      setCreatingPresentation(true);
      const { data } = await httpApi.post('/presentations/', { name });
      const newPresentationId = data?.id ?? null;
      setPresentationId(newPresentationId);
      message.success(`Презентация создана (ID: ${data?.id})`);

      // Load existing slides from the presentation to sync state
      if (newPresentationId) {
        await loadExistingSlides(newPresentationId);
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.detail || 'Не удалось создать презентацию');
    } finally {
      setCreatingPresentation(false);
    }
  };

  // const serializeSlideForApi = (s: Slide): ApiSlidePayload | null => {
  //   const base = { name: s.title || 'Слайд', order: s.order ?? 0 };

  //   // TEXT
  //   if (s.type === SlideType.TEXT) {
  //     return { ...base, type: 'text', data: { text: s.content || '' } };
  //   }

  //   // IMAGE (simple) or IMAGE with overlay from ImageTextEditor
  //   if (s.type === SlideType.IMAGE) {
  //     try {
  //       const parsed = JSON.parse(s.content || '{}');
  //       if (parsed.imageData && parsed.textElements) {
  //         // content saved by ImageTextEditor → treat as image_text_overlay
  //         return {
  //           ...base,
  //           type: 'image_text_overlay',
  //           data: {
  //             imageUrl: parsed.imageUrl || '',
  //             imageData: parsed.imageData,
  //             textElements: parsed.textElements,
  //           },
  //         };
  //       }
  //     } catch {}
  //     return { ...base, type: 'image', data: { url: s.content || '' } };
  //   }

  //   // VIDEO
  //   if (s.type === SlideType.VIDEO) {
  //     return { ...base, type: 'video', data: { url: s.content || '' } };
  //   }

  //   // EMBED
  //   if (s.type === SlideType.EMBED) {
  //     return { ...base, type: 'embed', data: { url: s.content || '' } };
  //   }

  //   // FLASHCARDS (already saved as JSON with { flashcards: { cards, ... } })
  //   if (s.type === SlideType.FLASHCARDS) {
  //     const parsed = safeJson(s.content);
  //     return { ...base, type: 'flashcards', data: parsed.flashcards ?? { cards: [] } };
  //   }

  //   // FILL WORDS (fill_in_blank) (JSON with { fillWords: { text, blanks, ... } })
  //   if (s.type === SlideType.FILL_WORDS) {
  //     const parsed = safeJson(s.content);
  //     return { ...base, type: 'fill_in_blank', data: parsed.fillWords ?? {} };
  //   }

  //   // Skip unsupported for now (QUIZ, CODE, CHART, IMAGE_DRAG_DROP…)
  //   return null;
  // };

  // ==== NORMALIZERS PER TYPE (build data object for API) =========================================
  const asString = (x: any, d = '') => (typeof x === 'string' ? x : d);
  const asNumber = (x: any, d = 0) => (typeof x === 'number' && !Number.isNaN(x) ? x : d);
  const asArray = (x: any) => (Array.isArray(x) ? x : []);
  const tryJson = (x: any) => {
    if (!x) return {};
    if (typeof x === 'object') return x;
    try {
      return JSON.parse(String(x));
    } catch {
      return {};
    }
  };

  // TEXT
  const buildTextData = (content: any) => {
    const c = tryJson(content);
    return { text: asString(c?.text ?? c?.html ?? c?.markdown ?? '') };
  };

  // IMAGE
  const buildImageData = (content: any) => {
    const c = tryJson(content);
    return { url: asString(c?.url ?? c?.imageUrl ?? '') };
  };

  // VIDEO
  const buildVideoData = (content: any) => {
    const c = tryJson(content);
    return { url: asString(c?.url ?? c?.videoUrl ?? '') };
  };

  // VIDEO_TIMECODES
  const buildVideoTimecodesData = (content: any) => {
    const c = tryJson(content);
    const url = asString(c?.url ?? c?.videoUrl ?? '');
    const timecodes = asArray(c?.timecodes).map((t: any) => ({
      from: asNumber(t?.from, 0),
      to: asNumber(t?.to, 0),
      label: asString(t?.label ?? ''),
    }));
    return timecodes.length ? { url, timecodes } : { url };
  };

  // IMAGE_TEXT_OVERLAY
  const buildImageTextOverlayData = (content: any) => {
    const c = tryJson(content);
    // В твоих редакторах раньше попадались imageUrl/imageData/textElements — бэку ок минимальная форма.
    const url = asString(c?.url ?? c?.imageUrl ?? '');
    const text = asString(
      c?.text ??
        asArray(c?.textElements)
          .map((x: any) => x?.text)
          .filter(Boolean)
          .join(' ') ??
        '',
    );
    return { url, text };
  };

  // EMBED
  const buildEmbedData = (content: any) => {
    const c = tryJson(content);
    const url = asString(c?.url ?? c?.src ?? '');
    const html = asString(c?.html ?? '');
    return html ? { html } : { url };
  };

  // FLASHCARDS
  const buildFlashcardsData = (content: any) => {
    const c = tryJson(content);
    const rawCards = asArray(c?.cards);
    const cards = rawCards
      .map((card: any) => ({
        front: asString(card?.front ?? card?.q ?? card?.question ?? ''),
        back: asString(card?.back ?? card?.a ?? card?.answer ?? ''),
      }))
      .filter((x: any) => x.front || x.back);
    return { cards };
  };

  // FILL_IN_BLANK
  const buildFillInBlankData = (content: any) => {
    const c = tryJson(content?.fillWords ?? content); // в части компонентов это лежит в content.fillWords
    return {
      text: asString(c?.text ?? ''),
      blanks: asArray(c?.blanks)
        .map((b: any) => asString(b))
        .filter(Boolean),
      showHints: !!c?.showHints,
      caseSensitive: !!c?.caseSensitive,
    };
  };

  // QUIZ
  const letterToIndex = (s: any) => {
    if (typeof s !== 'string') return null;
    const ch = s.trim().toUpperCase();
    if (!/^[A-Z]$/.test(ch)) return null;
    return ch.charCodeAt(0) - 'A'.charCodeAt(0);
  };

  const buildQuizData = (content: any) => {
    const c = tryJson(content?.quiz ?? content); // часто editor кладёт под content.quiz

    const questions = asArray(c?.quiz?.questions || c?.questions)
      .map((q: any) => {
        const prompt = asString(q?.prompt ?? q?.question ?? q?.text ?? '');

        // normalize options to array of plain strings
        const rawOpts = asArray(q?.options ?? q?.answers ?? q?.choices);
        const options = rawOpts
          .map((o: any) => (typeof o === 'string' ? o : asString(o?.text ?? o?.label ?? o?.value ?? '')))
          .filter((x: string) => x !== '');

        // collect correctness flags from various shapes
        let correct_indices: number[] = [];

        // 1) explicit indices (new SlideEditor format)
        if (!correct_indices.length) {
          correct_indices = asArray(q?.correct_indices)
            .map((i: any) => asNumber(i))
            .filter((i) => i >= 0);
        }

        // 2) options array with booleans
        if (!correct_indices.length) {
          const flagOpts = rawOpts.map((o: any) => (typeof o === 'object' ? !!(o?.correct ?? o?.isCorrect) : false));
          correct_indices = flagOpts.map((ok, idx) => (ok ? idx : -1)).filter((i) => i >= 0);
        }

        // 3) single correct index field (SlideEditor format)
        if (!correct_indices.length && typeof q?.correctAnswer === 'number') {
          correct_indices = [asNumber(q.correctAnswer)];
        }

        // 4) single correct index field (legacy format)
        if (!correct_indices.length && typeof q?.correctIndex === 'number') {
          correct_indices = [asNumber(q.correctIndex)];
        }

        // 5) letters like ['B','C'] or 'C'
        if (!correct_indices.length) {
          const letters = asArray(q?.correctLetters ?? q?.correct_letter ?? q?.answerLetters ?? q?.answersLetters);
          const fromLetters = letters.map((L: any) => letterToIndex(L)).filter((i: any) => i != null) as number[];
          if (fromLetters.length) correct_indices = fromLetters;
          else if (typeof q?.correctLetter === 'string') {
            const idx = letterToIndex(q.correctLetter);
            if (idx != null) correct_indices = [idx];
          }
        }

        // 6) correct texts (exact match)
        if (!correct_indices.length) {
          const texts = asArray(q?.correct ?? q?.correctOptions ?? q?.answer ?? q?.answers)
            .map((x: any) => (typeof x === 'string' ? x.trim() : x))
            .filter(Boolean);
          if (texts.length && options.length) {
            const lower = options.map((s: string) => s.trim().toLowerCase());
            correct_indices = texts
              .map((t: any) => (typeof t === 'string' ? lower.indexOf(t.trim().toLowerCase()) : -1))
              .filter((i: number) => i >= 0);
          }
        }

        // de-dup  sort
        correct_indices = Array.from(new Set(correct_indices)).sort((a, b) => a - b);

        return { prompt, options, correct_indices };
      })
      .filter((q: any) => q.prompt && q.options.length);

    const passing = asNumber(c?.quiz?.passing || c?.passing, 100);
    return { questions, passing };
  };

  const serializeSlideForApi = (slide: Slide & { serverId?: number }): ApiSlidePayload | null => {
    const apiType = mapSlideTypeToApi(slide.type as any);
    if (!apiType) return null;

    const base = { name: slide.title || 'Слайд', order: slide.order ?? 0 };
    const content = (slide as any)?.content ?? (slide as any)?.data ?? {};

    switch (apiType) {
      case 'text':
        return { ...base, type: apiType, data: buildTextData(content) };
      case 'image':
        return { ...base, type: apiType, data: buildImageData(content) };
      case 'video':
        return { ...base, type: apiType, data: buildVideoData(content) };
      case 'video_timecodes':
        return { ...base, type: apiType, data: buildVideoTimecodesData(content) };
      case 'image_text_overlay':
        return { ...base, type: apiType, data: buildImageTextOverlayData(content) };
      case 'embed':
        return { ...base, type: apiType, data: buildEmbedData(content) };
      case 'flashcards':
        return { ...base, type: apiType, data: buildFlashcardsData(content) };
      case 'fill_in_blank':
        return { ...base, type: apiType, data: buildFillInBlankData(content) };
      case 'quiz':
        return { ...base, type: apiType as any, data: buildQuizData(content) };
      default:
        return null;
    }
  };

  function safeJson(s?: string) {
    try {
      return JSON.parse(s || '{}');
    } catch {
      return {};
    }
  }

  const pushSlidesToPresentation = async () => {
    if (!presentationId) return message.warning('Сначала создайте презентацию');

    try {
      setCreatingSlides(true);

      const sorted = [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      let ok = 0;
      let fail = 0;

      // Create sequentially so we can map server IDs back to the exact client slide
      for (const s of sorted) {
        const payload = serializeSlideForApi(s);
        if (!payload) {
          fail++;
          continue;
        }
        try {
          const { data } = await httpApi.post(`/presentations/${presentationId}/slides/`, payload);
          ok++;
          // Save server id back into local state for this slide
          setSlides((prev) => prev.map((x) => (x.id === s.id ? { ...x, serverId: data?.id } : x)));
        } catch {
          fail++;
        }
      }
      if (ok) message.success(`Добавлено слайдов: ${ok}`);
      if (fail) message.warning(`Пропущено/ошибка: ${fail}`);
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Не удалось добавить слайды');
    } finally {
      setCreatingSlides(false);
    }
  };

  const persistSlideToApi = async (slide: Slide & { serverId?: number }) => {
    if (!presentationId) {
      message.warning('Сначала создайте презентацию (ID требуется для сохранения слайдов)');
      return;
    }

    // Get the next available order number to avoid conflicts
    const getNextOrder = async () => {
      try {
        // Get existing slides from the presentation to find the highest order
        const { data: presentation } = await httpApi.get(`/presentations/${presentationId}/`);
        const existingSlides = presentation?.slides || [];
        const maxOrder = existingSlides.length > 0 ? Math.max(...existingSlides.map((s: any) => s.order || 0)) : -1;
        return maxOrder + 1;
      } catch (error) {
        console.warn('Could not get existing slides, using fallback order:', error);
        return slides.length; // Fallback to local slides count
      }
    };

    const payload = serializeSlideForApi(slide);
    if (!payload) {
      message.warning('Этот тип слайда пока не поддержан API');
      return;
    }

    try {
      if (slide.serverId) {
        // PATCH /api/slides/{id}/
        await httpApi.patch(`/slides/${slide.serverId}/`, payload);
        message.success(`Слайд #${slide.serverId} обновлён`);
      } else {
        // Ensure unique order for new slides
        const nextOrder = await getNextOrder();
        const payloadWithOrder = { ...payload, order: nextOrder };

        // POST /api/presentations/{presentationId}/slides/
        const { data } = await httpApi.post(`/presentations/${presentationId}/slides/`, payloadWithOrder);
        setSlides((prev) => prev.map((x) => (x.id === slide.id ? { ...x, serverId: data?.id, order: nextOrder } : x)));
        message.success(`Слайд создан (ID: ${data?.id})`);
      }
    } catch (err: any) {
      console.error('persist slide error:', err);
      if (err?.response?.data?.non_field_errors?.includes('presentation, order must make a unique set')) {
        // Try to resolve order conflicts by reloading slides and retrying
        try {
          await loadExistingSlides(presentationId);
          message.warning('Порядок слайдов был обновлен. Попробуйте создать слайд снова.');
        } catch (reloadError) {
          message.error('Слайд с таким порядком уже существует. Попробуйте создать слайд снова.');
        }
      } else {
        message.error(err?.response?.data?.detail || 'Не удалось сохранить слайд');
      }
    }
  };

  const deleteSlideFromApi = async (slideId: string) => {
    const prev = slides;
    const target = prev.find((s) => s.id === slideId);
    if (!target) {
      message.error('Слайд не найден');
      return;
    }

    // Optimistic remove + reindex
    const remaining = prev.filter((s) => s.id !== slideId);
    const reindexed = remaining.map((s, idx) => ({ ...s, order: idx }));
    setSlides(reindexed);

    try {
      if (target.serverId) {
        await httpApi.delete(`/slides/${target.serverId}/`);
      }
      message.success('Слайд удалён');
    } catch (err: any) {
      // revert UI
      setSlides(prev);
      console.error('delete slide error:', err);
      message.error(err?.response?.data?.detail || 'Не удалось удалить слайд');
      return;
    }

    // Best-effort: sync orders for remaining slides that already exist on server
    try {
      await Promise.allSettled(
        reindexed.map((s, idx) => {
          if (!s.serverId) return Promise.resolve();
          const payload = serializeSlideForApi(s);
          if (!payload) return Promise.resolve();
          return httpApi.patch(`/slides/${s.serverId}/`, { ...payload, order: idx });
        }),
      );
    } catch {
      /* tolerate partial order sync failures */
    }
  };

  const canGoToQuiz = !!(courseId || id) && !!form.getFieldValue('title') && !!form.getFieldValue('description');

  /** 9) UI */
  return (
    <>
      <PageTitle>{isEdit ? 'Редактирование тренинга' : 'Создание тренинга'}</PageTitle>

      {/* Модалка создания категории */}
      <Modal
        title="Новая категория"
        open={createCategoryOpen}
        onCancel={() => {
          setCreateCategoryOpen(false);
          catForm.resetFields();
        }}
        onOk={async () => {
          try {
            const { name } = await catForm.validateFields();
            setCreatingCategory(true);
            const { data } = await httpApi.post('/training-categories/', { name: String(name).trim() });
            const created = {
              id: Number(data?.id),
              name: String(data?.name || name),
              parent: (data as any)?.parent ?? null,
            } as CategoryType;
            setCategories((prev) => [...prev, created]);
            form.setFieldsValue({ categoryId: created.id });
            message.success('Категория создана');
            setCreateCategoryOpen(false);
            catForm.resetFields();
          } catch (e: any) {
            if (e?.errorFields) return; // валидация формы
            console.error(e);
            message.error(e?.response?.data?.detail || 'Не удалось создать категорию');
          } finally {
            setCreatingCategory(false);
          }
        }}
        confirmLoading={creatingCategory}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={catForm} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[
              { required: true, message: 'Введите название категории' },
              { max: 255, message: 'Слишком длинное название' },
            ]}
          >
            <Input placeholder="Например, Охрана труда и безопасность" />
          </Form.Item>
        </Form>
      </Modal>

      <Card loading={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Основная информация" key="basic">
            <Form form={form} layout="vertical" initialValues={{ spaceId: undefined, content: '' }}>
              <Row gutter={24}>
                <Col span={16}>
                  <Form.Item
                    name="title"
                    label="Название тренинга"
                    rules={[{ required: true, whitespace: true, message: 'Введите название тренинга' }]}
                  >
                    <Input placeholder="Введите название тренинга" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Описание"
                    rules={[{ required: true, whitespace: true, message: 'Введите описание тренинга' }]}
                  >
                    <TextArea rows={3} placeholder="Краткое описание тренинга" showCount maxLength={500} />
                  </Form.Item>

                  {/* <Form.Item name="content" label="Контент курса">
                    <RichEditor
                      value={form.getFieldValue('content') || ''}
                      onChange={(html) => form.setFieldsValue({ content: html })}
                    />
                  </Form.Item> */}
                </Col>

                <Col span={8}>
                  <Card size="small" title="Настройки тренинга" style={{ marginBottom: 16 }}>
                    <Form.Item
                      name="categoryId"
                      label="Категория"
                      rules={[{ required: true, message: 'Выберите категорию' }]}
                    >
                      <Select
                        placeholder="Выберите категорию"
                        showSearch
                        optionFilterProp="children"
                        loading={categoriesLoading}
                      >
                        {categories.map((cat) => (
                          <Select.Option key={cat.id} value={cat.id}>
                            {cat.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button
                      icon={<PlusOutlined />}
                      style={{ marginBottom: 16 }}
                      onClick={() => setCreateCategoryOpen(true)}
                    >
                      Новая категория
                    </Button>
                    <Form.Item name="kbArticleId" label="KB-статья">
                      <Select
                        placeholder="Не выбрано"
                        showSearch
                        optionFilterProp="children"
                        allowClear
                        loading={!kbArticles.length}
                      >
                        {kbArticles.map((a) => (
                          <Select.Option key={a.id} value={a.id}>
                            {a.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label="Теги">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Input
                            value={inputTag}
                            onChange={(e) => setInputTag(e.target.value)}
                            placeholder="Добавить тег"
                            onPressEnter={handleAddTag}
                            style={{ width: 160 }}
                          />
                          <Button type="dashed" onClick={handleAddTag} icon={<PlusOutlined />}>
                            Добавить
                          </Button>
                        </Space>
                        <div>
                          {tags.map((tag) => (
                            <Tag key={tag} closable onClose={() => handleRemoveTag(tag)} style={{ marginBottom: 8 }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    </Form.Item>
                    <Form.Item label="Создатель" name="publisher">
                      <Input disabled />
                    </Form.Item>
                  </Card>

                  <Card size="small" title={isEdit ? 'Действия (редактирование)' : 'Действия'}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading} block>
                        {isEdit ? 'Сохранить изменения' : 'Сохранить черновик'}
                      </Button>

                      <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={loading} block>
                        {isEdit ? 'Обновить и открыть' : 'Опубликовать'}
                      </Button>

                      <Button
                        type="default"
                        icon={<BookOutlined />}
                        onClick={handleGoToQuiz}
                        disabled={!canGoToQuiz}
                        block
                      >
                        Перейти к викторине
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Слайды тренинга" key="slides">
            <Card size="small" title="Презентация" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Название презентации"
                  value={presentationName}
                  onChange={(e) => setPresentationName(e.target.value)}
                />
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreatePresentation}
                    loading={creatingPresentation}
                  >
                    Создать презентацию
                  </Button>

                  {presentationId && (
                    <>
                      <Tag color="blue">ID: {presentationId}</Tag>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => loadExistingSlides(presentationId)}
                        loading={loadingSlides}
                        disabled={!presentationId}
                      >
                        Загрузить слайды
                      </Button>
                    </>
                  )}

                  {/* <Button
                    disabled={!presentationId || slides.length === 0}
                    loading={creatingSlides}
                    onClick={pushSlidesToPresentation}
                  >
                    Отправить слайды в презентацию
                  </Button> */}
                </Space>

                <Text type="secondary">
                  {presentationId 
                    ? `Презентация создана. Слайды: ${slides.length} шт.` 
                    : 'Сначала создайте презентацию — затем добавляйте слайды в неё.'
                  }
                </Text>
              </Space>
            </Card>
            <SlideBuilder
              slides={slides}
              onSlidesChange={setSlides}
              readOnly={false}
              onPersistSlide={persistSlideToApi}
              onDeleteSlide={deleteSlideFromApi}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default AlmasCourseCreatePage;
