"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText, Calendar, User } from 'lucide-react';
import Image from 'next/image';

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
            {/* 로고 */}
            <div className="flex items-center">
              <Image
                src="/Container.png"
                alt="Oncare Logo"
                width={120}
                height={50}
                priority
                quality={100}
                className="h-7 w-auto"
              />
            </div>
            
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
          <Card>
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-8 h-8 p-0"
                              title="상세 보기"
                            >
                              <Eye />
                            </Button>
                            <Button 
                              size="sm" 
                              className="w-8 h-8 p-0 bg-text-primary text-white hover:bg-gray-700"
                              title="리포트"
                            >
                              <FileText />
                            </Button>
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