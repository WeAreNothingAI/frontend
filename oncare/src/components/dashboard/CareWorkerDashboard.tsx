"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Mic, MicOff, Loader2, Upload, FileAudio, Play, Pause, X } from 'lucide-react';
import { useSTTWebSocket } from '@/hooks/useSTTWebSocKet';
import { useMockSTTWebSocket } from '@/hooks/useMockSTTWebSocket';
import type { ClientDetail } from '@/lib/api';
import LogoutButton from '../ui/LogOutButton';

// Mock 데이터 (실제로는 API에서 가져옴)
const mockClients = [
  {
    id: 1,
    name: '김복자',
    birthDate: '1945-03-15',
    gender: '여',
    address: '서울시 강남구',
    contact: '010-1234-5678',
    guardianContact: '010-9876-5432',
    careWorkerId: 1,
    notes: '고혈압 주의'
  },
  {
    id: 2,
    name: '이순자',
    birthDate: '1940-07-20',
    gender: '여',
    address: '서울시 서초구',
    contact: '010-2345-6789',
    guardianContact: '010-8765-4321',
    careWorkerId: 1,
    notes: '당뇨병 관리 필요'
  },
  {
    id: 3,
    name: '박영수',
    birthDate: '1942-11-08',
    gender: '남',
    address: '서울시 송파구',
    contact: '010-3456-7890',
    guardianContact: '010-7654-3210',
    careWorkerId: 1,
    notes: '거동 불편'
  }
];

export default function CareWorkerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState<ClientDetail[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workStatus, setWorkStatus] = useState<Map<number, {isWorking: boolean, startTime?: string}>>(new Map());
  
  // 일지 관련 상태
  const [journalContent, setJournalContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingJournal, setIsEditingJournal] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentToken = localStorage.getItem('access_token');
  const isTemporaryToken = currentToken?.startsWith('temp_jwt_token_');
  const sttHook = isTemporaryToken ? useMockSTTWebSocket : useSTTWebSocket;

  

  // STT WebSocket Hook
  const {
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    clearTranscription
  } = sttHook({
    onTranscription: (text) => {
      setJournalContent(prev => prev + ' ' + text);
    },
    onError: (error) => {
      alert(`STT 오류: ${error}`);
    }
  });

  // 초기 데이터 로드
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      // 실제로는 API 호출
      // const response = await api.getClients();
      // setClients(response);
      
      // Mock 데이터 사용
      setTimeout(() => {
        setClients(mockClients);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('노인 목록 조회 실패:', error);
      setIsLoading(false);
    }
  };

  // 출근 처리
  const handleClockIn = async (clientId: number) => {
    try {
      // await api.startWork(clientId);
      
      const newStatus = new Map(workStatus);
      newStatus.set(clientId, {isWorking: true, startTime: new Date().toISOString()});
      setWorkStatus(newStatus);
      
      alert('출근 처리되었습니다.');
    } catch (error) {
      console.error('출근 처리 실패:', error);
      alert('출근 처리에 실패했습니다.');
    }
  };

  // 퇴근 처리
  const handleClockOut = async (clientId: number) => {
    try {
      // await api.endWork(clientId);
      
      const newStatus = new Map(workStatus);
      newStatus.delete(clientId);
      setWorkStatus(newStatus);
      
      alert('퇴근 처리되었습니다.');
    } catch (error) {
      console.error('퇴근 처리 실패:', error);
      alert('퇴근 처리에 실패했습니다.');
    }
  };

  // 일지 작성 열기
  const handleOpenJournal = (client: ClientDetail) => {
    setSelectedClient(client);
    setJournalContent('');
    clearTranscription();
    setAudioFile(null);
    setAudioUrl(null);
    setIsEditingJournal(false);
    setIsSheetOpen(true);
  };

  // 오디오 파일 업로드
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // 오디오 파일을 서버로 전송하여 STT 처리
      processAudioFile(file);
    } else {
      alert('오디오 파일만 업로드할 수 있습니다.');
    }
  };

  // 오디오 파일 STT 처리
  const processAudioFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stt/process`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.transcript) {
          setJournalContent(data.transcript);
        }
      }
    } catch (error) {
      console.error('오디오 처리 실패:', error);
      alert('오디오 파일 처리에 실패했습니다. 직접 입력해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 일지 생성
  const handleCreateJournal = async () => {
    if (!journalContent.trim() || !selectedClient) {
      alert('일지 내용을 입력해주세요.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 실제 API 호출 부분
      alert(`${selectedClient.name} 노인의 일지가 생성되었습니다.`);
      
      // 초기화
      setJournalContent('');
      clearTranscription();
      setAudioFile(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      setIsSheetOpen(false);
    } catch (error) {
      console.error('일지 생성 오류:', error);
      alert('일지 생성에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 오디오 재생/일시정지
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 오디오 파일 제거
  const removeAudioFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getClientWorkStatus = (clientId: number) => {
    return workStatus.get(clientId) || { isWorking: false };
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* 헤더 */}
      <header className="bg-white border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/oauth" className="flex items-center">
              <Image
                src="/Container.png"
                alt="Oncare Logo"
                width={120}
                height={50}
                priority
                quality={100}
                className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            
            <div className="flex items-center justify-center">
              {/* <button
                onClick={() => window.location.href = '/oauth'}
                className="transition-transform duration-200 hover:scale-105"
              >
                <Image 
                  src="/LoginButton.png"
                  alt="로그인/회원가입"
                  width={100}
                  height={34}
                  priority
                  quality={100}
                  className="h-7 w-auto object-contain"
                />
              </button> */}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary text-center">
            담당 노인 관리
          </h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-border-light">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Overview 탭 콘텐츠 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : clients.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">담당 노인이 없습니다.</p>
              </div>
            ) : (
              clients.map((client) => {
                const clientStatus = getClientWorkStatus(client.id);
                return (
                  <Card key={client.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-500">
                            {client.gender} | {new Date(client.birthDate).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        {clientStatus.isWorking && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            근무중
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">주소:</span> {client.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">연락처:</span> {client.contact}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">보호자:</span> {client.guardianContact}
                        </p>
                        {clientStatus.isWorking && clientStatus.startTime && (
                          <p className="text-sm text-green-600">
                            <span className="font-medium">출근시간:</span> {formatTime(clientStatus.startTime)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!clientStatus.isWorking ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClockIn(client.id)}
                            className="flex-1"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            출근
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClockOut(client.id)}
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            퇴근
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => handleOpenJournal(client)}
                          className="flex-1 bg-primary-500 hover:bg-primary-600"
                        >
                          일지 작성
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Settings 탭 콘텐츠 */}
        {activeTab === 'settings' && (
          <Card>
            <CardContent className="p-6">
              <p className="text-text-secondary">설정 페이지 내용이 여기에 표시됩니다.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 일지 작성 Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-full max-w-[600px] bg-white p-0"
        >
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>일지 작성</SheetTitle>
            <SheetDescription>
              {selectedClient?.name} 노인의 돌봄 일지를 작성합니다.
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* 날짜/시간 정보 */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

              {/* WebSocket 연결 상태 */}
              {!isConnected && !isTemporaryToken && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                <span className="text-sm text-yellow-700">음성 인식 서버 연결 중...</span>
              </div>
            )}
            
            {/* 개발용 Mock STT 안내 */}
            {isTemporaryToken && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-blue-700">개발용 Mock STT 사용 중 (실제 백엔드 연결 시 자동 전환)</span>
              </div>
            )}
            
            {/* 녹음 상태 */}
            {isRecording && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-700">녹음 중... 말씀해 주세요</span>
              </div>
            )}

            {/* 오디오 파일 업로드 영역 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-upload"
                disabled={isProcessing || isRecording}
              />
              <label
                htmlFor="audio-upload"
                className={`flex flex-col items-center cursor-pointer ${
                  isProcessing || isRecording ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">오디오 파일 업로드</span>
                <span className="text-xs text-gray-400 mt-1">클릭하여 파일 선택</span>
              </label>
            </div>

            {/* 업로드된 오디오 파일 표시 */}
            {audioUrl && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{audioFile?.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleAudioPlayback}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeAudioFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {/* 처리 중 표시 */}
            {isProcessing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">오디오 파일을 텍스트로 변환 중...</span>
              </div>
            )}

            {/* 일지 내용 입력/표시 */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                일지 내용
              </label>
              {isEditingJournal ? (
                <textarea
                  className="w-full h-48 p-4 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="일지 내용을 입력하세요..."
                />
              ) : (
                <div className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto">
                  {journalContent ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{journalContent}</p>
                  ) : (
                    <p className="text-gray-400 text-center">
                      녹음하기 버튼을 눌러 음성으로 일지를 작성하거나<br />
                      오디오 파일을 업로드하세요.
                    </p>
                  )}
                </div>
              )}
              
              <Button
                size="sm"
                variant="outline"
                className="absolute top-0 right-0"
                onClick={() => setIsEditingJournal(!isEditingJournal)}
              >
                {isEditingJournal ? '완료' : '수정'}
              </Button>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className={`flex-1 transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected || isProcessing || !!audioFile}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    <span>녹음 중지</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    <span>녹음 시작</span>
                  </>
                )}
              </Button>
              
              <Button 
                variant="default"
                className="flex-1 bg-primary-500 hover:bg-primary-600"
                disabled={!journalContent.trim() || isProcessing || isRecording}
                onClick={handleCreateJournal}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>처리 중...</span>
                  </>
                ) : (
                  '일지 생성'
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}