import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { getSoundCloudTrack } from '../utils/soundcloud';

const songs = [
  {
    title: "You Make Me Whole",
    artist: "Giffoo",
    album: "Paws Next To Me",
    url: "https://soundcloud.com/giffoo/you-make-me-whole?si=56ca46083eaa4142a37777f0ae293cb7&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    cover: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400",
    lyrics: [
      "Verse 1:",
      "Dancing through the starlit night",
      "Chasing dreams in pure delight",
      "Chorus:",
      "Let the music take control",
      "As we lose our mortal soul"
    ]
  },
  {
    title: "Ocean Breeze",
    artist: "Wave Riders",
    album: "Coastal Vibes",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    lyrics: [
      "Verse 1:",
      "Waves crash upon the shore",
      "Nature's rhythm, nothing more",
      "Chorus:",
      "Feel the ocean's gentle sway",
      "As our troubles drift away"
    ]
  }
];

interface MusicPlayerProps {
  searchQuery: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ searchQuery }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return songs;
    
    const query = searchQuery.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query) ||
      song.lyrics.some(line => line.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const currentSong = filteredSongs[currentSongIndex] || songs[0];

  useEffect(() => {
    const loadSoundCloudTrack = async () => {
      if (currentSong.url.includes('soundcloud.com')) {
        const track = await getSoundCloudTrack(currentSong.url);
        if (track) {
          setStreamUrl(track.streamUrl);
        }
      } else {
        setStreamUrl(currentSong.url);
      }
    };

    loadSoundCloudTrack();
  }, [currentSong]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % filteredSongs.length);
  };

  const playPrevious = () => {
    setCurrentSongIndex((prev) => (prev - 1 + filteredSongs.length) % filteredSongs.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {searchQuery && filteredSongs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-xl text-gray-600">No songs found matching "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="relative h-96">
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="text-3xl font-bold">{currentSong.title}</h2>
                <p className="text-xl opacity-80">By {currentSong.artist}</p>
                <p className="text-lg opacity-60">{currentSong.album}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <AudioVisualizer audioElement={audioRef.current} />

              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={playPrevious}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
                <button
                  onClick={playNext}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
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

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4">Lyrics</h3>
            <div className="space-y-2">
              {currentSong.lyrics.map((line, index) => (
                <p
                  key={index}
                  className={line.includes(':') ? 'font-bold mt-4' : 'text-gray-600'}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      <audio
        ref={audioRef}
        src={streamUrl || undefined}
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicPlayer;