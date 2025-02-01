const CLIENT_ID = 'Tit7SRuEo9NZKhH59rkDS9K1OKFUsPHU';

export const getSoundCloudTrack = async (url: string) => {
  try {
    // First search for tracks
    const searchUrl = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(url)}&client_id=${CLIENT_ID}&limit=1`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Failed to search tracks: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.collection || searchData.collection.length === 0) {
      throw new Error('No tracks found');
    }

    const track = searchData.collection[0];
    
    if (!track || !track.id) {
      throw new Error('Invalid track data received');
    }

    // Get the streaming URL using the track ID
    const streamResponse = await fetch(`https://api-v2.soundcloud.com/tracks/${track.id}/streams?client_id=${CLIENT_ID}`);
    
    if (!streamResponse.ok) {
      throw new Error(`Failed to get stream URL: ${streamResponse.status}`);
    }

    const streamData = await streamResponse.json();
    
    if (!streamData.http_mp3_128_url) {
      throw new Error('No streaming URL available');
    }

    return {
      streamUrl: streamData.http_mp3_128_url,
      title: track.title,
      artist: track.user?.username || 'Unknown Artist',
      artwork: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : undefined,
      album: track.genre || undefined
    };
  } catch (error) {
    console.error('Error fetching SoundCloud track:', error);
    throw error;
  }
};