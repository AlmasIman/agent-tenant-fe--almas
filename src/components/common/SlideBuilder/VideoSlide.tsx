import React from 'react';
import { Card, Typography } from 'antd';
import { Slide } from './types';

const { Title } = Typography;

interface VideoSlideProps {
  slide: Slide;
  onComplete?: (score?: number) => void;
}

const VideoSlide: React.FC<VideoSlideProps> = ({ slide, onComplete }) => {
  let videoUrl = '';

  try {
    const parsedContent = JSON.parse(slide.content);
    videoUrl = parsedContent.url || parsedContent.videoUrl || slide.content || '';
  } catch {
    videoUrl = slide.content || '';
  }

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  const getEmbedUrl = (url: string) => {
    if (isYouTube) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (isVimeo) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '900px',
        textAlign: 'center',
        background: 'white',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
      bodyStyle={{ padding: '40px' }}
    >
      <Title level={2} style={{ marginBottom: '32px' }}>
        {slide.title}
      </Title>
      {videoUrl && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 aspect ratio
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <iframe
            src={getEmbedUrl(videoUrl)}
            title={slide.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
            allowFullScreen
          />
        </div>
      )}
    </Card>
  );
};

export default VideoSlide;
