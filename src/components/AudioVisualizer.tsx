import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const sourceNodeRef = useRef<MediaElementAudioSourceNode>();
  const analyserRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const initializeAudioContext = () => {
      // Clean up previous audio context and connections
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      try {
        // Create new audio context and nodes
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioElement);

        // Store references
        audioContextRef.current = audioContext;
        sourceNodeRef.current = source;
        analyserRef.current = analyser;

        // Connect nodes
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Configure analyser
        analyser.fftSize = 256;
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    initializeAudioContext();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;

    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      animationRef.current = requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2;

        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioElement]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[200px] rounded-lg"
      width={800}
      height={200}
    />
  );
};

export default AudioVisualizer;