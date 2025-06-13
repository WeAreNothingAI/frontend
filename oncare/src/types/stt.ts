export interface AudioChunk {
  audio: number[];
  clientId: number;
}

export interface STTResponse {
  text?: string;
  error?: string;
  isFinal?: boolean;
  timestamp?: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
}