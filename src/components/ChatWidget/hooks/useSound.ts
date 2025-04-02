
import { useCallback, useEffect, useState } from 'react';

export function useSound() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element for message notification sound
    const messageSound = new Audio('/message-notification.mp3');
    messageSound.volume = 0.5;
    setAudio(messageSound);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);
  
  const playMessageSound = useCallback(() => {
    if (audio) {
      // Reset the audio to start
      audio.currentTime = 0;
      // Play the sound
      audio.play().catch(err => {
        console.error('Failed to play notification sound:', err);
      });
    }
  }, [audio]);
  
  return { playMessageSound };
}
