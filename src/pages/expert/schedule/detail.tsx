import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Layout/Sidebar';

interface ScheduleDetail {
  id: string;
  date: string;
  time: string;
  duration: number;
  clientName: string;
  clientId: string;
  clientPhone: string;
  clientEmail: string;
  type: 'video' | 'chat' | 'voice';
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  sessionNotes?: string;
  agenda?: string;
  location?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  nextSession?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

const ScheduleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isEditing, setIsEditing] = useState(false);

  // 샘플 데이터 - 실제로는 API에서 가져올 데이터
  const scheduleDetail: ScheduleDetail = {
    id: id as string || '1',
    date: '2024-08-11',
    time: '14:00',
    duration: 60,
    clientName: '김**',
    clientId: 'client_001',
    clientPhone: '010-1234-5678',
    clientEmail: 'client001@example.com',
    type: 'video',
    status: 'upcoming',
    sessionNotes: '첫 번째 상담 세션입니다. 내담자의 주요 고민사항에 대해 심도 있게 논의할 예정입니다.',
    agenda: '1. 라포 형성\n2. 주요 문제 파악\n3. 목표 설정\n4. 치료 계획 수립',
    meetingUrl: 'https://meet.expertlink.com/room/12345',
    priority: 'high',
    createdAt: '2024-08-09 15:30:00',
    updatedAt: '2024-08-10 09:15:00'
  };

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

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }),
      time: dateObj.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
  };

  const handleStartSession = () => {
    if (scheduleDetail.meetingUrl) {
      window.open(scheduleDetail.meetingUrl, '_blank');
    }
  };

  const handleCompleteSession = () => {
    // 상담 완료 처리 로직
    router.push(`/expert/records/write?scheduleId=${scheduleDetail.id}`);
  };

  const handleCancelSession = () => {
    // 상담 취소 처리 로직
    if (confirm('정말로 이 상담을 취소하시겠습니까?')) {
      // API 호출
      console.log('상담 취소됨');
    }
  };

  const handleReschedule = () => {
    // 일정 변경 처리 로직
    console.log('일정 변경');
  };

  const { date: formattedDate, time: formattedTime } = formatDateTime(scheduleDetail.date, scheduleDetail.time);

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
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-background-100 rounded-lg transition-colors"
              >
                <span className="text-xl">←</span>
              </button>
              <div>
                <h1 className="text-h2 font-bold text-secondary">일정 상세</h1>
                <p className="text-caption text-secondary-400 mt-1">
                  상담 일정의 상세 정보를 확인하고 관리할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-caption font-medium border ${getPriorityColor(scheduleDetail.priority)}`}>
                {getPriorityText(scheduleDetail.priority)}
              </span>
              <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(scheduleDetail.status)}`}>
                {getStatusText(scheduleDetail.status)}
              </span>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 기본 정보 카드 */}
            <div className="bg-white rounded-custom shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h3 font-semibold text-secondary flex items-center">
                  <span className="mr-3 text-2xl">{getTypeIcon(scheduleDetail.type)}</span>
                  {getTypeText(scheduleDetail.type)} 상담
                </h2>
                <div className="flex space-x-2">
                  {scheduleDetail.status === 'upcoming' && (
                    <>
                      <button 
                        onClick={handleStartSession}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                      >
                        상담 시작
                      </button>
                      <button 
                        onClick={handleReschedule}
                        className="bg-background-200 text-secondary-600 px-4 py-2 rounded-lg text-caption font-medium hover:bg-background-300 transition-colors"
                      >
                        일정 변경
                      </button>
                      <button 
                        onClick={handleCancelSession}
                        className="bg-error-50 text-error px-4 py-2 rounded-lg text-caption font-medium hover:bg-error-100 transition-colors"
                      >
                        취소
                      </button>
                    </>
                  )}
                  {scheduleDetail.status === 'in-progress' && (
                    <button 
                      onClick={handleCompleteSession}
                      className="bg-accent text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-accent-600 transition-colors"
                    >
                      상담 완료
                    </button>
                  )}
                  {scheduleDetail.status === 'completed' && (
                    <button 
                      onClick={() => router.push(`/expert/records/history?scheduleId=${scheduleDetail.id}`)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium hover:bg-primary-600 transition-colors"
                    >
                      상담 기록 보기
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">일시</label>
                    <div className="text-body text-secondary-700">
                      <div>{formattedDate}</div>
                      <div className="font-mono">{formattedTime} ({scheduleDetail.duration}분)</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">내담자</label>
                    <div className="text-body text-secondary-700">
                      <div className="font-medium">{scheduleDetail.clientName}</div>
                      <button 
                        onClick={() => router.push(`/expert/clients/profile?id=${scheduleDetail.clientId}`)}
                        className="text-primary hover:text-primary-600 text-caption mt-1 transition-colors"
                      >
                        프로필 보기 →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-caption text-secondary-400 block mb-1">연락처</label>
                    <div className="text-body text-secondary-700 space-y-1">
                      <div>{scheduleDetail.clientPhone}</div>
                      <div>{scheduleDetail.clientEmail}</div>
                    </div>
                  </div>

                  {scheduleDetail.meetingUrl && (
                    <div>
                      <label className="text-caption text-secondary-400 block mb-1">상담실 링크</label>
                      <button 
                        onClick={() => window.open(scheduleDetail.meetingUrl, '_blank')}
                        className="text-primary hover:text-primary-600 text-body transition-colors break-all"
                      >
                        {scheduleDetail.meetingUrl}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 상담 내용 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 상담 안건 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-h4 font-semibold text-secondary flex items-center">
                    <span className="mr-2">📋</span>
                    상담 안건
                  </h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-primary hover:text-primary-600 text-caption transition-colors"
                  >
                    {isEditing ? '저장' : '편집'}
                  </button>
                </div>
                
                {isEditing ? (
                  <textarea 
                    className="w-full p-3 border border-background-300 rounded-lg resize-none focus:outline-none focus:border-primary-300"
                    rows={6}
                    defaultValue={scheduleDetail.agenda}
                    placeholder="상담 안건을 입력하세요..."
                  />
                ) : (
                  <div className="text-body text-secondary-600 whitespace-pre-wrap min-h-[120px]">
                    {scheduleDetail.agenda || '상담 안건이 작성되지 않았습니다.'}
                  </div>
                )}
              </div>

              {/* 세션 노트 */}
              <div className="bg-white rounded-custom shadow-soft p-6">
                <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  세션 노트
                </h3>
                <div className="text-body text-secondary-600 min-h-[120px]">
                  {scheduleDetail.sessionNotes || '세션 노트가 작성되지 않았습니다.'}
                </div>
              </div>
            </div>

            {/* 기록 정보 */}
            <div className="bg-white rounded-custom shadow-soft p-6">
              <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                <span className="mr-2">📊</span>
                기록 정보
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-caption text-secondary-400 block mb-1">생성일시</label>
                  <div className="text-body text-secondary-700">
                    {new Date(scheduleDetail.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div>
                  <label className="text-caption text-secondary-400 block mb-1">수정일시</label>
                  <div className="text-body text-secondary-700">
                    {new Date(scheduleDetail.updatedAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>

              {scheduleDetail.recordingUrl && (
                <div className="mt-4 pt-4 border-t border-background-200">
                  <label className="text-caption text-secondary-400 block mb-2">상담 녹화</label>
                  <button 
                    onClick={() => window.open(scheduleDetail.recordingUrl, '_blank')}
                    className="flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors"
                  >
                    <span>🎬</span>
                    <span>녹화 파일 보기</span>
                  </button>
                </div>
              )}
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-custom shadow-soft p-6">
              <h3 className="text-h4 font-semibold text-secondary mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                빠른 작업
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => router.push(`/expert/clients/profile?id=${scheduleDetail.clientId}`)}
                  className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">👤</span>
                  <span className="text-caption font-medium text-primary group-hover:text-primary-600">내담자 프로필</span>
                </button>
                
                <button 
                  onClick={() => router.push(`/expert/records/write?scheduleId=${scheduleDetail.id}`)}
                  className="flex flex-col items-center p-4 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">📝</span>
                  <span className="text-caption font-medium text-accent-600 group-hover:text-accent-700">상담 기록</span>
                </button>
                
                <button 
                  onClick={() => router.push(`/expert/records/history?clientId=${scheduleDetail.clientId}`)}
                  className="flex flex-col items-center p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">📊</span>
                  <span className="text-caption font-medium text-secondary-600 group-hover:text-secondary-700">상담 이력</span>
                </button>
                
                <button 
                  onClick={() => router.push(`/expert/schedule/new?clientId=${scheduleDetail.clientId}`)}
                  className="flex flex-col items-center p-4 bg-background-100 hover:bg-background-200 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mb-2">📅</span>
                  <span className="text-caption font-medium text-secondary-500 group-hover:text-secondary-600">다음 일정 예약</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScheduleDetailPage;