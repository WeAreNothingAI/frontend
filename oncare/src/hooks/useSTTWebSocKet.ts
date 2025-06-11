// hooks/useSTTWebSocket.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSTTWebSocketProps {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useSTTWebSocket = ({ onTranscription, onError }: UseSTTWebSocketProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // eslint-disable-line
  const audioContextRef = useRef<AudioContext | null>(null); 
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clientIdRef = useRef<number>(Math.floor(Math.random() * 10000));

  // Socket.io 연결
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('accessToken'); // JWT 토큰 가져오기
    
    if (!token) {
      onError?.('인증 토큰이 없습니다.');
      return;
    }
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000', {
      path: '/socket.io',
      withCredentials: true, // 쿠키 자동 전송
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('WebSocket 연결됨');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket 연결 해제됨');
      setIsConnected(false);
    });

    socket.on('transcription', (data: { text: string, isFinal?: boolean }) => {
      console.log('변환된 텍스트:', data.text);
      setTranscribedText(prev => prev + ' ' + data.text);
      onTranscription?.(data.text);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('STT 오류:', error.message);
      onError?.(error.message);
    });

    socketRef.current = socket;
  }, [onTranscription, onError]);

  // 오디오 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // 16kHz 샘플레이트
          channelCount: 1,   // 모노
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      streamRef.current = stream;

      // AudioContext 설정 (16kHz)
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // ScriptProcessor 생성 (청크 크기: 4096 샘플 = 약 256ms)
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      let audioBuffer: number[] = [];
      
      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Float32Array를 number[]로 변환
        const audioChunk = Array.from(inputData);
        audioBuffer = audioBuffer.concat(audioChunk);
        
        // 버퍼가 충분히 쌓이면 전송 (약 500ms)
        if (audioBuffer.length >= 8000) { // 16000Hz * 0.5초
          if (socketRef.current?.connected) {
            socketRef.current.emit('audio', {
              audio: audioBuffer,
              clientId: clientIdRef.current
            });
          }
          audioBuffer = []; // 버퍼 초기화
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
      setTranscribedText(''); // 이전 텍스트 초기화
      
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      onError?.('마이크 접근 권한이 필요합니다.');
    }
  }, [onError]);

  // 오디오 녹음 중지
  const stopRecording = useCallback(() => {
    if (isRecording) {
      // Socket.io로 녹음 종료 알림
      if (socketRef.current?.connected) {
        socketRef.current.emit('stopRecording', {
          clientId: clientIdRef.current
        });
      }

      // 오디오 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // AudioContext 정리
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsRecording(false);
    }
  }, [isRecording]);

  // 컴포넌트 마운트 시 WebSocket 연결
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connectWebSocket]);

  return {
    isRecording,
    isConnected,
    transcribedText,
    startRecording,
    stopRecording,
    clearTranscription: () => setTranscribedText('')
  };
};