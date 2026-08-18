import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('../components/videoPlayer'), { ssr: false });

export default function Home() {
  return <VideoPlayer />;
}
