"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ChevronRight, Clock, Mic, MicOff, Loader2 } from 'lucide-react';
import { useSTTWebSocket } from '@/hooks/useSTTWebSocKet';

// Mock 데이터
const caregivers = [
  {
    id: 1,
    name: '오천희',
    status: 'ON',
    schedule: 'AM 10:00 - PM 12:00',
    reportStatus: '작성완료',
    dailyStatus: '미작성',
  },
  {
    id: 2,
    name: '김다영',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 3,
    name: '권현지',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 4,
    name: '박송규',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 5,
    name: '홍길동',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 6,
    name: '김용수',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 7,
    name: '박민우',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 8,
    name: '김하경',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
  {
    id: 9,
    name: '이송신',
    status: 'OFF',
    schedule: '',
    reportStatus: '',
    dailyStatus: '',
  },
];

export default function SocialWorkerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    elderName: ''
  });

  const [savedData, setSavedData] = useState({
    name: '',
    phone: '',
    elderName: ''
  });

  const [journalContent, setJournalContent] = useState('');
  const [journalList, setJournalList] = useState<Array<{id: number, date: string, content: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingJournal, setIsEditingJournal] = useState(false);;

  // STT WebSocket Hook
  const {
    isRecording,
    isConnected,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transcribedText,
    startRecording,
    stopRecording,
    clearTranscription
  } = useSTTWebSocket({
    onTranscription: (text) => {
      // 실시간으로 텍스트 추가
      setJournalContent(prev => prev + ' ' + text);
    },
    onError: (error) => {
      alert(`STT 오류: ${error}`);
    }
  });

  const handleOpenDetail = (caregiver: typeof caregivers[0]) => {
    const initialData = {
      name: caregiver.name,
      phone: '',
      elderName: ''
    };
    
    setFormData(initialData);
    setSavedData(initialData);
    setIsEditing(false);
    setJournalContent(''); // 일지 내용 초기화
    clearTranscription(); // STT 텍스트 초기화
    setIsSheetOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleSave: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setSavedData(formData);
    setIsEditing(false);
    // 여기에 실제 API 호출 로직 추가
  };

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setFormData(savedData);
    setIsEditing(false);
  };

  // 일지 생성 핸들러 (AI 요약 포함)
  const handleCreateJournal = async () => {
    if (!journalContent.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // 백엔드로 일지 내용 전송하여 AI 요약 받기
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journals/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: journalContent,
          caregiverId: formData.name,
          elderName: formData.elderName
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // AI가 요약한 내용으로 일지 생성
        const newJournal = {
          id: Date.now(),
          date: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          content: data.summarizedContent || journalContent
        };
        
        setJournalList(prev => [newJournal, ...prev]);
        setJournalContent(data.summarizedContent || journalContent);
        alert('일지가 생성되었습니다.');
      }
    } catch (error) {
      console.error('일지 생성 오류:', error);
      // 에러 시 원본 내용으로 저장
      const newJournal = {
        id: Date.now(),
        date: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        content: journalContent
      };
      setJournalList(prev => [newJournal, ...prev]);
    } finally {
      setIsProcessing(false);
      clearTranscription();
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ON') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">ON</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-200">OFF</Badge>;
  };

  const getReportStatusBadge = (status: string) => {
    if (status === '작성완료') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">작성완료</Badge>;
    }
    if (status === '미작성') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">미작성</Badge>;
    }
    return null;
  };

  const getDailyStatusBadge = (status: string) => {
    if (status === '미작성') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">미작성</Badge>;
    }
    if (status === '작성완료') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">작성완료</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* 헤더 */}
      <header className="bg-white border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 - 클릭하면 /oauth로 이동 */}
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
            
            {/* 로그인/회원가입 버튼 */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => window.location.href = '/signup'}
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
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary text-center">
            Attendance Records Management
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
          <Card className='border-b border-border-light'>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light bg-background-tertiary">
                      <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                        요양보호사
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                        상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                        오늘일정
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                        일지상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                        보고서상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                        상세보기
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {caregivers.map((caregiver) => (
                      <tr key={caregiver.id} className="hover:bg-primary-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text-primary">
                            {caregiver.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(caregiver.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">
                            {caregiver.schedule || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {caregiver.reportStatus && getReportStatusBadge(caregiver.reportStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {caregiver.dailyStatus && getDailyStatusBadge(caregiver.dailyStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                          <button
                            className="w-8 h-8 relative cursor-pointer transition-transform hover:scale-110 group"
                            title="상세 보기"
                            onClick={() => handleOpenDetail(caregiver)}
                          >
                            <Image
                              src="/folder.png"
                              alt="상세 보기"
                              width={32}
                              height={32}
                              className="w-full h-full object-contain group-hover:hidden"
                            />
                            <Image
                              src="/folder_filled.png"
                              alt="상세 보기"
                              width={32}
                              height={32}
                              className="w-full h-full object-contain hidden group-hover:block absolute top-0 left-0"
                            />
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

         {/* Slide-over Sheet */}
         <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent 
            side="right" 
            className="w-full max-w-[800px] lg:max-w-[1080px] bg-white p-0 sm:w-[800px] lg:w-[1080px]" 
            style={{ maxWidth: '1080px', width: '100%' }}
          >
            {/* 접근성을 위한 숨겨진 헤더 추가 */}
            <SheetHeader className="sr-only">
              <SheetTitle>요양보호사 일지 작성</SheetTitle>
              <SheetDescription>
                요양보호사의 정보를 수정하고 일지를 작성할 수 있습니다.
              </SheetDescription>
            </SheetHeader>

          
            {/* 콘텐츠 영역 - 좌우 분할 */}
              <div className="flex h-[calc(100%-73px)]">
                {/* 왼쪽 영역 - 프로필 수정 & 일지 목록 */}
                <div className="w-[300px] border-r border-gray-200 flex flex-col">
                  {/* 프로필 수정하기 섹션 */}
                  <div className="px-4 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium text-gray-900">프로필</h3>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEdit}
                          className="h-7 px-3 text-xs border-gray-300"
                        >
                          수정하기
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="h-7 px-3 text-xs border-gray-300"
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="h-7 px-3 text-xs bg-primary-500 hover:bg-primary-600"
                          >
                            저장하기
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">이름</label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            isEditing 
                              ? 'bg-white border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500' 
                              : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          } focus:outline-none`}
                          placeholder="이름을 입력하세요"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">전화번호</label>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            isEditing 
                              ? 'bg-white border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500' 
                              : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          } focus:outline-none`}
                          placeholder="010-0000-0000"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">관리 노인 이름</label>
                        <input
                          name="elderName"
                          value={formData.elderName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            isEditing 
                              ? 'bg-white border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500' 
                              : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          } focus:outline-none`}
                          placeholder="관리 노인 이름"
                        />
                      </div>
                    </div>
                  </div>

                {/* 일지 목록 섹션 */}
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">일지목록</h3>
                    
                    <div className="space-y-3">
                      {journalList.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          작성된 일지가 없습니다.
                        </p>
                      ) : (
                        journalList.map((journal) => (
                          <button
                            key={journal.id}
                            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => setJournalContent(journal.content)}
                          >
                            <span className="text-sm text-gray-600">{journal.date}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 오른쪽 영역 - 일지 작성 */}
                <div className="flex-1 flex flex-col">
                  {/* 일지 작성 헤더 */}
                  <div className="px-6 pt-10 pb-4">
                    <div className="flex flex-col items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">일지 작성</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date().toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 일지 작성 영역 */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="h-full">
                      {/* WebSocket 연결 상태 표시 */}
                      {!isConnected && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                          <span className="text-sm text-yellow-700">음성 인식 서버 연결 중...</span>
                        </div>
                      )}
                      
                      {/* 녹음 상태 표시 */}
                      {isRecording && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-sm text-red-700">녹음 중... 말씀해 주세요</span>
                        </div>
                      )}
                      
                      {/* 일지 내용 표시/편집 영역 */}
                      <div className="relative h-[calc(100%-80px)]">
                        {isEditingJournal ? (
                          <textarea
                            className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={journalContent}
                            onChange={(e) => setJournalContent(e.target.value)}
                            placeholder="일지 내용을 입력하세요..."
                          />
                        ) : (
                          <div className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto">
                            {journalContent ? (
                              <p className="text-gray-700 whitespace-pre-wrap">{journalContent}</p>
                            ) : (
                              <p className="text-gray-400 text-center">
                                녹음하기 버튼을 눌러 음성으로 일지를 작성하거나<br />
                                수정하기 버튼을 눌러 직접 입력하세요.
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* 수정하기/저장하기 버튼 */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => setIsEditingJournal(!isEditingJournal)}
                        >
                          {isEditingJournal ? '완료' : '수정하기'}
                        </Button>
                      </div>
                       {/* 하단 버튼들 - 왼쪽 하단에 위치 */}
                    <div className="mt-auto pt-6 flex gap-3">
                      <Button 
                        variant="outline" 
                        className={`flex-1 transition-all duration-200 ${
                          isRecording 
                            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!isConnected}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            <span>녹음 중지</span>
                            <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            <span>녹음 하기</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="default"
                        className="flex-1 bg-primary-500 hover:bg-primary-600"
                        disabled={!journalContent.trim() || isProcessing}
                        onClick={handleCreateJournal}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>생성 중...</span>
                          </>
                        ) : (
                          '일지 생성'
                        )}
                      </Button>
                    </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>


        {/* Settings 탭 콘텐츠 */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>설정</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">설정 페이지 내용이 여기에 표시됩니다.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}