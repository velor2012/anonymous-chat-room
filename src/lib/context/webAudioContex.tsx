'use-client';

import React, { useContext } from 'react';

export const WebAudioContext = React.createContext<AudioContext | undefined>(
  undefined,
);

export function useWebAudioContext() {
  const ctx = useContext(WebAudioContext);
  if (!ctx) {
    throw 'useWebAudio must be used within a WebAudioProvider';
  }
  return ctx;
}