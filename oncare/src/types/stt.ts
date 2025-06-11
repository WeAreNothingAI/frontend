// STT 관련 타입 정의
export interface AudioChunk {
  audio: number[]; // PCM 데이터 (Float32Array나 Int16Array를 number[]로 변환)
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