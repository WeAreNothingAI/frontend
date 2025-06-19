// hooks/useMockSTTWebSocket.ts - 개발용 Mock STT 훅
import { useState, useRef, useCallback } from 'react';

interface UseMockSTTWebSocketProps {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useMockSTTWebSocket = ({ onTranscription, onError }: UseMockSTTWebSocketProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected] = useState(true); // Mock에서는 항상 연결됨 (setIsConnected 제거)
  const [transcribedText, setTranscribedText] = useState('');
  const [connectionError, setConnectionError] = useState<string>('');
  
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null); // NodeJS.Timeout → number로 변경

  // Mock 텍스트 리스트 (랜덤으로 선택)
  const mockTranscriptions = [
    "안녕하세요. 오늘은 김복자 할머니와 상담을 진행하겠습니다.",
    "할머니께서 오늘 기분이 어떠신지 여쭤보았더니 좋다고 말씀하셨습니다.",
    "점심 식사 도움을 드렸고, 약 복용도 확인했습니다.",
    "산책을 함께 했으며, 날씨가 좋아서 기분이 좋으셨다고 하십니다.",
    "혈압 측정 결과 정상 범위였고, 컨디션도 양호하십니다.",
    "어제보다 걸음걸이가 안정적이어서 다행입니다.",
    "가족들 이야기를 하시며 즐거워하셨습니다.",
    "저녁 식사 준비를 도와드리고 마무리하겠습니다."
  ];

  // 오디오 녹음 시작 (Mock)
  const startRecording = useCallback(async () => {
    console.log('🎤 Mock STT 녹음 시작...');
    
    try {
      // 실제 마이크 권한은 요청 (UI 일관성을 위해)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      });
      streamRef.current = stream;

      setIsRecording(true);
      setTranscribedText('');
      setConnectionError('');
      
      // 3-8초 후 랜덤 텍스트 생성
      const randomDelay = Math.random() * 5000 + 3000; // 3-8초
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (isRecording) {
          const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
          console.log('📝 Mock 변환된 텍스트:', randomText);
          
          setTranscribedText(randomText);
          onTranscription?.(randomText);
          
          // 자동으로 녹음 중지
          stopRecording();
        }
      }, randomDelay);
      
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      onError?.('마이크 접근 권한이 필요합니다.');
      setConnectionError('마이크 접근 권한이 필요합니다.');
    }
  }, [onTranscription, onError, isRecording]);

  // 오디오 녹음 중지 (Mock)
  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    console.log('⏹️ Mock STT 녹음 중지...');

    // 타이머 정리
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    // 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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