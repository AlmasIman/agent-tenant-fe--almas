import React, { useEffect, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Разрешаем красивые размеры и шрифты (style-атрибуты)
const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '24px', '32px'];
Quill.register(Size, true);

const Font = Quill.import('attributors/style/font') as any;
Font.whitelist = ['Inter', 'Georgia', 'Arial', 'Courier New', 'Times New Roman', 'Monaco'];
Quill.register(Font, true);

// Вспомогатели: распознаём видео-ссылки и преобразуем в embed
const ytEmbed = (link: string) => {
  try {
    const url = new URL(link);
    if (!/youtu\.be|youtube\.com/.test(url.hostname)) return null;
    let id = '';
    if (url.hostname.includes('youtu.be')) id = url.pathname.replace('/', '');
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2] || '';
    }
    if (!id) return null;
    const t = url.searchParams.get('t') || url.searchParams.get('start') || '';
    const toSec = (t: string) => {
      if (!t) return 0;
      if (/^\d+$/.test(t)) return Number(t);
      const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
      const h = Number(m?.[1] || 0),
        mn = Number(m?.[2] || 0),
        s = Number(m?.[3] || 0);
      return h * 3600 + mn * 60 + s;
    };
    const start = toSec(t);
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
    if (start > 0) params.set('start', String(start));
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } catch {
    return null;
  }
};

const vimeoEmbed = (link: string) => {
  try {
    const url = new URL(link);
    if (!/vimeo\.com$/.test(url.hostname.replace(/^www\./, ''))) return null;
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (!/^\d+$/.test(id || '')) return null;
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
};

const isMp4 = (link: string) => {
  try {
    return /\.mp4($|\?)/i.test(new URL(link).pathname);
  } catch {
    return false;
  }
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  height?: number;
};

const RichEditor: React.FC<Props> = ({ value, onChange, placeholder = 'Напишите контент курса…', height = 420 }) => {
  const quillRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: Font.whitelist }, { size: Size.whitelist }],
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          // при желании сюда можно вставить кастомную загрузку картинок на сервер
        },
      },
      clipboard: {
        matchVisual: true,
      },
    }),
    [],
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'indent',
    'script',
    'align',
    'color',
    'background',
    'link',
    'image',
    'video',
  ];

  // Авто-встраивание видео по CTRL+V обычной ссылки
  useEffect(() => {
    const q = quillRef.current?.getEditor();
    if (!q) return;

    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (!text) return;

      const yt = ytEmbed(text);
      const vm = vimeoEmbed(text);
      const sel = q.getSelection(true);

      if (yt || vm) {
        e.preventDefault();
        const idx = sel ? sel.index : q.getLength();
        q.insertEmbed(idx, 'video', yt || vm, 'user');
        q.setSelection(idx + 1, 0, 'user');
      } else if (isMp4(text)) {
        e.preventDefault();
        const idx = sel ? sel.index : q.getLength();
        // Quill сам создаёт <video> при вставке видео-файла как embed
        q.insertEmbed(idx, 'video', text, 'user');
        q.setSelection(idx + 1, 0, 'user');
      }
    };

    q.root.addEventListener('paste', onPaste);
    return () => q.root.removeEventListener('paste', onPaste);
  }, []);

  return (
    <div className="kb-editor">
      <ReactQuill
        ref={quillRef as any}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ height }}
      />
      <style>{`
        .kb-editor .ql-toolbar {
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }
        .kb-editor .ql-container {
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        .kb-editor .ql-editor {
          min-height: ${Math.max(220, height - 90)}px;
          line-height: 1.8;
          font-size: 16px;
        }
        .kb-editor .ql-editor h1 { font-size: 28px; margin: 20px 0 12px; }
        .kb-editor .ql-editor h2 { font-size: 22px; margin: 18px 0 10px; }
        .kb-editor .ql-editor h3 { font-size: 18px; margin: 16px 0 8px; }
        .kb-editor .ql-editor p  { margin: 0 0 10px; }
        .kb-editor .ql-editor blockquote { border-left: 4px solid #d9d9d9; background: #fafafa; padding: 10px 14px; }
        .kb-editor .ql-editor img, .kb-editor .ql-editor video { border-radius: 8px; }

      `}</style>
    </div>
  );
};

export default RichEditor;

// /* Небольшой тёмный скин, если в проекте тёмная тема */
// @media (prefers-color-scheme: dark) {
//   .kb-editor .ql-toolbar, .kb-editor .ql-container { background: #141414; border-color: #303030; }
//   .kb-editor .ql-picker-label, .kb-editor .ql-stroke { color: #d9d9d9; border-color: #d9d9d9; }
//   .kb-editor .ql-editor { color: #e8e8e8; }
//   .kb-editor .ql-editor blockquote { background: #1f1f1f; border-color: #434343; }
// }
