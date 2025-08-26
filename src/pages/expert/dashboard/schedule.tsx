import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface TodaySchedule {
  id: string;
  time: string;
  duration: number;
  clientName: string;
  clientId: string;
  type: 'video' | 'chat' | 'voice';
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  meetingUrl?: string;
}

type StatusFilter = 'all' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

const TodaySchedulePage: React.FC = () => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // 오늘 일정 샘플 데이터 (확장 버전)
  const todaySchedule: TodaySchedule[] = [
    {
      id: '1',
      time: '09:00',
      duration: 60,
      clientName: '이**',
      clientId: 'client_001',
      type: 'video',
      status: 'completed',
      priority: 'medium',
      notes: '첫 번째 상담 완료. 다음 세션 예약 필요.',
      meetingUrl: 'https://meet.expertlink.com/room/12345'
    },
    {
      id: '2',
      time: '10:30',
      duration: 90,
      clientName: '박**',
      clientId: 'client_002',
      type: 'chat',
      status: 'in-progress',
      priority: 'high',
      notes: '긴급 상담 진행 중'
    },
    {
      id: '3',
      time: '14:00',
      duration: 60,
      clientName: '김**',
      clientId: 'client_003',
      type: 'video',
      status: 'upcoming',
      priority: 'medium',
      meetingUrl: 'https://meet.expertlink.com/room/67890'
    },
    {
      id: '4',
      time: '15:30',
      duration: 45,
      clientName: '정**',
      clientId: 'client_004',
      type: 'voice',
      status: 'upcoming',
      priority: 'low'
    },
    {
      id: '5',
      time: '16:30',
      duration: 60,
      clientName: '최**',
      clientId: 'client_005',
      type: 'video',
      status: 'upcoming',
      priority: 'high',
      notes: '첫 상담. 사전 준비 자료 검토 필요',
      meetingUrl: 'https://meet.expertlink.com/room/11111'
    },
    {
      id: '6',
      time: '18:00',
      duration: 60,
      clientName: '윤**',
      clientId: 'client_006',
      type: 'chat',
      status: 'cancelled',
      priority: 'medium',
      notes: '내담자 요청으로 취소됨'
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return '화상 상담';
      case 'chat': return '채팅 상담';
      case 'voice': return '음성 상담';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error bg-error-50 border-error-200';
      case 'medium': return 'text-primary bg-primary-50 border-primary-200';
      case 'low': return 'text-secondary-400 bg-secondary-50 border-secondary-200';
      default: return 'text-secondary-400 bg-secondary-50 border-secondary-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '긴급';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const filteredSchedule = todaySchedule.filter(schedule => 
    statusFilter === 'all' || schedule.status === statusFilter
  );

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return todaySchedule.length;
    return todaySchedule.filter(s => s.status === status).length;
  };

  const handleStartSession = (schedule: TodaySchedule) => {
    if (schedule.meetingUrl) {
      window.open(schedule.meetingUrl, '_blank');
    }
  };

  const handleCompleteSession = (schedule: TodaySchedule) => {
    router.push(`/expert/records/write?scheduleId=${schedule.id}`);
  };

  const handleViewDetail = (schedule: TodaySchedule) => {
    router.push(`/expert/schedule/detail?id=${schedule.id}`);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hour, minute] = startTime.split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-background-50">
      {/* 사이드바 */}
      <Sidebar 
        userType="expert" 
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-soft px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 font-bold text-secondary">오늘 일정</h1>
              <p className="text-caption text-secondary-400 mt-1">
                {new Date().toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}의 전체 상담 일정입니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 일정 통계 */}
              <div className="flex items-center space-x-4 bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-h4 font-bold text-secondary">{todaySchedule.length}</div>
                  <div className="text-xs text-secondary-400">총 일정</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-primary">{getStatusCount('upcoming')}</div>
                  <div className="text-xs text-secondary-400">예정</div>
                </div>
                <div className="w-px h-8 bg-background-300"></div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-accent">{getStatusCount('completed')}</div>
                  <div className="text-xs text-secondary-400">완료</div>
                </div>
              </div>

              {/* 알림 및 프로필 */}
              <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
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
        <main className="flex-1 overflow-y-auto p-6">
          {/* 필터 탭 */}
          <div className="mb-6">
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-soft">
              {[
                { key: 'all' as StatusFilter, label: '전체', count: getStatusCount('all') },
                { key: 'upcoming' as StatusFilter, label: '예정', count: getStatusCount('upcoming') },
                { key: 'in-progress' as StatusFilter, label: '진행중', count: getStatusCount('in-progress') },
                { key: 'completed' as StatusFilter, label: '완료', count: getStatusCount('completed') },
                { key: 'cancelled' as StatusFilter, label: '취소', count: getStatusCount('cancelled') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-caption font-medium transition-colors flex items-center space-x-2 ${
                    statusFilter === tab.key
                      ? 'bg-primary text-white'
                      : 'text-secondary-600 hover:bg-background-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      statusFilter === tab.key
                        ? 'bg-white text-primary'
                        : 'bg-background-200 text-secondary-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 일정 목록 */}
          <div className="space-y-4">
            {filteredSchedule.length > 0 ? (
              filteredSchedule.map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-custom shadow-soft p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTypeIcon(schedule.type)}</span>
                          <div>
                            <h3 className="text-body font-semibold text-secondary-700">
                              {schedule.clientName}
                            </h3>
                            <p className="text-caption text-secondary-400">
                              {getTypeText(schedule.type)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(schedule.priority)}`}>
                            {getPriorityText(schedule.priority)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(schedule.status)}`}>
                            {getStatusText(schedule.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-secondary-400">🕐</span>
                          <span className="text-body font-mono text-secondary-700">
                            {schedule.time} - {calculateEndTime(schedule.time, schedule.duration)}
                          </span>
                          <span className="text-caption text-secondary-400">
                            ({schedule.duration}분)
                          </span>
                        </div>
                        
                        {schedule.meetingUrl && (
                          <div className="flex items-center space-x-2">
                            <span className="text-secondary-400">🔗</span>
                            <button
                              onClick={() => window.open(schedule.meetingUrl, '_blank')}
                              className="text-primary hover:text-primary-600 text-caption transition-colors"
                            >
                              상담실 입장
                            </button>
                          </div>
                        )}
                      </div>

                      {schedule.notes && (
                        <div className="bg-background-50 p-3 rounded-lg mb-4">
                          <p className="text-caption text-secondary-600">
                            <span className="font-medium">메모: </span>
                            {schedule.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleViewDetail(schedule)}
                        className="bg-background-200 text-secondary-600 px-3 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                      >
                        상세보기
                      </button>
                      
                      {schedule.status === 'upcoming' && (
                        <>
                          <button
                            onClick={() => handleStartSession(schedule)}
                            className="bg-primary text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                          >
                            상담 시작
                          </button>
                          <button
                            onClick={() => router.push(`/expert/clients/profile?id=${schedule.clientId}`)}
                            className="bg-accent-50 text-accent-600 px-3 py-2 rounded-lg text-caption font-medium hover:bg-accent-100 transition-colors"
                          >
                            내담자 정보
                          </button>
                        </>
                      )}
                      
                      {schedule.status === 'in-progress' && (
                        <button
                          onClick={() => handleCompleteSession(schedule)}
                          className="bg-accent text-white px-3 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                        >
                          상담 완료
                        </button>
                      )}
                      
                      {schedule.status === 'completed' && (
                        <button
                          onClick={() => router.push(`/expert/records/history?scheduleId=${schedule.id}`)}
                          className="bg-secondary-100 text-secondary-600 px-3 py-2 rounded-lg text-caption font-medium hover:bg-secondary-200 transition-colors"
                        >
                          상담 기록
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-custom shadow-soft p-12 text-center">
                <span className="text-6xl mb-4 block">📅</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  {statusFilter === 'all' ? '일정이 없습니다' : `${getStatusText(statusFilter)} 일정이 없습니다`}
                </h3>
                <p className="text-caption text-secondary-400">
                  {statusFilter === 'all' 
                    ? '오늘 예정된 상담이 없습니다.' 
                    : '다른 상태의 일정을 확인해보세요.'}
                </p>
              </div>
            )}
          </div>

          {/* 빠른 액션 */}
          <div className="mt-8 bg-white rounded-custom shadow-soft p-6">
            <h2 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              빠른 작업
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/expert/schedule/new')}
                className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">📅</span>
                <span className="text-caption font-medium text-primary group-hover:text-primary-600">새 일정 등록</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/clients/list')}
                className="flex flex-col items-center p-4 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">👥</span>
                <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">내담자 목록</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/records/write')}
                className="flex flex-col items-center p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">📝</span>
                <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">상담 기록 작성</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/vacation')}
                className="flex flex-col items-center p-4 bg-background-100 hover:bg-background-200 rounded-lg transition-colors group"
              >
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

export default TodaySchedulePage;