import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  duration: number;
  clientName: string;
  clientId: string;
  type: 'video' | 'chat' | 'voice';
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  title?: string;
  notes?: string;
}

const ClientCalendarPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // 캘린더 이벤트 샘플 데이터
  const calendarEvents: CalendarEvent[] = [
    {
      id: '1',
      date: '2024-08-11',
      time: '09:00',
      duration: 60,
      clientName: '이**',
      clientId: 'client_001',
      type: 'video',
      status: 'completed',
      priority: 'medium',
      title: '첫 번째 상담',
      notes: '초기 상담 완료'
    },
    {
      id: '2',
      date: '2024-08-11',
      time: '14:00',
      duration: 60,
      clientName: '김**',
      clientId: 'client_003',
      type: 'video',
      status: 'upcoming',
      priority: 'high',
      title: '정기 상담'
    },
    {
      id: '3',
      date: '2024-08-12',
      time: '10:00',
      duration: 90,
      clientName: '박**',
      clientId: 'client_002',
      type: 'chat',
      status: 'upcoming',
      priority: 'medium',
      title: '채팅 상담'
    },
    {
      id: '4',
      date: '2024-08-12',
      time: '15:00',
      duration: 60,
      clientName: '정**',
      clientId: 'client_007',
      type: 'video',
      status: 'upcoming',
      priority: 'high',
      title: '긴급 상담'
    },
    {
      id: '5',
      date: '2024-08-13',
      time: '11:00',
      duration: 45,
      clientName: '한**',
      clientId: 'client_008',
      type: 'voice',
      status: 'upcoming',
      priority: 'low',
      title: '음성 상담'
    },
    {
      id: '6',
      date: '2024-08-14',
      time: '16:00',
      duration: 60,
      clientName: '윤**',
      clientId: 'client_009',
      type: 'chat',
      status: 'upcoming',
      priority: 'medium',
      title: '정기 상담'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent-100 border-accent-300 text-accent-700';
      case 'in-progress': return 'bg-primary-100 border-primary-300 text-primary-700';
      case 'upcoming': return 'bg-background-100 border-background-300 text-secondary-600';
      case 'cancelled': return 'bg-error-100 border-error-300 text-error-700';
      default: return 'bg-background-100 border-background-300 text-secondary-600';
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

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error';
      case 'medium': return 'bg-primary';
      case 'low': return 'bg-secondary-300';
      default: return 'bg-secondary-300';
    }
  };

  // 달력 생성 함수
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 일요일부터 시작
    
    const days = [];
    const current = new Date(startDate);
    
    // 6주 * 7일 = 42일
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendar();

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date === dateString);
  };

  // 월 변경
  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // 날짜 클릭 처리
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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
              <h1 className="text-h2 font-bold text-secondary">일정 캘린더</h1>
              <p className="text-caption text-secondary-400 mt-1">
                월별 상담 일정을 한눈에 확인하고 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 캘린더 네비게이션 */}
              <div className="flex items-center space-x-2 bg-background-100 px-4 py-2 rounded-lg">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-background-200 rounded transition-colors"
                >
                  <span className="text-secondary-600">←</span>
                </button>
                <div className="text-center min-w-[120px]">
                  <div className="text-h4 font-bold text-secondary">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </div>
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-background-200 rounded transition-colors"
                >
                  <span className="text-secondary-600">→</span>
                </button>
              </div>

              <button
                onClick={goToToday}
                className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
              >
                오늘
              </button>

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
        <main className="flex-1 overflow-hidden p-8">
          <div className="h-full flex space-x-8">
            {/* 캘린더 영역 */}
            <div className="flex-1 bg-white rounded-custom shadow-soft overflow-hidden">
              {/* 캘린더 헤더 */}
              <div className="p-6 border-b border-background-200">
                <div className="grid grid-cols-7 gap-4">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div key={day} className="text-center">
                      <div className={`text-caption font-semibold ${
                        index === 0 ? 'text-error' : index === 6 ? 'text-primary' : 'text-secondary-600'
                      }`}>
                        {day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 캘린더 본체 */}
              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-7 h-full">
                  {calendarDays.map((date, index) => {
                    const events = getEventsForDate(date);
                    const dayOfWeek = index % 7;
                    const weekNumber = Math.floor(index / 7);
                    
                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => handleDateClick(date)}
                        className={`border-r border-b border-background-300 cursor-pointer transition-colors relative ${
                          isSelected(date) 
                            ? 'bg-primary-50' 
                            : 'hover:bg-background-50 bg-white'
                        } ${
                          !isCurrentMonth(date) ? 'opacity-40 bg-background-25' : ''
                        } ${
                          dayOfWeek === 6 ? 'border-r-0' : ''
                        } ${
                          weekNumber === 5 ? 'border-b-0' : ''
                        }`}
                        style={{ height: 'calc(100% / 6)' }}
                      >
                        {/* 날짜 숫자 */}
                        <div className="p-2">
                          <div className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium ${
                            isToday(date) 
                              ? 'bg-primary text-white rounded-full' 
                              : dayOfWeek === 0 
                                ? 'text-error' 
                                : dayOfWeek === 6 
                                  ? 'text-blue-600' 
                                  : 'text-secondary-700'
                          }`}>
                            {date.getDate()}
                          </div>
                        </div>
                        
                        {/* 이벤트 목록 */}
                        <div className="px-1 pb-1 space-y-1 overflow-hidden">
                          {events.slice(0, 4).map((event, eventIndex) => (
                            <div
                              key={event.id}
                              className={`text-xs px-2 py-1 rounded-sm truncate cursor-pointer hover:opacity-80 ${
                                event.status === 'completed' 
                                  ? 'bg-accent text-white' 
                                  : event.status === 'in-progress'
                                    ? 'bg-primary text-white'
                                    : event.status === 'cancelled'
                                      ? 'bg-error-200 text-error-700'
                                      : event.priority === 'high'
                                        ? 'bg-error-100 text-error-700 border-l-2 border-error'
                                        : event.priority === 'medium'
                                          ? 'bg-primary-100 text-primary-700 border-l-2 border-primary'
                                          : 'bg-secondary-100 text-secondary-700 border-l-2 border-secondary-300'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/expert/schedule/detail?id=${event.id}`);
                              }}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="flex-shrink-0">{event.time}</span>
                                <span className="flex-shrink-0 text-xs">{getTypeIcon(event.type)}</span>
                                <span className="truncate">{event.clientName}</span>
                              </div>
                            </div>
                          ))}
                          {events.length > 4 && (
                            <div className="text-xs text-secondary-400 text-center py-1">
                              +{events.length - 4}개
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 사이드 패널 */}
            <div className="w-80 space-y-6">
              {/* 선택된 날짜 정보 */}
              <div className="bg-white rounded-custom shadow-soft p-4">
                <h3 className="text-h4 font-semibold text-secondary mb-3">
                  {selectedDate 
                    ? selectedDate.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })
                    : '날짜를 선택하세요'
                  }
                </h3>
                
                {selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => router.push(`/expert/schedule/detail?id=${event.id}`)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${getStatusColor(event.status)} hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(event.type)}</span>
                            <span className="font-medium">{event.clientName}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getPriorityDot(event.priority)}`}></div>
                        </div>
                        
                        <div className="text-caption space-y-1">
                          <div className="font-mono">{event.time} ({event.duration}분)</div>
                          {event.title && <div className="font-medium">{event.title}</div>}
                          {event.notes && <div className="text-secondary-500">{event.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">📅</span>
                    <p className="text-secondary-400 text-caption">이 날에는 일정이 없습니다.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">👈</span>
                    <p className="text-secondary-400 text-caption">캘린더에서 날짜를 클릭해주세요.</p>
                  </div>
                )}
              </div>

              {/* 빠른 액션 */}
              <div className="bg-white rounded-custom shadow-soft p-4">
                <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                  <span className="mr-2">⚡</span>
                  빠른 작업
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/expert/schedule/new')}
                    className="w-full flex items-center space-x-3 p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
                  >
                    <span className="text-xl">📅</span>
                    <span className="text-caption font-medium text-primary group-hover:text-primary-600">새 일정 등록</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/expert/clients/list')}
                    className="w-full flex items-center space-x-3 p-3 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
                  >
                    <span className="text-xl">👥</span>
                    <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">내담자 목록</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/expert/dashboard/schedule')}
                    className="w-full flex items-center space-x-3 p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
                  >
                    <span className="text-xl">📋</span>
                    <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">오늘 일정</span>
                  </button>
                </div>
              </div>

              {/* 범례 */}
              <div className="bg-white rounded-custom shadow-soft p-4">
                <h3 className="text-h4 font-semibold text-secondary mb-4">범례</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-caption text-secondary-400 mb-2">상담 타입</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span>🎥</span>
                        <span className="text-xs">화상</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💭</span>
                        <span className="text-xs">채팅</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🎧</span>
                        <span className="text-xs">음성</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-caption text-secondary-400 mb-2">우선순위</div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-error rounded-full"></div>
                        <span className="text-xs">긴급</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs">보통</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-secondary-300 rounded-full"></div>
                        <span className="text-xs">낮음</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientCalendarPage;