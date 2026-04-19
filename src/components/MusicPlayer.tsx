import { useEffect, useRef, useState } from 'react';
import type { GamePhase, RoomType, Settings } from '../types';

interface Props {
  phase: GamePhase;
  roomType: RoomType | null;
  settings: Settings;
}

const TRACKS = {
  intro: '/assets/music/the_tavern_s_first_light.mp3',
  exploration: '/assets/music/the_lute_at_the_hearth.mp3',
  combat: '/assets/music/steel_against_the_gate.mp3',
  boss: '/assets/music/the_king_s_last_gambit.mp3',
};

export function MusicPlayer({ phase, roomType, settings }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<string>(TRACKS.intro);

  useEffect(() => {
    let nextTrack = TRACKS.intro;

    if (phase === 'playing') {
      if (roomType === 'boss') {
        nextTrack = TRACKS.boss;
      } else if (roomType === 'combat') {
        nextTrack = TRACKS.combat;
      } else {
        nextTrack = TRACKS.exploration;
      }
    } else if (phase === 'epilogue') {
      nextTrack = TRACKS.intro; // Or maybe a dedicated win track if available
    }

    if (nextTrack !== currentTrack) {
      setCurrentTrack(nextTrack);
    }
  }, [phase, roomType, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    } else {
      audioRef.current.src = currentTrack;
    }

    if (settings.musicEnabled) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback failed (usually needs user interaction first):', err);
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [currentTrack, settings.musicEnabled]);

  return null;
}
