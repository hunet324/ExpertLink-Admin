import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface ActiveSession {
  id: string;
  clientName: string;
  clientId: string;
  startTime: string;
  duration: number;
  sessionType: 'scheduled' | 'emergency';
  status: 'connecting' | 'active' | 'ended';
  meetingUrl: string;
}

interface UpcomingSession {
  id: string;
  clientName: string;
  clientId: string;
  scheduledTime: string;
  duration: number;
  meetingUrl: string;
  priority: 'high' | 'medium' | 'low';
}

const VideoCounselingPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 활성 세션 샘플 데이터
  const activeSession: ActiveSession | null = {
    id: 'session_001',
    clientName: '김**',
    clientId: 'client_003',
    startTime: '2024-08-11T14:00:00',
    duration: 60,
    sessionType: 'scheduled',
    status: 'active',
    meetingUrl: 'https://meet.expertlink.com/room/67890'
  };

  // 예정된 세션 샘플 데이터
  const upcomingSessions: UpcomingSession[] = [
    {
      id: 'session_002',
      clientName: '정**',
      clientId: 'client_007',
      scheduledTime: '2024-08-11T15:00:00',
      duration: 60,
      meetingUrl: 'https://meet.expertlink.com/room/11111',
      priority: 'high'
    },
    {
      id: 'session_003',
      clientName: '이**',
      clientId: 'client_001',
      scheduledTime: '2024-08-11T16:30:00',
      duration: 90,
      meetingUrl: 'https://meet.expertlink.com/room/22222',
      priority: 'medium'
    },
    {
      id: 'session_004',
      clientName: '박**',
      clientId: 'client_002',
      scheduledTime: '2024-08-12T09:00:00',
      duration: 60,
      meetingUrl: 'https://meet.expertlink.com/room/33333',
      priority: 'medium'
    }
  ];

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  const getTimeUntilSession = (scheduledTime: string) => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const diffMinutes = Math.floor((scheduled.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return '시작 시간 지남';
    if (diffMinutes === 0) return '지금 시작';
    if (diffMinutes < 60) return `${diffMinutes}분 후`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}시간 ${minutes}분 후`;
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

  const handleJoinSession = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank', 'width=1200,height=800');
  };

  const handleEndSession = async () => {
    if (confirm('현재 진행 중인 상담을 종료하시겠습니까?')) {
      // 세션 종료 로직
      console.log('세션 종료');
      // 상담 기록 작성 페이지로 이동
      router.push(`/expert/records/write?sessionId=${activeSession?.id}`);
    }
  };

  const handleEmergencySession = () => {
    // 긴급 상담 시작 로직
    const emergencyUrl = 'https://meet.expertlink.com/room/emergency';
    window.open(emergencyUrl, '_blank', 'width=1200,height=800');
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
              <h1 className="text-h2 font-bold text-secondary flex items-center">
                <span className="mr-3 text-2xl">🎥</span>
                화상 상담실
              </h1>
              <p className="text-caption text-secondary-400 mt-1">
                화상 통화를 통한 실시간 상담을 진행할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 현재 시간 */}
              <div className="bg-background-100 px-4 py-2 rounded-lg">
                <div className="text-h4 font-mono font-bold text-secondary">
                  {currentTime.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-xs text-secondary-400 text-center">
                  {currentTime.toLocaleDateString('ko-KR', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* 긴급 상담 버튼 */}
              <button
                onClick={handleEmergencySession}
                className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors flex items-center space-x-2"
              >
                <span>🚨</span>
                <span>긴급 상담</span>
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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 현재 진행 중인 세션 */}
          {activeSession && (
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 font-semibold text-secondary flex items-center">
                  <span className="mr-2">🔴</span>
                  현재 진행 중
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-caption font-medium animate-pulse">
                    진행 중
                  </span>
                  <span className="text-body text-secondary-600">
                    {getSessionDuration(activeSession.startTime)} 경과
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">내담자</label>
                    <div className="text-h4 font-semibold text-secondary-700">
                      {activeSession.clientName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">시작 시간</label>
                    <div className="text-body text-secondary-700">
                      {new Date(activeSession.startTime).toLocaleString('ko-KR')}
                    </div>
                  </div>

                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">예정 시간</label>
                    <div className="text-body text-secondary-700">
                      {activeSession.duration}분
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 디바이스 제어 */}
                  <div>
                    <label className="text-caption text-secondary-400 block mb-2">디바이스 설정</label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setCameraEnabled(!cameraEnabled)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-caption font-medium transition-colors ${
                          cameraEnabled 
                            ? 'bg-primary text-white hover:bg-primary-600' 
                            : 'bg-background-300 text-secondary-600 hover:bg-background-400'
                        }`}
                      >
                        <span>{cameraEnabled ? '📹' : '📷'}</span>
                        <span>카메라 {cameraEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                      
                      <button
                        onClick={() => setMicEnabled(!micEnabled)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-caption font-medium transition-colors ${
                          micEnabled 
                            ? 'bg-primary text-white hover:bg-primary-600' 
                            : 'bg-background-300 text-secondary-600 hover:bg-background-400'
                        }`}
                      >
                        <span>{micEnabled ? '🎤' : '🔇'}</span>
                        <span>마이크 {micEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 세션 제어 */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleJoinSession(activeSession.meetingUrl)}
                      className="flex-1 bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                    >
                      상담실 재입장
                    </button>
                    <button
                      onClick={handleEndSession}
                      className="bg-error text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-600 transition-colors"
                    >
                      상담 종료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 예정된 세션 */}
          <div className="bg-white rounded-custom shadow-soft p-6">
            <h2 className="text-h3 font-semibold text-secondary mb-4 flex items-center">
              <span className="mr-2">📅</span>
              예정된 화상 상담
            </h2>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border border-background-200 rounded-lg p-4 hover:border-primary-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-body font-semibold text-secondary-700">
                            {session.clientName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(session.priority)}`}>
                            {getPriorityText(session.priority)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-caption text-secondary-600">
                          <div>
                            <span className="text-secondary-400">예정 시간:</span> {new Date(session.scheduledTime).toLocaleString('ko-KR')}
                          </div>
                          <div>
                            <span className="text-secondary-400">소요 시간:</span> {session.duration}분
                          </div>
                          <div>
                            <span className="text-secondary-400">시작까지:</span> 
                            <span className={`ml-1 font-medium ${
                              getTimeUntilSession(session.scheduledTime).includes('분 후') && 
                              parseInt(getTimeUntilSession(session.scheduledTime)) <= 5 
                                ? 'text-error' 
                                : 'text-primary'
                            }`}>
                              {getTimeUntilSession(session.scheduledTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleJoinSession(session.meetingUrl)}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                        >
                          입장하기
                        </button>
                        <button
                          onClick={() => router.push(`/expert/clients/profile?id=${session.clientId}`)}
                          className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                        >
                          내담자 정보
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📺</span>
                <h3 className="text-h4 font-semibold text-secondary-600 mb-2">
                  예정된 화상 상담이 없습니다
                </h3>
                <p className="text-caption text-secondary-400">
                  새로운 화상 상담 예약이 있으면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>

          {/* 빠른 작업 */}
          <div className="bg-white rounded-custom shadow-soft p-6">
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
                <span className="text-caption font-medium text-primary group-hover:text-primary-600">새 상담 예약</span>
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
                <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">상담 기록</span>
              </button>
              
              <button 
                onClick={() => router.push('/expert/dashboard/schedule')}
                className="flex flex-col items-center p-4 bg-background-100 hover:bg-background-200 rounded-lg transition-colors group"
              >
                <span className="text-2xl mb-2">📋</span>
                <span className="text-caption font-medium text-secondary-500 group-hover:text-secondary-600">오늘 일정</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoCounselingPage;