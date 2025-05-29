"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText, Calendar, User } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-700">✳ Oncare</span>
            </div>
            
            {/* 사용자 정보 */}
            <Button variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              복지사 + 이름/기관
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Attendance Records Management
          </h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        요양보호사
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        오늘일정
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        일지상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        보고서상태
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        상세보기
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {caregivers.map((caregiver) => (
                      <tr key={caregiver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {caregiver.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(caregiver.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
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
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-8 h-8 p-0 bg-gray-800 text-white hover:bg-gray-700"
                              title="리포트"
                            >
                              <FileText className="w-4 h-4" />
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
              <p className="text-gray-600">설정 페이지 내용이 여기에 표시됩니다.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}