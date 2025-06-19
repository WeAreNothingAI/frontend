/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from 'react';
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
import { Calendar, Clock, FileText, Download, Loader2, Filter, CheckSquare, ChevronRight, User, FileCheck } from 'lucide-react';
import { api } from '@/lib/api';
import type { CareWorker, WorkData, JournalListItem, ReportDetail } from '@/lib/api';
import LogoutButton from '../ui/LogOutButton';

// Mock 데이터
const mockCaregivers: CareWorker[] = [
  {
    id: 1,
    email: 'ohcheonhee@example.com',
    name: '오천희',
    role: 'careWorker',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    email: 'kimdayoung@example.com',
    name: '김다영',
    role: 'careWorker',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    email: 'kwonhyunji@example.com',
    name: '권현지',
    role: 'careWorker',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 4,
    email: 'parksonggyu@example.com',
    name: '박송규',
    role: 'careWorker',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 5,
    email: 'honggildong@example.com',
    name: '홍길동',
    role: 'careWorker',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

const mockJournals: JournalListItem[] = [
  {
    date: new Date().toISOString(),
    journalId: 1,
    createdAt: new Date().toISOString()
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    journalId: 2,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    journalId: 3,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    journalId: 4,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    journalId: 5,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockReport: ReportDetail = {
  file: 'weekly-report-mock.docx',
  docx_url: 'https://example.com/mock-report.docx',
  pdf_url: 'https://example.com/mock-report.pdf',
  title: '2025년 1월 2주차 요양보호 주간보고서',
  clientName: '김복자',
  birthDate: '1945-03-15',
  careLevel: '3등급',
  guardianContact: '010-9876-5432',
  reportDate: new Date().toISOString().split('T')[0],
  socialWorkerName: '이복지',
  summary: '김복자 어르신은 이번 주 전반적으로 안정적인 상태를 유지하셨습니다. 일상생활 수행능력이 향상되었으며, 특히 보행 능력이 개선되어 실내에서는 보조기구 없이도 이동이 가능해졌습니다.',
  riskNotes: '야간에 화장실 이용 시 낙상 위험이 있어 주의가 필요합니다. 또한 최근 혈압이 다소 높게 측정되어 지속적인 모니터링이 필요합니다.',
  evaluation: '전반적으로 건강 상태가 호전되고 있으며, 재활 운동에 적극적으로 참여하고 계십니다. 정서적으로도 안정적이며 요양보호사와의 관계도 원만합니다.',
  suggestion: '1. 야간 이동 시 안전바 설치 권장\n2. 주 2회 이상 혈압 체크 실시\n3. 현재의 재활 운동 프로그램 지속 유지\n4. 영양 상태 개선을 위한 단백질 섭취 증가',
  journalSummary: [
    {
      date: new Date().toISOString().split('T')[0],
      careWorker: '오천희',
      service: '일상생활 지원, 재활 운동',
      notes: '오전 산책 30분, 점심 식사 도움, 재활 운동 1시간'
    },
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      careWorker: '오천희',
      service: '병원 동행, 약물 관리',
      notes: '정기 검진 동행, 처방약 수령 및 복약 지도'
    }
  ]
};

export default function SocialWorkerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<CareWorker | null>(null);
  const [caregivers, setCaregivers] = useState<CareWorker[]>([]);
  const [workStatuses, setWorkStatuses] = useState<Map<number, {isWorking: boolean, clockInTime?: string, clientName?: string}>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  
  // 일지 관련 상태
  const [journals, setJournals] = useState<JournalListItem[]>([]);
  const [selectedJournals, setSelectedJournals] = useState<Set<number>>(new Set());
  const [isLoadingJournals, setIsLoadingJournals] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<ReportDetail[]>([]);
  
  // 날짜 필터
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // 일지 통계
  const [journalStats, setJournalStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  // 요양보호사 목록 및 출퇴근 상태 조회
  useEffect(() => {
    fetchCaregivers();
    // 5분마다 상태 업데이트
    const interval = setInterval(fetchCaregivers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCaregivers = async () => {
    try {
      setIsLoading(true);
      
      // Mock 데이터 사용 (실제 API 호출 시 주석 해제)
      // const response = await api.getCareWorkers();
      // if (response && response.success && response.data) {
      //   setCaregivers(response.data);
      // }
      
      // Mock 데이터 설정
      setCaregivers(mockCaregivers);
      
      // Mock 출퇴근 상태
      const mockStatusMap = new Map<number, any>();
      mockStatusMap.set(1, {
        isWorking: true,
        clockInTime: new Date().setHours(10, 0, 0, 0),
        clientName: '김복자'
      });
      mockStatusMap.set(3, {
        isWorking: true,
        clockInTime: new Date().setHours(9, 0, 0, 0),
        clientName: '이순자'
      });
      setWorkStatuses(mockStatusMap);
      
      // Mock 통계
      setJournalStats({
        total: 8,
        completed: 5,
        pending: 3
      });
      
    } catch (error) {
      console.error('요양보호사 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 출퇴근 상태 조회
  const fetchWorkStatuses = async () => {
    try {
      const response = await api.getThisWeekWorks();
      if (response && response.success && response.data) {
        const statusMap = new Map<number, any>();
        
        const today = new Date().toDateString();
        response.data.forEach((work: WorkData) => {
          if (new Date(work.workDate).toDateString() === today && work.events && work.events.length > 0) {
            const lastEvent = work.events[work.events.length - 1];
            if (lastEvent.type === 'CLOCK_IN') {
              statusMap.set(work.memberId, {
                isWorking: true,
                clockInTime: lastEvent.workTime,
                clientName: work.member?.name || '알 수 없음'
              });
            }
          }
        });
        
        setWorkStatuses(statusMap);
      }
    } catch (error) {
      console.error('출퇴근 상태 조회 실패:', error);
    }
  };

  // 오늘의 일지 통계 조회
  const fetchTodayJournalStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.getJournalsByDateRange({
        startDate: today,
        endDate: today
      });
      
      if (response && response.success && response.data) {
        setJournalStats({
          total: response.data.length,
          completed: response.data.filter((j: any) => j.summary).length,
          pending: response.data.filter((j: any) => !j.summary).length
        });
      }
    } catch (error) {
      console.error('일지 통계 조회 실패:', error);
    }
  };

  // 요양보호사 상세 보기 및 일지 목록 조회
  const handleOpenDetail = async (caregiver: CareWorker) => {
    setSelectedCaregiver(caregiver);
    setSelectedJournals(new Set());
    setGeneratedReports([]);
    setIsSheetOpen(true);
    
    await fetchJournals(caregiver.id);
  };

  // 일지 목록 조회
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchJournals = async (careWorkerId: number) => {
    try {
      setIsLoadingJournals(true);
      
      // Mock 데이터 사용 (실제 API 호출 시 주석 해제)
      // const response = await api.getJournalsByDateRange({
      //   startDate: dateRange.startDate,
      //   endDate: dateRange.endDate,
      //   careWorkerId
      // });
      // if (response && response.success && response.data) {
      //   setJournals(response.data);
      // }
      
      // Mock 데이터 설정
      setJournals(mockJournals);
      
    } catch (error) {
      console.error('일지 목록 조회 실패:', error);
      setJournals([]);
    } finally {
      setIsLoadingJournals(false);
    }
  };

  // 일지 선택/해제
  const toggleJournalSelection = (journalId: number) => {
    const newSelection = new Set(selectedJournals);
    if (newSelection.has(journalId)) {
      newSelection.delete(journalId);
    } else {
      newSelection.add(journalId);
    }
    setSelectedJournals(newSelection);
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedJournals.size === journals.length) {
      setSelectedJournals(new Set());
    } else {
      setSelectedJournals(new Set(journals.map(j => j.journalId)));
    }
  };

  // 주간보고서 생성
  const handleGenerateReport = async () => {
    if (selectedJournals.size === 0) {
      alert('보고서를 생성할 일지를 선택해주세요.');
      return;
    }
    
    try {
      setIsGeneratingReport(true);
      
      // Mock 데이터 사용 (실제 API 호출 시 주석 해제)
      // const journalIds = Array.from(selectedJournals);
      // const reports = await api.createWeeklyReport(journalIds);
      
      // Mock 보고서 생성
      await new Promise(resolve => setTimeout(resolve, 2000)); // 로딩 시뮬레이션
      const reports = [mockReport];
      
      if (reports && reports.length > 0) {
        setGeneratedReports(reports);
        alert(`${reports.length}개의 주간보고서가 생성되었습니다.`);
        
        // 선택 초기화
        setSelectedJournals(new Set());
      }
    } catch (error) {
      console.error('주간보고서 생성 실패:', error);
      alert('주간보고서 생성에 실패했습니다.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 보고서 다운로드
  const handleDownloadReport = async (reportId: number, format: 'pdf' | 'docx') => {
    try {
      // Mock 다운로드 (실제 API 호출 시 주석 해제)
      // const response = format === 'pdf' 
      //   ? await api.getReportPdfUrl(reportId)
      //   : await api.getReportDocxUrl(reportId);
      // if (response && response.download_url) {
      //   window.open(response.download_url, '_blank');
      // }
      
      // Mock 다운로드 시뮬레이션
      alert(`${format.toUpperCase()} 파일 다운로드가 시작됩니다.`);
      
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('다운로드에 실패했습니다.');
    }
  };

  // 날짜 범위 변경
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 날짜 필터 적용
  const applyDateFilter = () => {
    if (selectedCaregiver) {
      fetchJournals(selectedCaregiver.id);
    }
  };

  const getWorkStatusBadge = (caregiverId: number) => {
    const status = workStatuses.get(caregiverId);
    if (status?.isWorking) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          ON
        </Badge>
      );
    }
    return <Badge className="bg-red-100 text-red-800 border-red-200">OFF</Badge>;
  };

  const getSchedule = (caregiverId: number) => {
    const status = workStatuses.get(caregiverId);
    if (status?.isWorking && status.clockInTime) {
      const startTime = new Date(status.clockInTime);
      const currentTime = new Date();
      return `AM ${startTime.getHours()}:00 - PM ${currentTime.getHours()}:00`;
    }
    return '-';
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
        {/* 페이지 제목 및 통계 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary text-center mb-6">
            Attendance Records Management
          </h1>
          
          {/* 오늘의 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">오늘 작성된 일지</p>
                    <p className="text-2xl font-bold text-primary-600">{journalStats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">근무중인 요양보호사</p>
                    <p className="text-2xl font-bold text-green-600">{workStatuses.size}</p>
                  </div>
                  <User className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">완료된 보고서</p>
                    <p className="text-2xl font-bold text-blue-600">{journalStats.completed}</p>
                  </div>
                  <FileCheck className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
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
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-light bg-background-tertiary">
                        <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                          요양보호사
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                          출퇴근시간
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
                            {getWorkStatusBadge(caregiver.id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-text-secondary">
                              {getSchedule(caregiver.id)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Mock 상태 표시 */}
                            {caregiver.id === 1 || caregiver.id === 3 ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                작성완료
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                -
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Mock 상태 표시 */}
                            {caregiver.id === 1 ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                작성완료
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                미작성
                              </Badge>
                            )}
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
              )}
            </CardContent>
          </Card>
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

      {/* 보고서 작성 Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-full max-w-[800px] lg:max-w-[1080px] bg-white p-0 sm:w-[800px] lg:w-[1080px]" 
          style={{ maxWidth: '1080px', width: '100%' }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>보고서 작성</SheetTitle>
            <SheetDescription>
              요양보호사의 일지를 선택하여 주간보고서를 작성합니다.
            </SheetDescription>
          </SheetHeader>

          <div className="flex h-[calc(100%-73px)]">
            {/* 왼쪽 영역 - 프로필 & 일지 목록 */}
            <div className="w-[300px] border-r border-gray-200 flex flex-col">
              {/* 프로필 섹션 */}
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-900">프로필</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">이름</label>
                    <input
                      value={selectedCaregiver?.name || ''}
                      disabled
                      className="w-full px-3 py-1.5 text-sm rounded-md border bg-gray-50 border-gray-200 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">이메일</label>
                    <input
                      value={selectedCaregiver?.email || ''}
                      disabled
                      className="w-full px-3 py-1.5 text-sm rounded-md border bg-gray-50 border-gray-200 cursor-not-allowed"
                    />
                  </div>
                  
                  {workStatuses.get(selectedCaregiver?.id || 0)?.isWorking && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-green-800">
                        현재 근무중 ({workStatuses.get(selectedCaregiver?.id || 0)?.clientName})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 일지 목록 섹션 */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900">일지목록</h3>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    {selectedJournals.size === journals.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>
                
                {/* 날짜 필터 */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={applyDateFilter}
                    className="text-xs px-2"
                  >
                    조회
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {isLoadingJournals ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    </div>
                  ) : journals.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      해당 기간에 작성된 일지가 없습니다.
                    </p>
                  ) : (
                    journals.map((journal) => (
                      <button
                        key={journal.journalId}
                        className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          selectedJournals.has(journal.journalId)
                            ? 'bg-primary-50 border-primary-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleJournalSelection(journal.journalId)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedJournals.has(journal.journalId)}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <span className="text-sm text-gray-600">
                            {new Date(journal.date).toLocaleDateString('ko-KR', { 
                              month: 'numeric', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽 영역 - 보고서 작성 */}
            <div className="flex-1 flex flex-col">
              {/* 보고서 작성 헤더 */}
              <div className="px-6 pt-10 pb-4">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-900">보고서 작성</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      <span>{selectedJournals.size}개 일지 선택됨</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 보고서 내용 영역 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="h-full">
                  {generatedReports.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        일지를 선택하고 보고서를 생성해주세요.
                      </p>
                      {selectedJournals.size > 0 && (
                        <p className="text-sm text-primary-600">
                          선택한 일지들이 노인별로 자동 그룹화되어 보고서가 생성됩니다.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedReports.map((report, index) => (
                        <Card key={index} className="border-primary-200">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {report.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {report.clientName} ({report.birthDate})
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadReport(index, 'pdf')}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  PDF
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadReport(index, 'docx')}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  DOCX
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="font-medium text-gray-700">요약</p>
                                <p className="text-gray-600">{report.summary}</p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-700">위험 사항</p>
                                <p className="text-gray-600">{report.riskNotes}</p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-700">권고 사항</p>
                                <p className="text-gray-600">{report.suggestion}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* 하단 버튼 */}
                  <div className="mt-auto pt-6">
                    <Button
                      className="w-full bg-primary-500 hover:bg-primary-600"
                      disabled={selectedJournals.size === 0 || isGeneratingReport}
                      onClick={handleGenerateReport}
                    >
                      {isGeneratingReport ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          보고서 생성 중...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          주간보고서 생성
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}