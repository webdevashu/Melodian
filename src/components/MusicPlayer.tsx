import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { getSoundCloudTrack } from '../utils/soundcloud';

interface Track {
  title: string;
  artist: string;
  album?: string;
  url: string;
  cover: string;
  lyrics?: string[];
}

interface MusicPlayerProps {
  searchQuery: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ searchQuery }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const searchTrack = async () => {
      if (!searchQuery) return;
      
      setError(null);
      setIsLoading(true);
      
      try {
        const track = await getSoundCloudTrack(`https://soundcloud.com/search/sounds?q=${encodeURIComponent(searchQuery)}`);
        if (track) {
          setCurrentTrack({
            title: track.title,
            artist: track.artist,
            url: track.streamUrl,
            cover: track.artwork || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
            album: track.album || 'Unknown Album',
            lyrics: [] // SoundCloud API doesn't provide lyrics
          });
          setStreamUrl(track.streamUrl);
        }
      } catch (error) {
        console.error('Error loading track:', error);
        setError('Failed to load track. Please try again later.');
        setStreamUrl(null);
        setCurrentTrack(null);
      } finally {
        setIsLoading(false);
      }
    };

    searchTrack();
  }, [searchQuery]);

  const togglePlay = async () => {
    if (!audioRef.current || !streamUrl) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {searchQuery && !currentTrack && !isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-xl text-gray-600">No tracks found matching "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="relative h-96">
              <img
                src={currentTrack?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'}
                alt={currentTrack?.title || 'Music Cover'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="text-3xl font-bold">{currentTrack?.title || 'Search for a track'}</h2>
                <p className="text-xl opacity-80">By {currentTrack?.artist || 'Unknown Artist'}</p>
                <p className="text-lg opacity-60">{currentTrack?.album || 'Unknown Album'}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <AudioVisualizer audioElement={audioRef.current} />

              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={togglePlay}
                  className={`p-4 rounded-full ${isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors`}
                  disabled={isLoading || !streamUrl}
                >
                  {isLoading ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <input
                  type="range"
                  className="w-full h-2 rounded-lg appearance-none bg-gray-200"
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.volume = Number(e.target.value) / 100;
                    }
                  }}
                  defaultValue="100"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {streamUrl && (
        <audio
          ref={audioRef}
          src={streamUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            setError('Error playing audio. Please try again.');
            setIsPlaying(false);
          }}
        />
      )}
    </div>
  );
};

export default MusicPlayer;