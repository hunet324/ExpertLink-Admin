import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface TodaySchedule {
  id: string;
  time: string;
  clientName: string;
  type: 'video' | 'chat' | 'voice';
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
}

interface NewRequest {
  id: string;
  clientName: string;
  requestType: string;
  preferredDate: string;
  preferredTime: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

const ExpertDashboard: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 오늘 일정 샘플 데이터
  const todaySchedule: TodaySchedule[] = [
    {
      id: '1',
      time: '09:00',
      clientName: '이**',
      type: 'video',
      status: 'completed'
    },
    {
      id: '2',
      time: '10:30',
      clientName: '박**',
      type: 'chat',
      status: 'in-progress'
    },
    {
      id: '3',
      time: '14:00',
      clientName: '김**',
      type: 'video',
      status: 'upcoming'
    },
    {
      id: '4',
      time: '16:30',
      clientName: '최**',
      type: 'voice',
      status: 'upcoming'
    }
  ];

  // 신규 요청 샘플 데이터
  const newRequests: NewRequest[] = [
    {
      id: '1',
      clientName: '정**',
      requestType: '화상 상담',
      preferredDate: '2024-08-09',
      preferredTime: '15:00',
      priority: 'high',
      createdAt: '10분 전'
    },
    {
      id: '2',
      clientName: '한**',
      requestType: '채팅 상담',
      preferredDate: '2024-08-10',
      preferredTime: '11:00',
      priority: 'medium',
      createdAt: '1시간 전'
    },
    {
      id: '3',
      clientName: '윤**',
      requestType: '음성 상담',
      preferredDate: '2024-08-11',
      preferredTime: '09:30',
      priority: 'low',
      createdAt: '3시간 전'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent text-white';
      case 'in-progress': return 'bg-primary text-white';
      case 'upcoming': return 'bg-background-300 text-secondary-600';
      case 'cancelled': return 'bg-error text-white';
      default: return 'bg-background-300 text-secondary-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      case 'upcoming': return '예정';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'chat': return '💭';
      case 'voice': return '🎧';
      default: return '💬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-primary';
      case 'low': return 'text-secondary-400';
      default: return 'text-secondary-400';
    }
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary">대시보드</h1>
              <p className="text-caption text-secondary-400 mt-1">
                오늘은 {new Date().toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })} 입니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 알림 버튼 */}
              <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* 프로필 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">김</span>
                </div>
                <span className="text-body text-secondary-600">김상담사님</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">오늘 상담</p>
                  <p className="text-h2 font-bold text-secondary mt-1">4건</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">신규 요청</p>
                  <p className="text-h2 font-bold text-secondary mt-1">3건</p>
                </div>
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔔</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">이번 주 상담</p>
                  <p className="text-h2 font-bold text-secondary mt-1">18건</p>
                </div>
                <div className="w-12 h-12 bg-logo-point/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-secondary-400">총 내담자</p>
                  <p className="text-h2 font-bold text-secondary mt-1">47명</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* 오늘 일정 */}
            <div className="bg-white rounded-custom shadow-soft">
              <div className="p-6 border-b border-background-200">
                <h2 className="text-h3 font-semibold text-secondary flex items-center">
                  <span className="mr-2">📅</span>
                  오늘 일정
                </h2>
              </div>
              <div className="p-6">
                {todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        onClick={() => router.push(`/expert/schedule/detail?id=${schedule.id}`)}
                        className="flex items-center justify-between p-3 hover:bg-background-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-body font-mono text-secondary-600">
                            {schedule.time}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(schedule.type)}</span>
                            <span className="text-body text-secondary-700">{schedule.clientName}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(schedule.status)}`}>
                          {getStatusText(schedule.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🌸</span>
                    <p className="text-secondary-400">오늘 예정된 상담이 없습니다.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-background-200">
                  <button 
                    onClick={() => router.push('/expert/schedule')}
                    className="w-full text-primary hover:text-primary-600 text-center text-caption font-medium transition-colors"
                  >
                    전체 일정 보기 →
                  </button>
                </div>
              </div>
            </div>

            {/* 신규 요청 */}
            <div className="bg-white rounded-custom shadow-soft">
              <div className="p-6 border-b border-background-200">
                <h2 className="text-h3 font-semibold text-secondary flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">🔔</span>
                    신규 요청
                  </div>
                  {newRequests.length > 0 && (
                    <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                      {newRequests.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                {newRequests.length > 0 ? (
                  <div className="space-y-4">
                    {newRequests.map((request) => (
                      <div key={request.id} className="p-4 border border-background-200 rounded-lg hover:border-primary-200 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-body font-medium text-secondary-700">{request.clientName}</h4>
                            <p className="text-caption text-secondary-400">{request.requestType}</p>
                          </div>
                          <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-caption text-secondary-500 mb-3">
                          <p>희망 일시: {new Date(request.preferredDate).toLocaleDateString('ko-KR')} {request.preferredTime}</p>
                          <p className="mt-1">{request.createdAt}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors">
                            승인
                          </button>
                          <button className="flex-1 bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors">
                            거절
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📫</span>
                    <p className="text-secondary-400">신규 요청이 없습니다.</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-background-200">
                  <button className="w-full text-primary hover:text-primary-600 text-center text-caption font-medium transition-colors">
                    모든 요청 보기 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 버튼들 */}
          <div className="bg-white rounded-custom shadow-soft p-6">
            <h2 className="text-h3 font-semibold text-secondary mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              빠른 작업
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <button className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group">
                <span className="text-2xl mb-2">📝</span>
                <span className="text-caption font-medium text-primary group-hover:text-primary-600">상담 기록 작성</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group">
                <span className="text-2xl mb-2">👤</span>
                <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">새 내담자 등록</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group">
                <span className="text-2xl mb-2">📊</span>
                <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">검사 결과 확인</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-background-100 hover:bg-background-200 rounded-lg transition-colors group">
                <span className="text-2xl mb-2">🏖️</span>
                <span className="text-caption font-medium text-secondary-500 group-hover:text-secondary-600">휴무 설정</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExpertDashboard;