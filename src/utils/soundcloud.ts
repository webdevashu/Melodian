import SC from 'soundcloud';

// Initialize SoundCloud client
SC.initialize({
  client_id: import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID,
});

export const getSoundCloudTrack = async (url: string) => {
  try {
    const track = await SC.resolve(url);
    return {
      streamUrl: `${track.stream_url}?client_id=${import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID}`,
      title: track.title,
      artist: track.user.username,
      artwork: track.artwork_url ? track.artwork_url.replace('large', 't500x500') : undefined,
    };
  } catch (error) {
    console.error('Error fetching SoundCloud track:', error);
    return null;
  }
};