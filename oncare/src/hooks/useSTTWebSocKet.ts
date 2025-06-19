/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// hooks/useSTTWebSocket.ts - 토큰 기반 인증 버전
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
  const audioContextRef = useRef<AudioContext | null>(null); 
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clientIdRef = useRef<number>(Math.floor(Math.random() * 10000));

  useEffect(() => {
    // 이미 연결되어 있으면 리턴
    if (socketRef.current?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://oncare-2087995465.ap-northeast-2.elb.amazonaws.com';
    console.log('🔗 WebSocket 연결 시도:', wsUrl);
    
    // 사용자 정보와 토큰 가져오기
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!token) {
      console.error('❌ 인증 토큰이 없습니다.');
      setConnectionError('인증 토큰이 필요합니다. 다시 로그인해주세요.');
      onError?.('인증 토큰이 없습니다.');
      return;
    }
    
    const socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      // 🔥 토큰 기반 인증
      auth: {
        token: token // Bearer 프리픽스 없이 토큰만 전달
      },
      query: {
        userId: user?.id,
        clientId: clientIdRef.current
      },
      // 추가 헤더 (필요시)
      extraHeaders: {
        'Authorization': `Bearer ${token}`
      }
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
        setConnectionError('서버에서 연결을 거부했습니다. 인증을 확인해주세요.');
        onError?.('인증이 필요합니다.');
      }
    });

    // 연결 에러
    socket.on('connect_error', (error) => {
      console.error('🔥 WebSocket 연결 에러:', error.message);
      setIsConnected(false);
      
      // 토큰 관련 에러 처리
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setConnectionError('인증이 만료되었습니다. 다시 로그인해주세요.');
        onError?.('인증이 만료되었습니다.');
      } else {
        setConnectionError(`연결 실패: ${error.message}`);
      }
    });

    // STT 결과 수신
    socket.on('transcription', (data: { text: string, isFinal?: boolean }) => {
      console.log('📝 변환된 텍스트:', data.text);
      
      if (data.isFinal) {
        setTranscribedText(prev => prev + ' ' + data.text);
        onTranscription?.(data.text);
      } else {
        // 중간 결과도 표시하려면
        onTranscription?.(data.text);
      }
    });

    // STT 에러
    socket.on('stt_error', (error: { message: string }) => {
      console.error('🎤 STT 에러:', error.message);
      onError?.(error.message);
    });

    // 인증 에러 (서버에서 토큰 검증 실패 시)
    socket.on('auth_error', (error: { message: string }) => {
      console.error('🔐 인증 에러:', error.message);
      setConnectionError('인증에 실패했습니다. 다시 로그인해주세요.');
      onError?.('인증에 실패했습니다.');
      
      // 자동 재로그인이나 토큰 갱신 로직을 여기에 추가할 수 있음
    });

    socketRef.current = socket;

    return () => {
      console.log('🔌 컴포넌트 언마운트 - WebSocket 연결 해제');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [onError]); // onError 의존성 추가

  // 오디오 녹음 시작
  const startRecording = useCallback(async () => {
    if (!socketRef.current?.connected) {
      console.error('WebSocket not connected');
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
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 16000 
      });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      let audioBuffer: number[] = [];
      
      processorRef.current.onaudioprocess = (e) => {
        if (!isRecording) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const audioChunk = Array.from(inputData);
        audioBuffer = audioBuffer.concat(audioChunk);
        
        // 0.5초 분량의 오디오가 모이면 전송 (16000Hz * 0.5초 = 8000 샘플)
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
      
      // 녹음 시작 이벤트 전송
      socketRef.current.emit('startRecording', {
        clientId: clientIdRef.current
      });
      
      setIsRecording(true);
      setTranscribedText('');
      
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      onError?.('마이크 접근 권한이 필요합니다.');
    }
  }, [onError, isRecording]);

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