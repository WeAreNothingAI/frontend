/* eslint-disable @typescript-eslint/no-unused-vars */
// hooks/useSTTWebSocket.ts - 무한루프 수정 버전
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
  const [connectionError, setConnectionError] = useState<string>('');
  
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); 
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clientIdRef = useRef<number>(Math.floor(Math.random() * 10000));

  // ✅ useEffect를 직접 사용하여 한 번만 연결 (의존성 배열 문제 해결)
  useEffect(() => {
    // 이미 연결되어 있으면 리턴
    if (socketRef.current?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    console.log('🔗 WebSocket 연결 시도:', wsUrl);
    
    const socket = io(wsUrl, {
      path: '/socket.io',
      withCredentials: true, // 쿠키 기반 인증
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // 연결 성공
    socket.on('connect', () => {
      console.log('✅ WebSocket 연결 성공:', socket.id);
      setIsConnected(true);
      setConnectionError('');
    });

    // 연결 해제
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket 연결 해제:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        setConnectionError('서버에서 연결을 거부했습니다. 로그인을 확인해주세요.');
        onError?.('인증이 필요합니다. 다시 로그인해주세요.');
      }
    });

    // 연결 에러
    socket.on('connect_error', (error) => {
      console.error('🔥 WebSocket 연결 에러:', error);
      setIsConnected(false);
      setConnectionError('WebSocket 연결에 실패했습니다.');
    });

    // STT 결과 수신
    socket.on('transcription', (data: { text: string, isFinal?: boolean }) => {
      console.log('📝 변환된 텍스트:', data.text);
      
      if (data.isFinal) {
        setTranscribedText(prev => prev + ' ' + data.text);
        onTranscription?.(data.text);
      } else {
        onTranscription?.(data.text);
      }
    });

    // STT 에러
    socket.on('stt_error', (error: { message: string }) => {
      console.error('🎤 STT 에러:', error.message);
      onError?.(error.message);
    });

    socketRef.current = socket;

    // ✅ 컴포넌트 언마운트 시에만 연결 해제
    return () => {
      console.log('🔌 컴포넌트 언마운트 - WebSocket 연결 해제');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // ✅ 빈 의존성 배열로 한 번만 실행

  // 오디오 녹음 시작
  const startRecording = useCallback(async () => {
    if (!socketRef.current?.connected) {
      onError?.('음성 인식 서버에 연결되지 않았습니다.');
      return;
    }

    try {
      console.log('🎤 녹음 시작...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      let audioBuffer: number[] = [];
      
      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const audioChunk = Array.from(inputData);
        audioBuffer = audioBuffer.concat(audioChunk);
        
        if (audioBuffer.length >= 8000) {
          if (socketRef.current?.connected) {
            socketRef.current.emit('audio', {
              audio: audioBuffer,
              clientId: clientIdRef.current
            });
          }
          audioBuffer = [];
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
      setTranscribedText('');
      
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      onError?.('마이크 접근 권한이 필요합니다.');
    }
  }, [onError]);

  // 오디오 녹음 중지
  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    console.log('⏹️ 녹음 중지...');

    if (socketRef.current?.connected) {
      socketRef.current.emit('stopRecording', {
        clientId: clientIdRef.current
      });
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, [isRecording]);

  // 텍스트 초기화
  const clearTranscription = useCallback(() => {
    setTranscribedText('');
  }, []);

  return {
    isRecording,
    isConnected,
    transcribedText,
    connectionError,
    startRecording,
    stopRecording,
    clearTranscription,
  };
};